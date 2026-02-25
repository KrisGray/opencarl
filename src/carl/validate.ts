import fs from "fs";
import path from "path";
import { z } from "zod";
import type { CarlRuleDiscoveryWarning } from "./types";

export interface ManifestDomainConfig {
  name: string;
  state: boolean;
  recall: string[];
  exclude: string[];
  alwaysOn: boolean;
}

export interface ParsedManifest {
  domains: Record<string, ManifestDomainConfig>;
  devmode: boolean;
  globalExclude: string[];
  warnings: CarlRuleDiscoveryWarning[];
  isValid: boolean;
}

export interface ParsedDomainRules {
  rules: string[];
  warnings: CarlRuleDiscoveryWarning[];
}

const keyValueSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

const domainKeyPattern = /^([A-Z0-9_]+)_(STATE|RECALL|EXCLUDE|ALWAYS_ON)$/;

function warn(
  warnings: CarlRuleDiscoveryWarning[],
  message: string,
  details?: { path?: string; domain?: string }
): void {
  warnings.push({
    message,
    path: details?.path,
    domain: details?.domain,
  });
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

function ensureDomain(domains: Record<string, ManifestDomainConfig>, name: string) {
  if (!domains[name]) {
    domains[name] = {
      name,
      state: false,
      recall: [],
      exclude: [],
      alwaysOn: false,
    };
  }

  return domains[name];
}

export function parseManifest(manifestPath: string): ParsedManifest {
  const warnings: CarlRuleDiscoveryWarning[] = [];
  const domains: Record<string, ManifestDomainConfig> = {};
  let devmode = false;
  let globalExclude: string[] = [];
  let hasKnownEntry = false;

  if (!fs.existsSync(manifestPath)) {
    return {
      domains,
      devmode,
      globalExclude,
      warnings,
      isValid: false,
    };
  }

  const lines = fs.readFileSync(manifestPath, "utf8").split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    if (!line.includes("=")) {
      warn(warnings, "Malformed manifest line", { path: manifestPath });
      continue;
    }

    const [rawKey, rawValue] = line.split("=", 2);
    const parsed = keyValueSchema.safeParse({
      key: rawKey?.trim() ?? "",
      value: rawValue?.trim() ?? "",
    });

    if (!parsed.success) {
      warn(warnings, "Malformed manifest line", { path: manifestPath });
      continue;
    }

    const { key, value } = parsed.data;

    if (key === "DEVMODE") {
      hasKnownEntry = true;
      const parsedBool = parseBool(value);
      if (parsedBool === null) {
        warn(warnings, "Invalid DEVMODE value", { path: manifestPath });
      } else {
        devmode = parsedBool;
      }
      continue;
    }

    if (key === "GLOBAL_EXCLUDE") {
      hasKnownEntry = true;
      globalExclude = value
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
      continue;
    }

    const match = key.match(domainKeyPattern);
    if (!match) {
      warn(warnings, `Unknown manifest key: ${key}`, { path: manifestPath });
      continue;
    }

    hasKnownEntry = true;
    const domain = match[1];
    const field = match[2];
    const config = ensureDomain(domains, domain);

    if (field === "STATE") {
      const parsedBool = parseBool(value);
      if (parsedBool === null) {
        warn(warnings, `Invalid ${domain}_STATE value`, {
          path: manifestPath,
          domain,
        });
      } else {
        config.state = parsedBool;
      }
      continue;
    }

    if (field === "ALWAYS_ON") {
      const parsedBool = parseBool(value);
      if (parsedBool === null) {
        warn(warnings, `Invalid ${domain}_ALWAYS_ON value`, {
          path: manifestPath,
          domain,
        });
      } else {
        config.alwaysOn = parsedBool;
      }
      continue;
    }

    if (field === "RECALL") {
      config.recall = value
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
      continue;
    }

    if (field === "EXCLUDE") {
      config.exclude = value
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
    }
  }

  if (!hasKnownEntry) {
    warn(warnings, "Manifest contains no recognized entries", {
      path: manifestPath,
    });
  }

  return {
    domains,
    devmode,
    globalExclude,
    warnings,
    isValid: hasKnownEntry,
  };
}

function isValidContextRuleKey(key: string): boolean {
  const bracketPattern = "(?:FRESH|MODERATE|DEPLETED|CRITICAL)";
  const flagPattern = new RegExp(`^${bracketPattern}_RULES$`);
  const rulePattern = new RegExp(`^${bracketPattern}_RULE_\\d+$`);
  return flagPattern.test(key) || rulePattern.test(key);
}

function isValidCommandsRuleKey(key: string): boolean {
  return /^[A-Z0-9]+_RULE_\d+$/.test(key);
}

function isValidDomainRuleKey(domain: string, key: string): boolean {
  if (domain === "CONTEXT") {
    return isValidContextRuleKey(key);
  }

  if (domain === "COMMANDS") {
    return isValidCommandsRuleKey(key);
  }

  const pattern = new RegExp(`^${domain}_RULE_\\d+$`);
  return pattern.test(key);
}

export function parseDomainRules(domainPath: string, domain: string): ParsedDomainRules {
  const warnings: CarlRuleDiscoveryWarning[] = [];
  const rules: string[] = [];

  if (!fs.existsSync(domainPath)) {
    return { rules, warnings };
  }

  const lines = fs.readFileSync(domainPath, "utf8").split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    if (!line.includes("=")) {
      warn(warnings, "Malformed rule line", { path: domainPath, domain });
      continue;
    }

    const [rawKey, rawValue] = line.split("=", 2);
    const parsed = keyValueSchema.safeParse({
      key: rawKey?.trim() ?? "",
      value: rawValue?.trim() ?? "",
    });

    if (!parsed.success) {
      warn(warnings, "Malformed rule line", { path: domainPath, domain });
      continue;
    }

    const { key, value } = parsed.data;
    if (!value) {
      warn(warnings, `Empty rule value for ${key}`, { path: domainPath, domain });
      continue;
    }

    if (!isValidDomainRuleKey(domain, key)) {
      warn(warnings, `Invalid rule key: ${key}`, { path: domainPath, domain });
      continue;
    }

    rules.push(value);
  }

  return { rules, warnings };
}

export function resolveDomainFile(
  carlDir: string,
  domain: string,
  warnings: CarlRuleDiscoveryWarning[]
): string | null {
  const expectedName = domain.toLowerCase();
  const expectedPath = path.join(carlDir, expectedName);

  if (fs.existsSync(expectedPath)) {
    return expectedPath;
  }

  if (!fs.existsSync(carlDir)) {
    warn(warnings, `Missing domain file for ${domain}`, {
      path: expectedPath,
      domain,
    });
    return null;
  }

  const entries = fs.readdirSync(carlDir, { withFileTypes: true });
  const mismatch = entries.find((entry) => {
    if (!entry.isFile()) {
      return false;
    }

    return entry.name.toLowerCase() === expectedName;
  });

  if (mismatch) {
    warn(warnings, `Domain file must be lowercase: ${mismatch.name}`, {
      path: path.join(carlDir, mismatch.name),
      domain,
    });
    return null;
  }

  warn(warnings, `Missing domain file for ${domain}`, {
    path: expectedPath,
    domain,
  });

  return null;
}
