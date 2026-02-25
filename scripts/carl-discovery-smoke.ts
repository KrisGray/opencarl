const fs = require("fs");
const os = require("os");
const path = require("path");
const { loadCarlRules } = require("../src/carl/loader");

function writeFile(targetPath, content) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content, "utf8");
}

function writeManifest(dir, content) {
  writeFile(path.join(dir, "manifest"), content);
}

function writeDomain(dir, domain, content) {
  writeFile(path.join(dir, domain), content);
}

function countWarnings(warnings, predicate) {
  return warnings.filter((warning) => predicate(warning.message)).length;
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "carl-discovery-"));
const projectRoot = path.join(tempRoot, "project");
const projectCarlDir = path.join(projectRoot, ".carl");
const fallbackCarlDir = path.join(projectRoot, ".opencode", "carl");
const globalHome = path.join(tempRoot, "home");
const globalCarlDir = path.join(globalHome, ".carl");

try {
  writeManifest(
    projectCarlDir,
    [
      "GLOBAL_STATE=active",
      "GLOBAL_ALWAYS_ON=true",
      "GLOBAL_RECALL=project",
      "UNKNOWN_KEY=value",
      "MALFORMED_LINE",
    ].join("\n")
  );

  writeDomain(
    projectCarlDir,
    "global",
    ["GLOBAL_RULE_0=Project rule", "GLOBAL_BAD=Invalid"].join("\n")
  );

  writeManifest(
    globalCarlDir,
    ["GLOBAL_STATE=active", "GLOBAL_ALWAYS_ON=true"].join("\n")
  );

  writeDomain(globalCarlDir, "global", "GLOBAL_RULE_0=Global rule");

  writeManifest(
    fallbackCarlDir,
    ["GLOBAL_STATE=active", "GLOBAL_ALWAYS_ON=true"].join("\n")
  );

  writeDomain(fallbackCarlDir, "global", "GLOBAL_RULE_0=Fallback rule");

  const result = loadCarlRules({
    cwd: projectRoot,
    homeDir: globalHome,
    projectRoot,
    overrides: {
      projectCarlDir,
      globalCarlDir,
      fallbackCarlDir,
    },
  });

  const winningSource = result.sources.find((source) =>
    source.domains.includes("GLOBAL")
  );

  const manifestWarnings = countWarnings(
    result.warnings,
    (message) => message.toLowerCase().includes("manifest")
  );
  const domainWarnings = countWarnings(result.warnings, (message) =>
    message.toLowerCase().includes("rule")
  );

  console.log(
    `[carl] Shared domain GLOBAL resolved to: ${
      winningSource ? winningSource.scope : "none"
    }`
  );
  console.log(
    `[carl] Warnings: ${result.warnings.length} total (manifest: ${manifestWarnings}, domain: ${domainWarnings})`
  );
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
