import type { Hooks } from "@opencode-ai/plugin";
import { resolveCarlCommandSignals } from "../carl/command-parity";
import { buildCarlHelpGuidance } from "../carl/help-text";
import { buildCarlInjection } from "../carl/injector";
import {
  getCachedRules,
  hasSessionWarned,
  isCarlPath,
  markRulesDirty,
  markSessionWarned,
  clearSessionWarning,
} from "../carl/rule-cache";
import { matchDomainsForTurn } from "../carl/matcher";
import {
  consumeCommandSignals,
  getSessionSignals,
  getSessionPromptText,
  recordCommandSignals,
  recordPromptSignals,
  recordToolSignals,
} from "../carl/signal-store";
import type { CarlMatchDomainConfig, CarlRuleDomainPayload } from "../carl/types";
import {
  computeContextBracketData,
  type ContextBracketData,
} from "../carl/context-brackets";

type PartLike = {
  type?: string;
  text?: string;
  value?: string;
  content?: string;
};

type MessageLike = {
  role?: string;
  content?: string | Array<string | { type?: string; text?: string }>;
};

type TokenInfoLike = {
  input_tokens?: number;
  cache_read_input_tokens?: number;
  output_tokens?: number;
};

type MessageDataLike = {
  info?: {
    tokens?: TokenInfoLike;
  };
};

function extractPromptText(message?: MessageLike, parts?: PartLike[]): string {
  const collected: string[] = [];

  if (parts && parts.length > 0) {
    for (const part of parts) {
      if (!part) {
        continue;
      }
      if (typeof part.text === "string") {
        collected.push(part.text);
        continue;
      }
      if (typeof part.value === "string") {
        collected.push(part.value);
        continue;
      }
      if (typeof part.content === "string") {
        collected.push(part.content);
      }
    }
  }

  if (collected.length === 0 && message?.content) {
    if (typeof message.content === "string") {
      collected.push(message.content);
    } else {
      for (const entry of message.content) {
        if (typeof entry === "string") {
          collected.push(entry);
        } else if (entry && typeof entry.text === "string") {
          collected.push(entry.text);
        }
      }
    }
  }

  return collected.join("\n").trim();
}

function buildMatchDomains(
  payloads: Record<string, CarlRuleDomainPayload>
): Record<string, CarlMatchDomainConfig> {
  const configs: Record<string, CarlMatchDomainConfig> = {};

  for (const payload of Object.values(payloads)) {
    configs[payload.domain] = {
      name: payload.domain,
      state: payload.state,
      recall: payload.recall,
      exclude: payload.exclude,
      alwaysOn: payload.alwaysOn || payload.domain === "GLOBAL",
    };
  }

  return configs;
}

/**
 * Compute token usage from session messages.
 * Returns total input + cache tokens, or null if unavailable.
 */
function computeTokenUsage(messages: MessageDataLike[] | undefined): number | null {
  if (!messages || messages.length === 0) {
    return null;
  }

  let latestTokens = 0;

  // Find the most recent message with token info
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const tokens = msg?.info?.tokens;
    if (tokens) {
      const inputTokens = tokens.input_tokens ?? 0;
      const cacheTokens = tokens.cache_read_input_tokens ?? 0;
      const total = inputTokens + cacheTokens;
      if (total > 0) {
        latestTokens = total;
        break;
      }
    }
  }

  return latestTokens > 0 ? latestTokens : null;
}

/**
 * Get context bracket data from OpenCode client session.
 * Falls back to fresh session if token telemetry unavailable.
 */
async function getContextBracketFromSession(
  client: { session?: { messages?: (input: { path: { id: string } }) => Promise<unknown> } },
  sessionId: string
): Promise<ContextBracketData> {
  try {
    if (!client.session?.messages) {
      return computeContextBracketData(null);
    }

    const response = await client.session.messages({ path: { id: sessionId } });
    const messages = (response as any)?.data ?? response ?? [];

    if (!Array.isArray(messages)) {
      return computeContextBracketData(null);
    }

    const tokensUsed = computeTokenUsage(messages);
    return computeContextBracketData(tokensUsed);
  } catch {
    // Session messages unavailable, default to fresh
    return computeContextBracketData(null);
  }
}

export function createCarlPluginHooks(): Hooks {
  return {
    "chat.message": async (input, output) => {
      if (output.message?.role !== "user") {
        return;
      }

      const promptText = extractPromptText(
        output.message as MessageLike,
        output.parts as PartLike[]
      );

      if (promptText) {
        recordPromptSignals(input.sessionID, promptText);
      }
    },
    "tool.execute.before": async (input, output) => {
      recordToolSignals(input.sessionID, input.tool, output.args);
    },
    "command.execute.before": async (input) => {
      const commandName = (input.command ?? "").replace(/^\//, "").toLowerCase();
      if (commandName === "carl") {
        // /carl fallback should mirror *carl command-mode guidance
        recordCommandSignals(input.sessionID, ["carl"]);
      }
    },
    "experimental.chat.system.transform": async (input, output) => {
      const sessionId = input.sessionID ?? "";
      const discovery = getCachedRules({ sessionId });

      // Handle invalid project rules: warn once per session
      if (discovery.projectStatus === "invalid") {
        if (!hasSessionWarned(sessionId)) {
          const warningMessages = discovery.projectWarnings
            .map((w) => w.message)
            .join("; ");
          console.warn(
            `[carl] Invalid project rules detected - project rules disabled: ${warningMessages}`
          );
          markSessionWarned(sessionId);
        }
      } else if (discovery.projectStatus === "valid") {
        // Clear warning guard when project rules become valid again
        clearSessionWarning(sessionId);
      }

      const domainConfigs = buildMatchDomains(discovery.domainPayloads);
      const signals = getSessionSignals(sessionId);
      const promptText = getSessionPromptText(sessionId);
      const commandOverrides = consumeCommandSignals(sessionId);

      const commandResolution = resolveCarlCommandSignals({
        promptText,
        commandOverrides,
        commandsPayload: discovery.domainPayloads.COMMANDS,
        getHelpGuidance: () => buildCarlHelpGuidance().combined,
      });

      const matchResult = matchDomainsForTurn({
        promptText,
        signals,
        domains: domainConfigs,
        globalExclude: discovery.globalExclude,
      });

      // Compute context bracket from session token telemetry
      const contextBracket = await getContextBracketFromSession(
        (input as any).client,
        sessionId
      );

      const injection = buildCarlInjection({
        domainPayloads: {
          ...discovery.domainPayloads,
          ...commandResolution.commandPayloads,
        },
        matchedDomains: matchResult.matchedDomains,
        commandDomains: commandResolution.commandDomains,
        contextBracket,
      });

      if (discovery.devmode) {
        const alwaysOnDomains = Object.values(discovery.domainPayloads)
          .filter((payload) => payload.state)
          .filter((payload) => payload.alwaysOn || payload.domain === "GLOBAL")
          .map((payload) => payload.domain)
          .sort();

        console.log("[carl] devmode", {
          matchedDomains: matchResult.matchedDomains,
          commandDomains: commandResolution.commandDomains,
          alwaysOnDomains,
          injected: Boolean(injection),
          injectionLength: injection ? injection.length : 0,
          contextBracket: {
            bracket: contextBracket.bracket,
            contextRemaining: contextBracket.contextRemaining,
            isCritical: contextBracket.isCritical,
          },
        });
      }

      if (injection) {
        output.system.push(injection);
      }
    },
    "file.watcher.updated": async (input) => {
      // Mark rule cache dirty when .carl/ files change
      const filePath = input.path ?? "";
      if (isCarlPath(filePath)) {
        markRulesDirty();
      }
    },
  };
}
