export type OpencarlRuleSourceScope = "project" | "global" | "fallback";

export interface OpencarlRuleSource {
  scope: OpencarlRuleSourceScope;
  path: string;
  domains: string[];
}

export interface OpencarlRuleDiscoveryWarning {
  message: string;
  path?: string;
  domain?: string;
  scope?: OpencarlRuleSourceScope;
}

export type OpencarlProjectStatus = "valid" | "invalid" | "none";

export interface OpencarlRuleDiscoveryResult {
  sources: OpencarlRuleSource[];
  domains: string[];
  warnings: OpencarlRuleDiscoveryWarning[];
  domainPayloads: Record<string, OpencarlRuleDomainPayload>;
  globalExclude: string[];
  devmode: boolean;
  projectStatus: OpencarlProjectStatus;
  projectWarnings: OpencarlRuleDiscoveryWarning[];
}

export interface OpencarlRuleDomainPayload {
  domain: string;
  scope: OpencarlRuleSourceScope;
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

export type OpencarlSignalSource = "prompt" | "tool" | "path";

export interface OpencarlSessionSignals {
  promptTokens: string[];
  promptHistory: string[];
  toolTokens: string[];
  pathTokens: string[];
}

export interface OpencarlMatchDomainConfig {
  name: string;
  state: boolean;
  recall: string[];
  exclude: string[];
  alwaysOn: boolean;
}

export interface OpencarlMatchRequest {
  promptText: string;
  signals: OpencarlSessionSignals;
  domains: Record<string, OpencarlMatchDomainConfig>;
  globalExclude: string[];
}

export type OpencarlExclusionSource = "global" | "domain";

export interface OpencarlDomainMatchResult {
  domain: string;
  matchedKeywords: string[];
  excludedKeywords: string[];
  exclusionSource?: OpencarlExclusionSource;
}

export interface OpencarlGlobalExcludeResult {
  matchedKeywords: string[];
  triggered: boolean;
}

export interface OpencarlMatchResult {
  globalExclude: OpencarlGlobalExcludeResult;
  matchedDomains: string[];
  excludedDomains: string[];
  domainResults: OpencarlDomainMatchResult[];
}
