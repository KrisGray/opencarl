import * as fs from "fs/promises";

const MARKERS = {
  start: "<!-- CARL-START - DO NOT EDIT -->",
  end: "<!-- CARL-END - DO NOT EDIT -->",
};

export interface IntegrationResult {
  success: boolean;
  message: string;
}

/**
 * Integrate OpenCARL documentation into AGENTS.md using HTML comment markers.
 *
 * - If AGENTS.md already contains CARL-START marker, returns success with "already integrated" message
 * - Otherwise, appends OpenCARL section to end of AGENTS.md (creates file if needed)
 * - Always uses UTF-8 encoding, no BOM
 *
 * @param agentsPath - Path to AGENTS.md file
 * @param opencarlDocsPath - Path to OpenCARL-AGENTS.md content file
 * @returns Success/failure with descriptive message
 */
export async function integrateOpencarl(
  agentsPath: string,
  opencarlDocsPath: string
): Promise<IntegrationResult> {
  try {
    // Read OpenCARL documentation
    const opencarlDocs = await fs.readFile(opencarlDocsPath, "utf-8");
    const opencarlSection = `\n\n${MARKERS.start}\n${opencarlDocs}\n${MARKERS.end}\n`;

    // Check if AGENTS.md exists
    let existingContent = "";
    try {
      existingContent = await fs.readFile(agentsPath, "utf-8");

      // Check for existing integration
      if (existingContent.includes(MARKERS.start)) {
        return {
          success: true,
          message: "[opencarl] AGENTS.md already contains OpenCARL integration",
        };
      }
    } catch {
      // File doesn't exist - will create new
    }

    // Append OpenCARL section
    const newContent = existingContent.trimEnd() + opencarlSection;
    await fs.writeFile(agentsPath, newContent, "utf-8");

    return {
      success: true,
      message: `[opencarl] OpenCARL integration added to ${agentsPath}`,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `[opencarl] Integration failed: ${errorMsg}`,
    };
  }
}

/**
 * Remove OpenCARL integration from AGENTS.md using HTML comment markers.
 *
 * - If markers not found, returns success with "no integration found" message
 * - Removes entire OpenCARL section including markers
 * - Cleans up whitespace (preserves single blank line between remaining content)
 * - Handles file not found gracefully
 *
 * @param agentsPath - Path to AGENTS.md file
 * @returns Success/failure with descriptive message
 */
export async function removeOpencarlIntegration(
  agentsPath: string
): Promise<IntegrationResult> {
  try {
    const content = await fs.readFile(agentsPath, "utf-8");

    const startIndex = content.indexOf(MARKERS.start);
    const endIndex = content.indexOf(MARKERS.end);

    if (startIndex === -1 || endIndex === -1) {
    return {
      success: true,
      message: `[opencarl] No OpenCARL integration found in AGENTS.md`,
    }
    }

    // Remove CARL section
    const before = content.substring(0, startIndex).trimEnd();
    const after = content.substring(endIndex + MARKERS.end.length).trimStart();
    const newContent = before + (before && after ? "\n\n" : "") + after;

    await fs.writeFile(agentsPath, newContent, "utf-8");

    return {
      success: true,
      message: `[opencarl] OpenCARL integration removed from ${agentsPath}`,
    };
  } catch (err) {
    // Handle file not found gracefully
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return {
        success: true,
        message: "[opencarl] AGENTS.md not found - nothing to remove",
      };
    }

    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `[opencarl] Removal failed: ${errorMsg}`,
    };
  }
}
