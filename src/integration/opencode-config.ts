import * as fs from "fs/promises";
import * as path from "path";

/**
 * OpenCode configuration interface.
 * The instructions field can be a string or array of strings.
 */
export interface OpenCodeConfig {
  instructions?: string | string[];
  [key: string]: unknown;
}

/**
 * Read opencode.json from the specified directory.
 * Returns an empty config if file doesn't exist.
 * Throws clear error for malformed JSON.
 *
 * @param cwd - Current working directory to read opencode.json from
 * @returns Parsed OpenCodeConfig or default empty config
 */
export async function readOpenCodeConfig(cwd: string): Promise<OpenCodeConfig> {
  const configPath = path.join(cwd, "opencode.json");

  try {
    const content = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(content);
    return config;
  } catch (err) {
    // File doesn't exist - return empty config
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { instructions: [] };
    }

    // Malformed JSON - provide clear error
    if (err instanceof SyntaxError) {
      throw new Error(`[carl] opencode.json is malformed: ${err.message}`);
    }

    // Re-throw other errors
    throw err;
  }
}

/**
 * Merge OpenCARL documentation paths into the OpenCode config's instructions.
 * - Converts string instructions to array if needed
 * - Checks for existing OpenCARL references (idempotent)
 * - Preserves all existing instructions
 *
 * @param config - Existing OpenCode configuration
 * @param opencarlDocPaths - Paths to OpenCARL documentation files to add
 * @returns Updated config with OpenCARL instructions merged
 */
export function mergeOpencarlInstructions(
  config: OpenCodeConfig,
  opencarlDocPaths: string[]
): OpenCodeConfig {
  // Normalize instructions to array
  let instructions: string[];
  if (!config.instructions) {
    instructions = [];
  } else if (typeof config.instructions === "string") {
    instructions = [config.instructions];
  } else {
    instructions = [...config.instructions];
  }

  // Add OpenCARL doc paths if not already present
  for (const opencarlPath of opencarlDocPaths) {
    // Check for both exact match and path-only match (handles cases where user might have edited)
    const alreadyExists = instructions.some((existing) => {
      // Check for exact match or if the path appears in the instruction
      return existing === opencarlPath || existing.includes(opencarlPath);
    });

    if (!alreadyExists) {
      instructions.push(opencarlPath);
    }
  }

  // Return new config with merged instructions
  return {
    ...config,
    instructions,
  };
}

/**
 * Write OpenCode configuration to opencode.json in the specified directory.
 * - Uses 2-space indentation for readability
 * - Creates file if it doesn't exist
 * - Handles write errors gracefully
 *
 * @param cwd - Current working directory to write opencode.json to
 * @param config - OpenCode configuration to write
 */
export async function writeOpenCodeConfig(
  cwd: string,
  config: OpenCodeConfig
): Promise<void> {
  const configPath = path.join(cwd, "opencode.json");

  try {
    const content = JSON.stringify(config, null, 2);
    await fs.writeFile(configPath, content, "utf-8");
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(`[carl] Failed to write opencode.json: ${errorMsg}`);
  }
}
