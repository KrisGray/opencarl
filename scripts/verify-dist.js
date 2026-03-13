const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");

const requiredFiles = [
  "plugin.js",
  "plugin.d.ts",
  "integration/plugin-hooks.js",
  "opencarl/setup.js",
];

const requiredDirs = [".opencarl-template", "resources"];

function verifyDist() {
  const errors = [];

  if (!fs.existsSync(distDir)) {
    errors.push("dist/ directory not found - run npm run build first");
    return { success: false, errors };
  }

  for (const file of requiredFiles) {
    const filePath = path.join(distDir, file);
    if (!fs.existsSync(filePath)) {
      errors.push(`Missing: dist/${file}`);
    }
  }

  for (const dir of requiredDirs) {
    const dirPath = path.join(projectRoot, dir);
    if (!fs.existsSync(dirPath)) {
      errors.push(`Missing: ${dir}/`);
    }
  }

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

const result = verifyDist();
if (!result.success) {
  console.error("[verify] Dist verification failed:");
  result.errors.forEach((err) => console.error(`  ✗ ${err}`));
  process.exit(1);
}

console.log("[verify] Dist verification passed");
console.log("[verify] Package ready for publishing");
