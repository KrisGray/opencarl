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
 * Integrate CARL documentation into AGENTS.md using HTML comment markers.
 *
 * - If AGENTS.md already contains CARL-START marker, returns success with "already integrated" message
 * - Otherwise, appends CARL section to end of AGENTS.md (creates file if needed)
 * - Always uses UTF-8 encoding, no BOM
 *
 * @param agentsPath - Path to AGENTS.md file
 * @param carlDocsPath - Path to CARL-AGENTS.md content file
 * @returns Success/failure with descriptive message
 */
export async function integrateCarl(
  agentsPath: string,
  carlDocsPath: string
): Promise<IntegrationResult> {
  try {
    // Read CARL documentation
    const carlDocs = await fs.readFile(carlDocsPath, "utf-8");
    const carlSection = `\n\n${MARKERS.start}\n${carlDocs}\n${MARKERS.end}\n`;

    // Check if AGENTS.md exists
    let existingContent = "";
    try {
      existingContent = await fs.readFile(agentsPath, "utf-8");

      // Check for existing integration
      if (existingContent.includes(MARKERS.start)) {
        return {
          success: true,
          message: "[carl] AGENTS.md already contains CARL integration",
        };
      }
    } catch {
      // File doesn't exist - will create new
    }

    // Append CARL section
    const newContent = existingContent.trimEnd() + carlSection;
    await fs.writeFile(agentsPath, newContent, "utf-8");

    return {
      success: true,
      message: `[carl] CARL integration added to ${agentsPath}`,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `[carl] Integration failed: ${errorMsg}`,
    };
  }
}

/**
 * Remove CARL integration from AGENTS.md using HTML comment markers.
 *
 * - If markers not found, returns success with "no integration found" message
 * - Removes entire CARL section including markers
 * - Cleans up whitespace (preserves single blank line between remaining content)
 * - Handles file not found gracefully
 *
 * @param agentsPath - Path to AGENTS.md file
 * @returns Success/failure with descriptive message
 */
export async function removeCarlIntegration(
  agentsPath: string
): Promise<IntegrationResult> {
  try {
    const content = await fs.readFile(agentsPath, "utf-8");

    const startIndex = content.indexOf(MARKERS.start);
    const endIndex = content.indexOf(MARKERS.end);

    if (startIndex === -1 || endIndex === -1) {
      return {
        success: true,
        message: "[carl] No CARL integration found in AGENTS.md",
      };
    }

    // Remove CARL section
    const before = content.substring(0, startIndex).trimEnd();
    const after = content.substring(endIndex + MARKERS.end.length).trimStart();
    const newContent = before + (before && after ? "\n\n" : "") + after;

    await fs.writeFile(agentsPath, newContent, "utf-8");

    return {
      success: true,
      message: `[carl] CARL integration removed from ${agentsPath}`,
    };
  } catch (err) {
    // Handle file not found gracefully
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return {
        success: true,
        message: "[carl] AGENTS.md not found - nothing to remove",
      };
    }

    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `[carl] Removal failed: ${errorMsg}`,
    };
  }
}
