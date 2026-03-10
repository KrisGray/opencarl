/**
 * Integration tests for the complete rule injection pipeline.
 *
 * Tests the full workflow: manifest loading → keyword matching → rule loading → composition → injection.
 * Uses real .opencarl/ directories with full fixture data and snapshot testing for regression detection.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { loadOpencarlRules } from '../../../src/opencarl/loader';
import { matchDomainsForTurn } from '../../../src/opencarl/matcher';
import { buildCarlInjection } from '../../../src/opencarl/injector';
import { computeContextBracketData } from '../../../src/opencarl/context-brackets';
import type { OpencarlInjectionInput } from '../../../src/opencarl/injector';

const fixturesRoot = path.join(
  __dirname,
  '..',
  '..',
  'fixtures',
  'carl-directories'
);

function copyFixture(fixtureName: 'minimal' | 'full', targetCarlDir: string): void {
  const sourceCarlDir = path.join(fixturesRoot, fixtureName, '.carl');
  fs.mkdirSync(path.dirname(targetCarlDir), { recursive: true });
  fs.cpSync(sourceCarlDir, targetCarlDir, { recursive: true });
}

function createDomainConfigsFromPayloads(
  domainPayloads: Record<string, any>
): Record<string, any> {
  const configs: Record<string, any> = {};

  for (const [domainName, payload] of Object.entries(domainPayloads)) {
    configs[domainName] = {
      name: domainName,
      state: payload.state,
      recall: payload.recall,
      exclude: payload.exclude,
      alwaysOn: payload.alwaysOn,
    };
  }

  return configs;
}

describe('rule injection pipeline - integration', () => {
  let tempDir: string;
  let projectOpencarlDir: string;
  let globalOpencarlDir: string;
  let fallbackOpencarlDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'carl-pipeline-integration-'));
    projectOpencarlDir = path.join(tempDir, 'project', '.carl');
    globalOpencarlDir = path.join(tempDir, 'global', '.carl');
    fallbackOpencarlDir = path.join(tempDir, 'fallback', '.carl');
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('manifest and domain loading', () => {
    it('should load rules from manifest and domain files', () => {
      copyFixture('full', projectOpencarlDir);

      const loadResult = loadOpencarlRules({
        overrides: {
          projectOpencarlDir,
          globalOpencarlDir,
          fallbackOpencarlDir,
        },
      });

      // Verify domains loaded
      expect(loadResult.domains).toContain('CONTENT');
      expect(loadResult.domains).toContain('CONTEXT');
      expect(loadResult.domains).toContain('DEVELOPMENT');

      // Verify domain payloads have rules
      expect(loadResult.domainPayloads.CONTENT).toBeDefined();
      expect(loadResult.domainPayloads.DEVELOPMENT).toBeDefined();
      expect(loadResult.domainPayloads.CONTEXT).toBeDefined();

      expect(loadResult.domainPayloads.CONTENT.rules.length).toBeGreaterThan(0);
      expect(loadResult.domainPayloads.DEVELOPMENT.rules.length).toBeGreaterThan(0);
      expect(loadResult.domainPayloads.CONTEXT.rules.length).toBeGreaterThan(0);

      // Verify project status
      expect(loadResult.projectStatus).toBe('valid');

      // Verify sources
      expect(loadResult.sources).toHaveLength(1);
      expect(loadResult.sources[0].scope).toBe('project');
    });
  });

  describe('keyword matching', () => {
    it('should match domains based on prompt keywords', () => {
      copyFixture('full', projectOpencarlDir);

      const loadResult = loadOpencarlRules({
        overrides: {
          projectOpencarlDir,
          globalOpencarlDir,
          fallbackOpencarlDir,
        },
      });

      const domainConfigs = createDomainConfigsFromPayloads(loadResult.domainPayloads);

      const matchResult = matchDomainsForTurn({
        promptText: 'Help me fix bug in this code',
        signals: {
          promptTokens: ['fix', 'bug', 'code'],
          promptHistory: [],
          toolTokens: ['bash', 'git'],
          pathTokens: ['src/', 'lib/'],
        },
        domains: domainConfigs,
        globalExclude: loadResult.globalExclude,
      });

      // Should match DEVELOPMENT (keywords: fix bug, write code, implement, debug)
      expect(matchResult.matchedDomains).toContain('DEVELOPMENT');

      // Should not match CONTENT (keywords: write script, youtube, video)
      expect(matchResult.matchedDomains).not.toContain('CONTENT');

      // Verify domain results
      const devResult = matchResult.domainResults.find(r => r.domain === 'DEVELOPMENT');
      expect(devResult).toBeDefined();
      expect(devResult?.matchedKeywords.length).toBeGreaterThan(0);
    });

    it('should filter excluded domains by exclude keywords', () => {
      copyFixture('full', projectOpencarlDir);

      const loadResult = loadOpencarlRules({
        overrides: {
          projectOpencarlDir,
          globalOpencarlDir,
          fallbackOpencarlDir,
        },
      });

      const domainConfigs = createDomainConfigsFromPayloads(loadResult.domainPayloads);

      const matchResult = matchDomainsForTurn({
        promptText: 'Can you review this code for bugs',
        signals: {
          promptTokens: ['review', 'code', 'bugs'],
          promptHistory: [],
          toolTokens: [],
          pathTokens: [],
        },
        domains: domainConfigs,
        globalExclude: loadResult.globalExclude,
      });

      // Should exclude DEVELOPMENT (exclude: review)
      expect(matchResult.matchedDomains).not.toContain('DEVELOPMENT');
      expect(matchResult.excludedDomains).toContain('DEVELOPMENT');

      const excludedResult = matchResult.domainResults.find(
        r => r.domain === 'DEVELOPMENT'
      );
      expect(excludedResult).toBeDefined();
      expect(excludedResult?.excludedKeywords).toContain('review');
    });
  });

  describe('injection building', () => {
    it('should build injection with matched domains', () => {
      copyFixture('full', projectOpencarlDir);

      const loadResult = loadOpencarlRules({
        overrides: {
          projectOpencarlDir,
          globalOpencarlDir,
          fallbackOpencarlDir,
        },
      });

      const domainConfigs = createDomainConfigsFromPayloads(loadResult.domainPayloads);

      const matchResult = matchDomainsForTurn({
        promptText: 'Help me fix bug',
        signals: {
          promptTokens: ['fix', 'bug'],
          promptHistory: [],
          toolTokens: [],
          pathTokens: [],
        },
        domains: domainConfigs,
        globalExclude: loadResult.globalExclude,
      });

      const injectionInput: OpencarlInjectionInput = {
        domainPayloads: loadResult.domainPayloads,
        matchedDomains: matchResult.matchedDomains,
        contextBracket: computeContextBracketData(40000, 200000), // FRESH: 80% remaining
      };

      const injection = buildCarlInjection(injectionInput);

      expect(injection).not.toBeNull();
      expect(injection).toContain('<carl-rules>');
      expect(injection).toContain('[DEVELOPMENT] RULES:');
      expect(injection).toContain('Use early returns');
      expect(injection).toContain('</carl-rules>');
    });

    it('should include CONTEXT domain rules with bracket filtering', () => {
      copyFixture('full', projectOpencarlDir);

      const loadResult = loadOpencarlRules({
        overrides: {
          projectOpencarlDir,
          globalOpencarlDir,
          fallbackOpencarlDir,
        },
      });

      // CONTEXT is alwaysOn, so it should be in the payload
      expect(loadResult.domainPayloads.CONTEXT).toBeDefined();
      expect(loadResult.domainPayloads.CONTEXT.bracketFlags).toBeDefined();
      expect(loadResult.domainPayloads.CONTEXT.bracketRules).toBeDefined();

      const injectionInput: OpencarlInjectionInput = {
        domainPayloads: loadResult.domainPayloads,
        matchedDomains: [],
        contextBracket: computeContextBracketData(40000, 200000), // FRESH: 80% remaining
      };

      const injection = buildCarlInjection(injectionInput);

      expect(injection).not.toBeNull();
      expect(injection).toContain('CONTEXT BRACKET: [FRESH]');
      expect(injection).toContain('[FRESH] CONTEXT RULES:');
      // Should include FRESH rules
      expect(injection).toContain('Start with high-level context');
      // Should not include MODERATE or DEPLETED rules
      expect(injection).not.toContain('Add focused detail');
      expect(injection).not.toContain('Keep responses minimal');
    });

    it('should use MODERATE rules when context bracket is MODERATE', () => {
      copyFixture('full', projectOpencarlDir);

      const loadResult = loadOpencarlRules({
        overrides: {
          projectOpencarlDir,
          globalOpencarlDir,
          fallbackOpencarlDir,
        },
      });

      const injectionInput: OpencarlInjectionInput = {
        domainPayloads: loadResult.domainPayloads,
        matchedDomains: [],
        contextBracket: computeContextBracketData(100000, 200000), // MODERATE: 50% remaining
      };

      const injection = buildCarlInjection(injectionInput);

      expect(injection).not.toBeNull();
      expect(injection).toContain('CONTEXT BRACKET: [MODERATE]');
      expect(injection).toContain('[MODERATE] CONTEXT RULES:');
      // Should include MODERATE rules
      expect(injection).toContain('Add focused detail');
      // Should not include FRESH or DEPLETED rules
      expect(injection).not.toContain('Start with high-level context');
      expect(injection).not.toContain('Keep responses minimal');
    });

    it('should use DEPLETED rules when context bracket is CRITICAL', () => {
      copyFixture('full', projectOpencarlDir);

      const loadResult = loadOpencarlRules({
        overrides: {
          projectOpencarlDir,
          globalOpencarlDir,
          fallbackOpencarlDir,
        },
      });

      const injectionInput: OpencarlInjectionInput = {
        domainPayloads: loadResult.domainPayloads,
        matchedDomains: [],
        contextBracket: computeContextBracketData(160000, 200000), // CRITICAL: 20% remaining, uses DEPLETED rules
      };

      const injection = buildCarlInjection(injectionInput);

      expect(injection).not.toBeNull();
      expect(injection).toContain('CONTEXT CRITICAL');
      expect(injection).toContain('20% remaining');
      expect(injection).toContain('[DEPLETED] CONTEXT RULES:');
      // Should include DEPLETED rules
      expect(injection).toContain('Keep responses minimal');
      // Should not include FRESH or MODERATE rules
      expect(injection).not.toContain('Start with high-level context');
      expect(injection).not.toContain('Add focused detail');
    });
  });

  describe('snapshot testing', () => {
    it('should produce correct injection output (snapshot)', () => {
      copyFixture('full', projectOpencarlDir);

      const loadResult = loadOpencarlRules({
        overrides: {
          projectOpencarlDir,
          globalOpencarlDir,
          fallbackOpencarlDir,
        },
      });

      const domainConfigs = createDomainConfigsFromPayloads(loadResult.domainPayloads);

      const matchResult = matchDomainsForTurn({
        promptText: 'Help me debug this code',
        signals: {
          promptTokens: ['debug', 'code'],
          promptHistory: [],
          toolTokens: ['bash', 'git'],
          pathTokens: ['src/', 'lib/'],
        },
        domains: domainConfigs,
        globalExclude: loadResult.globalExclude,
      });

      const injectionInput: OpencarlInjectionInput = {
        domainPayloads: loadResult.domainPayloads,
        matchedDomains: matchResult.matchedDomains,
        contextBracket: computeContextBracketData(40000, 200000), // FRESH: 80% remaining
      };

      const injection = buildCarlInjection(injectionInput);

      expect(injection).toMatchSnapshot();
    });
  });

  describe('edge cases', () => {
    it('should handle empty matched domains', () => {
      copyFixture('full', projectOpencarlDir);

      const loadResult = loadOpencarlRules({
        overrides: {
          projectOpencarlDir,
          globalOpencarlDir,
          fallbackOpencarlDir,
        },
      });

      const domainConfigs = createDomainConfigsFromPayloads(loadResult.domainPayloads);

      // Match with a prompt that doesn't match any keywords
      const matchResult = matchDomainsForTurn({
        promptText: 'How is the weather today',
        signals: {
          promptTokens: ['weather', 'today'],
          promptHistory: [],
          toolTokens: [],
          pathTokens: [],
        },
        domains: domainConfigs,
        globalExclude: loadResult.globalExclude,
      });

      expect(matchResult.matchedDomains).toEqual([]);

      // CONTEXT is alwaysOn, so it should still produce injection
      const injectionInput: OpencarlInjectionInput = {
        domainPayloads: loadResult.domainPayloads,
        matchedDomains: matchResult.matchedDomains,
        contextBracket: computeContextBracketData(40000, 200000),
      };

      const injection = buildCarlInjection(injectionInput);

      // CONTEXT should still be injected (alwaysOn)
      expect(injection).not.toBeNull();
      expect(injection).toContain('CONTEXT BRACKET');
    });

    it('should return null when no domains should be injected', () => {
      copyFixture('minimal', projectOpencarlDir);

      const loadResult = loadOpencarlRules({
        overrides: {
          projectOpencarlDir,
          globalOpencarlDir,
          fallbackOpencarlDir,
        },
      });

      // Empty everything
      const injectionInput: OpencarlInjectionInput = {
        domainPayloads: {},
        matchedDomains: [],
      };

      const injection = buildCarlInjection(injectionInput);

      expect(injection).toBeNull();
    });
  });
});
