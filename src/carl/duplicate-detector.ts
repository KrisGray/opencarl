import path from "path";

/**
 * Duplicate Plugin Detection Module
 *
 * Detects when CARL is loaded from multiple paths (e.g., project + global plugins).
 * Uses session-scoped warning guard to warn once per session, not every turn.
 * First load wins - plugin continues normally after warning.
 */

/**
 * Result of checking for duplicate plugin loads.
 */
export interface DuplicateCheckResult {
  /** True if another plugin instance exists at a different path */
  isDuplicate: boolean;
  /** Path of the first plugin that was loaded (if different from current) */
  existingPath: string | null;
  /** True if warning was emitted this session (for guard tracking) */
  warningEmitted: boolean;
}

// Track all plugin paths that have been loaded (global state)
const loadedPluginPaths = new Set<string>();

// Session-scoped guard to emit warning once per session
const duplicateWarningGuard = new Set<string>();

/**
 * Normalize a plugin path for comparison.
 * Handles cross-platform differences (symlinks resolved, backslashes normalized).
 */
function normalizePath(pluginPath: string): string {
  return path.resolve(pluginPath).replace(/\\/g, "/");
}

/**
 * Register a plugin load at initialization.
 * Call this once per plugin instance when it initializes.
 *
 * @param pluginPath - Absolute or relative path to the plugin directory
 */
export function registerPluginLoad(pluginPath: string): void {
  const normalized = normalizePath(pluginPath);
  loadedPluginPaths.add(normalized);
}

/**
 * Check if the current plugin load is a duplicate of an existing load.
 * Uses session-scoped guard to warn only once per session.
 *
 * @param currentPath - Path of the current plugin instance
 * @param sessionId - Current session identifier
 * @returns DuplicateCheckResult with duplicate status and existing path
 */
export function checkDuplicateLoad(
  currentPath: string,
  sessionId: string
): DuplicateCheckResult {
  const normalized = normalizePath(currentPath);

  // Check if any existing path differs from current
  for (const existingPath of loadedPluginPaths) {
    if (existingPath !== normalized) {
      // Found a duplicate - check if we've warned this session
      const alreadyWarned = duplicateWarningGuard.has(sessionId);

      if (!alreadyWarned) {
        // Mark as warned for this session
        duplicateWarningGuard.add(sessionId);
      }

      return {
        isDuplicate: true,
        existingPath,
        warningEmitted: !alreadyWarned,
      };
    }
  }

  // No duplicate found
  return {
    isDuplicate: false,
    existingPath: null,
    warningEmitted: false,
  };
}

/**
 * Get a formatted warning message for duplicate plugin detection.
 *
 * @param currentPath - Path of the current plugin instance
 * @param existingPath - Path of the first loaded plugin instance
 * @returns Formatted warning message with [carl] prefix
 */
export function getDuplicateWarning(
  currentPath: string,
  existingPath: string
): string {
  return `[carl] Duplicate plugin detected

Multiple CARL plugins are loaded:
  - ${existingPath}
  - ${currentPath}

This may cause unexpected behavior. Remove one from your opencode.json plugins array.`;
}

/**
 * Clear all duplicate detection state.
 * For testing purposes only.
 */
export function clearDuplicateState(): void {
  loadedPluginPaths.clear();
  duplicateWarningGuard.clear();
}
