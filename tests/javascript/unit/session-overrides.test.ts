import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  loadSessionOverrides,
  applySessionOverrides,
  isDomainDisabledBySession,
  getDomainOverride,
} from '../../../src/carl/session-overrides';
import type { SessionOverrides } from '../../../src/carl/session-overrides';
import { createTestSessionOverrides } from '../../helpers/session-state-factory';

describe('session-overrides.ts', () => {
  let tempDir: string;
  let carlDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'carl-session-test-'));
    carlDir = path.join(tempDir, '.carl');
    fs.mkdirSync(carlDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('loadSessionOverrides', () => {
    describe('file loading', () => {
      it('should load session overrides from .carl/sessions/{id}.json', () => {
        const sessionsDir = path.join(carlDir, 'sessions');
        fs.mkdirSync(sessionsDir, { recursive: true });
        fs.writeFileSync(
          path.join(sessionsDir, 'test-session.json'),
          JSON.stringify({ domains: { DEVELOPMENT: 'false', CONTENT: 'true' } })
        );

        const result = loadSessionOverrides(carlDir, 'test-session');

        expect(result.exists).toBe(true);
        expect(result.sessionId).toBe('test-session');
        expect(result.domains.DEVELOPMENT).toBe('false');
        expect(result.domains.CONTENT).toBe('true');
      });

      it('should return default (empty domains) when file does not exist', () => {
        const result = loadSessionOverrides(carlDir, 'non-existent-session');

        expect(result.exists).toBe(false);
        expect(result.sessionId).toBe('non-existent-session');
        expect(result.domains).toEqual({});
      });

      it('should return default when sessionId is empty', () => {
        const result = loadSessionOverrides(carlDir, '');

        expect(result.exists).toBe(false);
        expect(result.sessionId).toBe('');
        expect(result.domains).toEqual({});
      });

      it('should return default when carlDir is empty', () => {
        const result = loadSessionOverrides('', 'test-session');

        expect(result.exists).toBe(false);
        expect(result.sessionId).toBe('test-session');
        expect(result.domains).toEqual({});
      });

      it('should set exists: true when file exists', () => {
        const sessionsDir = path.join(carlDir, 'sessions');
        fs.mkdirSync(sessionsDir, { recursive: true });
        fs.writeFileSync(
          path.join(sessionsDir, 'exists-test.json'),
          JSON.stringify({})
        );

        const result = loadSessionOverrides(carlDir, 'exists-test');

        expect(result.exists).toBe(true);
      });

      it('should set exists: false when file does not exist', () => {
        const result = loadSessionOverrides(carlDir, 'no-file');

        expect(result.exists).toBe(false);
      });
    });

    describe('override value parsing', () => {
      it('should parse domains with true/false/inherit values', () => {
        const sessionsDir = path.join(carlDir, 'sessions');
        fs.mkdirSync(sessionsDir, { recursive: true });
        fs.writeFileSync(
          path.join(sessionsDir, 'values-test.json'),
          JSON.stringify({
            domains: {
              DEVELOPMENT: 'true',
              CONTENT: 'false',
              DATABASE: 'inherit',
            },
          })
        );

        const result = loadSessionOverrides(carlDir, 'values-test');

        expect(result.domains.DEVELOPMENT).toBe('true');
        expect(result.domains.CONTENT).toBe('false');
        expect(result.domains.DATABASE).toBe('inherit');
      });

      it('should normalize domain names to uppercase', () => {
        const sessionsDir = path.join(carlDir, 'sessions');
        fs.mkdirSync(sessionsDir, { recursive: true });
        fs.writeFileSync(
          path.join(sessionsDir, 'case-test.json'),
          JSON.stringify({
            domains: {
              development: 'false',
              Content: 'true',
              DATABASE: 'inherit',
            },
          })
        );

        const result = loadSessionOverrides(carlDir, 'case-test');

        expect(result.domains.DEVELOPMENT).toBe('false');
        expect(result.domains.CONTENT).toBe('true');
        expect(result.domains.DATABASE).toBe('inherit');
      });

      it('should handle invalid JSON gracefully (console.warn, return empty)', () => {
        const sessionsDir = path.join(carlDir, 'sessions');
        fs.mkdirSync(sessionsDir, { recursive: true });
        fs.writeFileSync(
          path.join(sessionsDir, 'invalid.json'),
          'not valid json {{{'
        );

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        const result = loadSessionOverrides(carlDir, 'invalid');

        expect(result.exists).toBe(false);
        expect(result.domains).toEqual({});
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to parse session overrides')
        );

        consoleSpy.mockRestore();
      });

      it('should handle domains with various truthy values (yes, 1, true)', () => {
        const sessionsDir = path.join(carlDir, 'sessions');
        fs.mkdirSync(sessionsDir, { recursive: true });
        fs.writeFileSync(
          path.join(sessionsDir, 'truthy.json'),
          JSON.stringify({
            domains: {
              DOMAIN1: 'yes',
              DOMAIN2: '1',
              DOMAIN3: 'true',
            },
          })
        );

        const result = loadSessionOverrides(carlDir, 'truthy');

        expect(result.domains.DOMAIN1).toBe('true');
        expect(result.domains.DOMAIN2).toBe('true');
        expect(result.domains.DOMAIN3).toBe('true');
      });

      it('should handle domains with various falsy values (no, 0, false)', () => {
        const sessionsDir = path.join(carlDir, 'sessions');
        fs.mkdirSync(sessionsDir, { recursive: true });
        fs.writeFileSync(
          path.join(sessionsDir, 'falsy.json'),
          JSON.stringify({
            domains: {
              DOMAIN1: 'no',
              DOMAIN2: '0',
              DOMAIN3: 'false',
            },
          })
        );

        const result = loadSessionOverrides(carlDir, 'falsy');

        expect(result.domains.DOMAIN1).toBe('false');
        expect(result.domains.DOMAIN2).toBe('false');
        expect(result.domains.DOMAIN3).toBe('false');
      });

      it('should treat unknown values as inherit', () => {
        const sessionsDir = path.join(carlDir, 'sessions');
        fs.mkdirSync(sessionsDir, { recursive: true });
        fs.writeFileSync(
          path.join(sessionsDir, 'unknown.json'),
          JSON.stringify({
            domains: {
              DOMAIN1: 'maybe',
              DOMAIN2: 'unknown',
            },
          })
        );

        const result = loadSessionOverrides(carlDir, 'unknown');

        expect(result.domains.DOMAIN1).toBe('inherit');
        expect(result.domains.DOMAIN2).toBe('inherit');
      });

      it('should trim and lowercase value strings', () => {
        const sessionsDir = path.join(carlDir, 'sessions');
        fs.mkdirSync(sessionsDir, { recursive: true });
        fs.writeFileSync(
          path.join(sessionsDir, 'whitespace.json'),
          JSON.stringify({
            domains: {
              DOMAIN1: '  TRUE  ',
              DOMAIN2: '  False  ',
            },
          })
        );

        const result = loadSessionOverrides(carlDir, 'whitespace');

        expect(result.domains.DOMAIN1).toBe('true');
        expect(result.domains.DOMAIN2).toBe('false');
      });
    });
  });

  describe('applySessionOverrides', () => {
    it('should filter out domains with override: false', () => {
      const overrides = createTestSessionOverrides({
        domains: { DEVELOPMENT: 'false', CONTENT: 'inherit' },
        exists: true,
      });

      const result = applySessionOverrides(
        ['DEVELOPMENT', 'CONTENT', 'DATABASE'],
        overrides
      );

      expect(result).not.toContain('DEVELOPMENT');
      expect(result).toContain('CONTENT');
      expect(result).toContain('DATABASE');
    });

    it('should keep domains with override: true (if in original list)', () => {
      const overrides = createTestSessionOverrides({
        domains: { DEVELOPMENT: 'true', CONTENT: 'inherit' },
        exists: true,
      });

      const result = applySessionOverrides(
        ['DEVELOPMENT', 'CONTENT', 'DATABASE'],
        overrides
      );

      expect(result).toContain('DEVELOPMENT');
      expect(result).toContain('CONTENT');
      expect(result).toContain('DATABASE');
    });

    it('should keep domains with override: inherit (no change)', () => {
      const overrides = createTestSessionOverrides({
        domains: { DEVELOPMENT: 'inherit', CONTENT: 'inherit' },
        exists: true,
      });

      const result = applySessionOverrides(
        ['DEVELOPMENT', 'CONTENT', 'DATABASE'],
        overrides
      );

      expect(result).toContain('DEVELOPMENT');
      expect(result).toContain('CONTENT');
      expect(result).toContain('DATABASE');
    });

    it('should return sorted domain list', () => {
      const overrides = createTestSessionOverrides({
        domains: {},
        exists: true,
      });

      const result = applySessionOverrides(
        ['ZEBRA', 'ALPHA', 'BETA', 'GAMMA'],
        overrides
      );

      expect(result).toEqual(['ALPHA', 'BETA', 'GAMMA', 'ZEBRA']);
    });

    it('should handle empty overrides (return original list)', () => {
      const overrides = createTestSessionOverrides({
        domains: {},
        exists: false,
      });

      const result = applySessionOverrides(
        ['DEVELOPMENT', 'CONTENT'],
        overrides
      );

      expect(result).toEqual(['CONTENT', 'DEVELOPMENT']);
    });

    it('should handle empty input domain list', () => {
      const overrides = createTestSessionOverrides({
        domains: { DEVELOPMENT: 'false' },
        exists: true,
      });

      const result = applySessionOverrides([], overrides);

      expect(result).toEqual([]);
    });

    it('should filter multiple domains', () => {
      const overrides = createTestSessionOverrides({
        domains: {
          DEVELOPMENT: 'false',
          CONTENT: 'false',
          DATABASE: 'inherit',
        },
        exists: true,
      });

      const result = applySessionOverrides(
        ['DEVELOPMENT', 'CONTENT', 'DATABASE'],
        overrides
      );

      expect(result).toEqual(['DATABASE']);
    });
  });

  describe('helper functions', () => {
    describe('isDomainDisabledBySession', () => {
      it('should return true when domain has override: false', () => {
        const overrides = createTestSessionOverrides({
          domains: { DEVELOPMENT: 'false' },
          exists: true,
        });

        expect(isDomainDisabledBySession('DEVELOPMENT', overrides)).toBe(true);
      });

      it('should return false when domain has override: true', () => {
        const overrides = createTestSessionOverrides({
          domains: { DEVELOPMENT: 'true' },
          exists: true,
        });

        expect(isDomainDisabledBySession('DEVELOPMENT', overrides)).toBe(false);
      });

      it('should return false when domain has override: inherit', () => {
        const overrides = createTestSessionOverrides({
          domains: { DEVELOPMENT: 'inherit' },
          exists: true,
        });

        expect(isDomainDisabledBySession('DEVELOPMENT', overrides)).toBe(false);
      });

      it('should return false when domain is not in overrides', () => {
        const overrides = createTestSessionOverrides({
          domains: {},
          exists: false,
        });

        expect(isDomainDisabledBySession('DEVELOPMENT', overrides)).toBe(false);
      });

      it('should normalize domain name to uppercase', () => {
        const overrides = createTestSessionOverrides({
          domains: { DEVELOPMENT: 'false' },
          exists: true,
        });

        expect(isDomainDisabledBySession('development', overrides)).toBe(true);
        expect(isDomainDisabledBySession('Development', overrides)).toBe(true);
      });
    });

    describe('getDomainOverride', () => {
      it('should return override value for domain', () => {
        const overrides = createTestSessionOverrides({
          domains: { DEVELOPMENT: 'false', CONTENT: 'true' },
          exists: true,
        });

        expect(getDomainOverride('DEVELOPMENT', overrides)).toBe('false');
        expect(getDomainOverride('CONTENT', overrides)).toBe('true');
      });

      it('should return inherit for unknown domains', () => {
        const overrides = createTestSessionOverrides({
          domains: {},
          exists: false,
        });

        expect(getDomainOverride('UNKNOWN', overrides)).toBe('inherit');
      });

      it('should normalize domain name lookup', () => {
        const overrides = createTestSessionOverrides({
          domains: { DEVELOPMENT: 'false' },
          exists: true,
        });

        expect(getDomainOverride('development', overrides)).toBe('false');
        expect(getDomainOverride('Development', overrides)).toBe('false');
      });
    });
  });

  describe('edge cases', () => {
    let edgeTempDir: string;
    let edgeCarlDir: string;

    beforeEach(() => {
      edgeTempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'carl-edge-test-'));
      edgeCarlDir = path.join(edgeTempDir, '.carl');
      fs.mkdirSync(edgeCarlDir, { recursive: true });
    });

    afterEach(() => {
      fs.rmSync(edgeTempDir, { recursive: true, force: true });
    });

    it('should handle sessions directory does not exist', () => {
      const result = loadSessionOverrides(edgeCarlDir, 'test-session');

      expect(result.exists).toBe(false);
      expect(result.domains).toEqual({});
    });

    it('should handle .carl directory does not exist', () => {
      const nonExistentCarlDir = path.join(edgeTempDir, 'non-existent');
      const result = loadSessionOverrides(nonExistentCarlDir, 'test-session');

      expect(result.exists).toBe(false);
      expect(result.domains).toEqual({});
    });

    it('should handle .carl directory does not exist', () => {
      const result = loadSessionOverrides('/nonexistent/path', 'test');

      expect(result.exists).toBe(false);
      expect(result.domains).toEqual({});
    });

    it('should handle empty domains object in session file', () => {
      const sessionsDir = path.join(carlDir, 'sessions');
      fs.mkdirSync(sessionsDir, { recursive: true });
      fs.writeFileSync(
        path.join(sessionsDir, 'empty-domains.json'),
        JSON.stringify({ domains: {} })
      );

      const result = loadSessionOverrides(carlDir, 'empty-domains');

      expect(result.exists).toBe(true);
      expect(result.domains).toEqual({});
    });

    it('should handle extra fields in session file (ignore them)', () => {
      const sessionsDir = path.join(carlDir, 'sessions');
      fs.mkdirSync(sessionsDir, { recursive: true });
      fs.writeFileSync(
        path.join(sessionsDir, 'extra-fields.json'),
        JSON.stringify({
          domains: { DEVELOPMENT: 'false' },
          extraField: 'should be ignored',
          anotherField: 123,
        })
      );

      const result = loadSessionOverrides(carlDir, 'extra-fields');

      expect(result.exists).toBe(true);
      expect(result.domains).toEqual({ DEVELOPMENT: 'false' });
    });

    it('should handle domains with various truthy values (yes, 1, true)', () => {
      const sessionsDir = path.join(carlDir, 'sessions');
      fs.mkdirSync(sessionsDir, { recursive: true });
      fs.writeFileSync(
        path.join(sessionsDir, 'truthy.json'),
        JSON.stringify({
          domains: {
            DOMAIN1: 'yes',
            DOMAIN2: '1',
            DOMAIN3: 'TRUE',
            DOMAIN4: 'Yes',
          },
        })
      );

      const result = loadSessionOverrides(carlDir, 'truthy');

      expect(result.domains.DOMAIN1).toBe('true');
      expect(result.domains.DOMAIN2).toBe('true');
      expect(result.domains.DOMAIN3).toBe('true');
      expect(result.domains.DOMAIN4).toBe('true');
    });

    it('should handle domains with various falsy values (no, 0, false)', () => {
      const sessionsDir = path.join(carlDir, 'sessions');
      fs.mkdirSync(sessionsDir, { recursive: true });
      fs.writeFileSync(
        path.join(sessionsDir, 'falsy.json'),
        JSON.stringify({
          domains: {
            DOMAIN1: 'no',
            DOMAIN2: '0',
            DOMAIN3: 'FALSE',
            DOMAIN4: 'No',
          },
        })
      );

      const result = loadSessionOverrides(carlDir, 'falsy');

      expect(result.domains.DOMAIN1).toBe('false');
      expect(result.domains.DOMAIN2).toBe('false');
      expect(result.domains.DOMAIN3).toBe('false');
      expect(result.domains.DOMAIN4).toBe('false');
    });

    it('should handle concurrent lookups (different session IDs)', () => {
      const sessionsDir = path.join(carlDir, 'sessions');
      fs.mkdirSync(sessionsDir, { recursive: true });

      fs.writeFileSync(
        path.join(sessionsDir, 'session-1.json'),
        JSON.stringify({ domains: { DEVELOPMENT: 'false' } })
      );

      fs.writeFileSync(
        path.join(sessionsDir, 'session-2.json'),
        JSON.stringify({ domains: { CONTENT: 'true' } })
      );

      const result1 = loadSessionOverrides(carlDir, 'session-1');
      const result2 = loadSessionOverrides(carlDir, 'session-2');

      expect(result1.domains).toEqual({ DEVELOPMENT: 'false' });
      expect(result2.domains).toEqual({ CONTENT: 'true' });
    });

    it('should handle file read errors', () => {
      const sessionsDir = path.join(carlDir, 'sessions');
      fs.mkdirSync(sessionsDir, { recursive: true });

      // Create a directory instead of a file to trigger read error
      const sessionPath = path.join(sessionsDir, 'directory.json');
      fs.mkdirSync(sessionPath);

      const result = loadSessionOverrides(carlDir, 'directory');

      // Should handle gracefully
      expect(result.exists).toBe(false);
      expect(result.domains).toEqual({});
    });

    it('should handle null sessionId', () => {
      const result = loadSessionOverrides(carlDir, null as any);

      expect(result.exists).toBe(false);
      expect(result.sessionId).toBe('');
      expect(result.domains).toEqual({});
    });

    it('should handle non-string domain values', () => {
      const sessionsDir = path.join(carlDir, 'sessions');
      fs.mkdirSync(sessionsDir, { recursive: true });
      fs.writeFileSync(
        path.join(sessionsDir, 'non-string.json'),
        JSON.stringify({
          domains: {
            DOMAIN1: 123,
            DOMAIN2: true,
            DOMAIN3: null,
          },
        })
      );

      const result = loadSessionOverrides(carlDir, 'non-string');

      // Non-string values should be treated as inherit
      expect(result.domains.DOMAIN1).toBe('inherit');
      expect(result.domains.DOMAIN2).toBe('inherit');
      expect(result.domains.DOMAIN3).toBe('inherit');
    });

    it('should handle very long session IDs', () => {
      const longId = 'a'.repeat(1000);
      const result = loadSessionOverrides(carlDir, longId);

      expect(result.sessionId).toBe(longId);
      expect(result.exists).toBe(false);
    });
  });
});
