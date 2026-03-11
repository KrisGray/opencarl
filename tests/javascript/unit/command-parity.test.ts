import { resolveOpencarlCommandSignals, type OpencarlCommandResolutionInput } from '../../../src/opencarl/command-parity';
import type { OpencarlRuleDomainPayload } from '../../../src/opencarl/types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('command-parity.ts', () => {
  describe('resolveOpencarlCommandSignals', () => {
    describe('star command detection', () => {
      it('should detect *opencarl in prompt text', () => {
        const result = resolveOpencarlCommandSignals({
          promptText: 'Please help *opencarl with my code',
        });

        expect(result.commandTokens).toContain('OPENCARL');
      });

      it('should detect multiple star commands (*opencarl *brief *dev)', () => {
        const result = resolveOpencarlCommandSignals({
          promptText: 'I need *opencarl *brief *dev to work together',
        });

        expect(result.commandTokens).toContain('OPENCARL');
        expect(result.commandTokens).toContain('BRIEF');
        expect(result.commandTokens).toContain('DEV');
        expect(result.commandTokens).toHaveLength(3);
      });

      it('should extract command token from *opencarl', () => {
        const result = resolveOpencarlCommandSignals({
          promptText: 'Hey *opencarl can you help?',
        });

        expect(result.commandTokens).toEqual(['OPENCARL']);
      });

      it('should return empty array for prompt without star commands', () => {
        const result = resolveOpencarlCommandSignals({
          promptText: 'Please help me with my code',
        })

        expect(result.commandTokens).toEqual([]);
      });

      it('should handle empty prompt text', () => {
        const result = resolveOpencarlCommandSignals({
          promptText: '',
        })

        expect(result.commandTokens).toEqual([]);
        expect(result.commandDomains).toEqual([]);
        expect(result.commandPayloads).toEqual({});
      });

      it('should handle undefined prompt text', () => {
        const result = resolveOpencarlCommandSignals({
          promptText: undefined,
        })

        expect(result.commandTokens).toEqual([]);
      });

      it('should normalize tokens to uppercase', () => {
        const result = resolveOpencarlCommandSignals({
          promptText: '*opencarl *Brief *DEV',
        })

        expect(result.commandTokens).toEqual(['OPENCARL', 'BRIEF', 'DEV']);
      });
    });

    describe('*opencarl docs handling', () => {
      let tempDir: string;
      let commandsPath: string;

      beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'carl-test-'));
        commandsPath = path.join(tempDir, 'commands');
      });

      afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
      });

      it('should include docs guidance when "docs" in prompt with *opencarl', () => {
        fs.writeFileSync(
          commandsPath,
          'CARL_RULE_1=You are CARL, a helpful assistant.\nCARL_RULE_2=Follow best practices.\n'
        );

        const commandsPayload: OpencarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveOpencarlCommandSignals({
          promptText: '*opencarl docs please',
          commandsPayload,
          commandFilePath: commandsPath,
        });

        expect(result.commandDomains).toContain('OPENCARL');
        expect(result.commandPayloads['OPENCARL']).toBeDefined();
        expect(result.commandPayloads['OPENCARL'].rules.length).toBeGreaterThan(2);
        const combinedRules = result.commandPayloads['OPENCARL'].rules.join(' ');
        expect(combinedRules).toContain('CARL-DOCS');
      });

      it('should NOT include docs guidance when *opencarl without "docs"', () => {
        fs.writeFileSync(
          commandsPath,
          'CARL_RULE_1=You are CARL.\n'
        );

        const commandsPayload: OpencarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveOpencarlCommandSignals({
          promptText: '*opencarl help me',
          commandsPayload,
          commandFilePath: commandsPath,
        });

        expect(result.commandDomains).toContain('OPENCARL');
        expect(result.commandPayloads['OPENCARL'].rules).toHaveLength(1);
      });

      it('should include help guidance when provided via helpGuidance option', () => {
        fs.writeFileSync(
          commandsPath,
          'CARL_RULE_1=You are CARL.\n'
        );

        const commandsPayload: OpencarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveOpencarlCommandSignals({
          promptText: '*opencarl',
          commandsPayload,
          commandFilePath: commandsPath,
          helpGuidance: 'Custom help text here',
        });

        expect(result.commandDomains).toContain('OPENCARL');
        expect(result.commandPayloads['OPENCARL'].rules).toContain('Custom help text here');
      });
    });

    describe('custom command resolution', () => {
      let tempDir: string;
      let commandsPath: string;

      beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'carl-test-'));
        commandsPath = path.join(tempDir, 'commands');
      });

      afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
      });

      it('should resolve OPENCARL command to command payload', () => {
        fs.writeFileSync(
          commandsPath,
          'CARL_RULE_1=You are CARL.\nCARL_RULE_2=Be helpful.\n'
        );

        const commandsPayload: OpencarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveOpencarlCommandSignals({
          promptText: '*opencarl',
          commandsPayload,
          commandFilePath: commandsPath,
        });

        expect(result.commandPayloads['OPENCARL']).toBeDefined();
        expect(result.commandPayloads['OPENCARL'].domain).toBe('OPENCARL');
        expect(result.commandPayloads['OPENCARL'].rules).toHaveLength(2);
      });

      it('should return commandPayloads with correct domain', () => {
        fs.writeFileSync(
          commandsPath,
          'BRIEF_RULE_1=Be concise.\nDEV_RULE_1=Focus on code.\n'
        );

        const commandsPayload: OpencarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveOpencarlCommandSignals({
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

        const commandsPayload: OpencarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveOpencarlCommandSignals({
          promptText: '*opencarl *unknowncommand *anotherunknown',
          commandsPayload,
          commandFilePath: commandsPath,
        });

        expect(result.unresolvedTokens).toContain('UNKNOWNCOMMAND');
        expect(result.unresolvedTokens).toContain('ANOTHERUNKNOWN');
        expect(result.unresolvedTokens).not.toContain('OPENCARL');
      });

      it('should respect commandOverrides array', () => {
        fs.writeFileSync(
          commandsPath,
          'CARL_RULE_1=You are CARL.\nBRIEF_RULE_1=Be brief.\n'
        );

        const commandsPayload: OpencarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveOpencarlCommandSignals({
          promptText: '',
          commandOverrides: ['opencarl', 'brief'],
          commandsPayload,
          commandFilePath: commandsPath,
        });

        expect(result.commandTokens).toContain('OPENCARL');
        expect(result.commandTokens).toContain('BRIEF');
        expect(result.commandDomains).toContain('OPENCARL');
        expect(result.commandDomains).toContain('BRIEF');
      });

      it('should deduplicate tokens (uniqInOrder)', () => {
        const result = resolveOpencarlCommandSignals({
          promptText: '*opencarl *opencarl *opencarl *brief *brief',
        });

        expect(result.commandTokens).toEqual(['OPENCARL', 'BRIEF']);
      });

      it('should combine star commands and overrides, deduplicating', () => {
        fs.writeFileSync(
          commandsPath,
          'CARL_RULE_1=You are CARL.\nBRIEF_RULE_1=Be brief.\nDEV_RULE_1=Dev mode.\n'
        );

        const commandsPayload: OpencarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveOpencarlCommandSignals({
          promptText: '*opencarl *dev',
          commandOverrides: ['opencarl', 'brief'],
          commandsPayload,
          commandFilePath: commandsPath,
        });

        const opencarlCount = result.commandTokens.filter(t => t === 'OPENCARL').length;
        expect(opencarlCount).toBe(1);
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
      });

      afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
      });

      it('should handle undefined commandsPayload gracefully', () => {
        const result = resolveOpencarlCommandSignals({
          promptText: '*opencarl',
          commandsPayload: undefined,
        });

        expect(result.commandTokens).toContain('OPENCARL');
        expect(result.unresolvedTokens).toContain('OPENCARL');
        expect(result.commandPayloads).toEqual({});
      });

      it('should handle commandsPayload with state: false', () => {
        const commandsPayload: OpencarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: false,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveOpencarlCommandSignals({
          promptText: '*opencarl',
          commandsPayload,
        });

        expect(result.commandTokens).toContain('OPENCARL');
        expect(result.unresolvedTokens).toContain('OPENCARL');
        expect(result.commandPayloads).toEqual({});
      });

      it('should handle missing commandFilePath', () => {
        const commandsPayload: OpencarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: undefined as unknown as string,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveOpencarlCommandSignals({
          promptText: '*opencarl',
          commandsPayload,
        });

        expect(result.commandTokens).toContain('OPENCARL');
        expect(result.unresolvedTokens).toContain('OPENCARL');
      });

      it('should handle empty commandTokens array', () => {
        const result = resolveOpencarlCommandSignals({
          promptText: '',
          commandOverrides: [],
        });

        expect(result.commandTokens).toEqual([]);
        expect(result.commandDomains).toEqual([]);
        expect(result.commandPayloads).toEqual({});
        expect(result.unresolvedTokens).toEqual([]);
      });

      it('should preserve original case in commandTokens (normalized internally)', () => {
        const result = resolveOpencarlCommandSignals({
          promptText: '*OpEnCaRl *BrIeF',
        });

        expect(result.commandTokens).toEqual(['OPENCARL', 'BRIEF']);
      });

      it('should handle special characters in prompt (*opencarl-test, *opencarl_123)', () => {
        // *opencarl-test should match OPENCARL (stops at first -)
        // *opencarl_123 should match OPENCARL (stops at first _)
        const result = resolveOpencarlCommandSignals({
          promptText: '*opencarl-test *opencarl_123',
        });

        // Only OPENCARL should be extracted (the regex stops at non-letter chars, then deduplicates)
        expect(result.commandTokens).toEqual(['OPENCARL']);
      });

      it('should handle very long prompts with many star commands', () => {
        const longPrompt = Array(50).fill('*opencarl ').join('') + '*brief';
        const result = resolveOpencarlCommandSignals({
          promptText: longPrompt,
        });

        // Should have deduplicated OPENCARL and BRIEF
        expect(result.commandTokens).toEqual(['OPENCARL', 'BRIEF']);
      });

      it('should handle duplicate star commands (only once in result)', () => {
        const result = resolveOpencarlCommandSignals({
          promptText: '*opencarl *opencarl *opencarl',
        });

        expect(result.commandTokens).toEqual(['OPENCARL']);
      });

      it('should handle non-existent commands file path', () => {
        const commandsPayload: OpencarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveOpencarlCommandSignals({
          promptText: '*opencarl',
          commandsPayload,
          commandFilePath: '/nonexistent/path/commands',
        });

        expect(result.commandTokens).toContain('OPENCARL');
        expect(result.unresolvedTokens).toContain('OPENCARL');
        expect(result.commandPayloads).toEqual({});
      });

      it('should handle empty commands file', () => {
        fs.writeFileSync(commandsPath, '');

        const commandsPayload: OpencarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveOpencarlCommandSignals({
          promptText: '*opencarl',
          commandsPayload,
          commandFilePath: commandsPath,
        });

        expect(result.commandTokens).toContain('OPENCARL');
        expect(result.unresolvedTokens).toContain('OPENCARL');
      });

      it('should handle commands file with only comments', () => {
        fs.writeFileSync(
          commandsPath,
          '# This is a comment\n# Another comment\n'
        );

        const commandsPayload: OpencarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveOpencarlCommandSignals({
          promptText: '*opencarl',
          commandsPayload,
          commandFilePath: commandsPath,
        });

        expect(result.commandTokens).toContain('OPENCARL');
        expect(result.unresolvedTokens).toContain('OPENCARL');
      });

      it('should handle malformed rule lines in commands file', () => {
        fs.writeFileSync(
          commandsPath,
          'CARL_RULE_1=Valid rule\nINVALID_LINE\nCARL_RULE_2=Another valid\nNO_EQUALS_HERE\n'
        );

        const commandsPayload: OpencarlRuleDomainPayload = {
          domain: 'COMMANDS',
          scope: 'project',
          sourcePath: tempDir,
          rules: [],
          state: true,
          alwaysOn: false,
          recall: [],
          exclude: [],
        };

        const result = resolveOpencarlCommandSignals({
          promptText: '*opencarl',
          commandsPayload,
          commandFilePath: commandsPath,
        });

        expect(result.commandDomains).toContain('OPENCARL');
        expect(result.commandPayloads['OPENCARL'].rules).toHaveLength(2);
      });

      it('should handle null commandsPayload', () => {
        const result = resolveOpencarlCommandSignals({
          promptText: '*opencarl',
          commandsPayload: null,
        });

        expect(result.commandTokens).toContain('OPENCARL');
        expect(result.unresolvedTokens).toContain('OPENCARL');
        expect(result.commandPayloads).toEqual({});
      });
    });
  });
});
