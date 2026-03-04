import type { CarlRuleDomainPayload, CarlMatchDomainConfig } from '../../src/carl/types';

/**
 * Create a test domain payload with sensible defaults
 */
export function createTestDomainPayload(
  overrides?: Partial<CarlRuleDomainPayload>
): CarlRuleDomainPayload {
  return {
    domain: 'DEVELOPMENT',
    scope: 'project',
    sourcePath: '.carl/development',
    rules: ['Use early returns', 'Prefer small functions'],
    state: true,
    alwaysOn: false,
    recall: ['code', 'debug'],
    exclude: ['review'],
    ...overrides,
  };
}

/**
 * Create a test domain config for matching
 */
export function createTestDomainConfig(
  overrides?: Partial<CarlMatchDomainConfig>
): CarlMatchDomainConfig {
  return {
    name: 'DEVELOPMENT',
    state: true,
    recall: ['code', 'debug'],
    exclude: [],
    alwaysOn: false,
    ...overrides,
  };
}

/**
 * Create multiple domain payloads for testing
 */
export function createMultipleDomainPayloads(
  count: number
): Record<string, CarlRuleDomainPayload> {
  const payloads: Record<string, CarlRuleDomainPayload> = {};

  for (let i = 0; i < count; i++) {
    const domainName = `DOMAIN_${i}`;
    payloads[domainName] = createTestDomainPayload({
      domain: domainName,
      rules: [`Rule ${i}_1`, `Rule ${i}_2`],
    recall: [`keyword${i}`],
    exclude: [],
    state: i % 2 === 0,
    alwaysOn: i === 0,
    });
  }

  return payloads;
}
