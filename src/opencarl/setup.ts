import * as fs from "fs";
import * as path from "path";
import { findProjectOpencarl, findGlobalOpencarl } from "../integration/paths";
import {
  integrateOpencarl,
  removeOpencarlIntegration,
  IntegrationResult,
} from "../integration/agents-writer";
import {
  readOpenCodeConfig,
  mergeOpencarlInstructions,
  writeOpenCodeConfig,
} from "../integration/opencode-config";

export interface SetupCheckResult {
  needed: boolean;
  targetDir: string | null;
  reason: string;
}

export interface SeedResult {
  copied: string[];
  skipped: string[];
  failed: Array<{ file: string; error: string }>;
}

export interface SetupResult {
  success: boolean;
  targetDir: string | null;
  seedResult?: SeedResult;
  error?: string;
  reason?: string;
}

export interface IntegrationOptions {
  integrate?: boolean;
  remove?: boolean;
  agentsPath?: string;
  integrateOpencode?: boolean;
}

/**
 * Check if setup is needed by looking for project and global .opencarl/ directories.
 * Priority: project .opencarl/ first, fallback to ~/.opencarl/
 */
export function checkSetupNeeded(options: {
  cwd: string;
  homeDir: string;
}): SetupCheckResult {
  const { cwd, homeDir } = options;

  // Check for project .opencarl/
  const projectOpencarl = findProjectOpencarl(cwd);
  if (projectOpencarl) {
    return {
      needed: false,
      targetDir: projectOpencarl.opencarlDir,
      reason: "Project .opencarl/ already exists",
    };
  }

  // Check for global ~/.opencarl/
  const globalOpencarl = findGlobalOpencarl(homeDir);
  if (globalOpencarl) {
    return {
      needed: false,
      targetDir: globalOpencarl.opencarlDir,
      reason: "Global ~/.opencarl/ already exists",
    };
  }

  // No .opencarl/ found - determine target directory
  const targetDir = path.join(cwd, ".opencarl");

  // Check if project directory is writable
  try {
    fs.accessSync(cwd, fs.constants.W_OK);
    return {
      needed: true,
      targetDir,
      reason: "No .opencarl/ found - setup will seed to project directory",
    };
  } catch {
    // Project not writable, fallback to global
    const globalTarget = path.join(homeDir, ".opencarl");
    return {
      needed: true,
      targetDir: globalTarget,
      reason: "No .opencarl/ found - project not writable, setup will seed to global ~/.opencarl/",
    };
  }
}

/**
 * Recursively copy template directory to target, skipping existing files.
 * Never overwrites user content.
 */
export async function seedOpencarlTemplates(
  targetDir: string,
  templateDir: string
): Promise<SeedResult> {
  const results: SeedResult = {
    copied: [],
    skipped: [],
    failed: [],
  };

  // Ensure target exists
  try {
    await fs.promises.mkdir(targetDir, { recursive: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    results.failed.push({ file: targetDir, error: `Failed to create directory: ${errorMsg}` });
    return results;
  }

  // Read template directory
  let entries: fs.Dirent[];
  try {
    entries = await fs.promises.readdir(templateDir, { withFileTypes: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    results.failed.push({ file: templateDir, error: `Failed to read template: ${errorMsg}` });
    return results;
  }

  for (const entry of entries) {
    const srcPath = path.join(templateDir, entry.name);
    const destPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      // Recurse for directories
      const subResult = await seedOpencarlTemplates(destPath, srcPath);
      results.copied.push(...subResult.copied.map((p) => path.join(entry.name, p)));
      results.skipped.push(...subResult.skipped.map((p) => path.join(entry.name, p)));
      results.failed.push(...subResult.failed.map((f) => ({
        file: path.join(entry.name, f.file),
        error: f.error,
      })));
    } else {
      // Skip if file exists (idempotent)
      try {
        await fs.promises.access(destPath);
        results.skipped.push(entry.name);
      } catch {
        // File doesn't exist, copy it
        try {
          await fs.promises.copyFile(srcPath, destPath);
          results.copied.push(entry.name);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          results.failed.push({ file: entry.name, error: errorMsg });
        }
      }
    }
  }

  return results;
}

/**
 * Build the setup prompt message shown when .opencarl/ is missing.
 * Keep under 500 chars for visibility.
 */
export function buildSetupPrompt(): string {
  return `[opencarl] Setup Required

No .opencarl/ configuration found. To use OpenCARL:

1. Type: /opencarl setup
2. Or run: npx opencarl-core

This seeds starter templates to your project or home directory.`;
}

/**
 * Orchestrate the setup flow: check → seed.
 * Reports progress with checkmark format.
 */
export async function runSetup(options: {
  cwd: string;
  homeDir: string;
  templateDir?: string;
}): Promise<SetupResult> {
  const { cwd, homeDir, templateDir } = options;

  // Default template directory relative to this module
  const defaultTemplateDir = path.resolve(
    path.dirname(require.main?.filename || __dirname),
    "..",
    ".opencarl-template"
  );
  const actualTemplateDir = templateDir || defaultTemplateDir;

  // Check if setup is needed
  const checkResult = checkSetupNeeded({ cwd, homeDir });

  if (!checkResult.needed) {
    return {
      success: true,
      targetDir: checkResult.targetDir,
      reason: checkResult.reason,
    };
  }

  const targetDir = checkResult.targetDir;
  if (!targetDir) {
    return {
      success: false,
      targetDir: null,
      error: "Could not determine target directory for setup",
    };
  }

  console.log(`[opencarl] Setting up .opencarl/ at ${targetDir}`);

  // Check template directory exists
  try {
    await fs.promises.access(actualTemplateDir);
  } catch {
    return {
      success: false,
      targetDir,
      error: `Template directory not found: ${actualTemplateDir}`,
    };
  }

  // Seed templates
  console.log("[opencarl] Seeding templates...");
  const seedResult = await seedOpencarlTemplates(targetDir, actualTemplateDir);

  // Report progress with checkmarks
  for (const file of seedResult.copied) {
    console.log(`  ✓ ${file}`);
  }
  for (const file of seedResult.skipped) {
    console.log(`  - ${file} (skipped, exists)`);
  }
  for (const failure of seedResult.failed) {
    console.log(`  ✗ ${failure.file}: ${failure.error}`);
  }

  // Determine overall success
  const hasPartialSuccess = seedResult.copied.length > 0;
  const hasFailures = seedResult.failed.length > 0;

  if (hasFailures && !hasPartialSuccess) {
    return {
      success: false,
      targetDir,
      seedResult,
      error: "Setup failed - no files could be copied",
    };
  }

  if (hasFailures) {
    return {
      success: true,
      targetDir,
      seedResult,
      error: "Setup completed with some failures",
    };
  }

  return {
    success: true,
    targetDir,
    seedResult,
  };
}

/**
 * Run AGENTS.md integration or removal.
 * Can be called independently or as part of setup.
 */
export async function runIntegration(options: {
  cwd: string;
  integrate?: boolean;
  remove?: boolean;
  agentsPath?: string;
}): Promise<IntegrationResult> {
  const { cwd, integrate, remove, agentsPath } = options;

  // Default paths
  const defaultAgentsPath = path.join(cwd, "AGENTS.md");
  const targetAgentsPath = agentsPath || defaultAgentsPath;

  // Resolve OpenCARL-AGENTS.md path relative to this module
  const opencarlDocsPath = path.resolve(
    path.dirname(require.main?.filename || __dirname),
    "..",
    "resources",
    "docs",
    "OpenCARL-AGENTS.md"
  );

  if (integrate) {
    return integrateOpencarl(targetAgentsPath, opencarlDocsPath);
  }

  if (remove) {
    return removeOpencarlIntegration(targetAgentsPath);
  }

  return {
    success: false,
    message: "[opencarl] No integration action specified (use --integrate or --remove)",
  };
}

/**
 * Integrate OpenCARL documentation references into opencode.json.
 * - Reads existing opencode.json (or creates default)
 * - Merges OpenCARL doc paths into instructions field
 * - Idempotent - won't duplicate entries
 *
 * @param options - Configuration options including cwd
 * @returns IntegrationResult with success status and message
 */
export async function integrateOpencarl(options: {
  cwd: string;
}): Promise<IntegrationResult> {
  const { cwd } = options;

  try {
    // Read existing opencode.json (or get default empty config)
    let config;
    try {
      config = await readOpenCodeConfig(cwd);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: errorMsg,
      };
    }

    // Resolve OpenCARL-DOCS.md path relative to this module
    const opencarlDocsPath = path.resolve(
      path.dirname(require.main?.filename || __dirname),
      "..",
      "resources",
      "docs",
      "OpenCARL-DOCS.md"
    );

    // Relative path for opencode.json instructions
    // Use path relative to cwd if opencarlDocsPath is within cwd, otherwise use absolute
    const relativePath = "./resources/docs/OpenCARL-DOCS.md";

    // Merge OpenCARL instructions
    const mergedConfig = mergeOpencarlInstructions(config, [relativePath]);

    // Write updated config
    try {
      await writeOpenCodeConfig(cwd, mergedConfig);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: errorMsg,
      };
    }

    return {
      success: true,
      message: `[opencarl] OpenCARL documentation added to opencode.json instructions`,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `[opencarl] OpenCode integration failed: ${errorMsg}`,
    };
  }
}

export interface ListResult {
  success: boolean;
  domains?: Array<{ name: string; state: string; recall?: string }>;
  error?: string;
}

export interface ToggleResult {
  success: boolean;
  domain?: string;
  oldState?: string;
  newState?: string;
  error?: string;
}

/**
 * List all domains and their states from the manifest.
 */
export function runList(options: { cwd: string; homeDir: string }): ListResult {
  const { cwd, homeDir } = options;

  // Find .opencarl/ directory (project first, then global)
  let opencarlDir: string | null = null;
  const projectOpencarl = findProjectOpencarl(cwd);
  if (projectOpencarl) {
    opencarlDir = projectOpencarl.opencarlDir;
  } else {
    const globalOpencarl = findGlobalOpencarl(homeDir);
    if (globalOpencarl) {
      opencarlDir = globalOpencarl.opencarlDir;
    }
  }

  if (!opencarlDir) {
    return {
      success: false,
      error: "No .opencarl/ directory found. Run setup first.",
    };
  }

  const manifestPath = path.join(opencarlDir, "manifest");

  if (!fs.existsSync(manifestPath)) {
    return {
      success: false,
      error: `Manifest file not found: ${manifestPath}`,
    };
  }

  try {
    const lines = fs.readFileSync(manifestPath, "utf8").split(/\r?\n/);
    const domains: Array<{ name: string; state: string; recall?: string }> = [];
    const domainKeyPattern = /^([A-Z0-9_]+)_STATE=(.+)$/;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) {
        continue;
      }

      const match = line.match(domainKeyPattern);
      if (match) {
        const domain = match[1];
        const state = match[2];

        // Find recall keywords for this domain
        const recallMatch = lines.find(
          (l) => l.trim().startsWith(`${domain}_RECALL=`)
        );
        let recall: string | undefined;
        if (recallMatch) {
          const recallValue = recallMatch.split("=")[1]?.trim();
          if (recallValue) {
            recall = recallValue;
          }
        }

        domains.push({ name: domain, state, recall });
      }
    }

    return {
      success: true,
      domains,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Failed to read manifest: ${errorMsg}`,
    };
  }
}

/**
 * Toggle a domain's active state in the manifest.
 */
export function runToggle(options: {
  cwd: string;
  homeDir: string;
  domain: string;
}): ToggleResult {
  const { cwd, homeDir, domain } = options;

  // Normalize domain name to uppercase
  const domainName = domain.toUpperCase();

  // Find .opencarl/ directory (project first, then global)
  let opencarlDir: string | null = null;
  const projectOpencarl = findProjectOpencarl(cwd);
  if (projectOpencarl) {
    opencarlDir = projectOpencarl.opencarlDir;
  } else {
    const globalOpencarl = findGlobalOpencarl(homeDir);
    if (globalOpencarl) {
      opencarlDir = globalOpencarl.opencarlDir;
    }
  }

  if (!opencarlDir) {
    return {
      success: false,
      error: "No .opencarl/ directory found. Run setup first.",
    };
  }

  const manifestPath = path.join(opencarlDir, "manifest");

  if (!fs.existsSync(manifestPath)) {
    return {
      success: false,
      error: `Manifest file not found: ${manifestPath}`,
    };
  }

  try {
    const lines = fs.readFileSync(manifestPath, "utf8").split(/\r?\n/);
    let domainFound = false;
    let oldState: string | undefined;
    let lineIndex = -1;

    // Find the domain state line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const statePattern = new RegExp(`^${domainName}_STATE=(.+)$`);
      const match = line.match(statePattern);

      if (match) {
        domainFound = true;
        oldState = match[1].trim();
        lineIndex = i;
        break;
      }
    }

    if (!domainFound) {
      return {
        success: false,
        error: `Domain '${domainName}' not found in manifest.`,
      };
    }

    // Toggle the state
    const newState = oldState === "active" ? "inactive" : "active";
    lines[lineIndex] = `${domainName}_STATE=${newState}`;

    // Write back to file
    fs.writeFileSync(manifestPath, lines.join("\n"));

    return {
      success: true,
      domain: domainName,
      oldState,
      newState,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Failed to toggle domain: ${errorMsg}`,
    };
  }
}
