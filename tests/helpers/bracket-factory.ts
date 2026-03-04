import type { ContextBracketData, ContextBracket } from '../../src/carl/context-brackets';

/**
 * Create test context bracket data with sensible defaults
 */
export function createTestBracketData(
  overrides?: Partial<ContextBracketData>
): ContextBracketData {
  return {
    bracket: 'FRESH',
    contextRemaining: 75,
    isCritical: false,
    rulesBracket: 'FRESH',
    ...overrides,
  };
}

/**
 * Create bracket data for FRESH state (≥60% remaining)
 */
export function createFreshBracketData(): ContextBracketData {
  return createTestBracketData({
    bracket: 'FRESH',
    contextRemaining: 80,
    isCritical: false,
    rulesBracket: 'FRESH',
  });
}

/**
 * Create bracket data for MODERATE state (≥40% remaining)
 */
export function createModerateBracketData(): ContextBracketData {
  return createTestBracketData({
    bracket: 'MODERATE',
    contextRemaining: 50,
    isCritical: false,
    rulesBracket: 'MODERATE',
  });
}

/**
 * Create bracket data for DEPLETED state (≥25% remaining)
 */
export function createDepletedBracketData(): ContextBracketData {
  return createTestBracketData({
    bracket: 'DEPLETED',
    contextRemaining: 30,
    isCritical: false,
    rulesBracket: 'DEPLETED',
  });
}

/**
 * Create bracket data for CRITICAL state (<25% remaining)
 */
export function createCriticalBracketData(): ContextBracketData {
  return createTestBracketData({
    bracket: 'CRITICAL',
    contextRemaining: 15,
    isCritical: true,
    rulesBracket: 'DEPLETED', // CRITICAL uses DEPLETED rules
  });
}
