import {
  checkSetupNeeded,
  seedOpencarlTemplates,
  runSetup,
  buildSetupPrompt,
  copyResourcesToOpencode,
} from '../../../src/opencarl/setup';
import * as path from 'path';
import * as fs from 'fs';

// Mock the fs module
jest.mock('fs', () => ({
  accessSync: jest.fn(),
  constants: {
    W_OK: 2,
  },
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn(),
  copyFileSync: jest.fn(),
  promises: {
    mkdir: jest.fn(),
    readdir: jest.fn(),
    access: jest.fn(),
    copyFile: jest.fn(),
  },
}));

// Mock the paths module
jest.mock('../../../src/integration/paths', () => ({
  findProjectOpencarl: jest.fn(),
  findGlobalOpencarl: jest.fn(),
}));

import { findProjectOpencarl, findGlobalOpencarl } from '../../../src/integration/paths';

const mockFindProjectOpencarl = findProjectOpencarl as jest.MockedFunction<
  typeof findProjectOpencarl
>;
const mockFindGlobalOpencarl = findGlobalOpencarl as jest.MockedFunction<
  typeof findGlobalOpencarl
>;

// Helper to create mock Dirent
function createMockDirent(name: string, isDirectory: boolean): fs.Dirent {
  return {
    name,
    isDirectory: () => isDirectory,
    isFile: () => !isDirectory,
    isBlockDevice: () => false,
    isCharacterDevice: () => false,
    isFIFO: () => false,
    isSocket: () => false,
    isSymbolicLink: () => false,
  } as fs.Dirent;
}

describe('setup.ts', () => {
  // Get references to the mocked methods
  const mockAccessSync = fs.accessSync as jest.Mock;
  const mockMkdir = fs.promises.mkdir as jest.Mock;
  const mockReaddir = fs.promises.readdir as jest.Mock;
  const mockAccess = fs.promises.access as jest.Mock;
  const mockCopyFile = fs.promises.copyFile as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkSetupNeeded', () => {
    const testCwd = '/test/project';
    const testHomeDir = '/home/user';

    it('should return needed: false when project .opencarl/ exists', () => {
      mockFindProjectOpencarl.mockReturnValue({
        root: testCwd,
        opencarlDir: path.join(testCwd, '.opencarl'),
        manifestPath: path.join(testCwd, '.opencarl', 'manifest'),
      });
      mockFindGlobalOpencarl.mockReturnValue(null);

      const result = checkSetupNeeded({ cwd: testCwd, homeDir: testHomeDir });

      expect(result.needed).toBe(false);
      expect(result.targetDir).toBe(path.join(testCwd, '.opencarl'));
      expect(result.reason).toContain('Project .opencarl/');
    });

    it('should return needed: false when global ~/.opencarl/ exists', () => {
      mockFindProjectOpencarl.mockReturnValue(null);
      mockFindGlobalOpencarl.mockReturnValue({
        root: testHomeDir,
        opencarlDir: path.join(testHomeDir, '.opencarl'),
        manifestPath: path.join(testHomeDir, '.opencarl', 'manifest'),
      });

      const result = checkSetupNeeded({ cwd: testCwd, homeDir: testHomeDir });

      expect(result.needed).toBe(false);
      expect(result.targetDir).toBe(path.join(testHomeDir, '.opencarl'));
      expect(result.reason).toContain('Global ~/.opencarl/');
    });

    it('should return needed: true when no .opencarl/ found', () => {
      mockFindProjectOpencarl.mockReturnValue(null);
      mockFindGlobalOpencarl.mockReturnValue(null);
      mockAccessSync.mockReturnValue(undefined);

      const result = checkSetupNeeded({ cwd: testCwd, homeDir: testHomeDir });
      expect(result.needed).toBe(true);
      expect(result.targetDir).toBe(path.join(testCwd, '.opencarl'));
      expect(result.reason).toContain('No .opencarl/');
    });

    it('should prefer project .opencarl/ over global', () => {
      mockFindProjectOpencarl.mockReturnValue({
        root: testCwd,
        opencarlDir: path.join(testCwd, '.opencarl'),
        manifestPath: path.join(testCwd, '.opencarl', 'manifest'),
      });
      mockFindGlobalOpencarl.mockReturnValue({
        root: testHomeDir,
        opencarlDir: path.join(testHomeDir, '.opencarl'),
        manifestPath: path.join(testHomeDir, '.opencarl', 'manifest'),
      });

      const result = checkSetupNeeded({ cwd: testCwd, homeDir: testHomeDir });

      expect(result.needed).toBe(false);
      expect(result.targetDir).toBe(path.join(testCwd, '.opencarl'));
      expect(result.reason).toContain('Project');
    });

    it('should return project path when writable', () => {
      mockFindProjectOpencarl.mockReturnValue(null);
      mockFindGlobalOpencarl.mockReturnValue(null);
      mockAccessSync.mockReturnValue(undefined);

      const result = checkSetupNeeded({ cwd: testCwd, homeDir: testHomeDir });

      expect(result.needed).toBe(true);
      expect(result.targetDir).toBe(path.join(testCwd, '.opencarl'));
      expect(result.reason).toContain('No .opencarl/');
    });

    it('should fallback to global when project not writable', () => {
      mockFindProjectOpencarl.mockReturnValue(null);
      mockFindGlobalOpencarl.mockReturnValue(null);
      mockAccessSync.mockImplementation(() => {
        throw new Error('EACCES: permission denied');
      });

      const result = checkSetupNeeded({ cwd: testCwd, homeDir: testHomeDir });

      expect(result.needed).toBe(true);
      expect(result.targetDir).toBe(path.join(testHomeDir, '.opencarl'));
      expect(result.reason).toContain('global ~/.opencarl/');
    });
  });

  describe('copyResourcesToOpencode', () => {
    const testHomeDir = '/home/user';

    it('should return results object with copied, skipped, failed arrays', async () => {
      mockReaddir.mockResolvedValue([]);
      mockAccess.mockRejectedValue(new Error('ENOENT'));

      const result = await copyResourcesToOpencode(testHomeDir);

      expect(result).toHaveProperty('copied');
      expect(result).toHaveProperty('skipped');
      expect(result).toHaveProperty('failed');
      expect(Array.isArray(result.copied)).toBe(true);
      expect(Array.isArray(result.skipped)).toBe(true);
      expect(Array.isArray(result.failed)).toBe(true);
    });

    it('should skip items when source directory does not exist', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));
      mockReaddir.mockResolvedValue([]);

      const result = await copyResourcesToOpencode(testHomeDir);

      expect(result.copied.length).toBe(0);
      expect(result.skipped.length).toBe(0);
      expect(result.failed.length).toBe(0);
    });

    it('should handle mkdir errors gracefully', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockMkdir.mockRejectedValue(new Error('EACCES'));
      mockReaddir.mockResolvedValue([
        createMockDirent('commands', true),
      ]);

      const result = await copyResourcesToOpencode(testHomeDir);

      expect(result.failed.length).toBeGreaterThan(0);
    });

    it('should handle readdir errors gracefully', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockMkdir.mockResolvedValue(undefined);
      mockReaddir.mockRejectedValue(new Error('ENOENT'));

      const result = await copyResourcesToOpencode(testHomeDir);

      expect(result.failed.length).toBeGreaterThan(0);
    });
  });
});
