import path from "path";
import { buildOpencarlHelpGuidance } from "../src/opencarl/help-text";
import {
  resolveOpencarlCommandSignals,
  type OpencarlCommandResolutionResult,
} from "../src/opencarl/command-parity";
import type { OpencarlRuleDomainPayload } from "../src/opencarl/types";

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

const commandsPayload: OpencarlRuleDomainPayload = {
  domain: "COMMANDS",
  scope: "fallback",
  sourcePath: path.resolve(".opencarl-template"),
  rules: [],
  state: true,
  alwaysOn: false,
  recall: [],
  exclude: [],
};

const guidance = buildOpencarlHelpGuidance();

function resolveWithPrompt(promptText: string): OpencarlCommandResolutionResult {
  return resolveOpencarlCommandSignals({
    promptText,
    commandsPayload,
    helpGuidance: guidance.combined,
  });
}

runFixture("*carl help guidance", () => {
  const result = resolveWithPrompt("*opencarl show me help");
  const opencarlPayload = result.commandPayloads.OPENCARL;

  assert(result.commandDomains[0] === "OPENCARL", "Expected OPENCARL command first");
  assert(Boolean(opencarlPayload), "Expected OPENCARL payload to be present");
  assert(
    opencarlPayload.rules.join("\n").includes("Context Augmentation & Reinforcement Layer"),
    "Expected OPENCARL guidance from docs"
  );
});

runFixture("*brief command rules", () => {
  const result = resolveWithPrompt("*opencarl response only");
  const opencarlPayload = result.commandPayloads.OPENCARL;

  assert(result.commandDomains.includes("OPENCARL"), "Expected OPENCARL command");
  assert(Boolean(opencarlPayload), "Expected OPENCARL payload to be present");
  assert(
    opencarlPayload.rules.some((rule) =>
      rule.includes("Bullet points only - no prose paragraphs")
    ),
    "Expected OPENCARL rules from commands file"
  );
});

runFixture("multi-command ordering", () => {
  const result = resolveWithPrompt("*opencarl and *dev please");
    assert(
    result.commandDomains.join(",") === "OPENCARL,DEV",
    "Expected command order in follow prompt order"
  );
});

runFixture("/opencarl fallback parity", () => {
  const starResult = resolveWithPrompt("*opencarl");
  const slashResult = resolveOpencarlCommandSignals({
    promptText: "",
    commandOverrides: ["opencarl"],
    commandsPayload,
    helpGuidance: guidance.combined,
  });

  assert(
    starResult.commandDomains.join(",") === slashResult.commandDomains.join(","),
    "Expected /opencarl to match *opencarl command domains"
  );
  assert(
    Boolean(slashResult.commandPayloads.OPENCARL),
    "Expected /opencarl to resolve OPENCARL payload"
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
