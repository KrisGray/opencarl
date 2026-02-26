import { buildCarlInjection } from "../src/carl/injector";
import type { CarlRuleDomainPayload } from "../src/carl/types";
import { computeContextBracketData } from "../src/carl/context-brackets";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`[carl] Injection smoke failure: ${message}`);
  }
}

const payloads: Record<string, CarlRuleDomainPayload> = {
  GLOBAL: {
    domain: "GLOBAL",
    scope: "global",
    sourcePath: "/tmp/.carl",
    rules: ["Global rule"],
    state: true,
    alwaysOn: true,
    recall: ["global"],
    exclude: [],
  },
  OPS: {
    domain: "OPS",
    scope: "global",
    sourcePath: "/tmp/.carl",
    rules: ["Ops rule"],
    state: true,
    alwaysOn: true,
    recall: ["ops"],
    exclude: [],
  },
  DEV: {
    domain: "DEV",
    scope: "project",
    sourcePath: "/tmp/.carl",
    rules: ["Dev rule"],
    state: true,
    alwaysOn: false,
    recall: ["dev"],
    exclude: [],
  },
  COMMANDS: {
    domain: "COMMANDS",
    scope: "project",
    sourcePath: "/tmp/.carl",
    rules: ["Command rule"],
    state: true,
    alwaysOn: false,
    recall: [],
    exclude: [],
  },
};

const input = {
  domainPayloads: payloads,
  matchedDomains: ["DEV", "GLOBAL", "OPS"],
  commandDomains: ["COMMANDS"],
};

const first = buildCarlInjection(input);
const second = buildCarlInjection(input);

assert(Boolean(first), "Expected injection output to be non-empty");
assert(first === second, "Injection output is not deterministic");

const output = first ?? "";
const commandIndex = output.indexOf("COMMAND DOMAINS");
const alwaysOnIndex = output.indexOf("ALWAYS-ON DOMAINS");
const matchedIndex = output.indexOf("MATCHED DOMAINS");

assert(commandIndex !== -1, "Missing command domains section");
assert(alwaysOnIndex !== -1, "Missing always-on section");
assert(matchedIndex !== -1, "Missing matched section");
assert(
  commandIndex < alwaysOnIndex && alwaysOnIndex < matchedIndex,
  "Section ordering is not command -> always-on -> matched"
);

const globalIndex = output.indexOf("[GLOBAL] RULES:");
const opsIndex = output.indexOf("[OPS] RULES:");
assert(globalIndex !== -1, "GLOBAL rules missing from output");
assert(opsIndex !== -1, "OPS rules missing from output");
assert(
  globalIndex < opsIndex,
  "Always-on domains are not sorted alphabetically"
);

const globalMatches = output.match(/\[GLOBAL\] RULES:/g) ?? [];
assert(globalMatches.length === 1, "GLOBAL rules are duplicated in output");
assert(output.includes("[DEV] RULES:"), "Matched domain rules missing");

// Test context bracket functionality
console.log("[carl] Testing context bracket filtering...");

// Test CONTEXT domain with bracket rules
const contextPayloads: Record<string, CarlRuleDomainPayload> = {
  GLOBAL: {
    domain: "GLOBAL",
    scope: "global",
    sourcePath: "/tmp/.carl",
    rules: ["Global rule"],
    state: true,
    alwaysOn: true,
    recall: ["global"],
    exclude: [],
  },
  CONTEXT: {
    domain: "CONTEXT",
    scope: "global",
    sourcePath: "/tmp/.carl",
    rules: ["Fresh rule", "Moderate rule", "Depleted rule"],
    state: true,
    alwaysOn: false,
    recall: [],
    exclude: [],
    bracketFlags: { FRESH: true, MODERATE: true, DEPLETED: true, CRITICAL: true },
    bracketRules: {
      FRESH: ["Fresh context: full memory available"],
      MODERATE: ["Moderate context: prioritize key info"],
      DEPLETED: ["Depleted context: be concise"],
    },
  },
};

// Test FRESH bracket
const freshBracket = computeContextBracketData(50000); // 75% remaining
assert(freshBracket.bracket === "FRESH", "Should be FRESH bracket at 75%");
assert(freshBracket.rulesBracket === "FRESH", "Rules bracket should match");

const freshInput = {
  domainPayloads: contextPayloads,
  matchedDomains: ["CONTEXT"],
  contextBracket: freshBracket,
};
const freshOutput = buildCarlInjection(freshInput) ?? "";
assert(freshOutput.includes("CONTEXT BRACKET: [FRESH]"), "Missing FRESH bracket header");
assert(freshOutput.includes("Fresh context: full memory available"), "Missing FRESH rule");
assert(!freshOutput.includes("CONTEXT CRITICAL"), "Should not have CRITICAL warning in FRESH");

// Test MODERATE bracket
const moderateBracket = computeContextBracketData(100000); // 50% remaining
assert(moderateBracket.bracket === "MODERATE", "Should be MODERATE bracket at 50%");

const moderateOutput = buildCarlInjection({
  domainPayloads: contextPayloads,
  matchedDomains: ["CONTEXT"],
  contextBracket: moderateBracket,
}) ?? "";
assert(moderateOutput.includes("CONTEXT BRACKET: [MODERATE]"), "Missing MODERATE bracket header");
assert(moderateOutput.includes("Moderate context: prioritize key info"), "Missing MODERATE rule");

// Test DEPLETED bracket
const depletedBracket = computeContextBracketData(150000); // 25% remaining
assert(depletedBracket.bracket === "DEPLETED", "Should be DEPLETED bracket at 25%");

const depletedOutput = buildCarlInjection({
  domainPayloads: contextPayloads,
  matchedDomains: ["CONTEXT"],
  contextBracket: depletedBracket,
}) ?? "";
assert(depletedOutput.includes("CONTEXT BRACKET: [DEPLETED]"), "Missing DEPLETED bracket header");
assert(depletedOutput.includes("Depleted context: be concise"), "Missing DEPLETED rule");

// Test CRITICAL bracket (uses DEPLETED rules)
const criticalBracket = computeContextBracketData(180000); // 10% remaining
assert(criticalBracket.bracket === "CRITICAL", "Should be CRITICAL bracket at 10%");
assert(criticalBracket.isCritical === true, "isCritical should be true");
assert(criticalBracket.rulesBracket === "DEPLETED", "CRITICAL should use DEPLETED rules");

const criticalOutput = buildCarlInjection({
  domainPayloads: contextPayloads,
  matchedDomains: ["CONTEXT"],
  contextBracket: criticalBracket,
}) ?? "";
assert(criticalOutput.includes("CONTEXT CRITICAL"), "Missing CRITICAL warning");
assert(criticalOutput.includes("Recommend: compact session"), "Missing CRITICAL recommendation");
assert(criticalOutput.includes("CONTEXT BRACKET: [CRITICAL]"), "Missing CRITICAL bracket header");
assert(criticalOutput.includes("[DEPLETED] CONTEXT RULES:"), "CRITICAL should use DEPLETED rules section");
assert(criticalOutput.includes("Depleted context: be concise"), "CRITICAL should use DEPLETED rule content");

// Test fresh session (null tokens)
const freshSessionBracket = computeContextBracketData(null);
assert(freshSessionBracket.bracket === "FRESH", "Null tokens should default to FRESH");
assert(freshSessionBracket.contextRemaining === null, "Context remaining should be null");
assert(freshSessionBracket.isCritical === false, "Fresh session should not be critical");

console.log("[carl] Injection smoke checks passed.");
