import { resolveCarlCommandSignals, type CarlCommandResolutionInput } from '../../../src/carl/command-parity';
import type { CarlRuleDomainPayload } from '../../../src/carl/types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('command-parity.ts', () => {
  describe('resolveCarlCommandSignals', () => {
    describe('star command detection', () => {
      it('should detect *carl in prompt text', () => {
        const result = resolveCarlCommandSignals({
          promptText: 'Please help *carl with my code',
        });

        expect(result.commandTokens).toContain('CARL');
      });

      it('should detect multiple star commands (*carl *brief *dev)', () => {
        const result = resolveCarlCommandSignals({
          promptText: 'I need *carl *brief *dev to work together',
        });

        expect(result.commandTokens).toContain('CARL');
        expect(result.commandTokens).toContain('BRIEF');
        expect(result.commandTokens).toContain('DEV');
        expect(result.commandTokens).toHaveLength(3);
      });

      it('should extract command token from *carl', () => {
        const result = resolveCarlCommandSignals({
          promptText: 'Hey *carl can you help?',
        });

        expect(result.commandTokens).toEqual(['CARL']);
      });

      it('should return empty array for prompt without star commands', () => {
        const result = resolveCarlCommandSignals({
          promptText: 'Please help me with my code',
        })

        expect(result.commandTokens).toEqual([]);
      });

      it('should handle empty prompt text', () => {
        const result = resolveCarlCommandSignals({
          promptText: '',
        })

        expect(result.commandTokens).toEqual([]);
        expect(result.commandDomains).toEqual([]);
        expect(result.commandPayloads).toEqual({});
      });

      it('should handle undefined prompt text', () => {
        const result = resolveCarlCommandSignals({
          promptText: undefined,
        })

        expect(result.commandTokens).toEqual([]);
      });

      it('should normalize tokens to uppercase', () => {
        const result = resolveCarlCommandSignals({
          promptText: '*carl *Brief *DEV',
        })

        expect(result.commandTokens).toEqual(['CARL', 'BRIEF', 'DEV']);
      });
    });

    describe('*carl docs handling', () => {
      let tempDir: string;
      let commandsPath: string;

      beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'carl-test-'));
        commandsPath = path.join(tempDir, 'commands');
        fs.mkdirSync(commandsPath, { recursive: true });
      });

      afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
      });

      it('should include docs guidance when "docs" in prompt with *carl', () => {
        fs.writeFileSync(
          commandsPath,
          'CARL_RULE_1=You are CARL, a helpful assistant.\nCARL_RULE_2=Follow best practices.\n'
        );

        const commandsPayload: CarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveCarlCommandSignals({
          promptText: '*carl docs please',
          commandsPayload,
          commandFilePath: commandsPath,
        });

        expect(result.commandDomains).toContain('CARL');
        expect(result.commandPayloads['CARL']).toBeDefined();
        expect(result.commandPayloads['CARL'].rules.length).toBeGreaterThan(2);
        const combinedRules = result.commandPayloads['CARL'].rules.join(' ');
        expect(combinedRules).toContain('CARL-DOCS');
      });

      it('should NOT include docs guidance when *carl without "docs"', () => {
        fs.writeFileSync(
          commandsPath,
          'CARL_RULE_1=You are CARL.\n'
        );

        const commandsPayload: CarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveCarlCommandSignals({
          promptText: '*carl help me',
          commandsPayload,
          commandFilePath: commandsPath,
        });

        expect(result.commandDomains).toContain('CARL');
        expect(result.commandPayloads['CARL'].rules).toHaveLength(1);
      });

      it('should include help guidance when provided via helpGuidance option', () => {
        fs.writeFileSync(
          commandsPath,
          'CARL_RULE_1=You are CARL.\n'
        );

        const commandsPayload: CarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveCarlCommandSignals({
          promptText: '*carl',
          commandsPayload,
          commandFilePath: commandsPath,
          helpGuidance: 'Custom help text here',
        });

        expect(result.commandDomains).toContain('CARL');
        expect(result.commandPayloads['CARL'].rules).toContain('Custom help text here');
      });
    });

    describe('custom command resolution', () => {
      let tempDir: string;
      let commandsPath: string;

      beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'carl-test-'));
        commandsPath = path.join(tempDir, 'commands');
        fs.mkdirSync(commandsPath, { recursive: true });
      });

      afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
      });

      it('should resolve CARL command to command payload', () => {
        fs.writeFileSync(
          commandsPath,
          'CARL_RULE_1=You are CARL.\nCARL_RULE_2=Be helpful.\n'
        );

        const commandsPayload: CarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveCarlCommandSignals({
          promptText: '*carl',
          commandsPayload,
          commandFilePath: commandsPath,
        });

        expect(result.commandPayloads['CARL']).toBeDefined();
        expect(result.commandPayloads['CARL'].domain).toBe('CARL');
        expect(result.commandPayloads['CARL'].rules).toHaveLength(2);
      });

      it('should return commandPayloads with correct domain', () => {
        fs.writeFileSync(
          commandsPath,
          'BRIEF_RULE_1=Be concise.\nDEV_RULE_1=Focus on code.\n'
        );

        const commandsPayload: CarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveCarlCommandSignals({
          promptText: '*brief *dev',
          commandsPayload,
          commandFilePath: commandsPath,
        });

        expect(result.commandPayloads['BRIEF']).toBeDefined();
        expect(result.commandPayloads['BRIEF'].domain).toBe('BRIEF');
        expect(result.commandPayloads['DEV']).toBeDefined();
        expect(result.commandPayloads['DEV'].domain).toBe('DEV');
      });

      it('should track unresolved tokens for unknown commands', () => {
        fs.writeFileSync(
          commandsPath,
          'CARL_RULE_1=You are CARL.\n'
        );

        const commandsPayload: CarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveCarlCommandSignals({
          promptText: '*carl *unknowncommand *anotherunknown',
          commandsPayload,
          commandFilePath: commandsPath,
        });

        expect(result.unresolvedTokens).toContain('UNKNOWNCOMMAND');
        expect(result.unresolvedTokens).toContain('ANOTHERUNKNOWN');
        expect(result.unresolvedTokens).not.toContain('CARL');
      });

      it('should respect commandOverrides array', () => {
        fs.writeFileSync(
          commandsPath,
          'CARL_RULE_1=You are CARL.\nBRIEF_RULE_1=Be brief.\n'
        );

        const commandsPayload: CarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveCarlCommandSignals({
          promptText: '',
          commandOverrides: ['carl', 'brief'],
          commandsPayload,
          commandFilePath: commandsPath,
        });

        expect(result.commandTokens).toContain('CARL');
        expect(result.commandTokens).toContain('BRIEF');
        expect(result.commandDomains).toContain('CARL');
        expect(result.commandDomains).toContain('BRIEF');
      });

      it('should deduplicate tokens (uniqInOrder)', () => {
        const result = resolveCarlCommandSignals({
          promptText: '*carl *carl *carl *brief *brief',
        });

        expect(result.commandTokens).toEqual(['CARL', 'BRIEF']);
      });

      it('should combine star commands and overrides, deduplicating', () => {
        fs.writeFileSync(
          commandsPath,
          'CARL_RULE_1=You are CARL.\nBRIEF_RULE_1=Be brief.\nDEV_RULE_1=Dev mode.\n'
        );

        const commandsPayload: CarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveCarlCommandSignals({
          promptText: '*carl *dev',
          commandOverrides: ['carl', 'brief'],
          commandsPayload,
          commandFilePath: commandsPath,
        });

        const carlCount = result.commandTokens.filter(t => t === 'CARL').length;
        expect(carlCount).toBe(1);
        expect(result.commandTokens).toContain('BRIEF');
        expect(result.commandTokens).toContain('DEV');
      });
    });

    describe('edge cases', () => {
      let tempDir: string;
      let commandsPath: string;

      beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'carl-test-'));
        commandsPath = path.join(tempDir, 'commands');
        fs.mkdirSync(commandsPath, { recursive: true });
      });

      afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
      });

      it('should handle undefined commandsPayload gracefully', () => {
        const result = resolveCarlCommandSignals({
          promptText: '*carl',
          commandsPayload: undefined,
        });

        expect(result.commandTokens).toContain('CARL');
        expect(result.unresolvedTokens).toContain('CARL');
        expect(result.commandPayloads).toEqual({});
      });

      it('should handle commandsPayload with state: false', () => {
        const commandsPayload: CarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: false,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveCarlCommandSignals({
          promptText: '*carl',
          commandsPayload,
        });

        expect(result.commandTokens).toContain('CARL');
        expect(result.unresolvedTokens).toContain('CARL');
        expect(result.commandPayloads).toEqual({});
      });

      it('should handle missing commandFilePath', () => {
        const commandsPayload: CarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: undefined as unknown as string,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveCarlCommandSignals({
          promptText: '*carl',
          commandsPayload,
        });

        expect(result.commandTokens).toContain('CARL');
        expect(result.unresolvedTokens).toContain('CARL');
      });

      it('should handle empty commandTokens array', () => {
        const result = resolveCarlCommandSignals({
          promptText: '',
          commandOverrides: [],
        });

        expect(result.commandTokens).toEqual([]);
        expect(result.commandDomains).toEqual([]);
        expect(result.commandPayloads).toEqual({});
        expect(result.unresolvedTokens).toEqual([]);
      });

      it('should preserve original case in commandTokens (normalized internally)', () => {
        const result = resolveCarlCommandSignals({
          promptText: '*CaRl *BrIeF',
        });

        expect(result.commandTokens).toEqual(['CARL', 'BRIEF']);
      });

      it('should handle special characters in prompt (*carl-test, *carl_123)', () => {
        // *carl-test should match CARL (stops at first -)
        // *carl_123 should match CARL (stops at first -)
        const result = resolveCarlCommandSignals({
          promptText: '*carl-test *carl_123',
        });

        // Only CARL and CARL should be extracted (the regex stops at word boundary)
        expect(result.commandTokens).toEqual(['CARL', 'CARL']);
      });

      it('should handle very long prompts with many star commands', () => {
        const longPrompt = Array(50).fill('*carl ').join('') + '*brief';
        const result = resolveCarlCommandSignals({
          promptText: longPrompt,
        });

        // Should have deduplicated CARL and BRIEF
        expect(result.commandTokens).toEqual(['CARL', 'BRIEF']);
      });

      it('should handle duplicate star commands (only once in result)', () => {
        const result = resolveCarlCommandSignals({
          promptText: '*carl *carl *carl',
        });

        expect(result.commandTokens).toEqual(['CARL']);
      });

      it('should handle non-existent commands file path', () => {
        const commandsPayload: CarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveCarlCommandSignals({
          promptText: '*carl',
          commandsPayload,
          commandFilePath: '/nonexistent/path/commands',
        });

        expect(result.commandTokens).toContain('CARL');
        expect(result.unresolvedTokens).toContain('CARL');
        expect(result.commandPayloads).toEqual({});
      });

      it('should handle empty commands file', () => {
        fs.writeFileSync(commandsPath, '');

        const commandsPayload: CarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveCarlCommandSignals({
          promptText: '*carl',
          commandsPayload,
          commandFilePath: commandsPath,
        });

        expect(result.commandTokens).toContain('CARL');
        expect(result.unresolvedTokens).toContain('CARL');
      });

      it('should handle commands file with only comments', () => {
        fs.writeFileSync(
          commandsPath,
          '# This is a comment\n# Another comment\n'
        );

        const commandsPayload: CarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveCarlCommandSignals({
          promptText: '*carl',
          commandsPayload,
          commandFilePath: commandsPath,
        });

        expect(result.commandTokens).toContain('CARL');
        expect(result.unresolvedTokens).toContain('CARL');
      });

      it('should handle malformed rule lines in commands file', () => {
        fs.writeFileSync(
          commandsPath,
          'CARL_RULE_1=Valid rule\nINVALID_LINE\nCARL_RULE_2=Another valid\nNO_EQUALS_HERE\n'
        );

        const commandsPayload: CarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveCarlCommandSignals({
          promptText: '*carl',
          commandsPayload,
          commandFilePath: commandsPath,
        });

        expect(result.commandDomains).toContain('CARL');
        expect(result.commandPayloads['CARL'].rules).toHaveLength(2);
      });

      it('should handle null commandsPayload', () => {
        const result = resolveCarlCommandSignals({
          promptText: '*carl',
          commandsPayload: null,
        });

        expect(result.commandTokens).toContain('CARL');
        expect(result.unresolvedTokens).toContain('CARL');
        expect(result.commandPayloads).toEqual({});
      });
    });
  });
});
