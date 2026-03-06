import fs from "fs";
import os from "os";
import path from "path";
import { loadCarlRules } from "../../src/opencarl/loader";
import { createCarlPluginHooks } from "../../src/integration/plugin-hooks";

const PROJECT_PLUGIN_PATH = path.resolve(process.cwd(), ".opencode/plugins/carl.ts");
const GLOBAL_PLUGIN_PATH = path.join(
  os.homedir(),
  ".config",
  "opencode",
  "plugins",
  "carl.ts"
);

function warnIfDuplicatePluginPlacement() {
  const hasProjectPlugin = fs.existsSync(PROJECT_PLUGIN_PATH);
  const hasGlobalPlugin = fs.existsSync(GLOBAL_PLUGIN_PATH);

  if (hasProjectPlugin && hasGlobalPlugin) {
    console.warn(
      "[carl] Detected both project and global plugin entrypoints. " +
        "OpenCode may load both; remove one if this is unintended."
    );
  }
}

function logDiscoverySummary() {
  const result = loadCarlRules();

  console.log(`[carl] Discovery summary: ${result.sources.length} sources, ${result.domains.length} domains, ${result.warnings.length} warnings.`);

  for (const warning of result.warnings) {
    const domain = warning.domain ? ` domain=${warning.domain}` : "";
    const warningPath = warning.path ? ` path=${warning.path}` : "";
    console.warn(`[carl] Warning: ${warning.message}${domain}${warningPath}`);
  }
}

export default function carlPlugin(input) {
  warnIfDuplicatePluginPlacement();
  logDiscoverySummary();
  return createCarlPluginHooks();
}
