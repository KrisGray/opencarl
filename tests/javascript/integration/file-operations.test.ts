import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { loadOpencarlRules } from '../../../src/opencarl/loader';
import { markRulesDirty, getCachedRules, resetRulesCache } from '../../../src/opencarl/rule-cache';
import { loadSessionOverrides } from '../../../src/opencarl/session-overrides';

const fixturesRoot = path.join(
  __dirname,
  '..',
  '..',
  'fixtures',
  'carl-directories'
);

function copyFixture(
  fixtureName: 'minimal' | 'full',
  targetOpencarlDir: string
): void {
  const sourceOpencarlDir = path.join(fixturesRoot, fixtureName, '.carl');
  fs.mkdirSync(path.dirname(targetOpencarlDir), { recursive: true });
  fs.cpSync(sourceOpencarlDir, targetOpencarlDir, { recursive: true });
}

describe('file system operations - integration', () => {
  let tempDir: string;
  let projectOpencarlDir: string;
  let globalOpencarlDir: string;
  let fallbackOpencarlDir: string;
  const testSessionId = 'test-session-integration';

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'carl-file-ops-test-'));
    projectOpencarlDir = path.join(tempDir, 'project', '.carl');
    globalOpencarlDir = path.join(tempDir, 'global', '.carl');
    fallbackOpencarlDir = path.join(tempDir, 'fallback', '.carl');

    // Reset cache before each test
    resetRulesCache();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    resetRulesCache();
  });

  describe('manifest change detection and reload', () => {
    it('should detect manifest changes and reload rules', () => {
      // Setup temp .opencarl/ with DEVELOPMENT domain active
      copyFixture('full', projectOpencarlDir);

      // Load rules and cache result
      const firstResult = getCachedRules({
        sessionId: testSessionId,
        overrides: {
          projectOpencarlDir,
          globalOpencarlDir,
          fallbackOpencarlDir,
        },
      });

      expect(firstResult.domains).toContain('DEVELOPMENT');
      expect(firstResult.domains).toContain('CONTENT');
      expect(firstResult.domains).toContain('CONTEXT');

      // Modify MANIFEST to change DEVELOPMENT_STATE to 'inactive'
      const manifestPath = path.join(projectOpencarlDir, 'manifest');
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      const modifiedContent = manifestContent.replace(
        'DEVELOPMENT_STATE=active',
        'DEVELOPMENT_STATE=inactive'
      );
      fs.writeFileSync(manifestPath, modifiedContent, 'utf8');

      // Mark cache as dirty
      markRulesDirty();
      expect(markRulesDirty).toBeDefined();

      // Load rules again
      const secondResult = getCachedRules({
        sessionId: testSessionId,
        overrides: {
          projectOpencarlDir,
          globalOpencarlDir,
          fallbackOpencarlDir,
        },
      });

      // Assert result.domains does not include DEVELOPMENT
      expect(secondResult.domains).not.toContain('DEVELOPMENT');
      expect(secondResult.domains).toContain('CONTENT');
      expect(secondResult.domains).toContain('CONTEXT');

      // Assert projectStatus reflects updated manifest
      expect(secondResult.projectStatus).toBe('valid');
      expect(secondResult.domainPayloads.DEVELOPMENT).toBeUndefined();
    });
  });

  describe('domain file change detection and reload', () => {
    it('should detect domain file changes and reload rules', () => {
      // Setup temp .opencarl/ with development domain file containing rules
      copyFixture('minimal', projectOpencarlDir);

      // Load rules and cache result
      const firstResult = getCachedRules({
        sessionId: testSessionId,
        overrides: {
          projectOpencarlDir,
          globalOpencarlDir,
          fallbackOpencarlDir,
        },
      });

      const initialRuleCount = firstResult.domainPayloads.DEVELOPMENT?.rules.length ?? 0;
      expect(initialRuleCount).toBeGreaterThan(0);

      // Modify development domain file to add new rule
      const domainPath = path.join(projectOpencarlDir, 'development');
      const domainContent = fs.readFileSync(domainPath, 'utf8');
      const newRule = 'DEVELOPMENT_RULE_4=This is a new rule';
      const modifiedContent = domainContent.trim() + '\n' + newRule + '\n';
      fs.writeFileSync(domainPath, modifiedContent, 'utf8');

      // Mark cache as dirty and reload
      markRulesDirty();

      const secondResult = getCachedRules({
        sessionId: testSessionId,
        overrides: {
          projectOpencarlDir,
          globalOpencarlDir,
          fallbackOpencarlDir,
        },
      });

      // Debug: Check if DEVELOPMENT is in domains
      if (!secondResult.domains.includes('DEVELOPMENT')) {
        console.error('DEVELOPMENT domain missing from second result');
        console.error('Domains:', secondResult.domains);
        console.error('Domain payloads keys:', Object.keys(secondResult.domainPayloads));
      }

      // Assert result.domainPayloads.DEVELOPMENT.rules includes new rule
      expect(secondResult.domainPayloads.DEVELOPMENT?.rules).toContain('This is a new rule');

      // Verify rule count increased
      const newRuleCount = secondResult.domainPayloads.DEVELOPMENT?.rules.length ?? 0;
      expect(newRuleCount).toBe(initialRuleCount + 1);
    });
  });

  describe('session override application from session files', () => {
    it('should apply session overrides from session files', () => {
      // Setup temp .opencarl/ with multiple active domains (DEVELOPMENT, CONTENT, CONTEXT)
      copyFixture('full', projectOpencarlDir);

      // Create session file: .opencarl/sessions/test-session.json
      const sessionsDir = path.join(projectOpencarlDir, 'sessions');
      fs.mkdirSync(sessionsDir, { recursive: true });
      const sessionContent = JSON.stringify({
        domains: {
          DEVELOPMENT: 'false',
          CONTENT: 'true',
        },
      });
      fs.writeFileSync(path.join(sessionsDir, `${testSessionId}.json`), sessionContent, 'utf8');

      // Load session overrides
      const overrides = loadSessionOverrides(projectOpencarlDir, testSessionId);

      // Assert overrides disable DEVELOPMENT domain
      expect(overrides.domains.DEVELOPMENT).toBe('false');

      // Assert overrides preserve CONTENT domain as active
      expect(overrides.domains.CONTENT).toBe('true');

      // Verify the overrides actually affect domain loading
      const result = loadOpencarlRules({
        sessionId: testSessionId,
        overrides: {
          projectOpencarlDir,
          globalOpencarlDir,
          fallbackOpencarlDir,
        },
      });

      expect(result.domains).not.toContain('DEVELOPMENT');
      expect(result.domains).toContain('CONTENT');
      expect(result.domains).toContain('CONTEXT');
    });
  });

  describe('project over global rule precedence', () => {
    it('should prefer project rules over global rules with same domain name', () => {
      // Setup global .opencarl/ with DEVELOPMENT domain containing global rules
      copyFixture('full', globalOpencarlDir);

      // Modify global development to have distinct rules
      const globalDevPath = path.join(globalOpencarlDir, 'development');
      fs.writeFileSync(
        globalDevPath,
        'DEVELOPMENT_RULE_GLOBAL=Global-only rule\n',
        'utf8'
      );

      // Setup project .opencarl/ with DEVELOPMENT domain containing project rules
      copyFixture('minimal', projectOpencarlDir);

      // Load rules with both project and global paths
      const result = loadOpencarlRules({
        overrides: {
          projectOpencarlDir,
          globalOpencarlDir,
          fallbackOpencarlDir,
        },
      });

      // Assert result.sources includes both project and global scopes
      const scopes = result.sources.map((s) => s.scope);
      expect(scopes).toContain('project');
      expect(scopes).toContain('global');

      // Assert result.domainPayloads.DEVELOPMENT.rules contain project rules only
      expect(result.domainPayloads.DEVELOPMENT?.rules).toContain('Use early returns to reduce nesting');
      expect(result.domainPayloads.DEVELOPMENT?.rules).toContain('Prefer small, testable functions');

      // Assert global rules for DEVELOPMENT not present (project overrides)
      expect(result.domainPayloads.DEVELOPMENT?.rules).not.toContain('Global-only rule');

      // Verify global DEVELOPMENT is excluded from sources
      const projectSource = result.sources.find((s) => s.scope === 'project');
      const globalSource = result.sources.find((s) => s.scope === 'global');
      expect(projectSource?.domains).toContain('DEVELOPMENT');
      expect(globalSource?.domains).not.toContain('DEVELOPMENT');
    });
  });

  describe('fallback rules when project and global are missing', () => {
    it('should load fallback rules when project and global are missing', () => {
      // Setup fallback .opencarl/ with minimal CONTENT domain
      copyFixture('minimal', fallbackOpencarlDir);

      // Modify manifest to have CONTENT instead of DEVELOPMENT
      const manifestPath = path.join(fallbackOpencarlDir, 'manifest');
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      const modifiedContent = manifestContent
        .replace('DEVELOPMENT_STATE=active', 'CONTENT_STATE=active')
        .replace('DEVELOPMENT_RECALL=', 'CONTENT_RECALL=write content\n')
        .replace('DEVELOPMENT_EXCLUDE=', 'CONTENT_EXCLUDE=\n')
        .replace('DEVELOPMENT_ALWAYS_ON=false', 'CONTENT_ALWAYS_ON=false\n');
      fs.writeFileSync(manifestPath, modifiedContent, 'utf8');

      // Create content domain file
      const contentPath = path.join(fallbackOpencarlDir, 'content');
      fs.writeFileSync(contentPath, 'CONTENT_RULE_1=Write clear and concise content\n', 'utf8');

      // Leave project and global directories empty (don't create them)

      // Load rules with fallback path
      const result = loadOpencarlRules({
        overrides: {
          projectOpencarlDir: path.join(tempDir, 'missing-project', '.carl'),
          globalOpencarlDir: path.join(tempDir, 'missing-global', '.carl'),
          fallbackOpencarlDir,
        },
      });

      // Assert result.sources includes fallback scope
      const scopes = result.sources.map((s) => s.scope);
      expect(scopes).toContain('fallback');
      expect(scopes).not.toContain('project');
      expect(scopes).not.toContain('global');

      // Assert result.domains includes CONTENT
      expect(result.domains).toContain('CONTENT');
      expect(result.domains).not.toContain('DEVELOPMENT');

      // Assert result.domainPayloads.CONTENT.rules contain fallback rules
      expect(result.domainPayloads.CONTENT?.rules).toContain('Write clear and concise content');
    });
  });

  describe('corrupted session file graceful handling', () => {
    it('should handle corrupted session file gracefully', () => {
      // Setup temp .opencarl/ with domains
      copyFixture('full', projectOpencarlDir);

      // Create session file with invalid JSON: .opencarl/sessions/bad-session.json
      const sessionsDir = path.join(projectOpencarlDir, 'sessions');
      fs.mkdirSync(sessionsDir, { recursive: true });
      const badSessionId = 'bad-session';
      fs.writeFileSync(
        path.join(sessionsDir, `${badSessionId}.json`),
        'not valid json {{{',
        'utf8'
      );

      // Load session overrides
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const overrides = loadSessionOverrides(projectOpencarlDir, badSessionId);

      // Assert function returns empty overrides (graceful degradation)
      expect(overrides.exists).toBe(false);
      expect(overrides.domains).toEqual({});

      // Assert no errors thrown (already verified by not catching errors above)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse session overrides')
      );

      // Verify that loading rules still works
      const result = loadOpencarlRules({
        sessionId: badSessionId,
        overrides: {
          projectOpencarlDir,
          globalOpencarlDir,
          fallbackOpencarlDir,
        },
      });

      expect(result.domains).toEqual(['CONTENT', 'CONTEXT', 'DEVELOPMENT']);

      consoleSpy.mockRestore();
    });
  });
});
