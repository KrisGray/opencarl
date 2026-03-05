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
