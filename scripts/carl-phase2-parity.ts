import fs from "fs";
import os from "os";
import path from "path";
import { matchDomainsForTurn } from "../src/opencarl/matcher";
import { buildOpencarlInjection } from "../src/opencarl/injector";
import { resolveOpencarlCommandSignals } from "../src/opencarl/command-parity";
import { buildOpencarlHelpGuidance } from "../src/opencarl/help-text";
import type {
  OpencarlMatchDomainConfig,
  OpencarlMatchRequest,
  OpencarlRuleDomainPayload,
} from "../src/opencarl/types";

type MatchingFixture = {
  domainSets: Record<string, OpencarlMatchDomainConfig[]>;
  cases: Array<{
    id: string;
    description?: string;
    domainSet: string;
    input: Omit<OpencarlMatchRequest, "domains">;
    expected: {
      globalExcludeTriggered?: boolean;
      globalExcludeKeywords?: string[];
      matchedDomains?: string[];
      excludedDomains?: string[];
      domainResults?: Array<{
        domain: string;
        matchedKeywords?: string[];
        excludedKeywords?: string[];
        exclusionSource?: string;
      }>;
    };
  }>;
};

type InjectionFixture = {
  payloadSets: Record<string, Record<string, OpencarlRuleDomainPayload>>;
  cases: Array<{
    id: string;
    description?: string;
    payloadSet: string;
    input: {
      matchedDomains?: string[];
      commandDomains?: string[];
    };
    expected: {
      sectionsOrder?: string[];
      domainOrder?: Record<string, string[]>;
      includes?: string[];
    };
  }>;
};

type CommandFixture = {
  commandFiles: Record<string, string[]>;
  cases: Array<{
    id: string;
    description?: string;
    commandFile: string;
    input: {
      promptText?: string;
      commandOverrides?: string[];
    };
    expected: {
      commandDomains?: string[];
      unresolvedTokens?: string[];
      payloadContains?: string;
      parityWithStarPrompt?: string;
    };
  }>;
};

function readFixture<T>(fixturePath: string): T {
  const raw = fs.readFileSync(fixturePath, "utf8");
  return JSON.parse(raw) as T;
}

function buildDomainMap(domains: OpencarlMatchDomainConfig[]) {
  return domains.reduce<Record<string, OpencarlMatchDomainConfig>>((acc, domain) => {
    acc[domain.name] = domain;
    return acc;
  }, {});
}

function normalizeArray(values: string[] = []): string[] {
  return values.map((value) => value.trim()).filter(Boolean);
}

function assertArrayEqual(
  actual: string[],
  expected: string[],
  label: string,
  options: { unordered?: boolean } = {}
): void {
  const left = normalizeArray(actual);
  const right = normalizeArray(expected);
  const order = options.unordered ? "(unordered)" : "(ordered)";
  const normalizedLeft = options.unordered ? [...left].sort() : left;
  const normalizedRight = options.unordered ? [...right].sort() : right;

  if (normalizedLeft.length !== normalizedRight.length) {
    throw new Error(
      `${label} ${order} length mismatch: expected ${JSON.stringify(
        normalizedRight
      )}, got ${JSON.stringify(normalizedLeft)}`
    );
  }

  for (let i = 0; i < normalizedRight.length; i += 1) {
    if (normalizedLeft[i] !== normalizedRight[i]) {
      throw new Error(
        `${label} ${order} mismatch: expected ${JSON.stringify(
          normalizedRight
        )}, got ${JSON.stringify(normalizedLeft)}`
      );
    }
  }
}

function runCategory<T>(
  name: string,
  cases: T[],
  runner: (fixtureCase: T) => void
): void {
  const failures: Array<{ id: string; error: string }> = [];
  console.log(`\n${name.toUpperCase()}`);
  for (const fixtureCase of cases) {
    const id = (fixtureCase as { id?: string }).id ?? "unknown";
    const description = (fixtureCase as { description?: string }).description;
    const label = description ? `${id} ${description}` : id;
    try {
      runner(fixtureCase);
      console.log(`✔ ${label}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`✖ ${label}`);
      console.error(message);
      failures.push({ id, error: message });
    }
  }

  console.log(
    `${name.toUpperCase()} SUMMARY: ${cases.length - failures.length} passed, ${
      failures.length
    } failed`
  );

  if (failures.length > 0) {
    process.exit(1);
  }
}

function parseInjectionOutput(output: string): {
  sectionsOrder: string[];
  domainOrder: Record<string, string[]>;
} {
  const sectionsOrder: string[] = [];
  const domainOrder: Record<string, string[]> = {};
  let currentSection: string | null = null;

  for (const rawLine of output.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    if (
      line === "COMMAND DOMAINS (explicit)" ||
      line === "ALWAYS-ON DOMAINS" ||
      line === "MATCHED DOMAINS"
    ) {
      currentSection = line;
      sectionsOrder.push(line);
      domainOrder[currentSection] = [];
      continue;
    }

    const match = line.match(/^\[([A-Z0-9_-]+)\] RULES:$/);
    if (match && currentSection) {
      domainOrder[currentSection].push(match[1]);
    }
  }

  return { sectionsOrder, domainOrder };
}

function runMatchingFixtures(): void {
  const fixturePath = path.resolve(
    "scripts",
    "fixtures",
    "phase2",
    "matching.json"
  );
  const fixture = readFixture<MatchingFixture>(fixturePath);

  runCategory("Matching", fixture.cases, (fixtureCase) => {
    const domains = fixture.domainSets[fixtureCase.domainSet] ?? [];
    const request: OpencarlMatchRequest = {
      promptText: fixtureCase.input.promptText,
      signals: fixtureCase.input.signals,
      domains: buildDomainMap(domains),
      globalExclude: fixtureCase.input.globalExclude,
    };

    const result = matchDomainsForTurn(request);
    const expected = fixtureCase.expected;

    if (expected.globalExcludeTriggered !== undefined) {
      if (result.globalExclude.triggered !== expected.globalExcludeTriggered) {
        throw new Error(
          `globalExclude.triggered expected ${expected.globalExcludeTriggered} got ${result.globalExclude.triggered}`
        );
      }
    }

    if (expected.globalExcludeKeywords) {
      assertArrayEqual(
        result.globalExclude.matchedKeywords,
        expected.globalExcludeKeywords,
        "globalExclude.matchedKeywords",
        { unordered: true }
      );
    }

    if (expected.matchedDomains) {
      assertArrayEqual(
        result.matchedDomains,
        expected.matchedDomains,
        "matchedDomains"
      );
    }

    if (expected.excludedDomains) {
      assertArrayEqual(
        result.excludedDomains,
        expected.excludedDomains,
        "excludedDomains"
      );
    }

    if (expected.domainResults) {
      for (const expectedResult of expected.domainResults) {
        const actual = result.domainResults.find(
          (entry) => entry.domain === expectedResult.domain
        );
        if (!actual) {
          throw new Error(
            `domainResults missing ${expectedResult.domain}: ${JSON.stringify(
              result.domainResults
            )}`
          );
        }

        if (expectedResult.matchedKeywords) {
          assertArrayEqual(
            actual.matchedKeywords,
            expectedResult.matchedKeywords,
            `${expectedResult.domain}.matchedKeywords`,
            { unordered: true }
          );
        }

        if (expectedResult.excludedKeywords) {
          assertArrayEqual(
            actual.excludedKeywords,
            expectedResult.excludedKeywords,
            `${expectedResult.domain}.excludedKeywords`,
            { unordered: true }
          );
        }

        if (expectedResult.exclusionSource) {
          if (actual.exclusionSource !== expectedResult.exclusionSource) {
            throw new Error(
              `${expectedResult.domain}.exclusionSource expected ${expectedResult.exclusionSource} got ${actual.exclusionSource}`
            );
          }
        }
      }
    }
  });
}

function runInjectionFixtures(): void {
  const fixturePath = path.resolve(
    "scripts",
    "fixtures",
    "phase2",
    "injection.json"
  );
  const fixture = readFixture<InjectionFixture>(fixturePath);

  runCategory("Injection", fixture.cases, (fixtureCase) => {
    const payloads = fixture.payloadSets[fixtureCase.payloadSet] ?? {};
    const output = buildOpencarlInjection({
      domainPayloads: payloads,
      matchedDomains: fixtureCase.input.matchedDomains,
      commandDomains: fixtureCase.input.commandDomains,
    });

    if (!output) {
      throw new Error("Expected non-empty injection output");
    }

    const parsed = parseInjectionOutput(output);
    const expected = fixtureCase.expected;

    if (expected.sectionsOrder) {
      assertArrayEqual(
        parsed.sectionsOrder,
        expected.sectionsOrder,
        "sectionsOrder"
      );
    }

    if (expected.domainOrder) {
      for (const [section, domains] of Object.entries(expected.domainOrder)) {
        const actual = parsed.domainOrder[section] ?? [];
        assertArrayEqual(actual, domains, `${section} domains`);
      }
    }

    if (expected.includes) {
      for (const needle of expected.includes) {
        if (!output.includes(needle)) {
          throw new Error(`Missing expected output fragment: ${needle}`);
        }
      }
    }
  });
}

function writeCommandFile(lines: string[]): { dir: string; filePath: string } {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "carl-cmd-"));
  const filePath = path.join(tempDir, "commands");
  fs.writeFileSync(filePath, lines.join("\n"), "utf8");
  return { dir: tempDir, filePath };
}

function runCommandFixtures(): void {
  const fixturePath = path.resolve(
    "scripts",
    "fixtures",
    "phase2",
    "commands.json"
  );
  const fixture = readFixture<CommandFixture>(fixturePath);
  const guidance = buildOpencarlHelpGuidance();

  runCategory("Commands", fixture.cases, (fixtureCase) => {
    const commandLines = fixture.commandFiles[fixtureCase.commandFile] ?? [];
    const { dir, filePath } = writeCommandFile(commandLines);
    try {
      const commandsPayload: OpencarlRuleDomainPayload = {
        domain: "COMMANDS",
        scope: "project",
        sourcePath: dir,
        rules: [],
        state: true,
        alwaysOn: false,
        recall: [],
        exclude: [],
      };

      const result = resolveOpencarlCommandSignals({
        promptText: fixtureCase.input.promptText,
        commandOverrides: fixtureCase.input.commandOverrides,
        commandsPayload,
        commandFilePath: filePath,
        helpGuidance: guidance.combined,
      });

      const expected = fixtureCase.expected;

      if (expected.commandDomains) {
        assertArrayEqual(
          result.commandDomains,
          expected.commandDomains,
          "commandDomains"
        );
      }

      if (expected.unresolvedTokens) {
        assertArrayEqual(
          result.unresolvedTokens,
          expected.unresolvedTokens,
          "unresolvedTokens",
          { unordered: true }
        );
      }

      if (expected.payloadContains) {
        const payloadText = Object.values(result.commandPayloads)
          .flatMap((payload) => payload.rules)
          .join("\n");
        if (!payloadText.includes(expected.payloadContains)) {
          throw new Error(
            `payloadContains missing: ${expected.payloadContains}`
          );
        }
      }

      if (expected.parityWithStarPrompt) {
        const starResult = resolveOpencarlCommandSignals({
          promptText: expected.parityWithStarPrompt,
          commandsPayload,
          commandFilePath: filePath,
          helpGuidance: guidance.combined,
        });

        assertArrayEqual(
          result.commandDomains,
          starResult.commandDomains,
          "parity commandDomains"
        );

        const starRules = starResult.commandPayloads.CARL?.rules ?? [];
        const slashRules = result.commandPayloads.CARL?.rules ?? [];
        assertArrayEqual(slashRules, starRules, "parity CARL rules");
      }
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
}

function runCriticalLinks(): void {
  const results: Array<{ name: string; ok: boolean; detail?: string }> = [];

  const baseDomains: OpencarlMatchDomainConfig[] = [
    {
      name: "ALPHA",
      state: true,
      recall: ["alpha"],
      exclude: ["skip"],
      alwaysOn: false,
    },
  ];

  const exclusionResult = matchDomainsForTurn({
    promptText: "block alpha skip",
    signals: {
      promptTokens: ["block", "alpha", "skip"],
      promptHistory: ["block", "alpha", "skip"],
      toolTokens: [],
      pathTokens: [],
    },
    domains: buildDomainMap(baseDomains),
    globalExclude: ["block"],
  });

  const exclusionOk =
    exclusionResult.globalExclude.triggered &&
    exclusionResult.matchedDomains.length === 0 &&
    exclusionResult.excludedDomains.length === 0;
  results.push({
    name: "Exclusion precedence (global-first, then domain)",
    ok: exclusionOk,
    detail: exclusionOk
      ? undefined
      : `globalExclude=${exclusionResult.globalExclude.triggered} matched=${JSON.stringify(
          exclusionResult.matchedDomains
        )} excluded=${JSON.stringify(exclusionResult.excludedDomains)}`,
  });

  const payloads: Record<string, OpencarlRuleDomainPayload> = {
    GLOBAL: {
      domain: "GLOBAL",
      scope: "global",
      sourcePath: "/tmp/.opencarl",
      rules: ["Global rule"],
      state: true,
      alwaysOn: true,
      recall: ["global"],
      exclude: [],
    },
    DEV: {
      domain: "DEV",
      scope: "project",
      sourcePath: "/tmp/.opencarl",
      rules: ["Dev rule"],
      state: true,
      alwaysOn: false,
      recall: ["dev"],
      exclude: [],
    },
  };

  const first = buildOpencarlInjection({
    domainPayloads: payloads,
    matchedDomains: ["DEV"],
  });
  const second = buildOpencarlInjection({
    domainPayloads: payloads,
    matchedDomains: ["DEV"],
  });

  const injectionOk = Boolean(first) && first === second;
  results.push({
    name: "Injection ordering deterministic for repeated runs",
    ok: injectionOk,
    detail: injectionOk ? undefined : "Injection output changed between runs",
  });

  const guidance = buildOpencarlHelpGuidance();
  const { dir, filePath } = writeCommandFile([
    "CARL_RULE_1=Open the CARL manager UI",
  ]);

  try {
    const commandsPayload: OpencarlRuleDomainPayload = {
      domain: "COMMANDS",
      scope: "project",
      sourcePath: dir,
      rules: [],
      state: true,
      alwaysOn: false,
      recall: [],
      exclude: [],
    };

    const starResult = resolveOpencarlCommandSignals({
      promptText: "*carl help",
      commandsPayload,
      commandFilePath: filePath,
      helpGuidance: guidance.combined,
    });

    const slashResult = resolveOpencarlCommandSignals({
      promptText: "",
      commandOverrides: ["carl"],
      commandsPayload,
      commandFilePath: filePath,
      helpGuidance: guidance.combined,
    });

    const starRules = starResult.commandPayloads.CARL?.rules ?? [];
    const slashRules = slashResult.commandPayloads.CARL?.rules ?? [];
    const commandParityOk =
      starResult.commandDomains.join(",") ===
        slashResult.commandDomains.join(",") &&
      starRules.join("\n") === slashRules.join("\n");

    results.push({
      name: "Star/slash command parity for CARL help mode",
      ok: commandParityOk,
      detail: commandParityOk
        ? undefined
        : `starDomains=${starResult.commandDomains.join(",")} slashDomains=${slashResult.commandDomains.join(",")}`,
    });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }

  console.log("\nCRITICAL LINKS");
  console.log("=".repeat(48));
  for (const result of results) {
    if (result.ok) {
      console.log(`✔ ${result.name}`);
    } else {
      console.log(`✖ ${result.name}`);
      if (result.detail) {
        console.log(`  ${result.detail}`);
      }
    }
  }

  const failed = results.filter((result) => !result.ok).length;
  const passed = results.length - failed;
  console.log(`CRITICAL LINKS SUMMARY: ${passed} passed, ${failed} failed`);

  if (results.some((result) => !result.ok)) {
    process.exit(1);
  }
}

runMatchingFixtures();
runInjectionFixtures();
runCommandFixtures();
runCriticalLinks();
