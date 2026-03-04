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
      // Tests for combining multiple domains
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
