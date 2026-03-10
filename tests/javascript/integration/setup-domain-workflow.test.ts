import { runSetup, runList, runToggle } from '../../../src/opencarl/setup';
import { loadOpencarlRules } from '../../../src/opencarl/loader';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('setup and domain workflow - integration', () => {
  let tempDir: string;
  let projectOpencarlDir: string;
  let templateDir: string;

  beforeEach(() => {
    // Create temp working directory for .opencarl/
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'carl-integration-test-'));
    projectOpencarlDir = path.join(tempDir, '.carl');
    // Set template directory to the actual .opencarl-template directory
    templateDir = path.resolve(__dirname, '../../..', '.carl-template');
  });

  afterEach(() => {
    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('should scaffold .carl/ directory with setup command', () => {
    it('creates complete .carl directory structure', async () => {
      const homeDir = os.homedir();

      // Run setup with template directory
      const result = await runSetup({ cwd: tempDir, homeDir, templateDir });

      // Verify success
      expect(result.success).toBe(true);

      // Assert .opencarl/ directory exists
      expect(fs.existsSync(projectOpencarlDir)).toBe(true);

      // Assert MANIFEST file exists
      const manifestPath = path.join(projectOpencarlDir, 'manifest');
      expect(fs.existsSync(manifestPath)).toBe(true);

      // Assert manifest contains domain entries
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      expect(manifestContent).toContain('GLOBAL_STATE');
      expect(manifestContent).toContain('CONTEXT_STATE');
      expect(manifestContent).toContain('COMMANDS_STATE');

      // Assert template domain files exist
      expect(fs.existsSync(path.join(projectOpencarlDir, 'global'))).toBe(true);
      expect(fs.existsSync(path.join(projectOpencarlDir, 'context'))).toBe(true);
      expect(fs.existsSync(path.join(projectOpencarlDir, 'commands'))).toBe(true);
    });
  });

  describe('should list available domains and their states', () => {
    it('displays all domains with active/inactive states', async () => {
      const homeDir = os.homedir();

      // Run setup to create .opencarl/ directory
      await runSetup({ cwd: tempDir, homeDir, templateDir });

      // Run list
      const listResult = runList({ cwd: tempDir, homeDir });

      // Verify success
      expect(listResult.success).toBe(true);
      expect(listResult.domains).toBeDefined();

      // Assert list contains domain names
      const domainNames = listResult.domains!.map((d) => d.name);
      expect(domainNames).toContain('GLOBAL');
      expect(domainNames).toContain('CONTEXT');
      expect(domainNames).toContain('COMMANDS');

      // Assert list shows active/inactive state for each domain
      listResult.domains!.forEach((domain) => {
        expect(['active', 'inactive']).toContain(domain.state);
      });

      // Assert list format matches expected output (has recall keywords)
      const commands = listResult.domains!.find((d) => d.name === 'COMMANDS');
      expect(commands?.recall).toBeDefined();
    });
  });

  describe('should toggle domain state from active to inactive', () => {
    it('changes CONTEXT domain state and persists to MANIFEST', async () => {
      const homeDir = os.homedir();

      // Run setup to create .opencarl/ directory
      await runSetup({ cwd: tempDir, homeDir, templateDir });

      // Verify initial state is active
      const listBefore = runList({ cwd: tempDir, homeDir });
      const contextBefore = listBefore.domains!.find((d) => d.name === 'CONTEXT');
      expect(contextBefore?.state).toBe('active');

      // Run toggle for CONTEXT domain
      const toggleResult = runToggle({ cwd: tempDir, homeDir, domain: 'CONTEXT' });

      // Assert toggle returns success
      expect(toggleResult.success).toBe(true);
      expect(toggleResult.domain).toBe('CONTEXT');
      expect(toggleResult.oldState).toBe('active');
      expect(toggleResult.newState).toBe('inactive');

      // Assert MANIFEST file CONTEXT_STATE changed to 'inactive'
      const manifestPath = path.join(projectOpencarlDir, 'manifest');
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      expect(manifestContent).toContain('CONTEXT_STATE=inactive');

      // Verify via loadOpencarlRules() that CONTEXT domain is not in active list
      const loadResult = loadOpencarlRules({ cwd: tempDir, homeDir });
      expect(loadResult.domains).not.toContain('CONTEXT');
    });
  });

  describe('should toggle domain state from inactive back to active', () => {
    it('restores CONTEXT domain to active state', async () => {
      const homeDir = os.homedir();

      // Run setup, then toggle CONTEXT to inactive
      await runSetup({ cwd: tempDir, homeDir, templateDir });
      runToggle({ cwd: tempDir, homeDir, domain: 'CONTEXT' });

      // Verify it's inactive
      const listInactive = runList({ cwd: tempDir, homeDir });
      const contextInactive = listInactive.domains!.find((d) => d.name === 'CONTEXT');
      expect(contextInactive?.state).toBe('inactive');

      // Run toggle again for CONTEXT domain
      const toggleResult = runToggle({ cwd: tempDir, homeDir, domain: 'CONTEXT' });

      // Assert toggle returns success
      expect(toggleResult.success).toBe(true);
      expect(toggleResult.newState).toBe('active');

      // Assert MANIFEST file CONTEXT_STATE changed back to 'active'
      const manifestPath = path.join(projectOpencarlDir, 'manifest');
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      expect(manifestContent).toContain('CONTEXT_STATE=active');

      // Verify via loadOpencarlRules() that CONTEXT domain is in active list
      const loadResult = loadOpencarlRules({ cwd: tempDir, homeDir });
      expect(loadResult.domains).toContain('CONTEXT');
    });
  });

  describe('should verify full workflow: setup → list → toggle → list', () => {
    it('executes complete workflow with state verification', async () => {
      const homeDir = os.homedir();

      // Run setup, capture initial list output
      await runSetup({ cwd: tempDir, homeDir, templateDir });
      const initialList = runList({ cwd: tempDir, homeDir });
      const commandsInitial = initialList.domains!.find((d) => d.name === 'COMMANDS');
      expect(commandsInitial?.state).toBe('active');

      // Run toggle to change COMMANDS domain state
      runToggle({ cwd: tempDir, homeDir, domain: 'COMMANDS' });

      // Run list again, verify output shows new state
      const afterToggleList = runList({ cwd: tempDir, homeDir });
      const commandsAfterToggle = afterToggleList.domains!.find((d) => d.name === 'COMMANDS');
      expect(commandsAfterToggle?.state).toBe('inactive');

      // Run toggle to restore original state
      runToggle({ cwd: tempDir, homeDir, domain: 'COMMANDS' });

      // Verify list shows original state restored
      const finalList = runList({ cwd: tempDir, homeDir });
      const commandsFinal = finalList.domains!.find((d) => d.name === 'COMMANDS');
      expect(commandsFinal?.state).toBe('active');
    });
  });

  describe('should handle toggle for non-existent domain gracefully', () => {
    it('returns error without corrupting manifest', async () => {
      const homeDir = os.homedir();

      // Run setup
      await runSetup({ cwd: tempDir, homeDir, templateDir });

      // Capture original manifest content
      const manifestPath = path.join(projectOpencarlDir, 'manifest');
      const originalManifest = fs.readFileSync(manifestPath, 'utf8');

      // Run toggle for non-existent domain
      const toggleResult = runToggle({ cwd: tempDir, homeDir, domain: 'NONEXISTENT' });

      // Assert toggle returns error
      expect(toggleResult.success).toBe(false);
      expect(toggleResult.error).toContain('not found in manifest');

      // Assert .opencarl/ directory structure unchanged
      const currentManifest = fs.readFileSync(manifestPath, 'utf8');
      expect(currentManifest).toBe(originalManifest);

      // Verify no invalid MANIFEST entries created
      const loadResult = loadOpencarlRules({ cwd: tempDir, homeDir });
      expect(loadResult.domains).not.toContain('NONEXISTENT');
    });
  });
});
