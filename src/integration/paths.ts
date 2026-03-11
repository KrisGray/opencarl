import * as fs from "fs";
import * as path from "path";

export interface OpencarlSourcePath {
  root: string;
  opencarlDir: string;
  manifestPath: string;
}

function resolveOpencarlDirectory(
  opencarlDir: string,
  root: string
): OpencarlSourcePath | null {
  const manifestPath = path.join(opencarlDir, "manifest");

  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  return {
    root,
    opencarlDir,
    manifestPath,
  };
}

export function findProjectOpencarl(cwd: string): OpencarlSourcePath | null {
  let searchPath = path.resolve(cwd);

  for (let i = 0; i < 10; i += 1) {
    const opencarlDir = path.join(searchPath, ".opencarl");
    const resolved = resolveOpencarlDirectory(opencarlDir, searchPath);
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

export function findGlobalOpencarl(homeDir: string): OpencarlSourcePath | null {
  const resolvedHome = path.resolve(homeDir);
  return resolveOpencarlDirectory(
    path.join(resolvedHome, ".opencarl"),
    resolvedHome
  );
}

export function findFallbackOpencarl(
  projectRoot: string
): OpencarlSourcePath | null {
  const resolvedRoot = path.resolve(projectRoot);
  return resolveOpencarlDirectory(
    path.join(resolvedRoot, ".opencode/opencarl"),
    resolvedRoot
  );
}
