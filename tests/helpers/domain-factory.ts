import type { OpencarlRuleDomainPayload, OpencarlMatchDomainConfig } from '../../src/opencarl/types';

/**
 * Create a test domain payload with sensible defaults
 */
export function createTestDomainPayload(
  overrides?: Partial<OpencarlRuleDomainPayload>
): OpencarlRuleDomainPayload {
  return {
    domain: 'DEVELOPMENT',
    scope: 'project',
    sourcePath: '.opencarl/development',
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
  overrides?: Partial<OpencarlMatchDomainConfig>
): OpencarlMatchDomainConfig {
  return {
    name: 'DEVELOPMENT',
    state: true,
    recall: ['code', 'debug'],
    exclude: [],
    alwaysOn: false,
    ...overrides,
  };
}
