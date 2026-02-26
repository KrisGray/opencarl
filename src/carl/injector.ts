import type { CarlRuleDomainPayload } from "./types";
import type { ContextBracket, ContextBracketData } from "./context-brackets";
import { getRulesBracket, selectBracketRules, formatCriticalWarning } from "./context-brackets";

export interface CarlInjectionInput {
  domainPayloads: Record<string, CarlRuleDomainPayload>;
  matchedDomains?: string[];
  commandDomains?: string[];
  /** Context bracket data for CONTEXT rule filtering */
  contextBracket?: ContextBracketData;
}

function normalizeDomainName(domain: string): string {
  return domain.trim().toUpperCase();
}

function sortPayloads(payloads: CarlRuleDomainPayload[]): CarlRuleDomainPayload[] {
  return [...payloads].sort((left, right) =>
    left.domain.localeCompare(right.domain)
  );
}

function renderDomainRules(payload: CarlRuleDomainPayload): string[] {
  const lines: string[] = [];
  lines.push(`[${payload.domain}] RULES:`);

  payload.rules.forEach((rule, index) => {
    lines.push(`  ${index + 1}. ${rule}`);
  });

  return lines;
}

/**
 * Render CONTEXT domain rules with bracket filtering.
 * Only includes rules for the active bracket.
 */
function renderContextRules(
  payload: CarlRuleDomainPayload,
  contextBracket?: ContextBracketData
): string[] {
  const lines: string[] = [];

  // If no bracket data, render all rules (backward compatibility)
  if (!contextBracket || !payload.bracketRules) {
    return renderDomainRules(payload);
  }

  const rulesBracket = contextBracket.rulesBracket;
  const activeRules = selectBracketRules(
    payload.bracketRules,
    payload.bracketFlags ?? {},
    rulesBracket
  );

  if (activeRules.length === 0) {
    // No rules for this bracket
    return [];
  }

  // Add critical warning if in CRITICAL state
  if (contextBracket.isCritical && contextBracket.contextRemaining !== null) {
    lines.push(formatCriticalWarning(contextBracket.contextRemaining));
    lines.push("");
  }

  // Add bracket header
  if (contextBracket.contextRemaining !== null) {
    lines.push(`CONTEXT BRACKET: [${contextBracket.bracket}] (${contextBracket.contextRemaining.toFixed(0)}% remaining)`);
  } else {
    lines.push(`CONTEXT BRACKET: [${contextBracket.bracket}] (fresh session)`);
  }

  // Add bracket rules header
  lines.push("");
  lines.push(`[${rulesBracket}] CONTEXT RULES:`);
  activeRules.forEach((rule, index) => {
    lines.push(`  ${index + 1}. ${rule}`);
  });

  return lines;
}

export function buildCarlInjection(input: CarlInjectionInput): string | null {
  const payloadMap = input.domainPayloads ?? {};
  const commandSet = new Set(
    (input.commandDomains ?? []).map((domain) => normalizeDomainName(domain))
  );
  const matchedSet = new Set(
    (input.matchedDomains ?? []).map((domain) => normalizeDomainName(domain))
  );
  const contextBracket = input.contextBracket;

  const commandPayloads = sortPayloads(
    Array.from(commandSet)
      .map((domain) => payloadMap[domain])
      .filter((payload): payload is CarlRuleDomainPayload => Boolean(payload))
      .filter((payload) => payload.state)
      .filter((payload) => payload.rules.length > 0)
  );

  const alwaysOnPayloads = sortPayloads(
    Object.values(payloadMap)
      .filter((payload) => payload.state)
      .filter((payload) => payload.alwaysOn || payload.domain === "GLOBAL")
      .filter((payload) => payload.rules.length > 0)
      .filter((payload) => !commandSet.has(payload.domain))
  );

  const matchedPayloads = sortPayloads(
    Array.from(matchedSet)
      .map((domain) => payloadMap[domain])
      .filter((payload): payload is CarlRuleDomainPayload => Boolean(payload))
      .filter((payload) => payload.state)
      .filter((payload) => !commandSet.has(payload.domain))
      .filter((payload) => !(payload.alwaysOn || payload.domain === "GLOBAL"))
      .filter((payload) => payload.rules.length > 0)
  );

  // Check if CONTEXT domain has bracket-filtered rules
  const contextPayload = payloadMap["CONTEXT"];
  const hasContextRules = contextPayload && contextPayload.state && (
    contextBracket?.bracketRules
      ? selectBracketRules(
          contextPayload.bracketRules ?? {},
          contextPayload.bracketFlags ?? {},
          contextBracket.rulesBracket
        ).length > 0
      : contextPayload.rules.length > 0
  );

  if (
    commandPayloads.length === 0 &&
    alwaysOnPayloads.length === 0 &&
    matchedPayloads.length === 0 &&
    !hasContextRules
  ) {
    return null;
  }

  const lines: string[] = ["<carl-rules>"];

  // Context bracket header (if CONTEXT domain is active)
  if (hasContextRules && contextBracket) {
    if (contextBracket.contextRemaining !== null) {
      if (contextBracket.isCritical) {
        lines.push(`⚠️ CONTEXT CRITICAL: ${contextBracket.contextRemaining.toFixed(0)}% remaining ⚠️`);
        lines.push("Recommend: compact session OR spawn fresh agent for remaining work");
        lines.push("");
      }
      lines.push(`CONTEXT BRACKET: [${contextBracket.bracket}] (${contextBracket.contextRemaining.toFixed(0)}% remaining)`);
    } else {
      lines.push(`CONTEXT BRACKET: [${contextBracket.bracket}] (fresh session)`);
    }
    lines.push("");
  }

  if (commandPayloads.length > 0) {
    lines.push("COMMAND DOMAINS (explicit)");
    lines.push("=".repeat(48));
    for (const payload of commandPayloads) {
      lines.push(...renderDomainRules(payload));
      lines.push("");
    }
  }

  if (alwaysOnPayloads.length > 0) {
    // always-on domains section
    lines.push("ALWAYS-ON DOMAINS");
    lines.push("=".repeat(48));
    for (const payload of alwaysOnPayloads) {
      // Handle CONTEXT domain specially in always-on
      if (payload.domain === "CONTEXT" && contextBracket) {
        const contextLines = renderContextRules(payload, contextBracket);
        if (contextLines.length > 0) {
          lines.push(...contextLines);
          lines.push("");
        }
      } else {
        lines.push(...renderDomainRules(payload));
        lines.push("");
      }
    }
  }

  if (matchedPayloads.length > 0) {
    lines.push("MATCHED DOMAINS");
    lines.push("=".repeat(48));
    for (const payload of matchedPayloads) {
      // Handle CONTEXT domain specially in matched
      if (payload.domain === "CONTEXT" && contextBracket) {
        const contextLines = renderContextRules(payload, contextBracket);
        if (contextLines.length > 0) {
          lines.push(...contextLines);
          lines.push("");
        }
      } else {
        lines.push(...renderDomainRules(payload));
        lines.push("");
      }
    }
  }

  // Include CONTEXT as matched if not already included but has rules
  if (
    hasContextRules &&
    contextPayload &&
    !matchedSet.has("CONTEXT") &&
    !alwaysOnPayloads.some((p) => p.domain === "CONTEXT") &&
    contextPayload.state
  ) {
    if (matchedPayloads.length === 0 && alwaysOnPayloads.length === 0 && commandPayloads.length === 0) {
      // Only CONTEXT rules, no other domains
      lines.push("MATCHED DOMAINS");
      lines.push("=".repeat(48));
    }
    const contextLines = renderContextRules(contextPayload, contextBracket);
    if (contextLines.length > 0) {
      lines.push(...contextLines);
      lines.push("");
    }
  }

  lines.push("</carl-rules>");
  return `${lines.join("\n")}\n`;
}
