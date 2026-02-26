import type {
  CarlDomainMatchResult,
  CarlMatchDomainConfig,
  CarlMatchRequest,
  CarlMatchResult,
} from "./types";

function normalizeKeyword(value: string): string {
  return value.trim().toLowerCase();
}

function keywordMatchesSignals(keyword: string, signals: string[]): boolean {
  if (!keyword) {
    return false;
  }

  return signals.some((entry) => entry.includes(keyword));
}

function collectSignalHaystack(request: CarlMatchRequest): string[] {
  const haystack = new Set<string>();
  const promptText = request.promptText.trim().toLowerCase();
  if (promptText) {
    haystack.add(promptText);
  }

  for (const token of request.signals.toolTokens) {
    const normalized = token.trim().toLowerCase();
    if (normalized) {
      haystack.add(normalized);
    }
  }

  for (const token of request.signals.pathTokens) {
    const normalized = token.trim().toLowerCase();
    if (normalized) {
      haystack.add(normalized);
    }
  }

  return Array.from(haystack);
}

function getDomainEntries(domains: Record<string, CarlMatchDomainConfig>) {
  return Object.values(domains)
    .filter((domain) => domain.state)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function matchDomainsForTurn(request: CarlMatchRequest): CarlMatchResult {
  const haystack = collectSignalHaystack(request);
  const globalExcludeMatches = request.globalExclude
    .map((entry) => normalizeKeyword(entry))
    .filter((entry) => entry.length > 0)
    .filter((entry) => keywordMatchesSignals(entry, haystack));

  if (globalExcludeMatches.length > 0) {
    return {
      globalExclude: {
        matchedKeywords: globalExcludeMatches,
        triggered: true,
      },
      matchedDomains: [],
      excludedDomains: [],
      domainResults: [],
    };
  }

  const domainResults: CarlDomainMatchResult[] = [];
  const matchedDomains: string[] = [];
  const excludedDomains: string[] = [];

  for (const domain of getDomainEntries(request.domains)) {
    if (domain.alwaysOn) {
      continue;
    }

    const excludeMatches = domain.exclude
      .map((entry) => normalizeKeyword(entry))
      .filter((entry) => entry.length > 0)
      .filter((entry) => keywordMatchesSignals(entry, haystack));

    if (excludeMatches.length > 0) {
      excludedDomains.push(domain.name);
      domainResults.push({
        domain: domain.name,
        matchedKeywords: [],
        excludedKeywords: excludeMatches,
        exclusionSource: "domain",
      });
      continue;
    }

    const recallMatches = domain.recall
      .map((entry) => normalizeKeyword(entry))
      .filter((entry) => entry.length > 0)
      .filter((entry) => keywordMatchesSignals(entry, haystack));

    if (recallMatches.length > 0) {
      matchedDomains.push(domain.name);
      domainResults.push({
        domain: domain.name,
        matchedKeywords: recallMatches,
        excludedKeywords: [],
      });
    }
  }

  return {
    globalExclude: {
      matchedKeywords: [],
      triggered: false,
    },
    matchedDomains: [...matchedDomains].sort(),
    excludedDomains: [...excludedDomains].sort(),
    domainResults,
  };
}
