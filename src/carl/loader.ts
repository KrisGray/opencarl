import * as os from "os";
import * as path from "path";
import {
  findFallbackCarl,
  findGlobalCarl,
  findProjectCarl,
  type CarlSourcePath as OpencarlSourcePath,
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
  OpencarlRuleDiscoveryResult,
  OpencarlRuleDiscoveryWarning,
  OpencarlRuleDomainPayload,
  OpencarlRuleSource,
  OpencarlProjectStatus,
} from "./types";
import {
  OpencarlError,
  configReadError,
  domainLoadError,
  permissionError,
} from "./errors";
import { debugFileLoad } from "./debug";

export interface OpencarlRuleDiscoveryOverrides {
  projectOpencarlDir?: string;
  globalOpencarlDir?: string;
  fallbackOpencarlDir?: string;
}

export interface OpencarlRuleDiscoveryOptions {
  cwd?: string;
  homeDir?: string;
  projectRoot?: string;
  overrides?: OpencarlRuleDiscoveryOverrides;
  /** When false, project rules are skipped even if .opencarl/ exists */
  projectOptIn?: boolean;
  /** Session ID for per-session domain overrides */
  sessionId?: string;
}

interface ResolvedSource {
  scope: OpencarlRuleSource["scope"];
  path: OpencarlSourcePath;
  manifest: ParsedManifest;
}

interface ProjectLoadResult {
  source: ResolvedSource | null;
  domains: string[];
  payloads: OpencarlRuleDomainPayload[];
  warnings: OpencarlRuleDiscoveryWarning[];
  isValid: boolean;
}

function resolveSourceFromOverride(opencarlDir?: string): OpencarlSourcePath | null {
  if (!opencarlDir) {
    return null;
  }

  const manifestPath = path.join(opencarlDir, "manifest");
  return {
    root: path.dirname(opencarlDir),
    carlDir: opencarlDir,
    manifestPath,
  };
}

function resolveManifest(
  scope: OpencarlRuleSource["scope"],
  sourcePath: OpencarlSourcePath | null,
  warnings: OpencarlRuleDiscoveryWarning[]
): ResolvedSource | null {
  if (!sourcePath) {
    return null;
  }

  let manifest: ParsedManifest;
  try {
    manifest = parseManifest(sourcePath.manifestPath);
  } catch (error) {
    // Handle file read errors (permission denied, etc.)
    if (error instanceof Error) {
      if (error.message.includes("EACCES") || error.message.includes("permission")) {
        throw permissionError(sourcePath.manifestPath, "read manifest");
      }
      throw configReadError(sourcePath.manifestPath, error.message);
    }
    throw configReadError(sourcePath.manifestPath, String(error));
  }

  // Add scope to manifest warnings
  for (const w of manifest.warnings) {
    w.scope = scope;
  }
  warnings.push(...manifest.warnings);

  if (!manifest.isValid) {
    debugFileLoad(sourcePath.manifestPath, scope, false);
    return null;
  }

  debugFileLoad(sourcePath.manifestPath, scope, true);
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
  warnings: OpencarlRuleDiscoveryWarning[]
): OpencarlRuleDomainPayload[] {
  const payloads: OpencarlRuleDomainPayload[] = [];

  for (const domain of domains) {
    const domainPath = resolveDomainFile(source.path.carlDir, domain, warnings);
    if (!domainPath) {
      continue;
    }

    let parsed;
    try {
      parsed = parseDomainRules(domainPath, domain);
    } catch (error) {
      // Handle file read errors (permission issues, encoding problems)
      if (error instanceof Error && error.message.includes("EACCES")) {
        throw permissionError(domainPath, "read");
      }
      throw domainLoadError(domain, domainPath, error instanceof Error ? error.message : String(error));
    }

    // Add scope to domain warnings
    for (const w of parsed.warnings) {
      w.scope = source.scope;
    }
    warnings.push(...parsed.warnings);

    debugFileLoad(domainPath, source.scope, true);

    const manifestConfig = source.manifest.domains[domain];

    const payload: OpencarlRuleDomainPayload = {
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
): OpencarlRuleSource {
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
  projectPath: OpencarlSourcePath | null,
  allWarnings: OpencarlRuleDiscoveryWarning[]
): ProjectLoadResult {
  const projectWarnings: OpencarlRuleDiscoveryWarning[] = [];

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

export function loadOpencarlRules(
  options: OpencarlRuleDiscoveryOptions = {}
): OpencarlRuleDiscoveryResult {
  const warnings: OpencarlRuleDiscoveryWarning[] = [];
  const cwd = options.cwd ?? process.cwd();
  const homeDir = options.homeDir ?? os.homedir();
  const projectRoot = options.projectRoot ?? cwd;
  const overrides = options.overrides ?? {};
  const projectOptIn = options.projectOptIn ?? true;

  const projectPath =
    resolveSourceFromOverride(overrides.projectOpencarlDir) ??
    findProjectCarl(cwd);
  const globalPath =
    resolveSourceFromOverride(overrides.globalOpencarlDir) ??
    findGlobalCarl(homeDir);
  const fallbackPath =
    resolveSourceFromOverride(overrides.fallbackOpencarlDir) ??
    findFallbackCarl(projectRoot);

  const globalSource = resolveManifest("global", globalPath, warnings);

  const sources: OpencarlRuleSource[] = [];
  const finalDomains = new Map<string, OpencarlRuleSource["scope"]>();
  const domainPayloads = new Map<string, OpencarlRuleDomainPayload>();

  // Determine project status
  let projectStatus: OpencarlProjectStatus = "none";
  let projectWarnings: OpencarlRuleDiscoveryWarning[] = [];

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
  let loadedGlobalPayloads: OpencarlRuleDomainPayload[] | null = null;

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
  const sessionOpencarlDir =
    (projectStatus === "valid" ? projectResult.source?.path.carlDir : null) ??
    globalSource?.path.carlDir ??
    fallbackSource?.path.carlDir;

  // Load and apply session overrides
  let sessionOverrides: SessionOverrides | null = null;
  if (options.sessionId && sessionOpencarlDir) {
    sessionOverrides = loadSessionOverrides(sessionOpencarlDir, options.sessionId);
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
