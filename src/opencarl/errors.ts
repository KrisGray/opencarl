/**
 * Structured error handling for OpenCARL plugin.
 * Provides clear, actionable error messages with context and fix suggestions.
 */

/**
 * Categories of errors that can occur in the OpenCARL plugin.
 * @category Errors
 */
export type OpencarlErrorCategory = "config" | "manifest" | "runtime" | "permission";

/**
 * Base URL for OpenCARL documentation.
 */
const DOCS_BASE_URL = "https://github.com/KrisGray/opencarl/blob/main/docs";

/**
 * Structured error class for OpenCARL-specific errors.
 * Provides rich context to help users understand and fix issues.
 * @category Errors
 */
export class OpencarlError extends Error {
  public readonly category: OpencarlErrorCategory;
  public readonly context: string;
  public readonly location: string;
  public readonly fix: string;
  public readonly docsLink?: string;

  constructor(
    message: string,
    category: OpencarlErrorCategory,
    context: string,
    location: string,
    fix: string,
    docsLink?: string
  ) {
    super(message);
    this.name = "OpencarlError";
    this.category = category;
    this.context = context;
    this.location = location;
    this.fix = fix;
    this.docsLink = docsLink;

    // Maintain proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OpencarlError);
    }
  }
}

/**
 * Format an error for display to the user via console.error.
 * Handles both OpencarlError instances and generic errors.
 *
 * @category Errors
 * @param error - The error to format (can be OpencarlError or any other error type)
 * @returns A formatted string suitable for console.error output
 */
export function formatError(error: unknown): string {
  if (error instanceof OpencarlError) {
    const lines: string[] = [
      `[opencarl] ERROR: ${error.context}`,
      `  Location: ${error.location}`,
      `  Problem: ${error.message}`,
      `  Fix: ${error.fix}`,
    ];

    if (error.docsLink) {
      lines.push(`  Docs: ${error.docsLink}`);
    }

    return lines.join("\n");
  }

  // Handle generic errors with fallback formatting
  if (error instanceof Error) {
    return `[opencarl] ERROR: An unexpected error occurred
  Location: Unknown
  Problem: ${error.message}
  Fix: Check the error message above. If this persists, try running with DEVMODE=true for more details.`;
  }

  // Handle non-Error throwables
  return `[opencarl] ERROR: An unknown error occurred
  Location: Unknown
  Problem: ${String(error)}
  Fix: Check the error message above. If this persists, try running with DEVMODE=true for more details.`;
}

/**
 * Documentation links for error categories.
 */
const DOCS_LINKS: Record<OpencarlErrorCategory, string> = {
  config: `${DOCS_BASE_URL}/troubleshooting.md#configuration-errors`,
  manifest: `${DOCS_BASE_URL}/troubleshooting.md#manifest-errors`,
  runtime: `${DOCS_BASE_URL}/troubleshooting.md#runtime-errors`,
  permission: `${DOCS_BASE_URL}/troubleshooting.md#permission-errors`,
};

/**
 * Create an error for manifest file parsing failures.
 *
 * @category Errors
 * @param path - Path to the manifest file that failed to parse
 * @param details - Specific details about what went wrong
 * @returns A OpencarlError with actionable fix suggestions
 */
export function manifestParseError(path: string, details: string): OpencarlError {
  return new OpencarlError(
    `Failed to parse manifest file: ${details}`,
    "manifest",
    "Loading OpenCARL manifest configuration",
    path,
    `Validate manifest syntax: cat ${path}\nCommon fixes:\n  - Ensure each line follows KEY=value format\n  - Check for typos in domain names (e.g., CONTEXT_STATE not CONTEX_STATE)\n  - Verify boolean values are: true, false, yes, no, 1, or 0`,
    DOCS_LINKS.manifest
  );
}

/**
 * Create an error for domain rule loading failures.
 *
 * @category Errors
 * @param domain - The domain name that failed to load
 * @param path - Path to the domain file
 * @param details - Specific details about what went wrong
 * @returns A OpencarlError with actionable fix suggestions
 */
export function domainLoadError(
  domain: string,
  path: string,
  details: string
): OpencarlError {
  return new OpencarlError(
    `Failed to load domain rules: ${details}`,
    "runtime",
    `Loading ${domain} domain rules`,
    path,
    `Check domain file: cat ${path}\nCommon fixes:\n  - Ensure file exists and is readable\n  - Verify rule format: ${domain}_RULE_N = "rule text"\n  - Check for special characters that need escaping`,
    DOCS_LINKS.runtime
  );
}

/**
 * Create an error for file permission issues.
 *
 * @category Errors
 * @param path - Path to the file with permission issues
 * @param operation - The operation that was attempted (read, write, etc.)
 * @returns A OpencarlError with actionable fix suggestions
 */
export function permissionError(path: string, operation: string): OpencarlError {
  return new OpencarlError(
    `Permission denied while trying to ${operation}`,
    "permission",
    `Accessing ${path}`,
    path,
    `Check file permissions: ls -la ${path}\nFix permissions if needed:\n  - Read access: chmod +r ${path}\n  - Write access: chmod +w ${path}\n  - Full access: chmod +rw ${path}`,
    DOCS_LINKS.permission
  );
}

/**
 * Create an error for configuration file read failures.
 *
 * @category Errors
 * @param path - Path to the config file that couldn't be read
 * @param details - Specific details about what went wrong
 * @returns A OpencarlError with actionable fix suggestions
 */
export function configReadError(path: string, details: string): OpencarlError {
  return new OpencarlError(
    `Failed to read configuration: ${details}`,
    "config",
    "Reading OpenCARL configuration",
    path,
    `Verify configuration exists: ls -la ${path}\nIf file is missing, run: opencarl setup\nIf file exists, check contents: cat ${path}`,
    DOCS_LINKS.config
  );
}

/**
 * Create an error for setup failures.
 *
 * @category Errors
 * @param details - Specific details about what went wrong during setup
 * @returns A OpencarlError with actionable fix suggestions
 */
export function setupError(details: string): OpencarlError {
  return new OpencarlError(
    `Setup failed: ${details}`,
    "config",
    "Running OpenCARL setup",
    "setup",
    `Try running setup again: /opencarl setup\nIf this persists, check:\n  - You have write permissions in the target directory\n  - The .opencarl/ directory isn't corrupted (try removing and re-running setup)`,
    DOCS_LINKS.config
  );
}

/**
 * Create an error for integration failures.
 *
 * @category Errors
 * @param targetFile - The file being integrated with (e.g., AGENTS.md)
 * @param details - Specific details about what went wrong
 * @returns A OpencarlError with actionable fix suggestions
 */
export function integrationError(targetFile: string, details: string): OpencarlError {
  return new OpencarlError(
    `Integration failed: ${details}`,
    "config",
    `Integrating with ${targetFile}`,
    targetFile,
    `Check target file: cat ${targetFile}\nIf file has OpenCARL markers, verify they're properly formatted:\n  - <!-- OPENCARL:START -->\n  - <!-- OPENCARL:END -->\nTo remove integration and start fresh: /opencarl setup --remove`,
    DOCS_LINKS.config
  );
}
