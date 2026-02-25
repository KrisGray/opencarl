const fs = require("fs");
const path = require("path");
const readline = require("readline");
const {
  buildPluginEntrypoint,
  installGlobalPlugin,
} = require("./install-global-plugin.ts");

const PROJECT_PLUGIN_PATH = path.resolve(
  process.cwd(),
  ".opencode",
  "plugins",
  "carl.ts"
);

function parseScopeArg(argv) {
  const scopeFlag = argv.find((arg) => arg === "--scope" || arg.startsWith("--scope="));
  if (!scopeFlag) {
    return null;
  }

  if (scopeFlag === "--scope") {
    const index = argv.indexOf(scopeFlag);
    return argv[index + 1] || null;
  }

  return scopeFlag.split("=")[1] || null;
}

function promptForScope() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("Install scope? (global/project) [global]: ", (answer) => {
      rl.close();
      const trimmed = answer.trim();
      resolve(trimmed.length > 0 ? trimmed : "global");
    });
  });
}

function writeProjectPlugin() {
  const entrypoint = buildPluginEntrypoint("../../src/carl/loader");
  const existing = fs.existsSync(PROJECT_PLUGIN_PATH)
    ? fs.readFileSync(PROJECT_PLUGIN_PATH, "utf8")
    : null;

  if (existing === entrypoint) {
    return false;
  }

  fs.mkdirSync(path.dirname(PROJECT_PLUGIN_PATH), { recursive: true });
  fs.writeFileSync(PROJECT_PLUGIN_PATH, entrypoint, "utf8");
  return true;
}

async function run() {
  const scopeArg = parseScopeArg(process.argv.slice(2));
  const scope = scopeArg || (await promptForScope());

  if (scope === "global") {
    const changed = installGlobalPlugin();
    if (changed) {
      console.log("[carl] Installed global plugin entrypoint.");
    } else {
      console.log("[carl] Global plugin entrypoint already up to date.");
    }
    return;
  }

  if (scope === "project") {
    const changed = writeProjectPlugin();
    if (changed) {
      console.log("[carl] Installed project plugin entrypoint.");
    } else {
      console.log("[carl] Project plugin entrypoint already up to date.");
    }
    return;
  }

  console.error(`[carl] Unknown scope: ${scope}. Use \"global\" or \"project\".`);
  process.exit(1);
}

run();
