import os from "os";
import path from "path";
import {
  findFallbackCarl,
  findGlobalCarl,
  findProjectCarl,
  type CarlSourcePath,
} from "../integration/paths";
import {
  parseDomainRules,
  parseManifest,
  resolveDomainFile,
  type ParsedManifest,
} from "./validate";
import type {
  CarlRuleDiscoveryResult,
  CarlRuleDiscoveryWarning,
  CarlRuleSource,
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
}

interface ResolvedSource {
  scope: CarlRuleSource["scope"];
  path: CarlSourcePath;
  manifest: ParsedManifest;
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

function loadDomainWarnings(
  source: ResolvedSource,
  domains: string[],
  warnings: CarlRuleDiscoveryWarning[]
): string[] {
  const loaded: string[] = [];

  for (const domain of domains) {
    const domainPath = resolveDomainFile(source.path.carlDir, domain, warnings);
    if (!domainPath) {
      continue;
    }

    const parsed = parseDomainRules(domainPath, domain);
    warnings.push(...parsed.warnings);
    loaded.push(domain);
  }

  return loaded;
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

export function loadCarlRules(
  options: CarlRuleDiscoveryOptions = {}
): CarlRuleDiscoveryResult {
  const warnings: CarlRuleDiscoveryWarning[] = [];
  const cwd = options.cwd ?? process.cwd();
  const homeDir = options.homeDir ?? os.homedir();
  const projectRoot = options.projectRoot ?? cwd;
  const overrides = options.overrides ?? {};

  const projectPath =
    resolveSourceFromOverride(overrides.projectCarlDir) ??
    findProjectCarl(cwd);
  const globalPath =
    resolveSourceFromOverride(overrides.globalCarlDir) ??
    findGlobalCarl(homeDir);
  const fallbackPath =
    resolveSourceFromOverride(overrides.fallbackCarlDir) ??
    findFallbackCarl(projectRoot);

  const projectSource = resolveManifest("project", projectPath, warnings);
  const globalSource = resolveManifest("global", globalPath, warnings);

  const sources: CarlRuleSource[] = [];
  const finalDomains = new Map<string, CarlRuleSource["scope"]>();

  let loadedGlobalDomains: string[] | null = null;
  let loadedProjectDomains: string[] | null = null;

  if (globalSource) {
    const globalDomains = getActiveDomains(globalSource.manifest);
    loadedGlobalDomains = loadDomainWarnings(
      globalSource,
      globalDomains,
      warnings
    );
  }

  if (projectSource) {
    const projectDomains = getActiveDomains(projectSource.manifest);
    loadedProjectDomains = loadDomainWarnings(
      projectSource,
      projectDomains,
      warnings
    );
  }

  if (loadedGlobalDomains) {
    const projectOverrides = new Set(loadedProjectDomains ?? []);
    const filteredGlobal = loadedGlobalDomains.filter(
      (domain) => !projectOverrides.has(domain)
    );

    for (const domain of filteredGlobal) {
      finalDomains.set(domain, "global");
    }

    sources.push(toSourceEntry(globalSource as ResolvedSource, filteredGlobal));
  }

  if (loadedProjectDomains) {
    for (const domain of loadedProjectDomains) {
      finalDomains.set(domain, "project");
    }

    sources.push(
      toSourceEntry(projectSource as ResolvedSource, loadedProjectDomains)
    );
  }

  if (!projectSource && !globalSource && fallbackPath) {
    const fallbackSource = resolveManifest("fallback", fallbackPath, warnings);
    if (fallbackSource) {
      const fallbackDomains = getActiveDomains(fallbackSource.manifest);
      const loadedDomains = loadDomainWarnings(
        fallbackSource,
        fallbackDomains,
        warnings
      );

      for (const domain of loadedDomains) {
        finalDomains.set(domain, "fallback");
      }

      sources.push(toSourceEntry(fallbackSource, loadedDomains));
    }
  }

  const domains = Array.from(finalDomains.keys()).sort();

  return {
    sources,
    domains,
    warnings,
  };
}
