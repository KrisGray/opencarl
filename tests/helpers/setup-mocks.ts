/**
 * Mock utilities for fs module in setup tests.
 * Uses jest.mock('fs') pattern per user decision to mock entire fs module.
 */

/**
 * Interface for mocked fs module
 */
export interface MockFs {
  existsSync: jest.Mock;
  mkdirSync: jest.Mock;
  readdirSync: jest.Mock;
  copyFileSync: jest.Mock;
  accessSync: jest.Mock;
  promises: {
    mkdir: jest.Mock;
    readdir: jest.Mock;
    copyFile: jest.Mock;
    access: jest.Mock;
  };
}

/**
 * Create a mock fs module with all required methods.
 * Returns a mock object with jest.fn() for each fs method.
 */
export function createMockFs(): MockFs {
  return {
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    readdirSync: jest.fn(),
    copyFileSync: jest.fn(),
    accessSync: jest.fn(),
    promises: {
      mkdir: jest.fn(),
      readdir: jest.fn(),
      copyFile: jest.fn(),
      access: jest.fn(),
    },
  };
}

/**
 * Set up fs mock with the provided mock object.
 * Uses jest.mock('fs', () => mockFs) pattern.
 *
 * Note: Must be called at module scope (top of test file),
 * not inside test functions.
 */
export function setupMockFs(mockFs: MockFs): void {
  jest.mock('fs', () => mockFs);
}

/**
 * Clear all fs mocks after tests.
 * Restores original fs module behavior.
 */
export function teardownMockFs(): void {
  jest.clearAllMocks();
}
