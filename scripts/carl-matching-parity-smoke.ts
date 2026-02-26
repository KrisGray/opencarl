import { matchDomainsForTurn } from "../src/carl/matcher";
import type { CarlMatchDomainConfig, CarlMatchRequest } from "../src/carl/types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function buildDomains(domains: CarlMatchDomainConfig[]) {
  return domains.reduce<Record<string, CarlMatchDomainConfig>>((acc, domain) => {
    acc[domain.name] = domain;
    return acc;
  }, {});
}

function runFixture(name: string, request: CarlMatchRequest, check: () => void) {
  try {
    matchDomainsForTurn(request);
    check();
    console.log(`✔ ${name}`);
  } catch (error) {
    console.error(`✖ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

const domains = buildDomains([
  {
    name: "ALPHA",
    state: true,
    recall: ["alpha"],
    exclude: [],
    alwaysOn: false,
  },
  {
    name: "BETA",
    state: true,
    recall: ["beta"],
    exclude: ["skip"],
    alwaysOn: false,
  },
  {
    name: "PATH",
    state: true,
    recall: ["matcher.ts"],
    exclude: [],
    alwaysOn: false,
  },
  {
    name: "TOOL",
    state: true,
    recall: ["bash"],
    exclude: [],
    alwaysOn: false,
  },
]);

runFixture(
  "recall-only match",
  {
    promptText: "alpha and beta",
    signals: {
      promptTokens: ["alpha", "beta"],
      promptHistory: ["alpha", "beta"],
      toolTokens: [],
      pathTokens: [],
    },
    domains,
    globalExclude: [],
  },
  () => {
    const result = matchDomainsForTurn({
      promptText: "alpha and beta",
      signals: {
        promptTokens: ["alpha", "beta"],
        promptHistory: ["alpha", "beta"],
        toolTokens: [],
        pathTokens: [],
      },
      domains,
      globalExclude: [],
    });

    assert(result.matchedDomains.length === 2, "Expected two matched domains");
    assert(result.matchedDomains[0] === "ALPHA", "Expected ALPHA first");
    assert(result.matchedDomains[1] === "BETA", "Expected BETA second");
  }
);

runFixture(
  "recall+exclude overlap",
  {
    promptText: "beta skip",
    signals: {
      promptTokens: ["beta", "skip"],
      promptHistory: ["beta", "skip"],
      toolTokens: [],
      pathTokens: [],
    },
    domains,
    globalExclude: [],
  },
  () => {
    const result = matchDomainsForTurn({
      promptText: "beta skip",
      signals: {
        promptTokens: ["beta", "skip"],
        promptHistory: ["beta", "skip"],
        toolTokens: [],
        pathTokens: [],
      },
      domains,
      globalExclude: [],
    });

    assert(result.matchedDomains.length === 0, "Expected no matches due to exclusion");
    assert(result.excludedDomains.includes("BETA"), "Expected BETA to be excluded");
  }
);

runFixture(
  "global exclude short-circuit",
  {
    promptText: "block alpha",
    signals: {
      promptTokens: ["block", "alpha"],
      promptHistory: ["block", "alpha"],
      toolTokens: [],
      pathTokens: [],
    },
    domains,
    globalExclude: ["block"],
  },
  () => {
    const result = matchDomainsForTurn({
      promptText: "block alpha",
      signals: {
        promptTokens: ["block", "alpha"],
        promptHistory: ["block", "alpha"],
        toolTokens: [],
        pathTokens: [],
      },
      domains,
      globalExclude: ["block"],
    });

    assert(result.globalExclude.triggered, "Expected global exclude to trigger");
    assert(result.matchedDomains.length === 0, "Expected no matches when global exclude triggers");
  }
);

runFixture(
  "tool/path-driven match",
  {
    promptText: "no keyword",
    signals: {
      promptTokens: ["no", "keyword"],
      promptHistory: ["no", "keyword"],
      toolTokens: ["bash"],
      pathTokens: ["/Users/kris/Repos/carl/src/carl/matcher.ts", "matcher.ts"],
    },
    domains,
    globalExclude: [],
  },
  () => {
    const result = matchDomainsForTurn({
      promptText: "no keyword",
      signals: {
        promptTokens: ["no", "keyword"],
        promptHistory: ["no", "keyword"],
        toolTokens: ["bash"],
        pathTokens: ["/Users/kris/Repos/carl/src/carl/matcher.ts", "matcher.ts"],
      },
      domains,
      globalExclude: [],
    });

    assert(result.matchedDomains.includes("TOOL"), "Expected TOOL match from tool token");
    assert(result.matchedDomains.includes("PATH"), "Expected PATH match from path token");
  }
);

if (process.exitCode && process.exitCode !== 0) {
  process.exit(process.exitCode);
}
