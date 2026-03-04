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
      // Tests for GLOBAL domain handling
    });

    describe('always-on domains', () => {
      // Tests for ALWAYS_ON handling
    });

    describe('command domains', () => {
      // Tests for explicit command domains
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
