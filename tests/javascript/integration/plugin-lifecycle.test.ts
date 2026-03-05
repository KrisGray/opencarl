/**
 * Integration tests for plugin-hooks.ts
 *
 * Tests plugin lifecycle, hook registration, signal capture, and full injection pipeline.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { createCarlPluginHooks } from '../../../src/integration/plugin-hooks';

// Local type definition for Hooks to avoid ES module import issues
type Hooks = {
  'chat.message'?: (input: any, output: any) => Promise<void>;
  'tool.execute.before'?: (input: any, output: any) => Promise<void>;
  'command.execute.before'?: (input: any, output: any) => Promise<void>;
  'experimental.chat.system.transform'?: (input: any, output: any) => Promise<void>;
};

import {
  createMockOpenCodeClient,
  createMockHooksInput,
  createMockHooksOutput,
  type MockHooksInput,
  type MockHooksOutput,
} from '../../helpers/opencode-api-mock';
import { createTestDomainPayload } from '../../helpers/domain-factory';
import { createTestBracketData } from '../../helpers/bracket-factory';

// Mock file system operations for temp .carl/ directory
let tempCarlDir: string;

// Mock loaders and dependencies
jest.mock('../../../src/carl/rule-cache', () => ({
  getCachedRules: jest.fn(),
  hasSessionWarned: jest.fn(() => false),
  markSessionWarned: jest.fn(),
  clearSessionWarning: jest.fn(),
  markRulesDirty: jest.fn(),
  isCarlPath: jest.fn(() => true),
}));

jest.mock('../../../src/carl/matcher', () => ({
  matchDomainsForTurn: jest.fn(),
}));

jest.mock('../../../src/carl/injector', () => ({
  buildCarlInjection: jest.fn(),
}));

jest.mock('../../../src/carl/command-parity', () => ({
  resolveCarlCommandSignals: jest.fn(),
}));

jest.mock('../../../src/carl/setup', () => ({
  checkSetupNeeded: jest.fn(() => ({ needed: false, targetDir: null })),
  buildSetupPrompt: jest.fn(() => 'Setup prompt'),
  runSetup: jest.fn(() => ({ success: true, error: null })),
  runIntegration: jest.fn(() => ({ message: 'Integration complete' })),
  integrateOpencode: jest.fn(() => ({ message: 'OpenCode integration complete' })),
}));

jest.mock('../../../src/carl/debug', () => ({
  debugInjection: jest.fn(),
}));

jest.mock('../../../src/carl/duplicate-detector', () => ({
  checkDuplicateLoad: jest.fn(() => ({ isDuplicate: false, existingPath: null, warningEmitted: false })),
  getDuplicateWarning: jest.fn(() => 'Duplicate warning'),
  registerPluginLoad: jest.fn(),
}));

jest.mock('../../../src/carl/help-text', () => ({
  buildCarlHelpGuidance: jest.fn(() => ({ combined: 'Help guidance' })),
}));

describe('plugin-hooks.ts - integration', () => {
  let hooks: Hooks;
  let mockGetCachedRules: jest.Mock;
  let mockMatchDomainsForTurn: jest.Mock;
  let mockBuildCarlInjection: jest.Mock;
  let mockResolveCarlCommandSignals: jest.Mock;
  let signalStore: typeof import('../../../src/carl/signal-store');

  function loadAllModules() {
    jest.resetModules();
    jest.isolateModules(() => {
      // Load signal-store first
      signalStore = require('../../../src/carl/signal-store');

      // Set up mock implementations
      const ruleCache = require('../../../src/carl/rule-cache');
      mockGetCachedRules = ruleCache.getCachedRules;

      const matcher = require('../../../src/carl/matcher');
      mockMatchDomainsForTurn = matcher.matchDomainsForTurn;

      const injector = require('../../../src/carl/injector');
      mockBuildCarlInjection = injector.buildCarlInjection;

      const commandParity = require('../../../src/carl/command-parity');
      mockResolveCarlCommandSignals = commandParity.resolveCarlCommandSignals;

      // Default mock return values
      mockGetCachedRules.mockReturnValue({
        sources: [],
        domains: ['DEVELOPMENT'],
        warnings: [],
        domainPayloads: {
          DEVELOPMENT: createTestDomainPayload({
            domain: 'DEVELOPMENT',
            rules: ['Use early returns', 'Prefer small functions'],
          }),
        },
        globalExclude: [],
        devmode: false,
        projectStatus: 'valid',
        projectWarnings: [],
      });

      mockMatchDomainsForTurn.mockReturnValue({
        globalExclude: { matchedKeywords: [], triggered: false },
        matchedDomains: ['DEVELOPMENT'],
        excludedDomains: [],
        domainResults: [],
      });

      mockBuildCarlInjection.mockReturnValue('<carl-rules>\n[DEVELOPMENT] RULES:\n1. Use early returns\n2. Prefer small functions\n</carl-rules>');

      mockResolveCarlCommandSignals.mockReturnValue({
        commandPayloads: {},
        commandDomains: [],
      });

      // Create hooks after mocks are set up
      const { createCarlPluginHooks: createHooks } = require('../../../src/integration/plugin-hooks');
      hooks = createHooks();
    });
  }

  beforeEach(() => {
    // Create temp .carl/ directory for each test
    tempCarlDir = fs.mkdtempSync(path.join(os.tmpdir(), 'carl-test-'));

    // Load all modules in isolation
    loadAllModules();
  });

  afterEach(() => {
    // Clean up temp .carl/ directory
    if (fs.existsSync(tempCarlDir)) {
      fs.rmSync(tempCarlDir, { recursive: true, force: true });
    }
  });

  describe('Plugin initialization and hook registration', () => {
    it('should initialize plugin and register all hooks', () => {
      // All expected hooks should be present
      expect(hooks['chat.message']).toBeDefined();
      expect(hooks['tool.execute.before']).toBeDefined();
      expect(hooks['command.execute.before']).toBeDefined();
      expect(hooks['experimental.chat.system.transform']).toBeDefined();

      // Each hook should be a function
      expect(typeof hooks['chat.message']).toBe('function');
      expect(typeof hooks['tool.execute.before']).toBe('function');
      expect(typeof hooks['command.execute.before']).toBe('function');
      expect(typeof hooks['experimental.chat.system.transform']).toBe('function');
    });
  });

  describe('Signal capture from chat.message hook', () => {
    it('should capture prompt signals from chat.message hook', async () => {
      const input = createMockHooksInput({
        sessionID: 'test-session-1',
      });

      const output = createMockHooksOutput({
        message: { role: 'user', content: 'Write code for the auth module' },
      });

      // Call chat.message hook
      if (hooks['chat.message']) {
        await hooks['chat.message'](input, output);
      }

      // Verify signals were captured
      const signals = signalStore.getSessionSignals('test-session-1');
      expect(signals.promptTokens).toEqual(expect.arrayContaining(['write', 'code', 'for', 'the', 'auth', 'module']));
    });
  });

  describe('Signal capture from tool.execute.before hook', () => {
    it('should capture tool signals from tool.execute.before hook', async () => {
      const input = createMockHooksInput({
        sessionID: 'test-session-2',
        tool: 'ReadFile',
        callID: 'call-123',
        args: {
          filePath: '/Users/kris/Repos/opencarl/README.md',
        },
      });

      const output = createMockHooksOutput({ args: input.args });

      // Call tool.execute.before hook
      if (hooks['tool.execute.before']) {
        await hooks['tool.execute.before'](input, output);
      }

      // Verify tool and path signals were captured
      const signals = signalStore.getSessionSignals('test-session-2');
      expect(signals.toolTokens).toContain('readfile');
      expect(signals.pathTokens).toContain('readme.md');
    });
  });

  describe('Signal capture from command.execute.before hook', () => {
    it('should capture command signals from command.execute.before hook', async () => {
      const input = createMockHooksInput({
        sessionID: 'test-session-3',
        command: '/carl',
      });

      const output = createMockHooksOutput();

      // Call command.execute.before hook (2 arguments)
      if (hooks['command.execute.before']) {
        await hooks['command.execute.before'](input, output);
      }

      // Verify command signals were captured
      const signals = signalStore.getSessionSignals('test-session-3');
      expect(signalStore.getSessionPromptText('test-session-3')).toBe('');
    });

    it('should handle /carl setup command without error', async () => {
      const input = createMockHooksInput({
        sessionID: 'test-session-4',
        command: '/carl setup',
      });

      const output = createMockHooksOutput();

      // Should not throw
      if (hooks['command.execute.before']) {
        await expect(hooks['command.execute.before'](input, output)).resolves.not.toThrow();
      }
    });

    it('should handle /carl setup --integrate command without error', async () => {
      const input = createMockHooksInput({
        sessionID: 'test-session-5',
        command: '/carl setup --integrate',
      });

      const output = createMockHooksOutput();

      // Should not throw
      if (hooks['command.execute.before']) {
        await expect(hooks['command.execute.before'](input, output)).resolves.not.toThrow();
      }
    });

    it('should handle /carl setup --integrate-opencode command without error', async () => {
      const input = createMockHooksInput({
        sessionID: 'test-session-6',
        command: '/carl setup --integrate-opencode',
      });

      const output = createMockHooksOutput();

      // Should not throw
      if (hooks['command.execute.before']) {
        await expect(hooks['command.execute.before'](input, output)).resolves.not.toThrow();
      }
    });
  });

  describe('Full injection pipeline on system transform hook', () => {
    it('should process full injection pipeline on system transform hook', async () => {
      const input = createMockHooksInput({
        sessionID: 'test-session-7',
        model: { providerID: 'test', modelID: 'test' },
        client: createMockOpenCodeClient('test-session-7', [
          {
            info: {
              tokens: {
                input_tokens: 1000,
                cache_read_input_tokens: 500,
                output_tokens: 200,
              },
            },
          },
        ]),
      });

      const output = createMockHooksOutput({
        system: [],
      });

      // Call experimental.chat.system.transform hook
      if (hooks['experimental.chat.system.transform']) {
        await hooks['experimental.chat.system.transform'](input, output);
      }

      // Verify injection pipeline executed
      expect(mockGetCachedRules).toHaveBeenCalledWith({ sessionId: 'test-session-7' });
      expect(mockMatchDomainsForTurn).toHaveBeenCalled();
      expect(mockBuildCarlInjection).toHaveBeenCalled();

      // Verify output.system contains injection
      expect(output.system.length).toBeGreaterThan(0);
      expect(output.system[0]).toContain('<carl-rules>');
      expect(output.system[0]).toContain('[DEVELOPMENT] RULES:');
      expect(output.system[0]).toContain('Use early returns');
    });

    it('should include context bracket data in injection pipeline', async () => {
      const input = createMockHooksInput({
        sessionID: 'test-session-8',
        model: { providerID: 'test', modelID: 'test' },
        client: createMockOpenCodeClient('test-session-8', [
          {
            info: {
              tokens: {
                input_tokens: 2000,
                cache_read_input_tokens: 800,
                output_tokens: 300,
              },
            },
          },
        ]),
      });

      const output = createMockHooksOutput({
        system: [],
      });

      // Call experimental.chat.system.transform hook
      if (hooks['experimental.chat.system.transform']) {
        await hooks['experimental.chat.system.transform'](input, output);
      }

      // Verify injection was called with context bracket
      expect(mockBuildCarlInjection).toHaveBeenCalledWith(
        expect.objectContaining({
          contextBracket: expect.any(Object),
        })
      );
    });

    it('should handle empty session messages gracefully', async () => {
      const input = createMockHooksInput({
        sessionID: 'test-session-9',
        model: { providerID: 'test', modelID: 'test' },
        client: createMockOpenCodeClient('test-session-9', []),
      });

      const output = createMockHooksOutput({
        system: [],
      });

      // Should not throw even with empty messages
      if (hooks['experimental.chat.system.transform']) {
        await expect(hooks['experimental.chat.system.transform'](input, output)).resolves.not.toThrow();
      }

      // Verify injection still occurred
      expect(mockBuildCarlInjection).toHaveBeenCalled();
    });

    it('should handle missing client.session.messages gracefully', async () => {
      const input = createMockHooksInput({
        sessionID: 'test-session-10',
        model: { providerID: 'test', modelID: 'test' },
        client: {}, // Missing session.messages
      });

      const output = createMockHooksOutput({
        system: [],
      });

      // Should not throw even with missing client.session.messages
      if (hooks['experimental.chat.system.transform']) {
        await expect(hooks['experimental.chat.system.transform'](input, output)).resolves.not.toThrow();
      }

      // Verify injection still occurred with fallback context bracket
      expect(mockBuildCarlInjection).toHaveBeenCalled();
    });

    it('should inject rules when matched domains exist', async () => {
      mockMatchDomainsForTurn.mockReturnValue({
        globalExclude: { matchedKeywords: [], triggered: false },
        matchedDomains: ['DEVELOPMENT', 'CONTENT'],
        excludedDomains: [],
        domainResults: [],
      });

      const input = createMockHooksInput({
        sessionID: 'test-session-11',
        model: { providerID: 'test', modelID: 'test' },
      });

      const output = createMockHooksOutput({
        system: [],
      });

      if (hooks['experimental.chat.system.transform']) {
        await hooks['experimental.chat.system.transform'](input, output);
      }

      // Verify injection was added to output.system
      expect(output.system.length).toBeGreaterThan(0);
      expect(output.system[0]).toContain('<carl-rules>');
    });

    it('should not inject rules when no matched domains', async () => {
      mockMatchDomainsForTurn.mockReturnValue({
        globalExclude: { matchedKeywords: [], triggered: false },
        matchedDomains: [],
        excludedDomains: [],
        domainResults: [],
      });

      mockBuildCarlInjection.mockReturnValue(null);

      const input = createMockHooksInput({
        sessionID: 'test-session-12',
        model: { providerID: 'test', modelID: 'test' },
      });

      const output = createMockHooksOutput({
        system: [],
      });

      if (hooks['experimental.chat.system.transform']) {
        await hooks['experimental.chat.system.transform'](input, output);
      }

      // Verify no injection was added to output.system
      expect(output.system.length).toBe(0);
    });
  });
});
