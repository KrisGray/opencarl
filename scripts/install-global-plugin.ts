const fs = require("fs");
const os = require("os");
const path = require("path");

const GLOBAL_PLUGIN_PATH = path.join(
  os.homedir(),
  ".config",
  "opencode",
  "plugins",
  "carl.ts"
);

function buildPluginEntrypoint(loaderImportPath) {
  const summaryTemplate =
    "`[carl] Discovery summary: ${result.sources.length} sources, ${result.domains.length} domains, ${result.warnings.length} warnings.`";
  const domainTemplate = "` domain=${warning.domain}`";
  const pathTemplate = "` path=${warning.path}`";
  const warningTemplate =
    "`[carl] Warning: ${warning.message}${domain}${warningPath}`";

  return `import fs from "fs";
import os from "os";
import path from "path";
import { definePlugin } from "@opencode-ai/plugin";
import { loadCarlRules } from "${loaderImportPath}";

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

  console.log(${summaryTemplate});

  for (const warning of result.warnings) {
    const domain = warning.domain ? ${domainTemplate} : "";
    const warningPath = warning.path ? ${pathTemplate} : "";
    console.warn(${warningTemplate});
  }
}

export default definePlugin({
  name: "carl",
  setup() {
    warnIfDuplicatePluginPlacement();
    logDiscoverySummary();
    return {};
  },
});
`;
}

function writeFileIfChanged(targetPath, content) {
  const existing = fs.existsSync(targetPath)
    ? fs.readFileSync(targetPath, "utf8")
    : null;

  if (existing === content) {
    return false;
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content, "utf8");
  return true;
}

function installGlobalPlugin() {
  const loaderPath = path.resolve(process.cwd(), "src", "carl", "loader");
  const entrypoint = buildPluginEntrypoint(loaderPath);
  return writeFileIfChanged(GLOBAL_PLUGIN_PATH, entrypoint);
}

if (require.main === module) {
  const changed = installGlobalPlugin();
  if (changed) {
    console.log(`[carl] Global plugin entrypoint written to ${GLOBAL_PLUGIN_PATH}`);
  } else {
    console.log(`[carl] Global plugin entrypoint already up to date at ${GLOBAL_PLUGIN_PATH}`);
  }
}

module.exports = {
  buildPluginEntrypoint,
  installGlobalPlugin,
};
