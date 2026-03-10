import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { loadOpencarlRules } from '../../../src/opencarl/loader';

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
  const sourceOpencarlDir = path.join(fixturesRoot, fixtureName, '.opencarl');
  fs.mkdirSync(path.dirname(targetOpencarlDir), { recursive: true });
  fs.cpSync(sourceOpencarlDir, targetOpencarlDir, { recursive: true });
}

function writeSessionOverride(
  opencarlDir: string,
  sessionId: string,
  domains: Record<string, string>
): void {
  const sessionsDir = path.join(opencarlDir, 'sessions');
  fs.mkdirSync(sessionsDir, { recursive: true });
  fs.writeFileSync(
    path.join(sessionsDir, `${sessionId}.json`),
    JSON.stringify({ domains })
  );
}

describe('loader.ts', () => {
  let tempDir: string;
  let projectOpencarlDir: string;
  let globalOpencarlDir: string;
  let fallbackOpencarlDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'carl-loader-test-'));
    projectOpencarlDir = path.join(tempDir, 'project', '.opencarl');
    globalOpencarlDir = path.join(tempDir, 'global', '.opencarl');
    fallbackOpencarlDir = path.join(tempDir, 'fallback', '.opencarl');
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('loadOpencarlRules', () => {
    describe('project/global/fallback resolution', () => {
      it('loads active domains from project manifest and returns sorted domains list', () => {
        copyFixture('full', projectOpencarlDir);

        const result = loadOpencarlRules({
          overrides: {
            projectOpencarlDir,
            globalOpencarlDir,
            fallbackOpencarlDir,
          },
        });

        expect(result.domains).toEqual(['CONTENT', 'CONTEXT', 'DEVELOPMENT']);
        expect(result.sources).toHaveLength(1);
        expect(result.sources[0].scope).toBe('project');
      });

      it('sets projectStatus to valid when project rules load', () => {
        copyFixture('minimal', projectOpencarlDir);

        const result = loadOpencarlRules({
          overrides: {
            projectOpencarlDir,
            globalOpencarlDir,
            fallbackOpencarlDir,
          },
        });

        expect(result.projectStatus).toBe('valid');
      });

      it('prefers project domain payloads over global when names overlap', () => {
        copyFixture('minimal', projectOpencarlDir);
        copyFixture('full', globalOpencarlDir);

        fs.writeFileSync(
          path.join(projectOpencarlDir, 'development'),
          'DEVELOPMENT_RULE_1=Project-only rule\n',
          'utf8'
        );

        const result = loadOpencarlRules({
          overrides: {
            projectOpencarlDir,
            globalOpencarlDir,
            fallbackOpencarlDir,
          },
        });

        expect(result.domainPayloads.DEVELOPMENT.rules[0]).toBe('Project-only rule');
        expect(result.sources).toHaveLength(2);
        const globalSource = result.sources.find((source) => source.scope === 'global');
        const projectSource = result.sources.find((source) => source.scope === 'project');
        expect(globalSource?.domains).toEqual(['CONTENT', 'CONTEXT']);
        expect(projectSource?.domains).toEqual(['DEVELOPMENT']);
      });

      it('honors projectOptIn=false by ignoring project rules even when project .opencarl/ exists', () => {
        copyFixture('minimal', projectOpencarlDir);
        copyFixture('full', globalOpencarlDir);

        fs.writeFileSync(
          path.join(projectOpencarlDir, 'development'),
          'DEVELOPMENT_RULE_1=Project-only rule\n',
          'utf8'
        );

        const result = loadOpencarlRules({
          projectOptIn: false,
          overrides: {
            projectOpencarlDir,
            globalOpencarlDir,
            fallbackOpencarlDir,
          },
        });

        expect(result.projectStatus).toBe('none');
        expect(result.domains).toEqual(['CONTENT', 'CONTEXT', 'DEVELOPMENT']);
        expect(result.domainPayloads.DEVELOPMENT.sourcePath).toBe(globalOpencarlDir);
      });

      it('falls back to fallback .opencarl/ only when both project and global are missing', () => {
        const missingProject = path.join(tempDir, 'missing-project', '.opencarl');
        const missingGlobal = path.join(tempDir, 'missing-global', '.opencarl');
        copyFixture('full', fallbackOpencarlDir);

        const result = loadOpencarlRules({
          overrides: {
            projectOpencarlDir: missingProject,
            globalOpencarlDir: missingGlobal,
            fallbackOpencarlDir,
          },
        });

        expect(result.sources).toHaveLength(1);
        expect(result.sources[0].scope).toBe('fallback');
        expect(result.sources[0].path).toBe(fallbackOpencarlDir);
        expect(result.domains).toEqual(['CONTENT', 'CONTEXT', 'DEVELOPMENT']);
      });

      it('does not use fallback when global rules are available', () => {
        const missingProject = path.join(tempDir, 'missing-project', '.opencarl');
        copyFixture('full', globalOpencarlDir);
        copyFixture('minimal', fallbackOpencarlDir);

        const result = loadOpencarlRules({
          overrides: {
            projectOpencarlDir: missingProject,
            globalOpencarlDir,
            fallbackOpencarlDir,
          },
        });

        expect(result.sources).toHaveLength(1);
        expect(result.sources[0].scope).toBe('global');
        expect(result.sources[0].path).toBe(globalOpencarlDir);
      });

      it('keeps fallback unused when project rules are valid', () => {
        copyFixture('minimal', projectOpencarlDir);
        copyFixture('full', globalOpencarlDir);
        copyFixture('full', fallbackOpencarlDir);

        const result = loadOpencarlRules({
          overrides: {
            projectOpencarlDir,
            globalOpencarlDir,
            fallbackOpencarlDir,
          },
        });

        expect(result.sources).toHaveLength(2);
        expect(result.sources.some((source) => source.scope === 'fallback')).toBe(false);
      });
    });

    describe('domain payloads and sources', () => {
      it('applies session overrides to filter disabled domains and updates sources accordingly', () => {
        copyFixture('full', projectOpencarlDir);
        writeSessionOverride(projectOpencarlDir, 'session-1', {
          CONTENT: 'false',
        });

        const result = loadOpencarlRules({
          sessionId: 'session-1',
          overrides: {
            projectOpencarlDir,
            globalOpencarlDir,
            fallbackOpencarlDir,
          },
        });

        expect(result.domains).toEqual(['CONTEXT', 'DEVELOPMENT']);
        expect(result.domainPayloads.CONTENT).toBeUndefined();
        expect(result.sources).toHaveLength(1);
        expect(result.sources[0].domains).toEqual(['CONTEXT', 'DEVELOPMENT']);
      });

      it('includes bracketFlags and bracketRules for CONTEXT domain payloads', () => {
        copyFixture('full', projectOpencarlDir);

        const result = loadOpencarlRules({
          overrides: {
            projectOpencarlDir,
            globalOpencarlDir,
            fallbackOpencarlDir,
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
