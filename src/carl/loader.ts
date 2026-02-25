import fs from "fs";
import os from "os";
import path from "path";
import {
  findFallbackCarl,
  findGlobalCarl,
  findProjectCarl,
  type CarlSourcePath,
} from "../integration/paths";
import type { CarlRuleDiscoveryResult, CarlRuleSource } from "./types";

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

interface ParsedManifestDomains {
  domains: string[];
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

function parseBool(value: string): boolean | null {
  const normalized = value.trim().toLowerCase();

  if (["true", "yes", "1", "active", "on"].includes(normalized)) {
    return true;
  }

  if (["false", "no", "0", "inactive", "off"].includes(normalized)) {
    return false;
  }

  return null;
}

function parseManifestDomains(manifestPath: string): ParsedManifestDomains {
  try {
    const contents = fs.readFileSync(manifestPath, "utf8");
    const domains = new Set<string>();

    for (const rawLine of contents.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#") || !line.includes("=")) {
        continue;
      }

      const [rawKey, rawValue] = line.split("=", 2);
      const key = rawKey.trim();
      const value = rawValue.trim();
      if (!key.endsWith("_STATE")) {
        continue;
      }

      const domain = key.slice(0, -6);
      const state = parseBool(value);
      if (state) {
        domains.add(domain);
      }
    }

    return { domains: [...domains], isValid: true };
  } catch (error) {
    return { domains: [], isValid: false };
  }
}

export function loadCarlRules(
  options: CarlRuleDiscoveryOptions = {}
): CarlRuleDiscoveryResult {
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

  const sources: CarlRuleSource[] = [];
  const finalDomains = new Map<string, CarlRuleSource["scope"]>();

  let globalActive = false;
  let projectActive = false;

  if (globalPath) {
    const globalDomains = parseManifestDomains(globalPath.manifestPath);
    if (globalDomains.isValid) {
      globalActive = true;
      sources.push({
        scope: "global",
        path: globalPath.carlDir,
        domains: [...globalDomains.domains].sort(),
      });

      for (const domain of globalDomains.domains) {
        finalDomains.set(domain, "global");
      }
    }
  }

  if (projectPath) {
    const projectDomains = parseManifestDomains(projectPath.manifestPath);
    if (projectDomains.isValid) {
      projectActive = true;
      sources.push({
        scope: "project",
        path: projectPath.carlDir,
        domains: [...projectDomains.domains].sort(),
      });

      for (const domain of projectDomains.domains) {
        finalDomains.set(domain, "project");
      }
    }
  }

  if (!projectActive && !globalActive && fallbackPath) {
    const fallbackDomains = parseManifestDomains(fallbackPath.manifestPath);
    if (fallbackDomains.isValid) {
      sources.push({
        scope: "fallback",
        path: fallbackPath.carlDir,
        domains: [...fallbackDomains.domains].sort(),
      });

      for (const domain of fallbackDomains.domains) {
        finalDomains.set(domain, "fallback");
      }
    }
  }

  const domains = Array.from(finalDomains.keys()).sort();

  return {
    sources,
    domains,
    warnings: [],
  };
}
