import { parseManifest, parseDomainRules, resolveDomainFile } from '../../../src/opencarl/validate';
import type { ParsedManifest, ParsedDomainRules } from '../../../src/opencarl/validate';
import { createTestManifestPath } from '../../helpers/manifest-factory';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { OpencarlRuleDiscoveryWarning } from '../../../src/opencarl/types';

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
      it('should parse STATE=true variations', () => {
        const truthyValues = ['true', 'TRUE', 'yes', 'YES', '1', 'active', 'on'];

        truthyValues.forEach((value) => {
          const content = `DEVELOPMENT_STATE=${value}`;
          const manifestPath = createTestManifestPath(content, tempDir);
          const result = parseManifest(manifestPath);

          expect(result.isValid).toBe(true);
          expect(result.domains.DEVELOPMENT.state).toBe(true);
        });
      });

      it('should parse STATE=false variations', () => {
        const falsyValues = ['false', 'FALSE', 'no', 'NO', '0', 'inactive', 'off'];

        falsyValues.forEach((value) => {
          const content = `DEVELOPMENT_STATE=${value}`;
          const manifestPath = createTestManifestPath(content, tempDir);
          const result = parseManifest(manifestPath);

          expect(result.isValid).toBe(true);
          expect(result.domains.DEVELOPMENT.state).toBe(false);
        });
      });

      it('should parse ALWAYS_ON=true variations', () => {
        const truthyValues = ['true', 'TRUE', 'yes', 'YES', '1', 'active', 'on'];

        truthyValues.forEach((value) => {
          const content = `DEVELOPMENT_ALWAYS_ON=${value}`;
          const manifestPath = createTestManifestPath(content, tempDir);
          const result = parseManifest(manifestPath);

          expect(result.isValid).toBe(true);
          expect(result.domains.DEVELOPMENT.alwaysOn).toBe(true);
        });
      });

      it('should parse ALWAYS_ON=false variations', () => {
        const falsyValues = ['false', 'FALSE', 'no', 'NO', '0', 'inactive', 'off'];

        falsyValues.forEach((value) => {
          const content = `DEVELOPMENT_ALWAYS_ON=${value}`;
          const manifestPath = createTestManifestPath(content, tempDir);
          const result = parseManifest(manifestPath);

          expect(result.isValid).toBe(true);
          expect(result.domains.DEVELOPMENT.alwaysOn).toBe(false);
        });
      });

      it('should default domain state to false when not specified', () => {
        const content = `DEVELOPMENT_RECALL=code, debug`;
        const manifestPath = createTestManifestPath(content, tempDir);
        const result = parseManifest(manifestPath);

        expect(result.isValid).toBe(true);
        expect(result.domains.DEVELOPMENT.state).toBe(false);
      });

      it('should default alwaysOn to false when not specified', () => {
        const content = `DEVELOPMENT_STATE=active
DEVELOPMENT_RECALL=code`;
        const manifestPath = createTestManifestPath(content, tempDir);
        const result = parseManifest(manifestPath);

        expect(result.isValid).toBe(true);
        expect(result.domains.DEVELOPMENT.alwaysOn).toBe(false);
      });
    });
  });

  describe('parseDomainRules', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'carl-test-'));
    });

    afterEach(() => {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    describe('valid domain rules', () => {
      it('should parse valid RULE_N entries in order', () => {
        const content = `DEVELOPMENT_RULE_1=First rule
DEVELOPMENT_RULE_2=Second rule
DEVELOPMENT_RULE_3=Third rule`;
        const domainPath = path.join(tempDir, 'development');
        fs.writeFileSync(domainPath, content, 'utf8');

        const result = parseDomainRules(domainPath, 'DEVELOPMENT');

        expect(result.rules).toHaveLength(3);
        expect(result.rules[0]).toBe('First rule');
        expect(result.rules[1]).toBe('Second rule');
        expect(result.rules[2]).toBe('Third rule');
        expect(result.warnings).toHaveLength(0);
      });

      it('should ignore comment lines starting with #', () => {
        const content = `# This is a comment
DEVELOPMENT_RULE_1=First rule
# Another comment
DEVELOPMENT_RULE_2=Second rule`;
        const domainPath = path.join(tempDir, 'development');
        fs.writeFileSync(domainPath, content, 'utf8');

        const result = parseDomainRules(domainPath, 'DEVELOPMENT');

        expect(result.rules).toHaveLength(2);
        expect(result.rules).toEqual(['First rule', 'Second rule']);
        expect(result.warnings).toHaveLength(0);
      });

      it('should skip blank lines', () => {
        const content = `DEVELOPMENT_RULE_1=First rule

DEVELOPMENT_RULE_2=Second rule


DEVELOPMENT_RULE_3=Third rule`;
        const domainPath = path.join(tempDir, 'development');
        fs.writeFileSync(domainPath, content, 'utf8');

        const result = parseDomainRules(domainPath, 'DEVELOPMENT');

        expect(result.rules).toHaveLength(3);
        expect(result.warnings).toHaveLength(0);
      });

      it('should trim whitespace from keys and values', () => {
        const content = `DEVELOPMENT_RULE_1  =  First rule  
DEVELOPMENT_RULE_2  =  Second rule  `;
        const domainPath = path.join(tempDir, 'development');
        fs.writeFileSync(domainPath, content, 'utf8');

        const result = parseDomainRules(domainPath, 'DEVELOPMENT');

        expect(result.rules).toHaveLength(2);
        expect(result.rules[0]).toBe('First rule');
        expect(result.rules[1]).toBe('Second rule');
        expect(result.warnings).toHaveLength(0);
      });

      it('should warn on malformed lines without =', () => {
        const content = `DEVELOPMENT_RULE_1=First rule
this is not valid
DEVELOPMENT_RULE_2=Second rule`;
        const domainPath = path.join(tempDir, 'development');
        fs.writeFileSync(domainPath, content, 'utf8');

        const result = parseDomainRules(domainPath, 'DEVELOPMENT');

        expect(result.rules).toHaveLength(2);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].message).toContain('Malformed rule line');
      });

      it('should warn on invalid rule keys', () => {
        const content = `DEVELOPMENT_RULE_1=First rule
INVALID_KEY=value
DEVELOPMENT_RULE_2=Second rule`;
        const domainPath = path.join(tempDir, 'development');
        fs.writeFileSync(domainPath, content, 'utf8');

        const result = parseDomainRules(domainPath, 'DEVELOPMENT');

        expect(result.rules).toHaveLength(2);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].message).toContain('Invalid rule key');
      });
    });

    describe('CONTEXT domain brackets', () => {
      it('should parse FRESH_RULES flag', () => {
        const content = `FRESH_RULES=true
FRESH_RULE_1=Fresh rule`;
        const domainPath = path.join(tempDir, 'context');
        fs.writeFileSync(domainPath, content, 'utf8');

        const result = parseDomainRules(domainPath, 'CONTEXT');

        expect(result.bracketFlags).toBeDefined();
        expect(result.bracketFlags!['FRESH']).toBe(true);
        expect(result.bracketRules).toBeDefined();
        expect(result.bracketRules!['FRESH']).toHaveLength(1);
      });

      it('should parse MODERATE_RULE_N entries', () => {
        const content = `MODERATE_RULES=true
MODERATE_RULE_1=Moderate rule one
MODERATE_RULE_2=Moderate rule two`;
        const domainPath = path.join(tempDir, 'context');
        fs.writeFileSync(domainPath, content, 'utf8');

        const result = parseDomainRules(domainPath, 'CONTEXT');

        expect(result.bracketFlags).toBeDefined();
        expect(result.bracketFlags!['MODERATE']).toBe(true);
        expect(result.bracketRules).toBeDefined();
        expect(result.bracketRules!['MODERATE']).toHaveLength(2);
        expect(result.bracketRules!['MODERATE'][0]).toBe('Moderate rule one');
        expect(result.bracketRules!['MODERATE'][1]).toBe('Moderate rule two');
      });

      it('should populate bracketRules for CONTEXT domain', () => {
        const content = `FRESH_RULES=true
FRESH_RULE_1=Fresh rule
MODERATE_RULES=false
MODERATE_RULE_1=Moderate rule`;
        const domainPath = path.join(tempDir, 'context');
        fs.writeFileSync(domainPath, content, 'utf8');

        const result = parseDomainRules(domainPath, 'CONTEXT');

        expect(result.bracketRules).toBeDefined();
        expect(result.bracketRules!['FRESH']).toHaveLength(1);
        expect(result.bracketRules!['MODERATE']).toHaveLength(1);
      });

      it('should populate bracketFlags for CONTEXT domain', () => {
        const content = `FRESH_RULES=true
MODERATE_RULES=false
DEPLETED_RULES=yes
CRITICAL_RULES=1`;
        const domainPath = path.join(tempDir, 'context');
        fs.writeFileSync(domainPath, content, 'utf8');

        const result = parseDomainRules(domainPath, 'CONTEXT');

        expect(result.bracketFlags).toBeDefined();
        expect(result.bracketFlags!['FRESH']).toBe(true);
        expect(result.bracketFlags!['MODERATE']).toBe(false);
        expect(result.bracketFlags!['DEPLETED']).toBe(true);
        expect(result.bracketFlags!['CRITICAL']).toBe(true);
      });
    });

    describe('COMMANDS domain rules', () => {
      it('should parse COMMANDS domain with uppercase prefix', () => {
        const content = `TESTCMD_RULE_1=Test command rule
TESTCMD_RULE_2=Another command`;
        const domainPath = path.join(tempDir, 'commands');
        fs.writeFileSync(domainPath, content, 'utf8');

        const result = parseDomainRules(domainPath, 'COMMANDS');

        expect(result.rules).toHaveLength(2);
        expect(result.warnings).toHaveLength(0);
      });

      it('should accept alphanumeric prefixes for COMMANDS', () => {
        const content = `CMD123_RULE_1=Rule with numbers
ABC_RULE_2=Alphabetic rule`;
        const domainPath = path.join(tempDir, 'commands');
        fs.writeFileSync(domainPath, content, 'utf8');

        const result = parseDomainRules(domainPath, 'COMMANDS');

        expect(result.rules).toHaveLength(2);
        expect(result.warnings).toHaveLength(0);
      });
    });

    describe('malformed input', () => {
      it('should warn on empty rule values', () => {
        const content = `DEVELOPMENT_RULE_1=First rule
DEVELOPMENT_RULE_2=
DEVELOPMENT_RULE_3=Third rule`;
        const domainPath = path.join(tempDir, 'development');
        fs.writeFileSync(domainPath, content, 'utf8');

        const result = parseDomainRules(domainPath, 'DEVELOPMENT');

        expect(result.rules).toHaveLength(2);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].message).toContain('Empty rule value');
      });

      it('should warn on lines with empty key', () => {
        const content = `DEVELOPMENT_RULE_1=First rule
=value
DEVELOPMENT_RULE_2=Second rule`;
        const domainPath = path.join(tempDir, 'development');
        fs.writeFileSync(domainPath, content, 'utf8');

        const result = parseDomainRules(domainPath, 'DEVELOPMENT');

        expect(result.rules).toHaveLength(2);
        expect(result.warnings.length).toBeGreaterThan(0);
      });

      it('should handle non-existent domain file', () => {
        const nonExistentPath = path.join(tempDir, 'non-existent');
        const result = parseDomainRules(nonExistentPath, 'DEVELOPMENT');

        expect(result.rules).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });
    });

    describe('edge cases', () => {
      it('should handle multiple brackets in single file', () => {
        const content = `FRESH_RULES=true
FRESH_RULE_1=Fresh 1
MODERATE_RULES=true
MODERATE_RULE_1=Moderate 1
DEPLETED_RULES=false
CRITICAL_RULE_1=Critical 1`;
        const domainPath = path.join(tempDir, 'context');
        fs.writeFileSync(domainPath, content, 'utf8');

        const result = parseDomainRules(domainPath, 'CONTEXT');

        expect(result.bracketFlags).toBeDefined();
        expect(Object.keys(result.bracketFlags!)).toHaveLength(3);
        expect(result.bracketRules).toBeDefined();
        expect(Object.keys(result.bracketRules!)).toHaveLength(3);
        expect(result.rules).toHaveLength(3); // All rules added to flat list
      });

      it('should handle file with only comments and blank lines', () => {
        const content = `# Comment 1

# Comment 2

`;
        const domainPath = path.join(tempDir, 'development');
        fs.writeFileSync(domainPath, content, 'utf8');

        const result = parseDomainRules(domainPath, 'DEVELOPMENT');

        expect(result.rules).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });

      it('should handle rules with equals sign in value', () => {
        const content = `DEVELOPMENT_RULE_1=Rule with equals sign
DEVELOPMENT_RULE_2=Another rule`;
        const domainPath = path.join(tempDir, 'development');
        fs.writeFileSync(domainPath, content, 'utf8');

        const result = parseDomainRules(domainPath, 'DEVELOPMENT');

        expect(result.rules).toHaveLength(2);
        expect(result.rules[0]).toBe('Rule with equals sign');
        expect(result.rules[1]).toBe('Another rule');
      });
    });
  });

  describe('resolveDomainFile', () => {
    let tempDir: string;
    let warnings: OpencarlRuleDiscoveryWarning[];

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'carl-test-'));
      warnings = [];
    });

    afterEach(() => {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    describe('domain file resolution', () => {
      it('should return path when domain file exists with lowercase name', () => {
        const carlDir = path.join(tempDir, '.opencarl');
        fs.mkdirSync(carlDir);
        fs.writeFileSync(path.join(carlDir, 'development'), 'DEVELOPMENT_RULE_1=test', 'utf8');

        const result = resolveDomainFile(carlDir, 'DEVELOPMENT', warnings);

        expect(result).toBe(path.join(carlDir, 'development'));
        expect(warnings).toHaveLength(0);
      });

      it('should return null when domain file does not exist', () => {
        const carlDir = path.join(tempDir, '.opencarl');
        fs.mkdirSync(carlDir);

        const result = resolveDomainFile(carlDir, 'DEVELOPMENT', warnings);

        expect(result).toBeNull();
        expect(warnings).toHaveLength(1);
        expect(warnings[0].message).toContain('Missing domain file');
      });

      it('should warn when domain file has wrong case (UPPERCASE instead of lowercase)', () => {
        const carlDir = path.join(tempDir, '.opencarl');
        fs.mkdirSync(carlDir);
        // Create file with uppercase name (should be lowercase)
        fs.writeFileSync(path.join(carlDir, 'DEVELOPMENT'), 'DEVELOPMENT_RULE_1=test', 'utf8');

        const result = resolveDomainFile(carlDir, 'DEVELOPMENT', warnings);

        expect(result).toBeNull();
        expect(warnings).toHaveLength(1);
        expect(warnings[0].message).toContain('must be lowercase');
      });

    });

    describe('edge cases', () => {
      it('should warn when .opencarl directory does not exist', () => {
        const carlDir = path.join(tempDir, '.opencarl');
        // Don't create .opencarl directory

        const result = resolveDomainFile(carlDir, 'DEVELOPMENT', warnings);

        expect(result).toBeNull();
        expect(warnings).toHaveLength(1);
        expect(warnings[0].message).toContain('Missing domain file');
      });

      it('should handle multiple domain lookups independently', () => {
        const carlDir = path.join(tempDir, '.opencarl');
        fs.mkdirSync(carlDir);
        fs.writeFileSync(path.join(carlDir, 'development'), 'DEVELOPMENT_RULE_1=test', 'utf8');
        fs.writeFileSync(path.join(carlDir, 'context'), 'CONTEXT_RULE_1=test', 'utf8');

        const warnings1: OpencarlRuleDiscoveryWarning[] = [];
        const warnings2: OpencarlRuleDiscoveryWarning[] = [];

        const result1 = resolveDomainFile(carlDir, 'DEVELOPMENT', warnings1);
        const result2 = resolveDomainFile(carlDir, 'CONTEXT', warnings2);

        expect(result1).toBe(path.join(carlDir, 'development'));
        expect(result2).toBe(path.join(carlDir, 'context'));
        expect(warnings1).toHaveLength(0);
        expect(warnings2).toHaveLength(0);
      });

    });
  });
});
