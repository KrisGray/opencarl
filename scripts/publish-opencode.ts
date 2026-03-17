import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const projectRoot = path.resolve(__dirname, "..");

function run(command: string): void {
  console.log(`[publish] ${command}`);
  execSync(command, { cwd: projectRoot, stdio: "inherit" });
}

function publishOpenCode(): void {
  // Verify dist first
  console.log("[publish] Verifying dist...");
  run("npx ts-node scripts/verify-dist.ts");

  // Check that package.json has the correct name
  const packageJsonPath = path.join(projectRoot, "package.json");
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  
  if (pkg.name !== "opencarl") {
    console.error(`[publish] ERROR: package.json name should be "opencarl", got "${pkg.name}"`);
    process.exit(1);
  }

  // Verify dist/plugin.js exists
  const pluginPath = path.join(projectRoot, "dist", "plugin.js");
  if (!fs.existsSync(pluginPath)) {
    console.error("[publish] ERROR: dist/plugin.js not found - run npm run build:opencode first");
    process.exit(1);
  }

  // Publish
  console.log("[publish] Publishing opencarl...");
  run("npm publish --access public");
  console.log("[publish] Published successfully!");
}

publishOpenCode();
