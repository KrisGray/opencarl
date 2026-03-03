/**
 * Debug logging system for CARL rule matching and injection.
 * 
 * Enable with: CARL_DEBUG=true
 * 
 * All functions have zero overhead when debug mode is disabled.
 */

// Cache debug state at module load for zero-overhead when disabled
const DEBUG_ENABLED = process.env.CARL_DEBUG === "true";

/**
 * Check if debug mode is enabled.
 * Result is cached at module load time.
 */
export function isDebugEnabled(): boolean {
  return DEBUG_ENABLED;
}

/**
 * Log a debug message with category and optional data.
 * 
 * Format: [carl:debug] {timestamp} [{category}] {message}
 * If data provided, appended as JSON on next line.
 * 
 * Zero overhead when debug disabled (early return).
 */
export function debugLog(
  category: string,
  message: string,
  data?: object
): void {
  if (!DEBUG_ENABLED) {
    return;
  }

  const timestamp = new Date().toISOString();
  const prefix = `[carl:debug] ${timestamp} [${category}]`;
  
  if (data) {
    console.log(`${prefix} ${message}`);
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(`${prefix} ${message}`);
  }
}

/**
 * Log a rule matching decision.
 * 
 * Shows which domain was evaluated, what keywords were found,
 * and whether it matched or was excluded.
 */
export function debugRuleMatch(
  domain: string,
  keywords: string[],
  matched: string[],
  excluded: string[]
): void {
  if (!DEBUG_ENABLED) {
    return;
  }

  const isMatched = matched.length > 0;
  const isExcluded = excluded.length > 0;
  
  let status: string;
  let triggerKeywords: string[];
  
  if (isExcluded) {
    status = "EXCLUDED";
    triggerKeywords = excluded;
  } else if (isMatched) {
    status = "MATCHED";
    triggerKeywords = matched;
  } else {
    status = "NO_MATCH";
    triggerKeywords = [];
  }

  debugLog("rule-match", `Domain: ${domain}`, {
    status,
    domain,
    keywordsFound: keywords,
    triggerKeywords,
  });
}

/**
 * Log an injection event.
 * 
 * Shows which domains are being injected, total rule count,
 * and the context bracket.
 */
export function debugInjection(
  domains: string[],
  totalRules: number,
  bracket: string
): void {
  if (!DEBUG_ENABLED) {
    return;
  }

  debugLog("injection", `Injecting ${domains.length} domain(s) with ${totalRules} rules`, {
    domains,
    totalRules,
    contextBracket: bracket,
  });
}

/**
 * Log a file load event.
 * 
 * Tracks manifest and domain file loads (success/failure).
 */
export function debugFileLoad(
  path: string,
  scope: string,
  success: boolean
): void {
  if (!DEBUG_ENABLED) {
    return;
  }

  const status = success ? "SUCCESS" : "FAILED";
  
  debugLog("file-load", `${status}: ${path}`, {
    path,
    scope,
    success,
  });
}
