import * as path from "path";
import type { OpencarlSessionSignals } from "./types";

const MAX_SIGNAL_ENTRIES = 20;

interface SessionSignalStore {
  promptEntries: string[][];
  toolEntries: string[][];
  pathEntries: string[][];
  commandEntries: string[][];
  lastPromptText: string | null;
}

const sessionSignals = new Map<string, SessionSignalStore>();

function ensureSession(sessionId: string): SessionSignalStore {
  const existing = sessionSignals.get(sessionId);
  if (existing) {
    return existing;
  }

  const created: SessionSignalStore = {
    promptEntries: [],
    toolEntries: [],
    pathEntries: [],
    commandEntries: [],
    lastPromptText: null,
  };
  sessionSignals.set(sessionId, created);
  return created;
}

function pushBounded(entries: string[][], next: string[]): void {
  if (next.length === 0) {
    return;
  }

  entries.push(next);
  if (entries.length > MAX_SIGNAL_ENTRIES) {
    entries.shift();
  }
}

function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

function tokenizeText(input: string): string[] {
  const matches = input.toLowerCase().match(/[a-z0-9._-]+/g);
  return matches ? matches.filter((token) => token.length > 0) : [];
}

function normalizePathTokens(rawPath: string): string[] {
  const normalized = rawPath.replace(/\\/g, "/").trim();
  if (!normalized) {
    return [];
  }

  const tokens = new Set<string>();
  tokens.add(normalized.toLowerCase());

  const basename = path.posix.basename(normalized);
  if (basename) {
    tokens.add(basename.toLowerCase());
  }

  for (const segment of normalized.split("/")) {
    const token = segment.trim();
    if (token) {
      tokens.add(token.toLowerCase());
    }
  }

  return Array.from(tokens);
}

function collectStrings(value: unknown, depth = 0): string[] {
  if (depth > 4) {
    return [];
  }

  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectStrings(entry, depth + 1));
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap((entry) =>
      collectStrings(entry, depth + 1)
    );
  }

  return [];
}

function uniqTokens(entries: string[][]): string[] {
  const tokens = new Set<string>();
  for (const entry of entries) {
    for (const token of entry) {
      const normalized = normalizeToken(token);
      if (normalized) {
        tokens.add(normalized);
      }
    }
  }

  return Array.from(tokens);
}

/**
 * Record prompt signals for the current turn.
 * Tokenizes the prompt text and stores it for domain matching.
 * @category Signals
 * @param sessionId - The session identifier
 * @param promptText - The raw prompt text to tokenize and store
 */
export function recordPromptSignals(sessionId: string, promptText: string): void {
  if (!sessionId) {
    return;
  }

  const tokens = tokenizeText(promptText);
  const store = ensureSession(sessionId);
  store.lastPromptText = promptText;
  pushBounded(store.promptEntries, tokens);
}

/**
 * Get the most recent prompt text for a session.
 * @category Signals
 * @param sessionId - The session identifier
 * @returns The last recorded prompt text, or empty string if none
 */
export function getSessionPromptText(sessionId: string): string {
  if (!sessionId) {
    return "";
  }

  const store = ensureSession(sessionId);
  return store.lastPromptText ?? "";
}

/**
 * Record command signals for domain activation tracking.
 * @category Signals
 * @param sessionId - The session identifier
 * @param commands - Array of command names to record
 */
export function recordCommandSignals(sessionId: string, commands: string[]): void {
  if (!sessionId) {
    return;
  }

  const store = ensureSession(sessionId);
  pushBounded(store.commandEntries, commands);
}

/**
 * Consume and return the most recent command signals.
 * Removes the consumed entry from the store (LIFO order).
 * @category Signals
 * @param sessionId - The session identifier
 * @returns Array of command names, or empty array if none available
 */
export function consumeCommandSignals(sessionId: string): string[] {
  if (!sessionId) {
    return [];
  }

  const store = ensureSession(sessionId);
  const entry = store.commandEntries.pop();
  return entry ?? [];
}

/**
 * Record signals from tool usage for domain matching.
 * Extracts tool name tokens and path tokens from tool arguments.
 * @category Signals
 * @param sessionId - The session identifier
 * @param toolName - Name of the tool being used
 * @param toolArgs - Tool arguments (will be searched for path-like strings)
 */
export function recordToolSignals(
  sessionId: string,
  toolName: string,
  toolArgs?: unknown
): void {
  if (!sessionId) {
    return;
  }

  const store = ensureSession(sessionId);
  const toolTokens = new Set<string>(tokenizeText(toolName));
  const pathTokens = new Set<string>();

  for (const value of collectStrings(toolArgs)) {
    if (value.includes("/") || value.includes("\\")) {
      for (const token of normalizePathTokens(value)) {
        pathTokens.add(token);
      }
    }
  }

  pushBounded(store.toolEntries, Array.from(toolTokens));
  pushBounded(store.pathEntries, Array.from(pathTokens));
}

/**
 * Get all accumulated signals for a session.
 * Returns prompt tokens, history, tool tokens, and path tokens for domain matching.
 * @category Signals
 * @param sessionId - The session identifier
 * @returns Complete session signals object
 */
export function getSessionSignals(sessionId: string): OpencarlSessionSignals {
  if (!sessionId) {
    return {
      promptTokens: [],
      promptHistory: [],
      toolTokens: [],
      pathTokens: [],
    };
  }

  const store = ensureSession(sessionId);
  const promptHistory = uniqTokens(store.promptEntries);
  const toolTokens = uniqTokens(store.toolEntries);
  const pathTokens = uniqTokens(store.pathEntries);

  const lastPrompt =
    store.promptEntries.length > 0
      ? store.promptEntries[store.promptEntries.length - 1]
      : [];

  return {
    promptTokens: lastPrompt,
    promptHistory,
    toolTokens,
    pathTokens,
  };
}
