import path from "path";
import { buildCarlHelpGuidance } from "../src/carl/help-text";
import {
  resolveCarlCommandSignals,
  type CarlCommandResolutionResult,
} from "../src/carl/command-parity";
import type { CarlRuleDomainPayload } from "../src/carl/types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function runFixture(name: string, check: () => void) {
  try {
    check();
    console.log(`✔ ${name}`);
  } catch (error) {
    console.error(`✖ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

const commandsPayload: CarlRuleDomainPayload = {
  domain: "COMMANDS",
  scope: "fallback",
  sourcePath: path.resolve(".carl-template"),
  rules: [],
  state: true,
  alwaysOn: false,
  recall: [],
  exclude: [],
};

const guidance = buildCarlHelpGuidance();

function resolveWithPrompt(promptText: string): CarlCommandResolutionResult {
  return resolveCarlCommandSignals({
    promptText,
    commandsPayload,
    helpGuidance: guidance.combined,
  });
}

runFixture("*carl help guidance", () => {
  const result = resolveWithPrompt("*carl show me help");
  const carlPayload = result.commandPayloads.CARL;

  assert(result.commandDomains[0] === "CARL", "Expected CARL command first");
  assert(Boolean(carlPayload), "Expected CARL payload to be present");
  assert(
    carlPayload.rules.join("\n").includes("Context Augmentation & Reinforcement Layer"),
    "Expected CARL guidance from docs"
  );
});

runFixture("*brief command rules", () => {
  const result = resolveWithPrompt("*brief response only");
  const briefPayload = result.commandPayloads.BRIEF;

  assert(result.commandDomains.includes("BRIEF"), "Expected BRIEF command");
  assert(Boolean(briefPayload), "Expected BRIEF payload to be present");
  assert(
    briefPayload.rules.some((rule) =>
      rule.includes("Bullet points only - no prose paragraphs")
    ),
    "Expected BRIEF rules from commands file"
  );
});

runFixture("multi-command ordering", () => {
  const result = resolveWithPrompt("*brief and *dev please");
  assert(
    result.commandDomains.join(",") === "BRIEF,DEV",
    "Expected command order to follow prompt order"
  );
});

runFixture("/carl fallback parity", () => {
  const starResult = resolveWithPrompt("*carl");
  const slashResult = resolveCarlCommandSignals({
    promptText: "",
    commandOverrides: ["carl"],
    commandsPayload,
    helpGuidance: guidance.combined,
  });

  assert(
    starResult.commandDomains.join(",") === slashResult.commandDomains.join(","),
    "Expected /carl to match *carl command domains"
  );
  assert(
    Boolean(slashResult.commandPayloads.CARL),
    "Expected /carl to resolve CARL payload"
  );
});

runFixture("unresolved command diagnostics", () => {
  const result = resolveWithPrompt("*ghost");
  assert(
    result.unresolvedTokens.includes("GHOST"),
    "Expected unresolved command token"
  );
  assert(
    result.commandDomains.length === 0,
    "Expected no resolved command domains for unknown command"
  );
});

if (process.exitCode && process.exitCode !== 0) {
  process.exit(process.exitCode);
}
