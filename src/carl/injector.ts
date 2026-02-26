import type { CarlRuleDomainPayload } from "./types";

export interface CarlInjectionInput {
  domainPayloads: Record<string, CarlRuleDomainPayload>;
  matchedDomains?: string[];
  commandDomains?: string[];
}

function normalizeDomainName(domain: string): string {
  return domain.trim().toUpperCase();
}

function sortPayloads(payloads: CarlRuleDomainPayload[]): CarlRuleDomainPayload[] {
  return [...payloads].sort((left, right) =>
    left.domain.localeCompare(right.domain)
  );
}

function renderDomainRules(payload: CarlRuleDomainPayload): string[] {
  const lines: string[] = [];
  lines.push(`[${payload.domain}] RULES:`);

  payload.rules.forEach((rule, index) => {
    lines.push(`  ${index + 1}. ${rule}`);
  });

  return lines;
}

export function buildCarlInjection(input: CarlInjectionInput): string | null {
  const payloadMap = input.domainPayloads ?? {};
  const commandSet = new Set(
    (input.commandDomains ?? []).map((domain) => normalizeDomainName(domain))
  );
  const matchedSet = new Set(
    (input.matchedDomains ?? []).map((domain) => normalizeDomainName(domain))
  );

  const commandPayloads = sortPayloads(
    Array.from(commandSet)
      .map((domain) => payloadMap[domain])
      .filter((payload): payload is CarlRuleDomainPayload => Boolean(payload))
      .filter((payload) => payload.state)
      .filter((payload) => payload.rules.length > 0)
  );

  const alwaysOnPayloads = sortPayloads(
    Object.values(payloadMap)
      .filter((payload) => payload.state)
      .filter((payload) => payload.alwaysOn || payload.domain === "GLOBAL")
      .filter((payload) => payload.rules.length > 0)
      .filter((payload) => !commandSet.has(payload.domain))
  );

  const matchedPayloads = sortPayloads(
    Array.from(matchedSet)
      .map((domain) => payloadMap[domain])
      .filter((payload): payload is CarlRuleDomainPayload => Boolean(payload))
      .filter((payload) => payload.state)
      .filter((payload) => !commandSet.has(payload.domain))
      .filter((payload) => !(payload.alwaysOn || payload.domain === "GLOBAL"))
      .filter((payload) => payload.rules.length > 0)
  );

  if (
    commandPayloads.length === 0 &&
    alwaysOnPayloads.length === 0 &&
    matchedPayloads.length === 0
  ) {
    return null;
  }

  const lines: string[] = ["<carl-rules>"];

  if (commandPayloads.length > 0) {
    lines.push("COMMAND DOMAINS (explicit)");
    lines.push("=".repeat(48));
    for (const payload of commandPayloads) {
      lines.push(...renderDomainRules(payload));
      lines.push("");
    }
  }

  if (alwaysOnPayloads.length > 0) {
    // always-on domains section
    lines.push("ALWAYS-ON DOMAINS");
    lines.push("=".repeat(48));
    for (const payload of alwaysOnPayloads) {
      lines.push(...renderDomainRules(payload));
      lines.push("");
    }
  }

  if (matchedPayloads.length > 0) {
    lines.push("MATCHED DOMAINS");
    lines.push("=".repeat(48));
    for (const payload of matchedPayloads) {
      lines.push(...renderDomainRules(payload));
      lines.push("");
    }
  }

  lines.push("</carl-rules>");
  return `${lines.join("\n")}\n`;
}
