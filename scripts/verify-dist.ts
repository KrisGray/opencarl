import fs from "fs";
import path from "path";

const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");

const requiredFiles = [
  "plugin.js",
  "plugin.d.ts",
  "integration/plugin-hooks.js",
  "carl/setup.js",
];

const requiredDirs = [".opencarl-template", "resources"];

export function verifyDist(): { success: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check dist/ exists
  if (!fs.existsSync(distDir)) {
    errors.push("dist/ directory not found - run npm run build:opencode first");
    return { success: false, errors };
  }

  // Check required files
  for (const file of requiredFiles) {
    const filePath = path.join(distDir, file);
    if (!fs.existsSync(filePath)) {
      errors.push(`Missing: dist/${file}`);
    }
  }

  // Check required directories (from project root)
  for (const dir of requiredDirs) {
    const dirPath = path.join(projectRoot, dir);
    if (!fs.existsSync(dirPath)) {
      errors.push(`Missing: ${dir}/`);
    }
  }

  // Verify plugin.js has content
  const pluginPath = path.join(distDir, "plugin.js");
  if (fs.existsSync(pluginPath)) {
    const content = fs.readFileSync(pluginPath, "utf-8");
    if (content.length < 100) {
      errors.push("dist/plugin.js appears to be empty or incomplete");
    }
    if (!content.includes("createOpencarlPluginHooks")) {
      errors.push("dist/plugin.js does not export OpenCARL hooks");
    }
  }

  return { success: errors.length === 0, errors };
}

// Run verification when executed directly
if (require.main === module) {
  const result = verifyDist();
  if (!result.success) {
    console.error("[verify] Dist verification failed:");
    result.errors.forEach((err) => console.error(`  ✗ ${err}`));
    process.exit(1);
  }

  console.log("[verify] Dist verification passed");
  console.log("[verify] Package ready for publishing");
}
