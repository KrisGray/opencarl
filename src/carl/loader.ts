import type { CarlRuleDiscoveryResult } from "./types";

export function loadCarlRules(): CarlRuleDiscoveryResult {
  return {
    sources: [],
    domains: [],
    warnings: [],
  };
}
