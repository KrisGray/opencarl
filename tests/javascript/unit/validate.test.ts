import { parseManifest } from '../../../src/carl/validate';
import type { ParsedManifest } from '../../../src/carl/validate';
import { createTestManifestPath } from '../../helpers/manifest-factory';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('validate.ts', () => {
  describe('parseManifest', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'carl-test-'));
    });

    afterEach(() => {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    describe('valid manifests', () => {
      it('should parse valid single-domain manifest correctly', () => {
        const content = `DEVELOPMENT_STATE=active
DEVELOPMENT_RECALL=fix bug, write code, debug
DEVELOPMENT_EXCLUDE=secret, password`;
        const manifestPath = createTestManifestPath(content, tempDir);
        const result = parseManifest(manifestPath);

        expect(result.isValid).toBe(true);
        expect(result.domains).toHaveProperty('DEVELOPMENT');
        expect(result.domains.DEVELOPMENT.state).toBe(true);
        expect(result.domains.DEVELOPMENT.recall).toEqual(['fix bug', 'write code', 'debug']);
        expect(result.domains.DEVELOPMENT.exclude).toEqual(['secret', 'password']);
        expect(result.warnings).toHaveLength(0);
      });

      it('should parse valid multi-domain manifest correctly', () => {
        const content = `DEVELOPMENT_STATE=active
DEVELOPMENT_RECALL=code, debug
CONTENT_STATE=true
CONTENT_RECALL=write, edit
CONTEXT_STATE=yes
CONTEXT_RECALL=analyze`;
        const manifestPath = createTestManifestPath(content, tempDir);
        const result = parseManifest(manifestPath);

        expect(result.isValid).toBe(true);
        expect(Object.keys(result.domains)).toHaveLength(3);
        expect(result.domains).toHaveProperty('DEVELOPMENT');
        expect(result.domains).toHaveProperty('CONTENT');
        expect(result.domains).toHaveProperty('CONTEXT');
        expect(result.domains.DEVELOPMENT.state).toBe(true);
        expect(result.domains.CONTENT.state).toBe(true);
        expect(result.domains.CONTEXT.state).toBe(true);
      });

      it('should parse DEVMODE flag correctly', () => {
        const contentTrue = `DEVMODE=true
DEVELOPMENT_STATE=active`;
        const manifestPathTrue = createTestManifestPath(contentTrue, tempDir);
        const resultTrue = parseManifest(manifestPathTrue);

        expect(resultTrue.devmode).toBe(true);

        const contentFalse = `DEVMODE=false
DEVELOPMENT_STATE=active`;
        const manifestPathFalse = createTestManifestPath(contentFalse, path.join(tempDir, 'test2'));
        const resultFalse = parseManifest(manifestPathFalse);

        expect(resultFalse.devmode).toBe(false);
      });

      it('should parse GLOBAL_EXCLUDE keywords', () => {
        const content = `GLOBAL_EXCLUDE=secret, password, token, api_key
DEVELOPMENT_STATE=active`;
        const manifestPath = createTestManifestPath(content, tempDir);
        const result = parseManifest(manifestPath);

        expect(result.globalExclude).toEqual(['secret', 'password', 'token', 'api_key']);
        expect(result.isValid).toBe(true);
      });
    });

    describe('edge cases', () => {
      it('should return invalid for empty manifest', () => {
        const content = '';
        const manifestPath = createTestManifestPath(content, tempDir);
        const result = parseManifest(manifestPath);

        expect(result.isValid).toBe(false);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].message).toContain('no recognized entries');
      });

      it('should ignore blank lines and whitespace', () => {
        const content = `DEVELOPMENT_STATE=active


DEVELOPMENT_RECALL=code, debug


DEVMODE=false`;
        const manifestPath = createTestManifestPath(content, tempDir);
        const result = parseManifest(manifestPath);

        expect(result.isValid).toBe(true);
        expect(result.domains).toHaveProperty('DEVELOPMENT');
        expect(result.devmode).toBe(false);
      });

      it('should ignore comment lines starting with hash', () => {
        const content = `# This is a comment
DEVELOPMENT_STATE=active
# Another comment
DEVELOPMENT_RECALL=code
# Final comment`;
        const manifestPath = createTestManifestPath(content, tempDir);
        const result = parseManifest(manifestPath);

        expect(result.isValid).toBe(true);
        expect(result.domains).toHaveProperty('DEVELOPMENT');
        expect(result.warnings).toHaveLength(0);
      });

      it('should trim whitespace from keys and values', () => {
        const content = `DEVELOPMENT_STATE  =  active
DEVELOPMENT_RECALL  =  code, debug  `;
        const manifestPath = createTestManifestPath(content, tempDir);
        const result = parseManifest(manifestPath);

        expect(result.isValid).toBe(true);
        expect(result.domains.DEVELOPMENT.state).toBe(true);
        expect(result.domains.DEVELOPMENT.recall).toEqual(['code', 'debug']);
      });

      it('should handle RECALL/EXCLUDE with extra commas', () => {
        const content = `DEVELOPMENT_STATE=active
DEVELOPMENT_RECALL=fix bug, , write code, ,
DEVELOPMENT_EXCLUDE=secret, , password, ,`;
        const manifestPath = createTestManifestPath(content, tempDir);
        const result = parseManifest(manifestPath);

        expect(result.isValid).toBe(true);
        expect(result.domains.DEVELOPMENT.recall).toEqual(['fix bug', 'write code']);
        expect(result.domains.DEVELOPMENT.exclude).toEqual(['secret', 'password']);
      });

      it('should handle file that does not exist', () => {
        const nonExistentPath = path.join(tempDir, 'non-existent.manifest');
        const result = parseManifest(nonExistentPath);

        expect(result.isValid).toBe(false);
        expect(result.domains).toEqual({});
        expect(result.devmode).toBe(false);
        expect(result.globalExclude).toEqual([]);
      });
    });

    describe('malformed input', () => {
      it('should warn on lines without equals sign', () => {
        const content = `DEVELOPMENT_STATE=active
this is not valid
DEVELOPMENT_RECALL=code`;
        const manifestPath = createTestManifestPath(content, tempDir);
        const result = parseManifest(manifestPath);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].message).toContain('Malformed manifest line');
        expect(result.domains.DEVELOPMENT.recall).toEqual(['code']);
      });

      it('should warn on unknown manifest keys', () => {
        const content = `DEVELOPMENT_STATE=active
UNKNOWN_FIELD=value
DEVELOPMENT_RECALL=code`;
        const manifestPath = createTestManifestPath(content, tempDir);
        const result = parseManifest(manifestPath);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].message).toContain('Unknown manifest key');
      });

      it('should warn on invalid STATE boolean value', () => {
        const content = `DEVELOPMENT_STATE=maybe
DEVELOPMENT_RECALL=code`;
        const manifestPath = createTestManifestPath(content, tempDir);
        const result = parseManifest(manifestPath);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].message).toContain('Invalid DEVELOPMENT_STATE value');
        expect(result.domains.DEVELOPMENT.state).toBe(false);
      });

      it('should warn on invalid ALWAYS_ON boolean value', () => {
        const content = `DEVELOPMENT_STATE=active
DEVELOPMENT_ALWAYS_ON=sure
DEVELOPMENT_RECALL=code`;
        const manifestPath = createTestManifestPath(content, tempDir);
        const result = parseManifest(manifestPath);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].message).toContain('Invalid DEVELOPMENT_ALWAYS_ON value');
        expect(result.domains.DEVELOPMENT.alwaysOn).toBe(false);
      });

      it('should handle empty key (line starting with =)', () => {
        const content = `DEVELOPMENT_STATE=active
=value
DEVELOPMENT_RECALL=code`;
        const manifestPath = createTestManifestPath(content, tempDir);
        const result = parseManifest(manifestPath);

        expect(result.isValid).toBe(true);
        expect(result.warnings.length).toBeGreaterThan(0);
      });

      it('should accumulate multiple warnings', () => {
        const content = `DEVELOPMENT_STATE=maybe
this is not valid
DEVELOPMENT_ALWAYS_ON=sure
UNKNOWN_FIELD=value
DEVELOPMENT_RECALL=code`;
        const manifestPath = createTestManifestPath(content, tempDir);
        const result = parseManifest(manifestPath);

        expect(result.isValid).toBe(true);
        expect(result.warnings.length).toBeGreaterThan(2);
      });
    });

    describe('STATE and ALWAYS_ON parsing', () => {
      // Boolean value variations
    });
  });
});
