import * as fs from "fs";
import * as path from "path";

export interface CarlHelpGuidance {
  overview: string;
  manager: string;
  combined: string;
}

function readFileSafe(filePath: string): string {
  if (!filePath || !fs.existsSync(filePath)) {
    return "";
  }

  return fs.readFileSync(filePath, "utf8").trim();
}

function stripFrontmatter(markdown: string): string {
  if (!markdown.startsWith("---")) {
    return markdown.trim();
  }

  const closingIndex = markdown.indexOf("\n---", 3);
  if (closingIndex === -1) {
    return markdown.trim();
  }

  return markdown.slice(closingIndex + 4).trim();
}

export function buildCarlHelpGuidance(options?: {
  overviewPath?: string;
  managerPath?: string;
}): CarlHelpGuidance {
  const overviewPath =
    options?.overviewPath ??
    path.resolve(
      process.cwd(),
      "resources",
      "skills",
      "carl-help",
      "CARL-OVERVIEW.md"
    );
  const managerPath =
    options?.managerPath ??
    path.resolve(process.cwd(), "resources", "commands", "carl", "manager.md");

  const overview = readFileSafe(overviewPath);
  const manager = stripFrontmatter(readFileSafe(managerPath));
  const combined = [overview, manager].filter(Boolean).join("\n\n");

  return {
    overview,
    manager,
    combined,
  };
}

export interface CarlDocsGuidance {
  quickReference: string;
  fullGuide: string;
  combined: string;
}

export function buildCarlDocsGuidance(options?: {
  docsPath?: string;
}): CarlDocsGuidance {
  const docsPath =
    options?.docsPath ??
    path.resolve(
      process.cwd(),
      "resources",
      "docs",
      "CARL-DOCS.md"
    );

  const fullContent = readFileSafe(docsPath);

  // Extract quick reference (before --- separator)
  const separatorIndex = fullContent.indexOf("\n---");
  const quickReference = separatorIndex > 0
    ? fullContent.slice(0, separatorIndex).trim()
    : fullContent.slice(0, 2000); // Fallback: first 2000 chars

  return {
    quickReference,
    fullGuide: fullContent,
    combined: fullContent,
  };
}
