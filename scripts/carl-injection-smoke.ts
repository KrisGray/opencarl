import { buildCarlInjection } from "../src/carl/injector";
import type { CarlRuleDomainPayload } from "../src/carl/types";

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

console.log("[carl] Injection smoke checks passed.");
