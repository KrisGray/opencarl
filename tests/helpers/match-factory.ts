import type { OpencarlMatchRequest, OpencarlSessionSignals } from '../../src/opencarl/types';

/**
 * Create a test match request with sensible defaults
 */
export function createTestMatchRequest(
  overrides?: Partial<OpencarlMatchRequest>
): OpencarlMatchRequest {
  return {
    promptText: 'Write a function to add two numbers',
    signals: {
      promptTokens: ['function', 'add', 'numbers'],
      promptHistory: ['previous message'],
      toolTokens: ['bash', 'git'],
      pathTokens: ['src/', 'lib/'],
    },
    domains: {
      DEVELOPMENT: {
        name: 'DEVELOPMENT',
        state: true,
        recall: ['code', 'debug'],
        exclude: [],
        alwaysOn: false,
      }
    },
    globalExclude: [],
    ...overrides,
  };
}

/**
 * Create test session signals with sensible defaults
 */
export function createTestSignals(
  overrides?: Partial<OpencarlSessionSignals>
): OpencarlSessionSignals {
  return {
    promptTokens: ['token1', 'token2'],
    promptHistory: ['history1'],
    toolTokens: ['tool1'],
    pathTokens: ['path1'],
    ...overrides,
  };
}
