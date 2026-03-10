import {
  checkSetupNeeded,
  seedOpencarlTemplates,
  runSetup,
  buildSetupPrompt,
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
});
