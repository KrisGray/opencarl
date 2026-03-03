/**
 * Context bracket utilities for CONTEXT domain rule filtering.
 *
 * Brackets are determined by token headroom:
 * - FRESH: ≥60% remaining
 * - MODERATE: ≥40% remaining
 * - DEPLETED: ≥25% remaining
 * - CRITICAL: <25% remaining (uses DEPLETED rules with warning)
 */
export type ContextBracket = "FRESH" | "MODERATE" | "DEPLETED" | "CRITICAL";

export interface ContextBracketData {
  /** Computed bracket from token headroom */
  bracket: ContextBracket;
  /** Context remaining percentage (0-100), null if unknown */
  contextRemaining: number | null;
  /** Whether this is a critical context state */
  isCritical: boolean;
  /** The actual bracket whose rules should be used (DEPLETED for CRITICAL) */
  rulesBracket: ContextBracket;
}

/** Bracket thresholds (percentage remaining) */
const BRACKET_THRESHOLDS = {
  FRESH: 60,
  MODERATE: 40,
  DEPLETED: 25,
  CRITICAL: 0,
} as const;

/** Default max context size (200k tokens for most models) */
const DEFAULT_MAX_CONTEXT = 200000;

/**
 * Determine context bracket from percentage remaining.
 * Returns FRESH if percentage is null (unknown/fresh session).
 */
export function getContextBracket(
  contextRemaining: number | null,
): ContextBracket {
  if (contextRemaining === null) {
    return "FRESH";
  }

  if (contextRemaining >= BRACKET_THRESHOLDS.FRESH) {
    return "FRESH";
  }
  if (contextRemaining >= BRACKET_THRESHOLDS.MODERATE) {
    return "MODERATE";
  }
  if (contextRemaining >= BRACKET_THRESHOLDS.DEPLETED) {
    return "DEPLETED";
  }
  return "CRITICAL";
}

/**
 * Get the bracket whose rules should be used.
 * CRITICAL bracket uses DEPLETED rules.
 */
export function getRulesBracket(bracket: ContextBracket): ContextBracket {
  return bracket === "CRITICAL" ? "DEPLETED" : bracket;
}

/**
 * Compute full context bracket data from token usage.
 *
 * @param tokensUsed - Current token usage (input + cache)
 * @param maxContext - Maximum context size (defaults to 200k)
 * @returns Complete bracket data for injection
 */
export function computeContextBracketData(
  tokensUsed: number | null,
  maxContext: number = DEFAULT_MAX_CONTEXT,
): ContextBracketData {
  if (tokensUsed === null || tokensUsed <= 0) {
    return {
      bracket: "FRESH",
      contextRemaining: null,
      isCritical: false,
      rulesBracket: "FRESH",
    };
  }

  const contextRemaining = Math.max(
    0,
    100 - Math.floor((tokensUsed * 100) / maxContext),
  );
  const bracket = getContextBracket(contextRemaining);
  const isCritical = bracket === "CRITICAL";
  const rulesBracket = getRulesBracket(bracket);

  return {
    bracket,
    contextRemaining,
    isCritical,
    rulesBracket,
  };
}

/**
 * Parse context file for bracket-specific rules.
 *
 * Context file format:
 * - {BRACKET}_RULES = true/false (enable/disable bracket)
 * - {BRACKET}_RULE_N = rule text
 *
 * @param content - Raw file content
 * @returns Tuple of [bracketFlags, bracketRules]
 */
export function parseContextFile(
  content: string,
): [Record<string, boolean>, Record<string, string[]>] {
  const bracketFlags: Record<string, boolean> = {};
  const bracketRules: Record<string, string[]> = {};

  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) {
      continue;
    }

    const [rawKey, rawValue] = line.split("=", 2);
    const key = rawKey?.trim() ?? "";
    const value = rawValue?.trim() ?? "";

    if (!key || !value) {
      continue;
    }

    // Detect bracket flags: {BRACKET}_RULES = true/false
    const flagMatch = key.match(/^(FRESH|MODERATE|DEPLETED|CRITICAL)_RULES$/);
    if (flagMatch) {
      const bracketName = flagMatch[1];
      const normalized = value.toLowerCase();
      bracketFlags[bracketName] = ["true", "yes", "1"].includes(normalized);
      continue;
    }

    // Detect rules: {BRACKET}_RULE_{N} = rule text
    const ruleMatch = key.match(
      /^(FRESH|MODERATE|DEPLETED|CRITICAL)_RULE_(\d+)$/,
    );
    if (ruleMatch) {
      const bracketName = ruleMatch[1];
      if (!bracketRules[bracketName]) {
        bracketRules[bracketName] = [];
      }
      bracketRules[bracketName].push(value);
    }
  }

  return [bracketFlags, bracketRules];
}

/**
 * Select rules for the current context bracket.
 *
 * @param bracketRules - All bracket rules from context file
 * @param bracketFlags - Bracket enable/disable flags
 * @param rulesBracket - The bracket whose rules to use (already mapped for CRITICAL)
 * @returns Rules for the active bracket, or empty array if disabled/missing
 */
export function selectBracketRules(
  bracketRules: Record<string, string[]>,
  bracketFlags: Record<string, boolean>,
  rulesBracket: ContextBracket,
): string[] {
  // Check if this bracket is enabled (default: true if not specified)
  const isEnabled = bracketFlags[rulesBracket] ?? true;
  if (!isEnabled) {
    return [];
  }

  return bracketRules[rulesBracket] ?? [];
}

/**
 * Format context bracket header for injection.
 *
 * @param data - Context bracket data
 * @returns Formatted header string or null if no bracket info
 */
export function formatContextBracketHeader(
  data: ContextBracketData,
): string | null {
  const lines: string[] = [];

  if (data.isCritical) {
    const remaining = data.contextRemaining ?? 0;
    lines.push(`⚠️ CONTEXT CRITICAL: ${remaining.toFixed(0)}% remaining ⚠️`);
    lines.push(
      "Recommend: compact session OR spawn fresh agent for remaining work",
    );
    lines.push("");
  }

  if (data.contextRemaining !== null) {
    lines.push(
      `CONTEXT BRACKET: [${data.bracket}] (${data.contextRemaining.toFixed(0)}% remaining)`,
    );
  } else {
    lines.push(`CONTEXT BRACKET: [${data.bracket}] (fresh session)`);
  }

  return lines.join("\n");
}

/**
 * Format critical warning for injection.
 *
 * @param contextRemaining - Percentage remaining
 * @returns Warning string
 */
export function formatCriticalWarning(contextRemaining: number): string {
  return `⚠️ CONTEXT CRITICAL: ${contextRemaining.toFixed(0)}% remaining ⚠️\nRecommend: compact session OR spawn fresh agent for remaining work`;
}
