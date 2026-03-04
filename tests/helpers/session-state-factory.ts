import type { SessionOverrides, SessionOverrideValue } from '../../src/carl/session-overrides';

/**
 * Create a test session overrides object with sensible defaults.
 * Supports partial overrides via spread operator pattern.
 */
export function createTestSessionOverrides(
  overrides?: Partial<SessionOverrides>
): SessionOverrides {
  return {
    sessionId: 'test-session',
    domains: {},
    exists: false,
    ...overrides,
  };
}

/**
 * Create a test session override value for explicit testing.
 * Default is "inherit" - returns the value as-is for explicit override scenarios.
 */
export function createTestOverrideValue(value?: SessionOverrideValue): SessionOverrideValue {
  return value ?? 'inherit';
}
