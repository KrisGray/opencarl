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
  findProjectCarl: jest.fn(),
  findGlobalCarl: jest.fn(),
}));

import { findProjectCarl, findGlobalCarl } from '../../../src/integration/paths';

const mockFindProjectCarl = findProjectCarl as jest.MockedFunction<typeof findProjectCarl>;
const mockFindGlobalCarl = findGlobalCarl as jest.MockedFunction<typeof findGlobalCarl>;

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

    it('should return needed: false when project .carl/ exists', () => {
      mockFindProjectCarl.mockReturnValue({
        root: testCwd,
        carlDir: path.join(testCwd, '.opencarl'),
        manifestPath: path.join(testCwd, '.opencarl', 'manifest'),
      });
      mockFindGlobalCarl.mockReturnValue(null);

      const result = checkSetupNeeded({ cwd: testCwd, homeDir: testHomeDir });

      expect(result.needed).toBe(false);
      expect(result.targetDir).toBe(path.join(testCwd, '.opencarl'));
      expect(result.reason).toContain('Project .opencarl/');
    });

    it('should return needed: false when global ~/.opencarl/ exists', () => {
      mockFindProjectCarl.mockReturnValue(null);
      mockFindGlobalCarl.mockReturnValue({
        root: testHomeDir,
        carlDir: path.join(testHomeDir, '.opencarl'),
        manifestPath: path.join(testHomeDir, '.opencarl', 'manifest'),
      });

      const result = checkSetupNeeded({ cwd: testCwd, homeDir: testHomeDir });

      expect(result.needed).toBe(false);
      expect(result.targetDir).toBe(path.join(testHomeDir, '.opencarl'));
      expect(result.reason).toContain('Global ~/.opencarl/');
    });

    it('should return needed: true when no .carl/ found', () => {
      mockFindProjectCarl.mockReturnValue(null);
      mockFindGlobalCarl.mockReturnValue(null);
      mockAccessSync.mockReturnValue(undefined);

      const result = checkSetupNeeded({ cwd: testCwd, homeDir: testHomeDir });
      expect(result.needed).toBe(true);
      expect(result.targetDir).toBe(path.join(testCwd, '.opencarl'));
      expect(result.reason).toContain('No .opencarl/');
    });

    it('should prefer project .opencarl/ over global', () => {
      mockFindProjectCarl.mockReturnValue({
        root: testCwd,
        carlDir: path.join(testCwd, '.opencarl'),
        manifestPath: path.join(testCwd, '.opencarl', 'manifest'),
      });
      mockFindGlobalCarl.mockReturnValue({
        root: testHomeDir,
        carlDir: path.join(testHomeDir, '.opencarl'),
        manifestPath: path.join(testHomeDir, '.opencarl', 'manifest'),
      });

      const result = checkSetupNeeded({ cwd: testCwd, homeDir: testHomeDir });

      expect(result.needed).toBe(false);
      expect(result.targetDir).toBe(path.join(testCwd, '.opencarl'));
      expect(result.reason).toContain('Project');
    });

    it('should return project path when writable', () => {
      mockFindProjectCarl.mockReturnValue(null);
      mockFindGlobalCarl.mockReturnValue(null);
      mockAccessSync.mockReturnValue(undefined);

      const result = checkSetupNeeded({ cwd: testCwd, homeDir: testHomeDir });

      expect(result.needed).toBe(true);
      expect(result.targetDir).toBe(path.join(testCwd, '.opencarl'));
      expect(result.reason).toContain('No .opencarl/');
    });

    it('should fallback to global when project not writable', () => {
      mockFindProjectCarl.mockReturnValue(null);
      mockFindGlobalCarl.mockReturnValue(null);
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
