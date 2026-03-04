/**
 * Unit tests for src/carl/injector.ts
 * Tests for buildCarlInjection - rule composer and injector
 */

import { buildCarlInjection } from '../../../src/carl/injector';
import type { CarlInjectionInput } from '../../../src/carl/injector';
import { createTestDomainPayload } from '../../helpers/domain-factory';
import {
  createTestBracketData,
  createFreshBracketData,
  createModerateBracketData,
  createDepletedBracketData,
  createCriticalBracketData,
} from '../../helpers/bracket-factory';

describe('injector.ts', () => {
  describe('buildCarlInjection', () => {
    describe('single domain', () => {
      it('should inject single matched domain', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            DEVELOPMENT: createTestDomainPayload({
              domain: 'DEVELOPMENT',
              rules: ['Use early returns', 'Prefer small functions'],
            }),
          },
          matchedDomains: ['DEVELOPMENT'],
        };

        const result = buildCarlInjection(input);

        expect(result).not.toBeNull();
        expect(result).toContain('<carl-rules>');
        expect(result).toContain('DEVELOPMENT');
        expect(result).toContain('Use early returns');
        expect(result).toContain('</carl-rules>');
      });

      it('should include domain name in output', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            CONTENT: createTestDomainPayload({
              domain: 'CONTENT',
              rules: ['Write clearly'],
            }),
          },
          matchedDomains: ['CONTENT'],
        };

        const result = buildCarlInjection(input);

        expect(result).toContain('[CONTENT] RULES:');
      });

      it('should number rules sequentially', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            DEVELOPMENT: createTestDomainPayload({
              domain: 'DEVELOPMENT',
              rules: ['Rule one', 'Rule two', 'Rule three'],
            }),
          },
          matchedDomains: ['DEVELOPMENT'],
        };

        const result = buildCarlInjection(input);

        expect(result).toContain('1. Rule one');
        expect(result).toContain('2. Rule two');
        expect(result).toContain('3. Rule three');
      });

      it('should not inject inactive domain', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            DEVELOPMENT: createTestDomainPayload({
              domain: 'DEVELOPMENT',
              state: false,
              rules: ['Use early returns'],
            }),
          },
          matchedDomains: ['DEVELOPMENT'],
        };

        const result = buildCarlInjection(input);

        expect(result).toBeNull();
      });

      it('should not inject domain with empty rules', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            DEVELOPMENT: createTestDomainPayload({
              domain: 'DEVELOPMENT',
              rules: [],
            }),
          },
          matchedDomains: ['DEVELOPMENT'],
        };

        const result = buildCarlInjection(input);

        expect(result).toBeNull();
      });

      it('should sort domains alphabetically', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            ZEBRA: createTestDomainPayload({ domain: 'ZEBRA', rules: ['Z rule'] }),
            ALPHA: createTestDomainPayload({ domain: 'ALPHA', rules: ['A rule'] }),
            MIDDLE: createTestDomainPayload({ domain: 'MIDDLE', rules: ['M rule'] }),
          },
          matchedDomains: ['ZEBRA', 'ALPHA', 'MIDDLE'],
        };

        const result = buildCarlInjection(input);

        expect(result).not.toBeNull();
        const alphaPos = result!.indexOf('[ALPHA]');
        const middlePos = result!.indexOf('[MIDDLE]');
        const zebraPos = result!.indexOf('[ZEBRA]');
        expect(alphaPos).toBeLessThan(middlePos);
        expect(middlePos).toBeLessThan(zebraPos);
      });
    });

    describe('multiple domains', () => {
      it('should combine rules from multiple matched domains', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            DEVELOPMENT: createTestDomainPayload({
              domain: 'DEVELOPMENT',
              rules: ['Dev rule 1'],
            }),
            CONTENT: createTestDomainPayload({
              domain: 'CONTENT',
              rules: ['Content rule 1'],
            }),
          },
          matchedDomains: ['DEVELOPMENT', 'CONTENT'],
        };

        const result = buildCarlInjection(input);

        expect(result).not.toBeNull();
        expect(result).toContain('[DEVELOPMENT] RULES:');
        expect(result).toContain('Dev rule 1');
        expect(result).toContain('[CONTENT] RULES:');
        expect(result).toContain('Content rule 1');
      });

      it('should separate domains with headers', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            ALPHA: createTestDomainPayload({ domain: 'ALPHA', rules: ['A rule'] }),
            BETA: createTestDomainPayload({ domain: 'BETA', rules: ['B rule'] }),
          },
          matchedDomains: ['ALPHA', 'BETA'],
        };

        const result = buildCarlInjection(input);

        expect(result).toContain('[ALPHA] RULES:');
        expect(result).toContain('[BETA] RULES:');
        // Should have separate sections, not merged
        const alphaMatch = result!.match(/\[ALPHA\] RULES:/g);
        const betaMatch = result!.match(/\[BETA\] RULES:/g);
        expect(alphaMatch).toHaveLength(1);
        expect(betaMatch).toHaveLength(1);
      });

      it('should maintain domain separation (not merge rules)', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            DOMAIN_A: createTestDomainPayload({
              domain: 'DOMAIN_A',
              rules: ['A1', 'A2'],
            }),
            DOMAIN_B: createTestDomainPayload({
              domain: 'DOMAIN_B',
              rules: ['B1', 'B2'],
            }),
          },
          matchedDomains: ['DOMAIN_A', 'DOMAIN_B'],
        };

        const result = buildCarlInjection(input);

        // Rules should be in separate sections, not combined
        const lines = result!.split('\n');
        const domainALine = lines.findIndex(l => l.includes('[DOMAIN_A]'));
        const domainBLine = lines.findIndex(l => l.includes('[DOMAIN_B]'));
        const a1Line = lines.findIndex(l => l.includes('A1'));
        const b1Line = lines.findIndex(l => l.includes('B1'));

        // DOMAIN_A section should come before DOMAIN_B (alphabetical)
        expect(domainALine).toBeLessThan(domainBLine);
        // Each domain's rules should be under its own header
        expect(a1Line).toBeGreaterThan(domainALine);
        expect(a1Line).toBeLessThan(domainBLine);
        expect(b1Line).toBeGreaterThan(domainBLine);
      });

      it('should handle three or more domains', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            ALPHA: createTestDomainPayload({ domain: 'ALPHA', rules: ['Rule A'] }),
            BETA: createTestDomainPayload({ domain: 'BETA', rules: ['Rule B'] }),
            GAMMA: createTestDomainPayload({ domain: 'GAMMA', rules: ['Rule C'] }),
            DELTA: createTestDomainPayload({ domain: 'DELTA', rules: ['Rule D'] }),
          },
          matchedDomains: ['ALPHA', 'BETA', 'GAMMA', 'DELTA'],
        };

        const result = buildCarlInjection(input);

        expect(result).toContain('[ALPHA] RULES:');
        expect(result).toContain('[BETA] RULES:');
        expect(result).toContain('[GAMMA] RULES:');
        expect(result).toContain('[DELTA] RULES:');
        expect(result).toContain('Rule A');
        expect(result).toContain('Rule B');
        expect(result).toContain('Rule C');
        expect(result).toContain('Rule D');
      });

      it('should filter matchedDomains not in domainPayloads', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            DEVELOPMENT: createTestDomainPayload({
              domain: 'DEVELOPMENT',
              rules: ['Dev rule'],
            }),
          },
          matchedDomains: ['DEVELOPMENT', 'UNKNOWN_DOMAIN'],
        };

        const result = buildCarlInjection(input);

        expect(result).not.toBeNull();
        expect(result).toContain('[DEVELOPMENT] RULES:');
        expect(result).not.toContain('[UNKNOWN_DOMAIN]');
        expect(result).not.toContain('undefined');
      });
    });

    describe('global rules', () => {
      it('should always include GLOBAL domain', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            GLOBAL: createTestDomainPayload({
              domain: 'GLOBAL',
              rules: ['Global rule 1', 'Global rule 2'],
              alwaysOn: false,
            }),
          },
          matchedDomains: [],
        };

        const result = buildCarlInjection(input);

        expect(result).not.toBeNull();
        expect(result).toContain('[GLOBAL] RULES:');
        expect(result).toContain('Global rule 1');
      });

      it('should include GLOBAL even with matched domains', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            GLOBAL: createTestDomainPayload({
              domain: 'GLOBAL',
              rules: ['Global rule'],
              alwaysOn: false,
            }),
            DEVELOPMENT: createTestDomainPayload({
              domain: 'DEVELOPMENT',
              rules: ['Dev rule'],
            }),
          },
          matchedDomains: ['DEVELOPMENT'],
        };

        const result = buildCarlInjection(input);

        expect(result).toContain('[GLOBAL] RULES:');
        expect(result).toContain('[DEVELOPMENT] RULES:');
        expect(result).toContain('ALWAYS-ON DOMAINS');
      });

      it('should place GLOBAL in ALWAYS-ON DOMAINS section', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            GLOBAL: createTestDomainPayload({
              domain: 'GLOBAL',
              rules: ['Global rule'],
            }),
          },
          matchedDomains: [],
        };

        const result = buildCarlInjection(input);

        expect(result).toContain('ALWAYS-ON DOMAINS');
        expect(result).toContain('[GLOBAL] RULES:');
      });
    });

    describe('always-on domains', () => {
      it('should include ALWAYS_ON domain even without match', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            ALWAYS_ON_DOMAIN: createTestDomainPayload({
              domain: 'ALWAYS_ON_DOMAIN',
              rules: ['Always rule'],
              alwaysOn: true,
            }),
          },
          matchedDomains: [],
        };

        const result = buildCarlInjection(input);

        expect(result).toContain('[ALWAYS_ON_DOMAIN] RULES:');
        expect(result).toContain('Always rule');
      });

      it('should not duplicate ALWAYS_ON domain in matched section', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            ALWAYS_ON_DOMAIN: createTestDomainPayload({
              domain: 'ALWAYS_ON_DOMAIN',
              rules: ['Always rule'],
              alwaysOn: true,
            }),
          },
          matchedDomains: ['ALWAYS_ON_DOMAIN'],
        };

        const result = buildCarlInjection(input);

        // Should appear only once in ALWAYS-ON section
        const matches = result!.match(/\[ALWAYS_ON_DOMAIN\]/g);
        expect(matches).toHaveLength(1);
        expect(result).toContain('ALWAYS-ON DOMAINS');
      });

      it('should filter inactive ALWAYS_ON domains', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            ALWAYS_ON_DOMAIN: createTestDomainPayload({
              domain: 'ALWAYS_ON_DOMAIN',
              rules: ['Always rule'],
              alwaysOn: true,
              state: false,
            }),
          },
          matchedDomains: [],
        };

        const result = buildCarlInjection(input);

        expect(result).toBeNull();
      });

      it('should separate ALWAYS-ON from MATCHED sections', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            DEVELOPMENT: createTestDomainPayload({
              domain: 'DEVELOPMENT',
              rules: ['Dev rule'],
              alwaysOn: false,
            }),
            GLOBAL: createTestDomainPayload({
              domain: 'GLOBAL',
              rules: ['Global rule'],
              alwaysOn: false,
            }),
          },
          matchedDomains: ['DEVELOPMENT'],
        };

        const result = buildCarlInjection(input);

        expect(result).toContain('ALWAYS-ON DOMAINS');
        expect(result).toContain('MATCHED DOMAINS');
        expect(result).toContain('[GLOBAL] RULES:');
        expect(result).toContain('[DEVELOPMENT] RULES:');
      });
    });

    describe('command domains', () => {
      it('should include command domains in COMMAND section', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            BRIEF: createTestDomainPayload({
              domain: 'BRIEF',
              rules: ['Brief rule'],
            }),
          },
          commandDomains: ['BRIEF'],
        };

        const result = buildCarlInjection(input);

        expect(result).toContain('COMMAND DOMAINS (explicit)');
        expect(result).toContain('[BRIEF] RULES:');
      });

      it('should prioritize command over matched domains', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            BRIEF: createTestDomainPayload({
              domain: 'BRIEF',
              rules: ['Brief rule'],
            }),
          },
          matchedDomains: ['BRIEF'],
          commandDomains: ['BRIEF'],
        };

        const result = buildCarlInjection(input);

        expect(result).toContain('COMMAND DOMAINS (explicit)');
        expect(result).toContain('[BRIEF] RULES:');
        // Should NOT appear in MATCHED DOMAINS section
        expect(result).not.toContain('MATCHED DOMAINS');
      });

      it('should prioritize command over alwaysOn', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            BRIEF: createTestDomainPayload({
              domain: 'BRIEF',
              rules: ['Brief rule'],
              alwaysOn: true,
            }),
          },
          commandDomains: ['BRIEF'],
        };

        const result = buildCarlInjection(input);

        expect(result).toContain('COMMAND DOMAINS (explicit)');
        expect(result).toContain('[BRIEF] RULES:');
        // Should NOT appear in ALWAYS-ON section
        const alwaysOnMatches = result!.match(/ALWAYS-ON DOMAINS/g);
        expect(alwaysOnMatches).toBeNull();
      });

      it('should handle multiple command domains', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            BRIEF: createTestDomainPayload({
              domain: 'BRIEF',
              rules: ['Brief rule'],
            }),
            DETAILED: createTestDomainPayload({
              domain: 'DETAILED',
              rules: ['Detailed rule'],
            }),
          },
          commandDomains: ['BRIEF', 'DETAILED'],
        };

        const result = buildCarlInjection(input);

        expect(result).toContain('[BRIEF] RULES:');
        expect(result).toContain('[DETAILED] RULES:');
        expect(result).toContain('COMMAND DOMAINS (explicit)');
      });

      it('should filter inactive command domains', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            BRIEF: createTestDomainPayload({
              domain: 'BRIEF',
              rules: ['Brief rule'],
              state: false,
            }),
          },
          commandDomains: ['BRIEF'],
        };

        const result = buildCarlInjection(input);

        expect(result).toBeNull();
      });

      it('should normalize domain names (case-insensitive)', () => {
        const input: CarlInjectionInput = {
          domainPayloads: {
            BRIEF: createTestDomainPayload({
              domain: 'BRIEF',
              rules: ['Brief rule'],
            }),
          },
          commandDomains: ['brief'], // lowercase
        };

        const result = buildCarlInjection(input);

        expect(result).toContain('[BRIEF] RULES:');
        expect(result).toContain('Brief rule');
      });
    });

    describe('context brackets', () => {
      // Tests for CONTEXT with bracket filtering
    });

    describe('edge cases', () => {
      // Empty inputs, missing domains, etc.
    });

    describe('output formatting', () => {
      // Tests for output structure and format
    });
  });
});
