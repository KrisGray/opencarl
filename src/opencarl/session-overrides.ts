import * as fs from "fs";
import * as path from "path";

/**
 * Per-session override file loader.
 * Reads `.opencarl/sessions/{session_id}.json` to allow disabling domains per-session.
 */

export type SessionOverrideValue = "inherit" | "true" | "false";

export interface SessionOverrides {
  sessionId: string;
  domains: Record<string, SessionOverrideValue>;
  exists: boolean;
}

const OVERRIDE_DIR = "sessions";

/**
 * Parse a session override value from string.
 */
function parseOverrideValue(value: unknown): SessionOverrideValue {
  if (typeof value !== "string") {
    return "inherit";
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return "true";
  }

  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return "false";
  }

  return "inherit";
}

/**
 * Load per-session overrides in `.opencarl/sessions/{session_id}.json`.
 * Returns default (all inherit) if file doesn't exist.
 */
export function loadSessionOverrides(
  carlDir: string,
  sessionId: string
): SessionOverrides {
  const domains: Record<string, SessionOverrideValue> = {};

  if (!sessionId || !carlDir) {
    return {
      sessionId: sessionId ?? "",
      domains,
      exists: false,
    };
  }

  const overridePath = path.join(carlDir, OVERRIDE_DIR, `${sessionId}.json`);

  if (!fs.existsSync(overridePath)) {
    return {
      sessionId,
      domains,
      exists: false,
    };
  }

  try {
    const content = fs.readFileSync(overridePath, "utf8");
    const parsed = JSON.parse(content);

    if (typeof parsed !== "object" || parsed === null) {
      return {
        sessionId,
        domains,
        exists: true,
      };
    }

    // Parse domains field
    const rawDomains = (parsed as Record<string, unknown>).domains;
    if (typeof rawDomains === "object" && rawDomains !== null) {
      for (const [domain, value] of Object.entries(rawDomains as Record<string, unknown>)) {
        domains[domain.toUpperCase()] = parseOverrideValue(value);
      }
    }

    return {
      sessionId,
      domains,
      exists: true,
    };
  } catch (error) {
    // Invalid JSON - treat as non-existent
    console.warn(
      `[carl] Failed to parse session overrides for ${sessionId}: ${error}`
    );
    return {
      sessionId,
      domains,
      exists: false,
    };
  }
}

/**
 * Apply session overrides to a list of active domains.
 * - "inherit": use default state (no change)
 * - "true": force enable (only if domain exists in manifest)
 * - "false": force disable
 *
 * Returns filtered list of domains.
 */
export function applySessionOverrides(
  domains: string[],
  overrides: SessionOverrides
): string[] {
  if (!overrides.domains || Object.keys(overrides.domains).length === 0) {
    return domains;
  }

  const inputDomains = new Set(domains);
  
  for (const [domain, value] of Object.entries(overrides.domains)) {
    if (value === "false") {
      // Disable domain from overrides
      inputDomains.delete(domain);
    }
    // Note: "true" and "inherit" are no-ops - we respect the original override value
  }

  return Array.from(inputDomains).sort();
}

/**
 * Check if a domain is explicitly disabled by session overrides.
 */
export function isDomainDisabledBySession(
  domain: string,
  overrides: SessionOverrides
): boolean {
  const normalized = domain.toUpperCase();
  return overrides.domains[normalized] === "false";
}

/**
 * Get the override value for a domain.
 */
export function getDomainOverride(
  domain: string,
  overrides: SessionOverrides
): SessionOverrideValue {
  const normalized = domain.toUpperCase();
  return overrides.domains[normalized] ?? "inherit";
}
