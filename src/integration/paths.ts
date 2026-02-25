import fs from "fs";
import path from "path";

export interface CarlSourcePath {
  root: string;
  carlDir: string;
  manifestPath: string;
}

function resolveCarlDirectory(carlDir: string, root: string): CarlSourcePath | null {
  const manifestPath = path.join(carlDir, "manifest");

  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  return {
    root,
    carlDir,
    manifestPath,
  };
}

export function findProjectCarl(cwd: string): CarlSourcePath | null {
  let searchPath = path.resolve(cwd);

  for (let i = 0; i < 10; i += 1) {
    const carlDir = path.join(searchPath, ".carl");
    const resolved = resolveCarlDirectory(carlDir, searchPath);
    if (resolved) {
      return resolved;
    }

    const parent = path.dirname(searchPath);
    if (parent === searchPath) {
      break;
    }

    searchPath = parent;
  }

  return null;
}

export function findGlobalCarl(homeDir: string): CarlSourcePath | null {
  const resolvedHome = path.resolve(homeDir);
  return resolveCarlDirectory(path.join(resolvedHome, ".carl"), resolvedHome);
}

export function findFallbackCarl(projectRoot: string): CarlSourcePath | null {
  const resolvedRoot = path.resolve(projectRoot);
  return resolveCarlDirectory(
    path.join(resolvedRoot, ".opencode/carl"),
    resolvedRoot
  );
}
