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
  CarlRuleDomainPayload,
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
    warnings.push(...parsed.warnings);

    const manifestConfig = source.manifest.domains[domain];

    payloads.push({
      domain,
      scope: source.scope,
      sourcePath: source.path.carlDir,
      rules: parsed.rules,
      state: manifestConfig?.state ?? false,
      alwaysOn: manifestConfig?.alwaysOn ?? false,
      recall: manifestConfig?.recall ?? [],
      exclude: manifestConfig?.exclude ?? [],
    });
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
  const domainPayloads = new Map<string, CarlRuleDomainPayload>();

  let loadedGlobalDomains: string[] | null = null;
  let loadedProjectDomains: string[] | null = null;
  let loadedGlobalPayloads: CarlRuleDomainPayload[] | null = null;
  let loadedProjectPayloads: CarlRuleDomainPayload[] | null = null;

  if (globalSource) {
    const globalDomains = getActiveDomains(globalSource.manifest);
    loadedGlobalPayloads = loadDomainPayloads(
      globalSource,
      globalDomains,
      warnings
    );
    loadedGlobalDomains = loadedGlobalPayloads.map((payload) => payload.domain);
  }

  if (projectSource) {
    const projectDomains = getActiveDomains(projectSource.manifest);
    loadedProjectPayloads = loadDomainPayloads(
      projectSource,
      projectDomains,
      warnings
    );
    loadedProjectDomains = loadedProjectPayloads.map((payload) => payload.domain);
  }

  if (loadedGlobalDomains) {
    const projectOverrides = new Set(loadedProjectDomains ?? []);
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

  if (loadedProjectDomains) {
    for (const domain of loadedProjectDomains) {
      finalDomains.set(domain, "project");
    }

    for (const payload of loadedProjectPayloads ?? []) {
      domainPayloads.set(payload.domain, payload);
    }

    sources.push(
      toSourceEntry(projectSource as ResolvedSource, loadedProjectDomains)
    );
  }

  let fallbackSource: ResolvedSource | null = null;

  if (!projectSource && !globalSource && fallbackPath) {
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

  const domains = Array.from(finalDomains.keys()).sort();
  const effectiveManifest =
    projectSource?.manifest ?? globalSource?.manifest ?? fallbackSource?.manifest;
  const globalExclude = effectiveManifest?.globalExclude ?? [];
  const devmode = effectiveManifest?.devmode ?? false;

  return {
    sources,
    domains,
    warnings,
    domainPayloads: Object.fromEntries(domainPayloads.entries()),
    globalExclude,
    devmode,
  };
}
