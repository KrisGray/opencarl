import os from "os";
import path from "path";
import { loadCarlRules, type CarlRuleDiscoveryOptions } from "./loader";
import type { CarlRuleDiscoveryResult } from "./types";

/**
 * Session-scoped rule cache with dirty tracking for live reload support.
 * Rules are cached and only reloaded when .carl/ files change.
 */

interface RuleCacheEntry {
  result: CarlRuleDiscoveryResult;
  lastLoadedAt: number;
  options: CarlRuleDiscoveryOptions;
}

// Global cache entry (shared across sessions)
let globalCache: RuleCacheEntry | null = null;

// Dirty flag - when true, cache needs refresh on next access
let isDirty = false;

// Track which paths are under .carl/ for dirty detection
const CARL_DIR_NAMES = [".carl", ".opencode/carl"];

/**
 * Check if a file path is inside a .carl/ directory.
 */
export function isCarlPath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/");
  for (const carlDir of CARL_DIR_NAMES) {
    if (normalized.includes(`/${carlDir}/`) || normalized.endsWith(`/${carlDir}`)) {
      return true;
    }
    // Also handle paths that start with .carl/
    if (normalized.startsWith(`${carlDir}/`) || normalized === carlDir) {
      return true;
    }
  }
  return false;
}

/**
 * Mark the rule cache as dirty, triggering a reload on next access.
 * Call this when .carl/ files are modified.
 */
export function markRulesDirty(): void {
  isDirty = true;
}

/**
 * Check if the cache is currently dirty.
 */
export function isCacheDirty(): boolean {
  return isDirty;
}

/**
 * Get cached rules, reloading only if dirty or cache is empty.
 */
export function getCachedRules(
  options: CarlRuleDiscoveryOptions = {}
): CarlRuleDiscoveryResult {
  const now = Date.now();
  const homeDir = options.homeDir ?? os.homedir();
  const cwd = options.cwd ?? process.cwd();
  const projectRoot = options.projectRoot ?? cwd;

  // Check if we need to reload
  const needsReload =
    isDirty ||
    !globalCache ||
    cacheOptionsDiffer(globalCache.options, options);

  if (!needsReload && globalCache) {
    return globalCache.result;
  }

  // Reload and cache
  const result = loadCarlRules(options);
  globalCache = {
    result,
    lastLoadedAt: now,
    options: {
      cwd,
      homeDir,
      projectRoot,
      overrides: options.overrides,
    },
  };
  isDirty = false;

  return result;
}

/**
 * Reset the rule cache entirely.
 * Use sparingly - mainly for testing or explicit reset scenarios.
 */
export function resetRulesCache(): void {
  globalCache = null;
  isDirty = false;
}

/**
 * Get cache metadata for debugging.
 */
export function getCacheMeta(): {
  cached: boolean;
  dirty: boolean;
  lastLoadedAt: number | null;
} {
  return {
    cached: globalCache !== null,
    dirty: isDirty,
    lastLoadedAt: globalCache?.lastLoadedAt ?? null,
  };
}

/**
 * Compare cache options to determine if reload is needed.
 */
function cacheOptionsDiffer(
  cached: CarlRuleDiscoveryOptions,
  fresh: CarlRuleDiscoveryOptions
): boolean {
  // Check key paths that affect discovery
  if (cached.cwd !== fresh.cwd && fresh.cwd) return true;
  if (cached.projectRoot !== fresh.projectRoot && fresh.projectRoot) return true;
  if (cached.homeDir !== fresh.homeDir && fresh.homeDir) return true;

  // Check overrides
  const cachedOverrides = cached.overrides ?? {};
  const freshOverrides = fresh.overrides ?? {};
  if (cachedOverrides.projectCarlDir !== freshOverrides.projectCarlDir) return true;
  if (cachedOverrides.globalCarlDir !== freshOverrides.globalCarlDir) return true;
  if (cachedOverrides.fallbackCarlDir !== freshOverrides.fallbackCarlDir) return true;

  return false;
}
