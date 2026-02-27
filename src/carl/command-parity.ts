import fs from "fs";
import path from "path";
import type { CarlRuleDomainPayload } from "./types";
import { buildCarlDocsGuidance } from "./help-text";

export interface CarlCommandResolutionInput {
  promptText?: string;
  commandOverrides?: string[];
  commandsPayload?: CarlRuleDomainPayload | null;
  commandFilePath?: string;
  helpGuidance?: string;
  getHelpGuidance?: () => string;
}

export interface CarlCommandResolutionResult {
  commandTokens: string[];
  commandDomains: string[];
  commandPayloads: Record<string, CarlRuleDomainPayload>;
  unresolvedTokens: string[];
}

type CommandRuleMap = Record<string, string[]>;

// Matches CARL star-command triggers like *carl, *brief, *dev
const STAR_COMMAND_PATTERN = /\*([a-zA-Z]+)/g;
const COMMAND_RULE_PATTERN = /^([A-Z0-9]+)_RULE_(\d+)$/;

function normalizeToken(token: string): string {
  return token.trim().toUpperCase();
}

function uniqInOrder(tokens: string[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const token of tokens) {
    const normalized = normalizeToken(token);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    ordered.push(normalized);
  }
  return ordered;
}

function detectStarCommands(promptText: string): string[] {
  const tokens: string[] = [];
  if (!promptText) {
    return tokens;
  }

  let match: RegExpExecArray | null;
  while ((match = STAR_COMMAND_PATTERN.exec(promptText)) !== null) {
    tokens.push(match[1]);
  }

  return tokens;
}

function resolveCommandFilePath(
  payload?: CarlRuleDomainPayload | null,
  overridePath?: string
): string | null {
  if (overridePath) {
    return overridePath;
  }

  if (!payload?.sourcePath) {
    return null;
  }

  return path.join(payload.sourcePath, "commands");
}

function parseCommandRules(commandFilePath: string): CommandRuleMap {
  if (!commandFilePath || !fs.existsSync(commandFilePath)) {
    return {};
  }

  const lines = fs.readFileSync(commandFilePath, "utf8").split(/\r?\n/);
  const map = new Map<string, { index: number; rule: string }[]>();

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) {
      continue;
    }

    const [rawKey, rawValue] = line.split("=", 2);
    const key = rawKey?.trim() ?? "";
    const value = rawValue?.trim() ?? "";
    if (!value) {
      continue;
    }

    const match = key.match(COMMAND_RULE_PATTERN);
    if (!match) {
      continue;
    }

    const command = match[1];
    const index = Number(match[2]);
    if (!Number.isFinite(index)) {
      continue;
    }

    const entries = map.get(command) ?? [];
    entries.push({ index, rule: value });
    map.set(command, entries);
  }

  const rules: CommandRuleMap = {};
  for (const [command, entries] of map.entries()) {
    const ordered = entries
      .slice()
      .sort((left, right) => left.index - right.index)
      .map((entry) => entry.rule);
    if (ordered.length > 0) {
      rules[command] = ordered;
    }
  }

  return rules;
}

export function resolveCarlCommandSignals(
  input: CarlCommandResolutionInput
): CarlCommandResolutionResult {
  const promptText = input.promptText ?? "";
  const starTokens = detectStarCommands(promptText);
  const overrideTokens = input.commandOverrides ?? [];
  const commandTokens = uniqInOrder([...starTokens, ...overrideTokens]);

  if (commandTokens.length === 0) {
    return {
      commandTokens,
      commandDomains: [],
      commandPayloads: {},
      unresolvedTokens: [],
    };
  }

  const commandsPayload = input.commandsPayload ?? null;
  const commandsEnabled = commandsPayload?.state ?? false;
  const commandFilePath = resolveCommandFilePath(
    commandsPayload,
    input.commandFilePath
  );

  if (!commandsEnabled || !commandFilePath) {
    return {
      commandTokens,
      commandDomains: [],
      commandPayloads: {},
      unresolvedTokens: [...commandTokens],
    };
  }

  const commandRuleMap = parseCommandRules(commandFilePath);
  const commandPayloads: Record<string, CarlRuleDomainPayload> = {};
  const unresolvedTokens: string[] = [];
  const commandDomains: string[] = [];

  for (const token of commandTokens) {
    const rules = commandRuleMap[token];
    if (!rules || rules.length === 0) {
      unresolvedTokens.push(token);
      continue;
    }

    const payloadRules = [...rules];
    if (token === "CARL") {
      // Check for docs subcommand in prompt text
      const isDocsRequest = promptText.toLowerCase().includes('docs');

      if (isDocsRequest) {
        const docsGuidance = buildCarlDocsGuidance();
        // Use quick reference for initial response
        payloadRules.push(docsGuidance.quickReference);
        // Note about full docs available
        payloadRules.push("\n\n*For the full guide, see the resources/docs/CARL-DOCS.md file or visit the online documentation.*");
      } else {
        // Existing help guidance logic
        const guidance =
          input.helpGuidance ?? input.getHelpGuidance?.() ?? "";
        if (guidance) {
          payloadRules.push(guidance);
        }
      }
    }

    commandDomains.push(token);
    commandPayloads[token] = {
      domain: token,
      scope: commandsPayload?.scope ?? "project",
      sourcePath: commandsPayload?.sourcePath ?? commandFilePath,
      rules: payloadRules,
      state: true,
      alwaysOn: false,
      recall: [],
      exclude: [],
    };
  }

  return {
    commandTokens,
    commandDomains,
    commandPayloads,
    unresolvedTokens,
  };
}
