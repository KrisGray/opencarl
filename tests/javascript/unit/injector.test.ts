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
      // Tests for single matched domain
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
