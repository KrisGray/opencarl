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

  // Backup existing package.json
  const packageJsonPath = path.join(projectRoot, "package.json");
  const packageClaudePath = path.join(projectRoot, "package.claude.json");
  const packageOpenCodePath = path.join(projectRoot, "package.opencode.json");

  // Save Claude package config
  if (fs.existsSync(packageJsonPath)) {
    fs.copyFileSync(packageJsonPath, packageClaudePath);
    console.log("[publish] Backed up package.json to package.claude.json");
  }

  // Swap to OpenCode package config
  fs.copyFileSync(packageOpenCodePath, packageJsonPath);
  console.log("[publish] Swapped to OpenCode package.json");

  // Copy README
  const readmePath = path.join(projectRoot, "README.md");
  const readmeOpenCodePath = path.join(projectRoot, "README-opencode.md");
  const readmeBackupPath = path.join(projectRoot, "README.claude.md");
  
  if (fs.existsSync(readmePath)) {
    fs.copyFileSync(readmePath, readmeBackupPath);
  }
  if (fs.existsSync(readmeOpenCodePath)) {
    fs.copyFileSync(readmeOpenCodePath, readmePath);
    console.log("[publish] Swapped to OpenCode README");
  }

  try {
    // Publish
    console.log("[publish] Publishing @krisgray/opencode-carl-plugin...");
    run("npm publish --access public");
    console.log("[publish] Published successfully!");
  } finally {
    // Restore Claude package config
    fs.copyFileSync(packageClaudePath, packageJsonPath);
    console.log("[publish] Restored Claude package.json");

    // Restore README
    if (fs.existsSync(readmeBackupPath)) {
      fs.copyFileSync(readmeBackupPath, readmePath);
      console.log("[publish] Restored Claude README");
    }

    console.log("[publish] Done - repo restored to Claude Code configuration");
  }
}

publishOpenCode();
