import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { loadCarlRules } from '../../../src/carl/loader';

const fixturesRoot = path.join(
  __dirname,
  '..',
  '..',
  'fixtures',
  'carl-directories'
);

function copyFixture(fixtureName: 'minimal' | 'full', targetCarlDir: string): void {
  const sourceCarlDir = path.join(fixturesRoot, fixtureName, '.carl');
  fs.mkdirSync(path.dirname(targetCarlDir), { recursive: true });
  fs.cpSync(sourceCarlDir, targetCarlDir, { recursive: true });
}

function writeSessionOverride(
  carlDir: string,
  sessionId: string,
  domains: Record<string, string>
): void {
  const sessionsDir = path.join(carlDir, 'sessions');
  fs.mkdirSync(sessionsDir, { recursive: true });
  fs.writeFileSync(
    path.join(sessionsDir, `${sessionId}.json`),
    JSON.stringify({ domains })
  );
}

describe('loader.ts', () => {
  let tempDir: string;
  let projectCarlDir: string;
  let globalCarlDir: string;
  let fallbackCarlDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'carl-loader-test-'));
    projectCarlDir = path.join(tempDir, 'project', '.carl');
    globalCarlDir = path.join(tempDir, 'global', '.carl');
    fallbackCarlDir = path.join(tempDir, 'fallback', '.carl');
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('loadCarlRules', () => {
    describe('project/global/fallback resolution', () => {
      it('loads active domains from project manifest and returns sorted domains list', () => {
        copyFixture('full', projectCarlDir);

        const result = loadCarlRules({
          overrides: {
            projectCarlDir,
            globalCarlDir,
            fallbackCarlDir,
          },
        });

        expect(result.domains).toEqual(['CONTENT', 'CONTEXT', 'DEVELOPMENT']);
        expect(result.sources).toHaveLength(1);
        expect(result.sources[0].scope).toBe('project');
      });

      it('sets projectStatus to valid when project rules load', () => {
        copyFixture('minimal', projectCarlDir);

        const result = loadCarlRules({
          overrides: {
            projectCarlDir,
            globalCarlDir,
            fallbackCarlDir,
          },
        });

        expect(result.projectStatus).toBe('valid');
      });

      it('prefers project domain payloads over global when names overlap', () => {
        copyFixture('minimal', projectCarlDir);
        copyFixture('full', globalCarlDir);

        fs.writeFileSync(
          path.join(projectCarlDir, 'development'),
          'DEVELOPMENT_RULE_1=Project-only rule\n',
          'utf8'
        );

        const result = loadCarlRules({
          overrides: {
            projectCarlDir,
            globalCarlDir,
            fallbackCarlDir,
          },
        });

        expect(result.domainPayloads.DEVELOPMENT.rules[0]).toBe('Project-only rule');
        expect(result.sources).toHaveLength(2);
        const globalSource = result.sources.find((source) => source.scope === 'global');
        const projectSource = result.sources.find((source) => source.scope === 'project');
        expect(globalSource?.domains).toEqual(['CONTENT', 'CONTEXT']);
        expect(projectSource?.domains).toEqual(['DEVELOPMENT']);
      });

      it('honors projectOptIn=false by ignoring project rules even when project .carl/ exists', () => {
        copyFixture('minimal', projectCarlDir);
        copyFixture('full', globalCarlDir);

        fs.writeFileSync(
          path.join(projectCarlDir, 'development'),
          'DEVELOPMENT_RULE_1=Project-only rule\n',
          'utf8'
        );

        const result = loadCarlRules({
          projectOptIn: false,
          overrides: {
            projectCarlDir,
            globalCarlDir,
            fallbackCarlDir,
          },
        });

        expect(result.projectStatus).toBe('none');
        expect(result.domains).toEqual(['CONTENT', 'CONTEXT', 'DEVELOPMENT']);
        expect(result.domainPayloads.DEVELOPMENT.sourcePath).toBe(globalCarlDir);
      });

      it('falls back to fallback .carl/ only when both project and global are missing', () => {
        const missingProject = path.join(tempDir, 'missing-project', '.carl');
        const missingGlobal = path.join(tempDir, 'missing-global', '.carl');
        copyFixture('full', fallbackCarlDir);

        const result = loadCarlRules({
          overrides: {
            projectCarlDir: missingProject,
            globalCarlDir: missingGlobal,
            fallbackCarlDir,
          },
        });

        expect(result.sources).toHaveLength(1);
        expect(result.sources[0].scope).toBe('fallback');
        expect(result.sources[0].path).toBe(fallbackCarlDir);
        expect(result.domains).toEqual(['CONTENT', 'CONTEXT', 'DEVELOPMENT']);
      });

      it('does not use fallback when global rules are available', () => {
        const missingProject = path.join(tempDir, 'missing-project', '.carl');
        copyFixture('full', globalCarlDir);
        copyFixture('minimal', fallbackCarlDir);

        const result = loadCarlRules({
          overrides: {
            projectCarlDir: missingProject,
            globalCarlDir,
            fallbackCarlDir,
          },
        });

        expect(result.sources).toHaveLength(1);
        expect(result.sources[0].scope).toBe('global');
        expect(result.sources[0].path).toBe(globalCarlDir);
      });

      it('keeps fallback unused when project rules are valid', () => {
        copyFixture('minimal', projectCarlDir);
        copyFixture('full', globalCarlDir);
        copyFixture('full', fallbackCarlDir);

        const result = loadCarlRules({
          overrides: {
            projectCarlDir,
            globalCarlDir,
            fallbackCarlDir,
          },
        });

        expect(result.sources).toHaveLength(2);
        expect(result.sources.some((source) => source.scope === 'fallback')).toBe(false);
      });
    });

    describe('domain payloads and sources', () => {
      it('applies session overrides to filter disabled domains and updates sources accordingly', () => {
        copyFixture('full', projectCarlDir);
        writeSessionOverride(projectCarlDir, 'session-1', {
          CONTENT: 'false',
        });

        const result = loadCarlRules({
          sessionId: 'session-1',
          overrides: {
            projectCarlDir,
            globalCarlDir,
            fallbackCarlDir,
          },
        });

        expect(result.domains).toEqual(['CONTEXT', 'DEVELOPMENT']);
        expect(result.domainPayloads.CONTENT).toBeUndefined();
        expect(result.sources).toHaveLength(1);
        expect(result.sources[0].domains).toEqual(['CONTEXT', 'DEVELOPMENT']);
      });

      it('includes bracketFlags and bracketRules for CONTEXT domain payloads', () => {
        copyFixture('full', projectCarlDir);

        const result = loadCarlRules({
          overrides: {
            projectCarlDir,
            globalCarlDir,
            fallbackCarlDir,
          },
        });

        expect(result.domainPayloads.CONTEXT.bracketFlags).toBeDefined();
        expect(result.domainPayloads.CONTEXT.bracketRules).toBeDefined();
        expect(result.domainPayloads.CONTEXT.bracketFlags?.FRESH).toBe(true);
        expect(result.domainPayloads.CONTEXT.bracketRules?.FRESH?.length).toBeGreaterThan(0);
      });
    });
  });
});
