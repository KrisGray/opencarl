import type { Hooks } from "@opencode-ai/plugin";
import { resolveCarlCommandSignals } from "../carl/command-parity";
import { buildCarlHelpGuidance } from "../carl/help-text";
import { buildCarlInjection } from "../carl/injector";
import { getCachedRules, isCarlPath, markRulesDirty } from "../carl/rule-cache";
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
      const discovery = getCachedRules();
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

      const injection = buildCarlInjection({
        domainPayloads: {
          ...discovery.domainPayloads,
          ...commandResolution.commandPayloads,
        },
        matchedDomains: matchResult.matchedDomains,
        commandDomains: commandResolution.commandDomains,
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
