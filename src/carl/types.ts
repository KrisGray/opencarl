export type CarlRuleSourceScope = "project" | "global" | "fallback";

export interface CarlRuleSource {
  scope: CarlRuleSourceScope;
  path: string;
  domains: string[];
}

export interface CarlRuleDiscoveryWarning {
  message: string;
  path?: string;
  domain?: string;
}

export interface CarlRuleDiscoveryResult {
  sources: CarlRuleSource[];
  domains: string[];
  warnings: CarlRuleDiscoveryWarning[];
}
