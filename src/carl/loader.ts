import os from "os";
import path from "path";
import {
  findFallbackCarl,
  findGlobalCarl,
  findProjectCarl,
  type CarlSourcePath,
} from "../integration/paths";
import {
  loadSessionOverrides,
  applySessionOverrides,
  type SessionOverrides,
} from "./session-overrides";
import {
  parseDomainRules,
  parseManifest,
  resolveDomainFile,
  type ParsedManifest,
} from "./validate";
import type {
  CarlRuleDiscoveryResult,
  CarlRuleDiscoveryWarning,
  CarlRuleDomainPayload,
  CarlRuleSource,
  CarlProjectStatus,
} from "./types";

export interface CarlRuleDiscoveryOverrides {
  projectCarlDir?: string;
  globalCarlDir?: string;
  fallbackCarlDir?: string;
}

export interface CarlRuleDiscoveryOptions {
  cwd?: string;
  homeDir?: string;
  projectRoot?: string;
  overrides?: CarlRuleDiscoveryOverrides;
  /** When false, project rules are skipped even if .carl/ exists */
  projectOptIn?: boolean;
  /** Session ID for per-session domain overrides */
  sessionId?: string;
}

interface ResolvedSource {
  scope: CarlRuleSource["scope"];
  path: CarlSourcePath;
  manifest: ParsedManifest;
}

interface ProjectLoadResult {
  source: ResolvedSource | null;
  domains: string[];
  payloads: CarlRuleDomainPayload[];
  warnings: CarlRuleDiscoveryWarning[];
  isValid: boolean;
}

function resolveSourceFromOverride(carlDir?: string): CarlSourcePath | null {
  if (!carlDir) {
    return null;
  }

  const manifestPath = path.join(carlDir, "manifest");
  return {
    root: path.dirname(carlDir),
    carlDir,
    manifestPath,
  };
}

function resolveManifest(
  scope: CarlRuleSource["scope"],
  sourcePath: CarlSourcePath | null,
  warnings: CarlRuleDiscoveryWarning[]
): ResolvedSource | null {
  if (!sourcePath) {
    return null;
  }

  const manifest = parseManifest(sourcePath.manifestPath);

  // Add scope to manifest warnings
  for (const w of manifest.warnings) {
    w.scope = scope;
  }
  warnings.push(...manifest.warnings);

  if (!manifest.isValid) {
    return null;
  }

  return { scope, path: sourcePath, manifest };
}

function getActiveDomains(manifest: ParsedManifest): string[] {
  return Object.values(manifest.domains)
    .filter((domain) => domain.state)
    .map((domain) => domain.name);
}

function loadDomainPayloads(
  source: ResolvedSource,
  domains: string[],
  warnings: CarlRuleDiscoveryWarning[]
): CarlRuleDomainPayload[] {
  const payloads: CarlRuleDomainPayload[] = [];

  for (const domain of domains) {
    const domainPath = resolveDomainFile(source.path.carlDir, domain, warnings);
    if (!domainPath) {
      continue;
    }

    const parsed = parseDomainRules(domainPath, domain);

    // Add scope to domain warnings
    for (const w of parsed.warnings) {
      w.scope = source.scope;
    }
    warnings.push(...parsed.warnings);

    const manifestConfig = source.manifest.domains[domain];

    const payload: CarlRuleDomainPayload = {
      domain,
      scope: source.scope,
      sourcePath: source.path.carlDir,
      rules: parsed.rules,
      state: manifestConfig?.state ?? false,
      alwaysOn: manifestConfig?.alwaysOn ?? false,
      recall: manifestConfig?.recall ?? [],
      exclude: manifestConfig?.exclude ?? [],
    };

    // Include bracket data for CONTEXT domain
    if (domain === "CONTEXT") {
      payload.bracketFlags = parsed.bracketFlags;
      payload.bracketRules = parsed.bracketRules;
    }

    payloads.push(payload);
  }

  return payloads;
}

function toSourceEntry(
  source: ResolvedSource,
  domains: string[]
): CarlRuleSource {
  return {
    scope: source.scope,
    path: source.path.carlDir,
    domains: [...domains].sort(),
  };
}

/**
 * Load project rules with validation tracking.
 * Returns all warnings scoped to "project" for invalid detection.
 */
function loadProjectRules(
  projectPath: CarlSourcePath | null,
  allWarnings: CarlRuleDiscoveryWarning[]
): ProjectLoadResult {
  const projectWarnings: CarlRuleDiscoveryWarning[] = [];

  if (!projectPath) {
    return {
      source: null,
      domains: [],
      payloads: [],
      warnings: projectWarnings,
      isValid: true, // No project is valid (not invalid)
    };
  }

  // Check if manifest exists
  const manifest = parseManifest(projectPath.manifestPath);

  // Add scope to manifest warnings
  for (const w of manifest.warnings) {
    w.scope = "project";
  }
  projectWarnings.push(...manifest.warnings);
  allWarnings.push(...manifest.warnings);

  // Manifest parse failure = invalid
  if (!manifest.isValid) {
    return {
      source: null,
      domains: [],
      payloads: [],
      warnings: projectWarnings,
      isValid: false,
    };
  }

  const source: ResolvedSource = {
    scope: "project",
    path: projectPath,
    manifest,
  };

  const projectDomains = getActiveDomains(manifest);
  const payloads = loadDomainPayloads(source, projectDomains, allWarnings);

  // Collect domain warnings scoped to project
  for (const w of allWarnings) {
    if (w.scope === "project" && !projectWarnings.includes(w)) {
      projectWarnings.push(w);
    }
  }

  // Check for invalid domain rules (malformed, missing files)
  const hasInvalidDomainWarnings = projectWarnings.some(
    (w) =>
      w.domain &&
      (w.message.includes("Malformed") ||
        w.message.includes("Invalid") ||
        w.message.includes("Missing"))
  );

  const loadedDomains = payloads.map((p) => p.domain);

  return {
    source,
    domains: loadedDomains,
    payloads,
    warnings: projectWarnings,
    isValid: !hasInvalidDomainWarnings,
  };
}

export function loadCarlRules(
  options: CarlRuleDiscoveryOptions = {}
): CarlRuleDiscoveryResult {
  const warnings: CarlRuleDiscoveryWarning[] = [];
  const cwd = options.cwd ?? process.cwd();
  const homeDir = options.homeDir ?? os.homedir();
  const projectRoot = options.projectRoot ?? cwd;
  const overrides = options.overrides ?? {};
  const projectOptIn = options.projectOptIn ?? true;

  const projectPath =
    resolveSourceFromOverride(overrides.projectCarlDir) ??
    findProjectCarl(cwd);
  const globalPath =
    resolveSourceFromOverride(overrides.globalCarlDir) ??
    findGlobalCarl(homeDir);
  const fallbackPath =
    resolveSourceFromOverride(overrides.fallbackCarlDir) ??
    findFallbackCarl(projectRoot);

  const globalSource = resolveManifest("global", globalPath, warnings);

  const sources: CarlRuleSource[] = [];
  const finalDomains = new Map<string, CarlRuleSource["scope"]>();
  const domainPayloads = new Map<string, CarlRuleDomainPayload>();

  // Determine project status
  let projectStatus: CarlProjectStatus = "none";
  let projectWarnings: CarlRuleDiscoveryWarning[] = [];

  // Load project rules with opt-in check
  const projectResult = loadProjectRules(
    projectOptIn ? projectPath : null,
    warnings
  );

  if (!projectOptIn && projectPath) {
    // Opt-in disabled but project exists - treat as "none" (not loaded)
    projectStatus = "none";
  } else if (projectResult.source) {
    if (projectResult.isValid) {
      projectStatus = "valid";
    } else {
      projectStatus = "invalid";
      projectWarnings = projectResult.warnings;
    }
  }

  // Load global rules
  let loadedGlobalDomains: string[] | null = null;
  let loadedGlobalPayloads: CarlRuleDomainPayload[] | null = null;

  if (globalSource) {
    const globalDomains = getActiveDomains(globalSource.manifest);
    loadedGlobalPayloads = loadDomainPayloads(
      globalSource,
      globalDomains,
      warnings
    );
    loadedGlobalDomains = loadedGlobalPayloads.map((payload) => payload.domain);
  }

  // Apply global rules (filtered by project overrides if project is valid)
  const projectOverrides = new Set(
    projectStatus === "valid" ? projectResult.domains : []
  );

  if (loadedGlobalDomains) {
    const filteredGlobal = loadedGlobalDomains.filter(
      (domain) => !projectOverrides.has(domain)
    );
    const filteredGlobalPayloads = (loadedGlobalPayloads ?? []).filter(
      (payload) => !projectOverrides.has(payload.domain)
    );

    for (const domain of filteredGlobal) {
      finalDomains.set(domain, "global");
    }

    for (const payload of filteredGlobalPayloads) {
      domainPayloads.set(payload.domain, payload);
    }

    sources.push(toSourceEntry(globalSource as ResolvedSource, filteredGlobal));
  }

  // Apply project rules only if valid
  if (projectStatus === "valid" && projectResult.domains.length > 0) {
    for (const domain of projectResult.domains) {
      finalDomains.set(domain, "project");
    }

    for (const payload of projectResult.payloads) {
      domainPayloads.set(payload.domain, payload);
    }

    sources.push(
      toSourceEntry(projectResult.source as ResolvedSource, projectResult.domains)
    );
  }

  // Fallback rules only if no project and no global
  let fallbackSource: ResolvedSource | null = null;

  if (!projectResult.source && !globalSource && fallbackPath) {
    fallbackSource = resolveManifest("fallback", fallbackPath, warnings);
    if (fallbackSource) {
      const fallbackDomains = getActiveDomains(fallbackSource.manifest);
      const loadedPayloads = loadDomainPayloads(
        fallbackSource,
        fallbackDomains,
        warnings
      );
      const loadedDomains = loadedPayloads.map((payload) => payload.domain);

      for (const domain of loadedDomains) {
        finalDomains.set(domain, "fallback");
      }

      for (const payload of loadedPayloads) {
        domainPayloads.set(payload.domain, payload);
      }

      sources.push(toSourceEntry(fallbackSource, loadedDomains));
    }
  }

  // Determine which .carl/ directory to use for session overrides
  const sessionCarlDir =
    (projectStatus === "valid" ? projectResult.source?.path.carlDir : null) ??
    globalSource?.path.carlDir ??
    fallbackSource?.path.carlDir;

  // Load and apply session overrides
  let sessionOverrides: SessionOverrides | null = null;
  if (options.sessionId && sessionCarlDir) {
    sessionOverrides = loadSessionOverrides(sessionCarlDir, options.sessionId);
  }

  // Apply session overrides to filter domains
  let domains = Array.from(finalDomains.keys()).sort();
  let filteredDomainPayloads = new Map(domainPayloads);

  if (sessionOverrides) {
    const activeDomains = applySessionOverrides(domains, sessionOverrides);
    const disabledDomains = new Set(
      domains.filter((d) => !activeDomains.includes(d))
    );

    // Update domains list
    domains = activeDomains;

    // Filter payloads for disabled domains
    for (const disabledDomain of disabledDomains) {
      filteredDomainPayloads.delete(disabledDomain);
      finalDomains.delete(disabledDomain);
    }

    // Update sources to reflect filtered domains
    for (const source of sources) {
      source.domains = source.domains.filter(
        (d) => !disabledDomains.has(d)
      );
    }
  }

  const effectiveManifest =
    projectStatus === "valid"
      ? projectResult.source?.manifest
      : globalSource?.manifest ?? fallbackSource?.manifest;
  const globalExclude = effectiveManifest?.globalExclude ?? [];
  const devmode = effectiveManifest?.devmode ?? false;

  return {
    sources,
    domains,
    warnings,
    domainPayloads: Object.fromEntries(filteredDomainPayloads.entries()),
    globalExclude,
    devmode,
    projectStatus,
    projectWarnings,
  };
}
