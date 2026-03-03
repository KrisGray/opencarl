import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const projectRoot = path.resolve(__dirname, "..");

console.log("[build] Compiling TypeScript...");
execSync("npx tsc --project tsconfig.build.json", {
  cwd: projectRoot,
  stdio: "inherit",
});

// Verify dist/plugin.js exists
const pluginPath = path.join(projectRoot, "dist", "plugin.js");
if (!fs.existsSync(pluginPath)) {
  console.error("[build] ERROR: dist/plugin.js not found after compilation");
  process.exit(1);
}

console.log("[build] OpenCode plugin built successfully");
console.log(`[build] Output: ${pluginPath}`);
