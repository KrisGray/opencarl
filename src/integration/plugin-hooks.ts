import os from "os";
import path from "path";

// Type import workaround for ES module in CommonJS context
// Note: Using 'any' for Hooks to support Jest/ts-jest compatibility
// In production runtime, the actual @opencode-ai/plugin Hooks type will be used
type Hooks = any;
import { computeContextBracketData, type ContextBracketData } from "../carl/context-brackets";
import type { OpencarlRuleDomainPayload, OpencarlMatchDomainConfig } from "../carl/types";
import { resolveOpencarlCommandSignals } from "../carl/command-parity";
import { checkSetupNeeded, buildSetupPrompt, runSetup, runIntegration, integrateOpencarl } from "../carl/setup";
import {
  registerPluginLoad,
  checkDuplicateLoad,
  getDuplicateWarning,
} from "../carl/duplicate-detector";
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
import { debugInjection } from "../carl/debug";
import {
  recordPromptSignals,
  recordToolSignals,
  recordCommandSignals,
  getSessionSignals,
  getSessionPromptText,
  consumeCommandSignals,
} from "../carl/signal-store";
import { formatError } from "../carl/errors";

// Resolve plugin path at module initialization for duplicate detection
const PLUGIN_PATH = __dirname;

// Register this plugin load
registerPluginLoad(PLUGIN_PATH);

// Setup detection state (check once per process)
let setupChecked = false;

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
  payloads: Record<string, OpencarlRuleDomainPayload>,
): Record<string, OpencarlMatchDomainConfig> {
  const configs: Record<string, OpencarlMatchDomainConfig> = {};

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
function computeTokenUsage(
  messages: MessageDataLike[] | undefined,
): number | null {
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
  client: {
    session?: {
      messages?: (input: { path: { id: string } }) => Promise<unknown>;
    };
  },
  sessionId: string,
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
        output.parts as PartLike[],
      );

      if (promptText) {
        recordPromptSignals(input.sessionID, promptText);
      }
    },
    "tool.execute.before": async (input, output) => {
      recordToolSignals(input.sessionID, input.tool, output.args);
    },
    "command.execute.before": async (input) => {
      const commandName = (input.command ?? "")
        .replace(/^\//, "")
        .toLowerCase();
      if (commandName === "carl") {
        // /carl fallback should mirror *carl command-mode guidance
        recordCommandSignals(input.sessionID, ["carl"]);
      }
      // Handle /carl setup command
      if (commandName === "carl setup" || commandName === "carl-setup") {
        try {
          const result = await runSetup({
            cwd: process.cwd(),
            homeDir: os.homedir(),
          });
          console.log(
            result.success
              ? "[carl] Setup complete"
              : `[carl] Setup failed: ${result.error}`,
          );
        } catch (error) {
          console.error(formatError(error));
        }
      }
      // Handle /carl setup --integrate
      if (commandName === "carl setup --integrate") {
        try {
          const result = await runIntegration({
            cwd: process.cwd(),
            integrate: true,
          });
          console.log(result.message);
        } catch (error) {
          console.error(formatError(error));
        }
      }
      // Handle /carl setup --remove
      if (commandName === "carl setup --remove") {
        try {
          const result = await runIntegration({
            cwd: process.cwd(),
            remove: true,
          });
          console.log(result.message);
        } catch (error) {
          console.error(formatError(error));
        }
      }
      // Handle /carl setup --integrate-opencode
      if (commandName === "carl setup --integrate-opencode") {
        try {
          const result = await integrateOpencarl({
            cwd: process.cwd(),
          });
          console.log(result.message);
        } catch (error) {
          console.error(formatError(error));
        }
      }
    },
    "experimental.chat.system.transform": async (input, output) => {
      try {
        const sessionId = input.sessionID ?? "";

      // Check setup on first invocation
      if (!setupChecked) {
        setupChecked = true;
        const setupCheck = checkSetupNeeded({
          cwd: process.cwd(),
          homeDir: os.homedir(),
        });

        if (setupCheck.needed && setupCheck.targetDir) {
          output.system.push(buildSetupPrompt());
        }
      }

      // Check for duplicate plugin loads (warn once per session)
      const duplicateCheck = checkDuplicateLoad(PLUGIN_PATH, sessionId);
      if (
        duplicateCheck.isDuplicate &&
        duplicateCheck.existingPath &&
        !duplicateCheck.warningEmitted
      ) {
        const warning = getDuplicateWarning(
          PLUGIN_PATH,
          duplicateCheck.existingPath,
        );
        console.warn(warning);
      }

      const discovery = getCachedRules({ sessionId });

      // Handle invalid project rules: warn once per session
      if (discovery.projectStatus === "invalid") {
        if (!hasSessionWarned(sessionId)) {
          const warningMessages = discovery.projectWarnings
            .map((w) => w.message)
            .join("; ");
          console.warn(
            `[carl] Invalid project rules detected - project rules disabled: ${warningMessages}`,
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

      const commandResolution = resolveOpencarlCommandSignals({
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
        sessionId,
      );

      // Debug logging for injection
      if (matchResult.matchedDomains.length > 0) {
        const totalRules = matchResult.matchedDomains.reduce((sum, domain) => {
          const payload = discovery.domainPayloads[domain];
          return sum + (payload?.rules?.length || 0);
        }, 0);
        
        debugInjection(
          matchResult.matchedDomains,
          totalRules,
          contextBracket.bracket
        );
      }

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
      } catch (error) {
        console.error(formatError(error));
      }
    },
  };
}
