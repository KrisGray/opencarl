import type { Config } from 'jest';

const config: Config = {
  // Use ts-jest preset for TypeScript support
  preset: 'ts-jest',

  // Node test environment (no browser)
  testEnvironment: 'node',

  // Parallel execution with 2 workers (per user decision)
  maxWorkers: 2,

  // Test file patterns - standard Jest patterns
  testMatch: [
    '**/tests/javascript/**/*.test.ts',
    '**/tests/javascript/**/*.spec.ts'
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Global coverage thresholds (80% per user decision)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Root directory
  rootDir: '.',

  // Test timeout (30 seconds default)
  testTimeout: 30000,

  // Verbose output
  verbose: true
};

export default config;
