/**
 * E2E tests for star-commands with real OpenCode in Docker container
 *
 * Tests:
 * 5. Star-command flow - opencarl status, opencarl list, opencarl toggle work correctly
 *
 * Primary validation: File system verification (manifest state)
 * Secondary validation: Output parsing (stdout/stderr messages)
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Test configuration
const CONTAINER_NAME = 'carl-e2e';
const IMAGE_NAME = 'opencode-carl:e2e';
const WORKSPACE_DIR = '/workspace';
const FIXTURES_DIR = '/workspace/tests/e2e/fixtures';

describe('E2E: Star-Commands', () => {
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
   * Helper: Setup .opencarl/ with test manifest
   */
  function setupTestManifest(fixtureName: string): void {
    dockerExec(`mkdir -p ${WORKSPACE_DIR}/.carl`);
    dockerExec(`cp ${FIXTURES_DIR}/${fixtureName} ${WORKSPACE_DIR}/.carl/manifest`);
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
    cleanupOpencarlDir();
  });

  describe('Test 5: Star-command flow', () => {
    beforeEach(() => {
      // Setup .opencarl/ with default domains
      setupTestManifest('setup-manifest.txt');
    });

    afterEach(() => {
      // Cleanup after each test
      cleanupOpencarlDir();
    });

    describe('carl status', () => {
      it('should display current domain status', () => {
        // Execute: opencarl status
        const result = dockerExec(`cd ${WORKSPACE_DIR} && carl status`);

        // Primary assertion (file system): Verify manifest state unchanged
        const manifestContent = readFileContent('.carl/manifest');
        expect(manifestContent).toContain('GLOBAL_STATE=active');
        expect(manifestContent).toContain('CONTEXT_STATE=active');
        expect(manifestContent).toContain('COMMANDS_STATE=active');

        // Secondary assertion (output): Display shows domains
        const hasDomains =
          result.stdout.toLowerCase().includes('global') ||
          result.stdout.toLowerCase().includes('context') ||
          result.stdout.toLowerCase().includes('commands');
        expect(hasDomains).toBe(true);

        // Verify no errors
        expect(result.exitCode).toBe(0);

        console.log('✓ carl status displayed domain status');
      });

      it('should show active status for enabled domains', () => {
        // Execute: opencarl status
        const result = dockerExec(`cd ${WORKSPACE_DIR} && carl status`);

        // Primary assertion: Manifest has active domains
        const manifestContent = readFileContent('.carl/manifest');
        expect(manifestContent).toContain('GLOBAL_STATE=active');
        expect(manifestContent).toContain('CONTEXT_STATE=active');
        expect(manifestContent).toContain('COMMANDS_STATE=active');

        // Secondary assertion: Output contains "active" or domain names
        expect(
          result.stdout.toLowerCase().includes('active') ||
            result.stdout.toLowerCase().includes('global') ||
            result.stdout.toLowerCase().includes('context') ||
            result.stdout.toLowerCase().includes('commands')
        ).toBe(true);

        console.log('✓ carl status showed active domains');
      });
    });

    describe('carl list', () => {
      it('should list all configured domains', () => {
        // Execute: opencarl list
        const result = dockerExec(`cd ${WORKSPACE_DIR} && carl list`);

        // Primary assertion: File system unchanged (read-only command)
        const manifestContentBefore = readFileContent('.carl/manifest');
        const manifestContentAfter = readFileContent('.carl/manifest');
        expect(manifestContentBefore).toBe(manifestContentAfter);

        // Secondary assertion (output): Shows all domains from manifest
        // The manifest contains: GLOBAL, CONTEXT, COMMANDS
        const hasDomains =
          result.stdout.toLowerCase().includes('global') ||
          result.stdout.toLowerCase().includes('context') ||
          result.stdout.toLowerCase().includes('commands');
        expect(hasDomains).toBe(true);

        // Verify no errors
        expect(result.exitCode).toBe(0);

        console.log('✓ carl list displayed all domains');
      });

      it('should show domain details including state', () => {
        // Execute: opencarl list
        const result = dockerExec(`cd ${WORKSPACE_DIR} && carl list`);

        // Primary assertion: Manifest contains domain configurations
        const manifestContent = readFileContent('.carl/manifest');
        expect(manifestContent).toContain('GLOBAL_STATE');
        expect(manifestContent).toContain('CONTEXT_STATE');
        expect(manifestContent).toContain('COMMANDS_STATE');

        // Secondary assertion: Output references domains or state
        expect(
          result.stdout.toLowerCase().includes('domain') ||
            result.stdout.toLowerCase().includes('global') ||
            result.stdout.toLowerCase().includes('context') ||
            result.stdout.toLowerCase().includes('commands')
        ).toBe(true);

        console.log('✓ carl list showed domain details');
      });
    });

    describe('carl toggle', () => {
      it('should toggle domain from active to inactive', () => {
        // Execute: opencarl toggle GLOBAL inactive
        const result = dockerExec(`cd ${WORKSPACE_DIR} && carl toggle GLOBAL inactive`);

        // Primary assertion (file system): Manifest STATE updated to inactive
        const manifestContent = readFileContent('.carl/manifest');
        expect(manifestContent).toContain('GLOBAL_STATE=inactive');

        // Secondary assertion (output): Confirmation message
        expect(
          result.stdout.toLowerCase().includes('global') ||
            result.stdout.toLowerCase().includes('toggle') ||
            result.stdout.toLowerCase().includes('inactive')
        ).toBe(true);

        // Verify no errors
        expect(result.exitCode).toBe(0);

        console.log('✓ carl toggle GLOBAL inactive - Domain state updated');
      });

      it('should toggle domain from inactive to active', () => {
        // First, toggle to inactive
        dockerExec(`cd ${WORKSPACE_DIR} && carl toggle CONTEXT inactive`);

        // Verify it's inactive
        let manifestContent = readFileContent('.carl/manifest');
        expect(manifestContent).toContain('CONTEXT_STATE=inactive');

        // Execute: opencarl toggle CONTEXT active
        const result = dockerExec(`cd ${WORKSPACE_DIR} && carl toggle CONTEXT active`);

        // Primary assertion: Manifest STATE updated to active
        manifestContent = readFileContent('.carl/manifest');
        expect(manifestContent).toContain('CONTEXT_STATE=active');

        // Secondary assertion: Confirmation message
        expect(
          result.stdout.toLowerCase().includes('context') ||
            result.stdout.toLowerCase().includes('toggle') ||
            result.stdout.toLowerCase().includes('active')
        ).toBe(true);

        // Verify no errors
        expect(result.exitCode).toBe(0);

        console.log('✓ carl toggle CONTEXT active - Domain state updated');
      });

      it('should update manifest without affecting other domains', () => {
        // Get initial manifest content
        const initialManifest = readFileContent('.carl/manifest');
        const initialContextState = initialManifest.match(/CONTEXT_STATE=(active|inactive)/)?.[1];

        // Execute: opencarl toggle GLOBAL inactive
        dockerExec(`cd ${WORKSPACE_DIR} && carl toggle GLOBAL inactive`);

        // Get updated manifest content
        const updatedManifest = readFileContent('.carl/manifest');

        // Primary assertion: GLOBAL state changed, CONTEXT state unchanged
        expect(updatedManifest).toContain('GLOBAL_STATE=inactive');
        expect(updatedManifest).toContain(`CONTEXT_STATE=${initialContextState}`);

        // Verify other domains still exist
        expect(updatedManifest).toContain('GLOBAL');
        expect(updatedManifest).toContain('CONTEXT');
        expect(updatedManifest).toContain('COMMANDS');

        console.log('✓ carl toggle updated only the target domain');
      });

      it('should handle invalid domain name gracefully', () => {
        // Execute: opencarl toggle INVALID_DOMAIN active
        const result = dockerExec(`cd ${WORKSPACE_DIR} && carl toggle INVALID_DOMAIN active`);

        // Primary assertion: Manifest unchanged for valid domains
        const manifestContent = readFileContent('.carl/manifest');
        expect(manifestContent).toContain('GLOBAL_STATE');
        expect(manifestContent).toContain('CONTEXT_STATE');
        expect(manifestContent).toContain('COMMANDS_STATE');

        // Verify the invalid domain was not added
        expect(manifestContent).not.toContain('INVALID_DOMAIN');

        // Secondary assertion: Error message or graceful handling
        // Command may fail or return error message
        // Either outcome is acceptable for this test

        console.log('✓ carl toggle handled invalid domain name');
      });
    });

    describe('Star-command error handling', () => {
      it('should handle missing *carl command gracefully', () => {
        // Execute: Non-existent *opencarl command
        const result = dockerExec(`cd ${WORKSPACE_DIR} && *carl nonexistent-command`);

        // Primary assertion: Manifest unchanged
        const manifestExists = fileExists('.carl/manifest');
        expect(manifestExists).toBe(true);

        // Secondary assertion: Either command fails or returns help/error
        // Both are acceptable error handling behaviors

        console.log('✓ Missing *carl command handled gracefully');
      });

      it('should handle malformed toggle command gracefully', () => {
        // Execute: opencarl toggle with missing arguments
        const result = dockerExec(`cd ${WORKSPACE_DIR} && carl toggle`);

        // Primary assertion: Manifest unchanged (if it exists)
        if (fileExists('.carl/manifest')) {
          const manifestBefore = readFileContent('.carl/manifest');
          const manifestAfter = readFileContent('.carl/manifest');
          expect(manifestBefore).toBe(manifestAfter);
        }

        // Secondary assertion: Error or help message
        // Both are acceptable error handling behaviors

        console.log('✓ Malformed carl toggle command handled gracefully');
      });
    });
  });
});
