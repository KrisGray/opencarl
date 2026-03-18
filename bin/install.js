#!/usr/bin/env node

/**
 * OpenCARL Setup Script for OpenCode
 * 
 * This script sets up OpenCARL for use with OpenCode:
 * - Seeds .opencarl/ directory with templates
 * - Copies commands and skills to .opencode/
 * - Optionally integrates with AGENTS.md
 * - Checks opencode.json plugin configuration
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Colors
const amber = '\x1b[38;5;214m';
const orange = '\x1b[38;5;208m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const cyan = '\x1b[36m';
const dim = '\x1b[2m';
const reset = '\x1b[0m';

// Get version from package.json
const pkg = require('../package.json');

const banner = `
${orange}    ██████╗ ██████╗ ███████╗███╗   ██╗██████╗  █████╗ ██████╗ ██╗
   ██╔═══██╗██╔══██╗██╔════╝████╗  ██║██╔════╝██╔══██╗██╔══██╗██║
   ██║   ██║██████╔╝█████╗  ██╔██╗ ██║██║     ███████║██████╔╝██║
   ██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║██║     ██╔══██║██╔══██╗██║
   ╚██████╔╝██║     ███████╗██║ ╚████║╚██████╗██║  ██║██║  ██║███████╗
    ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝${reset}

   OpenCARL ${dim}v${pkg.version}${reset}
   Context Augmentation & Reinforcement Layer for OpenCode
`;

// OpenCARL section for AGENTS.md
const CARL_AGENTS_SECTION = `<!-- CARL-START - DO NOT EDIT -->
## OpenCARL Integration

OpenCARL provides dynamic rule injection for this project. Rules load automatically when relevant to your current task.

### How OpenCARL Works with OpenCode

1. **OpenCode AGENTS.md rules** - Load first as project-scoped instructions
2. **OpenCARL's dynamic rules** - Load based on recall keyword matches
3. **Both sets of rules apply** to the current session

### Integration Points

| Integration | Purpose |
|-------------|---------|
| \`*carl\` | Enter CARL help mode |
| \`*carl docs\` | View full CARL documentation |
| \`/carl\` | Domain management commands |
| \`.opencarl/\` directory | Your rule definitions |

### Quick Reference

\`\`\`
.opencarl/
├── manifest        # Domain registry (states + recall keywords)
├── global          # Always-loaded rules
├── commands        # Star-command definitions
└── {domain}        # Custom domain files
\`\`\`

For full documentation, run \`*carl docs\` in OpenCode.
<!-- CARL-END - DO NOT EDIT -->`;

// Parse args
const args = process.argv.slice(2);
const hasGlobal = args.includes('--global') || args.includes('-g');
const hasLocal = args.includes('--local') || args.includes('-l');
const hasHelp = args.includes('--help') || args.includes('-h');
const hasIntegrate = args.includes('--integrate') || args.includes('-i');
const hasRemove = args.includes('--remove') || args.includes('-r');

console.log(banner);

// Show help
if (hasHelp) {
  console.log(`  ${yellow}Usage:${reset} npx opencarl [options]

  ${yellow}Options:${reset}
    ${amber}-g, --global${reset}       Install globally (to ~/.opencode and ~/.opencarl)
    ${amber}-l, --local${reset}        Install locally (to ./.opencode and ./.opencarl)
    ${amber}-i, --integrate${reset}    Add OpenCARL section to AGENTS.md
    ${amber}-r, --remove${reset}       Remove OpenCARL section from AGENTS.md
    ${amber}-h, --help${reset}         Show this help message

  ${yellow}Examples:${reset}
    ${dim}# Interactive setup${reset}
    npx opencarl

    ${dim}# Setup globally with AGENTS.md integration${reset}
    npx opencarl --global --integrate

    ${dim}# Setup for current project only${reset}
    npx opencarl --local

    ${dim}# Just add/remove AGENTS.md section${reset}
    npx opencarl --integrate
    npx opencarl --remove

  ${yellow}What gets installed:${reset}
    .opencode/commands/carl/   - Slash commands (/carl list, /carl view, etc.)
    .opencode/skills/carl-*/   - Domain management helpers
    .opencarl/                 - Your rule configuration (if not exists)
    AGENTS.md                  - OpenCARL integration section (optional)
`);
  process.exit(0);
}

/**
 * Recursively copy directory
 */
function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Add CARL section to AGENTS.md
 */
function integrateAgentsMd(agentsPath) {
  console.log(`\n  ${cyan}Integrating with AGENTS.md...${reset}`);
  console.log(`  ${dim}Checking: ${agentsPath}${reset}`);

  let content = '';
  let fileExists = fs.existsSync(agentsPath);

  if (fileExists) {
    content = fs.readFileSync(agentsPath, 'utf8');

    // Check if CARL section already exists
    if (content.includes('<!-- CARL-START')) {
      console.log(`  ${yellow}OpenCARL section already exists in AGENTS.md${reset}`);
      return false;
    }
    console.log(`  ${dim}Existing AGENTS.md found, adding OpenCARL section${reset}`);
  } else {
    console.log(`  ${dim}Creating AGENTS.md with OpenCARL section${reset}`);
    content = `# Project Instructions\n\n`;
    fs.writeFileSync(agentsPath, content);
  }

  // Append CARL section
  const updatedContent = content.trimEnd() + '\n\n' + CARL_AGENTS_SECTION + '\n';
  fs.writeFileSync(agentsPath, updatedContent);

  return true;
}

/**
 * Remove CARL section from AGENTS.md
 */
function removeAgentsIntegration(agentsPath) {
  console.log(`\n  ${cyan}Removing OpenCARL integration from AGENTS.md...${reset}`);

  if (!fs.existsSync(agentsPath)) {
    console.log(`  ${yellow}AGENTS.md not found${reset}`);
    return false;
  }

  let content = fs.readFileSync(agentsPath, 'utf8');

  // Check if CARL section exists
  if (!content.includes('<!-- CARL-START')) {
    console.log(`  ${yellow}No OpenCARL section found in AGENTS.md${reset}`);
    return false;
  }

  // Remove CARL section (including markers and content between them)
  const pattern = /<!-- CARL-START - DO NOT EDIT -->[\s\S]*?<!-- CARL-END - DO NOT EDIT -->/;
  const updatedContent = content.replace(pattern, '').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';

  fs.writeFileSync(agentsPath, updatedContent);
  console.log(`  ${green}✓${reset} Removed OpenCARL section from AGENTS.md`);
  return true;
}

/**
 * Check opencode.json for plugin configuration
 */
function checkOpencodeJson(isGlobal, opencodeDir) {
  const opencodeJsonPath = isGlobal
    ? path.join(opencodeDir, 'opencode.json')
    : path.join(process.cwd(), 'opencode.json');

  console.log(`\n  ${cyan}Checking opencode.json configuration...${reset}`);

  if (!fs.existsSync(opencodeJsonPath)) {
    console.log(`  ${yellow}opencode.json not found at: ${opencodeJsonPath}${reset}`);
    console.log(`  ${dim}Create it with:${reset}`);
    console.log(`  ${dim}{\n    "plugin": ["opencarl"]\n  }${reset}`);
    return false;
  }

  try {
    const config = JSON.parse(fs.readFileSync(opencodeJsonPath, 'utf8'));

    if (config.plugin && Array.isArray(config.plugin)) {
      const hasCarl = config.plugin.some(p =>
        p === 'opencarl' ||
        p.includes('opencarl')
      );

      if (hasCarl) {
        console.log(`  ${green}✓${reset} Plugin found in opencode.json`);
        return true;
      }
    }

    console.log(`  ${yellow}Plugin not found in opencode.json${reset}`);
    console.log(`  ${dim}Add to your opencode.json:${reset}`);
    console.log(`  ${dim}{\n    "plugin": ["opencarl"]\n  }${reset}`);
    return false;
  } catch (e) {
    console.log(`  ${yellow}Could not parse opencode.json${reset}`);
    return false;
  }
}

/**
 * Main installation function
 */
function install(isGlobal, doIntegrate = false) {
  const src = path.join(__dirname, '..');

  const opencodeDir = isGlobal
    ? path.join(os.homedir(), '.opencode')
    : path.join(process.cwd(), '.opencode');

  const opencarlDir = isGlobal
    ? path.join(os.homedir(), '.opencarl')
    : path.join(process.cwd(), '.opencarl');

  const agentsPath = isGlobal
    ? path.join(os.homedir(), 'AGENTS.md')
    : path.join(process.cwd(), 'AGENTS.md');

  const opencodeLabel = opencodeDir.replace(os.homedir(), '~');
  const opencarlLabel = opencarlDir.replace(os.homedir(), '~');

  console.log(`  Installing to ${amber}${opencodeLabel}${reset} and ${amber}${opencarlLabel}${reset}\n`);

  // 1. Copy commands
  const commandsDir = path.join(opencodeDir, 'commands');
  fs.mkdirSync(commandsDir, { recursive: true });
  
  // Copy opencarl subdirectory commands
  const commandsSrc = path.join(src, 'resources', 'commands', 'opencarl');
  const commandsDest = path.join(commandsDir, 'opencarl');
  copyDir(commandsSrc, commandsDest);
  console.log(`  ${green}✓${reset} Installed commands/opencarl`);
  
  // Copy top-level command files (e.g., opencarl-setup.md)
  const commandsRoot = path.join(src, 'resources', 'commands');
  const topLevelCommands = fs.readdirSync(commandsRoot, { withFileTypes: true })
    .filter(e => e.isFile() && e.name.endsWith('.md'));
  for (const cmd of topLevelCommands) {
    const cmdSrc = path.join(commandsRoot, cmd.name);
    const cmdDest = path.join(commandsDir, cmd.name);
    fs.copyFileSync(cmdSrc, cmdDest);
  }
  if (topLevelCommands.length > 0) {
    console.log(`  ${green}✓${reset} Installed ${topLevelCommands.length} top-level command(s)`);
  }

  // 2. Copy skills
  const skillsDir = path.join(opencodeDir, 'skills');
  fs.mkdirSync(skillsDir, { recursive: true });
  const skillsSrc = path.join(src, 'resources', 'skills');
  if (fs.existsSync(skillsSrc)) {
    const skillFolders = fs.readdirSync(skillsSrc, { withFileTypes: true })
      .filter(d => d.isDirectory());
    for (const folder of skillFolders) {
      copyDir(path.join(skillsSrc, folder.name), path.join(skillsDir, folder.name));
    }
    console.log(`  ${green}✓${reset} Installed skills`);
  }

  // 3. Copy .opencarl-template to .opencarl (if not exists)
  const opencarlTemplateSrc = path.join(src, '.opencarl-template');
  if (!fs.existsSync(opencarlDir)) {
    copyDir(opencarlTemplateSrc, opencarlDir);
    console.log(`  ${green}✓${reset} Created ${opencarlLabel}`);
  } else {
    console.log(`  ${dim}${opencarlLabel} already exists, skipping${reset}`);
  }

  // 4. Check opencode.json
  checkOpencodeJson(isGlobal, opencodeDir);

  // 5. Integrate with AGENTS.md (if requested)
  if (doIntegrate) {
    if (integrateAgentsMd(agentsPath)) {
      console.log(`  ${green}✓${reset} Added CARL section to AGENTS.md`);
    }
  }

  console.log(`
  ${green}Done!${reset} OpenCARL is installed.

  ${amber}Next steps:${reset}
    1. ${dim}Ensure opencarl is in your opencode.json${reset}
    2. ${dim}Restart OpenCode if needed${reset}
    3. ${dim}Type *opencarl for interactive help${reset}

  ${amber}Quick start:${reset}
    ${dim}*opencarl${reset}          - Interactive help
    ${dim}/carl list${reset}     - Show all domains
    ${dim}/carl view DOMAIN${reset} - View domain rules

  ${amber}Optional:${reset}
    ${dim}npx opencarl --integrate${reset} - Add OpenCARL to AGENTS.md
`);
}

/**
 * Handle --integrate flag only (no full install)
 */
function integrateOnly(isGlobal) {
  const agentsPath = isGlobal
    ? path.join(os.homedir(), 'AGENTS.md')
    : path.join(process.cwd(), 'AGENTS.md');

  if (integrateAgentsMd(agentsPath)) {
    console.log(`  ${green}✓${reset} Added CARL section to AGENTS.md\n`);
  }
}

/**
 * Handle --remove flag
 */
function removeOnly(isGlobal) {
  const agentsPath = isGlobal
    ? path.join(os.homedir(), 'AGENTS.md')
    : path.join(process.cwd(), 'AGENTS.md');

  removeAgentsIntegration(agentsPath);
}

/**
 * Prompt for install location
 */
function promptLocation() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const globalLabel = path.join(os.homedir(), '.opencode').replace(os.homedir(), '~');

  console.log(`  ${yellow}Where would you like to install?${reset}

  ${amber}1${reset}) Global ${dim}(${globalLabel} + ~/.opencarl)${reset} - available in all projects
  ${amber}2${reset}) Local  ${dim}(./.opencode + ./.opencarl)${reset} - this project only
`);

  rl.question(`  Choice ${dim}[1]${reset}: `, (answer) => {
    rl.close();
    const choice = answer.trim() || '1';
    const isGlobal = choice !== '2';

    // Ask about AGENTS.md
    const rl2 = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log(`
  ${yellow}Add CARL section to AGENTS.md?${reset}
  ${dim}This documents how CARL works with OpenCode.${reset}

  ${amber}1${reset}) Yes ${dim}(recommended)${reset}
  ${amber}2${reset}) No, skip for now
`);

    rl2.question(`  Choice ${dim}[1]${reset}: `, (answer2) => {
      rl2.close();
      const doIntegrate = (answer2.trim() || '1') !== '2';
      install(isGlobal, doIntegrate);
    });
  });
}

// Main logic
if (hasGlobal && hasLocal) {
  console.error(`  ${yellow}Cannot specify both --global and --local${reset}`);
  process.exit(1);
}

const isGlobal = hasGlobal || (!hasLocal);

// Handle --remove flag
if (hasRemove) {
  removeOnly(isGlobal);
  process.exit(0);
}

// Handle --integrate only (no other flags)
if (hasIntegrate && !hasGlobal && !hasLocal && args.length === 1) {
  // Prompt for location
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`  ${yellow}Where is your AGENTS.md?${reset}

  ${amber}1${reset}) Global ${dim}(~/AGENTS.md)${reset}
  ${amber}2${reset}) Local  ${dim}(./AGENTS.md)${reset}
`);

  rl.question(`  Choice ${dim}[1]${reset}: `, (answer) => {
    rl.close();
    const choice = answer.trim() || '1';
    integrateOnly(choice !== '2');
  });
} else if (hasGlobal || hasLocal) {
  // Direct install with flags
  install(isGlobal, hasIntegrate);
} else {
  // Interactive mode
  promptLocation();
}
