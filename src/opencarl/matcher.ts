import type {
  OpencarlDomainMatchResult,
  OpencarlMatchDomainConfig,
  OpencarlMatchRequest,
  OpencarlMatchResult,
} from "./types";
import { debugRuleMatch } from "./debug";

function normalizeKeyword(value: string): string {
  return value.trim().toLowerCase();
}

function keywordMatchesSignals(keyword: string, signals: string[]): boolean {
  if (!keyword) {
    return false;
  }

  return signals.some((entry) => entry.includes(keyword));
}

function collectSignalHaystack(request: OpencarlMatchRequest): string[] {
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

function getDomainEntries(domains: Record<string, OpencarlMatchDomainConfig>) {
  return Object.values(domains)
    .filter((domain) => domain.state)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Match domains against current turn signals.
 *
 * Evaluates each domain's recall and exclude patterns against the current
 * prompt text and session signals to determine which domains should be activated.
 *
 * @category Matching
 * @param request - The match request containing prompt text, signals, and domain configs
 * @returns Match result with activated and excluded domains
 */
export function matchDomainsForTurn(request: OpencarlMatchRequest): OpencarlMatchResult {
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

  const domainResults: OpencarlDomainMatchResult[] = [];
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
      debugRuleMatch(domain.name, haystack, [], excludeMatches);
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
      debugRuleMatch(domain.name, haystack, recallMatches, []);
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
