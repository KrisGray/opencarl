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
  scope?: CarlRuleSourceScope;
}

export type CarlProjectStatus = "valid" | "invalid" | "none";

export interface CarlRuleDiscoveryResult {
  sources: CarlRuleSource[];
  domains: string[];
  warnings: CarlRuleDiscoveryWarning[];
  domainPayloads: Record<string, CarlRuleDomainPayload>;
  globalExclude: string[];
  devmode: boolean;
  projectStatus: CarlProjectStatus;
  projectWarnings: CarlRuleDiscoveryWarning[];
}

export interface CarlRuleDomainPayload {
  domain: string;
  scope: CarlRuleSourceScope;
  sourcePath: string;
  rules: string[];
  state: boolean;
  alwaysOn: boolean;
  recall: string[];
  exclude: string[];
  /** CONTEXT domain: bracket enable/disable flags (e.g., { FRESH: true, DEPLETED: false }) */
  bracketFlags?: Record<string, boolean>;
  /** CONTEXT domain: rules organized by bracket (e.g., { FRESH: ["rule1"], DEPLETED: ["rule2"] }) */
  bracketRules?: Record<string, string[]>;
}

export type CarlSignalSource = "prompt" | "tool" | "path";

export interface CarlSessionSignals {
  promptTokens: string[];
  promptHistory: string[];
  toolTokens: string[];
  pathTokens: string[];
}

export interface CarlMatchDomainConfig {
  name: string;
  state: boolean;
  recall: string[];
  exclude: string[];
  alwaysOn: boolean;
}

export interface CarlMatchRequest {
  promptText: string;
  signals: CarlSessionSignals;
  domains: Record<string, CarlMatchDomainConfig>;
  globalExclude: string[];
}

export type CarlExclusionSource = "global" | "domain";

export interface CarlDomainMatchResult {
  domain: string;
  matchedKeywords: string[];
  excludedKeywords: string[];
  exclusionSource?: CarlExclusionSource;
}

export interface CarlGlobalExcludeResult {
  matchedKeywords: string[];
  triggered: boolean;
}

export interface CarlMatchResult {
  globalExclude: CarlGlobalExcludeResult;
  matchedDomains: string[];
  excludedDomains: string[];
  domainResults: CarlDomainMatchResult[];
}
