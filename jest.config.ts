import type { Config } from 'jest';

const config: Config = {
  // Use ts-jest preset for TypeScript support
  preset: 'ts-jest',

  // Node test environment (no browser)
  testEnvironment: 'node',

  // Serialize tests to avoid shared E2E container races
  maxWorkers: 1,

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

  // Global coverage thresholds
  coverageThreshold: {
    global: {
      branches: 71,
      functions: 80,
      lines: 78,
      statements: 78
    }
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Root directory
  rootDir: '.',

  // Test timeout (30 seconds default)
  testTimeout: 30000,

  // Verbose output
  verbose: true,

  // TypeScript configuration for Jest
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          skipLibCheck: true,
          strict: false,
          noImplicitAny: false,
          moduleResolution: 'node'
        }
      }
    ]
  }
};

export default config;
