/**
 * Scope of an OpenCARL rule source.
 * @category Configuration
 */
export type OpencarlRuleSourceScope = "project" | "global" | "fallback";

/**
 * Represents a source of OpenCARL rules (project, global, or fallback).
 * @category Configuration
 */
export interface OpencarlRuleSource {
  scope: OpencarlRuleSourceScope;
  path: string;
  domains: string[];
}

/**
 * Warning generated during rule discovery.
 * @category Configuration
 */
export interface OpencarlRuleDiscoveryWarning {
  message: string;
  path?: string;
  domain?: string;
  scope?: OpencarlRuleSourceScope;
}

/**
 * Status of an OpenCARL project configuration.
 * @category Configuration
 */
export type OpencarlProjectStatus = "valid" | "invalid" | "none";

/**
 * Result of loading and discovering OpenCARL rules from all sources.
 * @category Configuration
 */
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

/**
 * Payload containing the rules and configuration for a single domain.
 * @category Configuration
 */
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

/**
 * Source of a signal token in the session.
 * @category Signals
 */
export type OpencarlSignalSource = "prompt" | "tool" | "path";

/**
 * Collection of signal tokens accumulated during a session.
 * Used for domain matching and rule activation.
 * @category Signals
 */
export interface OpencarlSessionSignals {
  promptTokens: string[];
  promptHistory: string[];
  toolTokens: string[];
  pathTokens: string[];
}

/**
 * Configuration for a domain during matching operations.
 * @category Matching
 */
export interface OpencarlMatchDomainConfig {
  name: string;
  state: boolean;
  recall: string[];
  exclude: string[];
  alwaysOn: boolean;
}

/**
 * Request to match domains against current turn signals.
 * @category Matching
 */
export interface OpencarlMatchRequest {
  promptText: string;
  signals: OpencarlSessionSignals;
  domains: Record<string, OpencarlMatchDomainConfig>;
  globalExclude: string[];
}

/**
 * Source of an exclusion match.
 * @category Matching
 */
export type OpencarlExclusionSource = "global" | "domain";

/**
 * Result of matching a single domain against signals.
 * @category Matching
 */
export interface OpencarlDomainMatchResult {
  domain: string;
  matchedKeywords: string[];
  excludedKeywords: string[];
  exclusionSource?: OpencarlExclusionSource;
}

/**
 * Result of checking global exclude patterns.
 * @category Matching
 */
export interface OpencarlGlobalExcludeResult {
  matchedKeywords: string[];
  triggered: boolean;
}

/**
 * Complete result of domain matching for a turn.
 * @category Matching
 */
export interface OpencarlMatchResult {
  globalExclude: OpencarlGlobalExcludeResult;
  matchedDomains: string[];
  excludedDomains: string[];
  domainResults: OpencarlDomainMatchResult[];
}
