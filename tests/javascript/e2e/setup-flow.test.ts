/**
 * E2E tests for setup flow with real OpenCode in Docker container
 *
 * Tests:
 * 1. Setup flow (happy path) - Fresh install creates .opencarl/ with valid defaults
 * 2. Idempotency (happy path) - Re-running setup preserves valid config
 *
 * Primary validation: File system verification (.opencarl/ structure, manifest content)
 * Secondary validation: Output parsing (stdout/stderr messages)
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Test configuration
const CONTAINER_NAME = 'carl-e2e';
const IMAGE_NAME = 'opencode-carl:e2e';
const WORKSPACE_DIR = '/workspace';

describe('E2E: Setup Flow', () => {
  /**
   * Helper: Execute command in Docker container
   */
  function dockerExec(cmd: string): { stdout: string; stderr: string; exitCode: number } {
    try {
      const stdout = execSync(`docker exec ${CONTAINER_NAME} bash -c "${cmd}"`, {
        encoding: 'utf8',
      });
      return { stdout, stderr: '', exitCode: 0 };
    } catch (error: any) {
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message || '',
        exitCode: error.status || 1,
      };
    }
  }

  /**
   * Helper: Check if directory exists in container
   */
  function directoryExists(dirPath: string): boolean {
    const result = dockerExec(`[ -d ${WORKSPACE_DIR}${dirPath} ] && echo "EXISTS" || echo "NOT_FOUND"`);
    return result.stdout.includes('EXISTS');
  }

  /**
   * Helper: Check if file exists in container
   */
  function fileExists(filePath: string): boolean {
    const result = dockerExec(`[ -f ${WORKSPACE_DIR}${filePath} ] && echo "EXISTS" || echo "NOT_FOUND"`);
    return result.stdout.includes('EXISTS');
  }

  /**
   * Helper: Read file content from container
   */
  function readFileContent(filePath: string): string {
    const result = dockerExec(`cat ${WORKSPACE_DIR}${filePath}`);
    if (result.exitCode !== 0) {
      throw new Error(`Failed to read file ${filePath}: ${result.stderr}`);
    }
    return result.stdout;
  }

  /**
   * Helper: Cleanup .opencarl directory
   */
  function cleanupOpencarlDir(): void {
    dockerExec(`rm -rf ${WORKSPACE_DIR}/.carl`);
  }

  // Check if container is running before all tests
  beforeAll(() => {
    const result = dockerExec('echo "container_alive"');
    if (result.exitCode !== 0) {
      throw new Error(
        'Docker container is not running. Please start the E2E test container first using tests/e2e/run-e2e-tests.sh'
      );
    }
  });

  // Cleanup after all tests
  afterAll(() => {
    // Optional: Clean up .opencarl directory after all tests
    // cleanupOpencarlDir();
  });

  describe('Test 1: Setup flow (happy path)', () => {
    beforeEach(() => {
      // Ensure clean state before test
      cleanupOpencarlDir();
    });

    afterEach(() => {
      // Cleanup after test
      cleanupOpencarlDir();
    });

    it('should create .carl/ directory with valid structure on setup', () => {
      // Execute: opencarl setup
      const result = dockerExec(`cd ${WORKSPACE_DIR} && carl setup`);

      // Verify command executed successfully
      expect(result.exitCode).toBe(0);

      // Primary assertion (file system): .opencarl/ directory structure
      expect(directoryExists('.carl')).toBe(true);
      expect(fileExists('.carl/manifest')).toBe(true);
      expect(fileExists('.carl/global')).toBe(true);
      expect(fileExists('.carl/commands')).toBe(true);
      expect(fileExists('.carl/context')).toBe(true);
      expect(directoryExists('.carl/sessions')).toBe(true);

      // Verify manifest is valid content (contains expected keys)
      const manifestContent = readFileContent('.carl/manifest');
      expect(manifestContent).toContain('DEVMODE');
      expect(manifestContent).toContain('GLOBAL_STATE');
      expect(manifestContent).toContain('CONTEXT_STATE');
      expect(manifestContent).toContain('COMMANDS_STATE');

      // Secondary assertion (output): Setup complete message
      const hasSetupMessage =
        result.stdout.includes('setup') || result.stderr.includes('setup');
      expect(hasSetupMessage).toBe(true);
      expect(result.stdout.toLowerCase()).not.toContain('error');

      console.log('✓ Setup flow test passed - .carl/ directory created with valid structure');
    });

    it('should create manifest with default domain configurations', () => {
      // Execute setup
      const result = dockerExec(`cd ${WORKSPACE_DIR} && carl setup`);

      expect(result.exitCode).toBe(0);

      // Verify manifest contains default domains from template
      const manifestContent = readFileContent('.carl/manifest');

      // Check for default GLOBAL domain
      expect(manifestContent).toContain('GLOBAL_STATE=active');
      expect(manifestContent).toContain('GLOBAL_ALWAYS_ON=true');

      // Check for default CONTEXT domain
      expect(manifestContent).toContain('CONTEXT_STATE=active');
      expect(manifestContent).toContain('CONTEXT_ALWAYS_ON=true');

      // Check for default COMMANDS domain
      expect(manifestContent).toContain('COMMANDS_STATE=active');
      expect(manifestContent).toContain('COMMANDS_RECALL');

      // Check for DEVMODE setting
      expect(manifestContent).toContain('DEVMODE=');

      console.log('✓ Manifest contains default domain configurations');
    });
  });

  describe('Test 2: Idempotency (happy path)', () => {
    beforeEach(() => {
      // Ensure clean state before test
      cleanupOpencarlDir();
    });

    afterEach(() => {
      // Cleanup after test
      cleanupOpencarlDir();
    });

    it('should preserve existing manifest on second setup run', () => {
      // First setup run
      const firstResult = dockerExec(`cd ${WORKSPACE_DIR} && carl setup`);
      expect(firstResult.exitCode).toBe(0);

      // Capture manifest content after first run
      const manifestContent1 = readFileContent('.carl/manifest');

      // Second setup run
      const secondResult = dockerExec(`cd ${WORKSPACE_DIR} && carl setup`);
      expect(secondResult.exitCode).toBe(0);

      // Capture manifest content after second run
      const manifestContent2 = readFileContent('.carl/manifest');

      // Primary assertion: Manifest content unchanged
      expect(manifestContent1).toBe(manifestContent2);

      // Secondary assertion: Second run indicates already configured
      expect(
        secondResult.stdout.toLowerCase().includes('already') ||
          secondResult.stdout.toLowerCase().includes('configured') ||
          secondResult.stderr.toLowerCase().includes('already') ||
          secondResult.stderr.toLowerCase().includes('configured')
      ).toBe(true);

      console.log('✓ Idempotency test passed - Second setup run preserved existing config');
    });

    it('should preserve custom manifest changes on re-setup', () => {
      // First setup run
      dockerExec(`cd ${WORKSPACE_DIR} && carl setup`);

      // Make a custom change to the manifest
      const customManifest = readFileContent('.carl/manifest');
      const modifiedManifest = customManifest.replace('DEVMODE=true', 'DEVMODE=false');

      // Write the modified manifest back
      dockerExec(`cat > ${WORKSPACE_DIR}/.carl/manifest << 'EOF'
${modifiedManifest}
EOF`);

      // Verify the change was written
      const beforeReSetup = readFileContent('.carl/manifest');
      expect(beforeReSetup).toContain('DEVMODE=false');

      // Second setup run
      dockerExec(`cd ${WORKSPACE_DIR} && carl setup`);

      // Verify the custom change is preserved
      const afterReSetup = readFileContent('.carl/manifest');
      expect(afterReSetup).toContain('DEVMODE=false');
      expect(afterReSetup).not.toContain('DEVMODE=true');

      console.log('✓ Custom manifest changes preserved on re-setup');
    });

    it('should create all files only once (no duplicates)', () => {
      // First setup run
      dockerExec(`cd ${WORKSPACE_DIR} && carl setup`);

      // Check file count in .opencarl/ directory
      const firstFileCount = dockerExec(`find ${WORKSPACE_DIR}/.carl -type f | wc -l`).stdout.trim();

      // Second setup run
      dockerExec(`cd ${WORKSPACE_DIR} && carl setup`);

      // Check file count again
      const secondFileCount = dockerExec(`find ${WORKSPACE_DIR}/.carl -type f | wc -l`).stdout.trim();

      // Primary assertion: File count unchanged
      expect(parseInt(firstFileCount)).toBe(parseInt(secondFileCount));

      // Verify no duplicate files exist
      expect(parseInt(firstFileCount)).toBeGreaterThan(0);

      console.log(`✓ No duplicate files created (${firstFileCount} files in .carl/)`);
    });
  });
});
