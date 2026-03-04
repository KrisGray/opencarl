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
      // Tests for valid single/multi-domain manifests
    });

    describe('edge cases', () => {
      // Empty, whitespace, comments
    });

    describe('malformed input', () => {
      // Invalid lines, missing equals, invalid booleans
    });

    describe('STATE and ALWAYS_ON parsing', () => {
      // Boolean value variations
    });
  });
});
