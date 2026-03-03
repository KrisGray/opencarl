# Phase 5: OpenCode Rules Integration & Distribution - Research

**Researched:** 2026-03-03
**Domain:** OpenCode plugin distribution, AGENTS.md integration, npm packaging
**Confidence:** HIGH

## Summary

Phase 5 requires implementing two distinct capabilities: (1) writing CARL documentation to project AGENTS.md files with reversible integration via HTML comment markers, and (2) packaging CARL as an npm plugin for OpenCode with proper distribution via @krisgray/opencode-carl-plugin. Research confirms OpenCode has mature plugin infrastructure with npm support, AGENTS.md is the standard for project-scoped instructions, and the integration approach is straightforward. The main complexity is creating two separate package.json configurations—one for Claude Code (carl-core) and one for OpenCode (opencode-carl-plugin).

**Primary recommendation:** Implement AGENTS.md integration using HTML comment markers for reversible section management, create separate npm package for OpenCode with pre-built dist/plugin.js, and extend setup.ts with --integrate/--remove flags.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Write full CARL documentation to AGENTS.md (parity with existing Claude Code CARL integration)
- Do NOT modify opencode.json instructions field
- Research required: Examine existing Claude Code CARL integration approach and match it for OpenCode
- Include same sections/structure as Claude Code setup
- Add `--integrate` flag to setup command (e.g., `setup --integrate`)
- User must explicitly request integration (opt-in, not automatic)
- If AGENTS.md exists, append CARL section to end (preserve existing content)
- Provide `--remove` flag to remove CARL integration from AGENTS.md (undo mechanism)
- Use HTML comment markers to identify CARL section:
  - Start marker: `<!-- CARL-START -->`
  - End marker: `<!-- CARL-END -->`
  - These markers enable reliable section identification and removal
- Package name: `@krisgray/opencode-carl-plugin` (personal scope)
- Include pre-built JavaScript in dist/ (users load dist/plugin.js directly)
- Manual npm update only — no auto-checking from CARL
- Use semver versioning (major.minor.patch)
- Communicate breaking changes via CHANGELOG + semver major version bump
- Manual publish via `npm publish` (no CI/CD automation required)
- Users responsible for discovering and installing updates via standard npm workflow

### OpenCode's Discretion
- Exact format/structure of AGENTS.md CARL section (researcher to examine Claude Code setup)
- Which npm package files to include beyond core requirements
- README content and documentation structure for npm package

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INST-03 | Setup flow updates `opencode.json` and/or `AGENTS.md` with CARL integration when requested | AGENTS.md integration via --integrate flag; opencode.json NOT modified per user decision |
| INST-05 | Plugin can be distributed via npm and loaded from `opencode.json` plugin list | npm packaging with @krisgray/opencode-carl-plugin; OpenCode auto-installs npm plugins |
| INTE-01 | Update `AGENTS.md` with CARL usage guidance (project scope) | AGENTS.md integration implementation; HTML comment markers for reversible sections |
| INTE-02 | Update `opencode.json` `instructions` to include CARL docs when requested | **NOT IMPLEMENTED** per user decision - using AGENTS.md only |
| INTE-03 | Document precedence between CARL rules and OpenCode rules/instructions | AGENTS.md section documents CARL vs OpenCode rule interaction |

</phase_requirements>

## Standard Stack

### Core

| Library/Tool | Version | Purpose | Why Standard |
|--------------|---------|---------|--------------|
| @opencode-ai/plugin | 1.2.15 | TypeScript types for OpenCode plugins | Official SDK for type-safe plugin development |
| npm | latest | Package distribution | Standard registry for JavaScript packages |
| semver | - | Version management | Industry standard for versioning (already in use) |

### Supporting

| Library/Tool | Version | Purpose | When to Use |
|--------------|---------|---------|-------------|
| fs-extra | - | File system operations | For AGENTS.md read/write operations |
| TypeScript | ^4.0+ | Plugin compilation | Build dist/plugin.js from src/ |

### Build Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| tsc | TypeScript compilation | Compile src/ → dist/ |
| npm publish | Package distribution | Manual publish workflow |

**Installation:**
```bash
# For plugin development
npm install --save-dev @opencode-ai/plugin typescript

# For package users
npm install @krisgray/opencode-carl-plugin
```

## Architecture Patterns

### Recommended Package Structure

```
carl/
├── package.json              # OpenCode plugin package config
├── package.claude.json       # Claude Code package config (rename strategy)
├── dist/
│   └── plugin.js             # Pre-built plugin entry (users load this)
├── src/
│   ├── carl/
│   │   ├── setup.ts          # EXTEND: add integrate/remove functions
│   │   └── ...
│   └── integration/
│       ├── agents-writer.ts  # NEW: AGENTS.md integration logic
│       └── plugin-hooks.ts   # EXISTING: OpenCode plugin hooks
├── resources/
│   ├── docs/
│   │   └── CARL-DOCS.md      # Source for AGENTS.md section
│   └── ...
├── .carl-template/           # Bundled in npm package
└── README.md                 # npm package README
```

### Pattern 1: Dual Package Configuration

**What:** Maintain separate package.json for OpenCode vs Claude Code distribution
**When to use:** When serving two different ecosystems with different requirements

**Example:**
```json
// package.json (OpenCode)
{
  "name": "@krisgray/opencode-carl-plugin",
  "version": "1.0.0",
  "main": "dist/plugin.js",
  "files": [
    "dist/",
    ".carl-template/",
    "resources/",
    "README.md",
    "LICENSE"
  ],
  "keywords": ["opencode", "opencode-plugin", "carl", "rules"],
  "peerDependencies": {
    "@opencode-ai/plugin": "^1.2.0"
  }
}

// package.claude.json (Claude Code - rename before publish)
{
  "name": "carl-core",
  "version": "1.0.8",
  "bin": { "carl-core": "bin/install.js" },
  "files": ["bin", "hooks", "resources", ".carl-template"]
}
```

**Source:** OpenCode plugin documentation + existing package.json structure

### Pattern 2: AGENTS.md Integration with Markers

**What:** Use HTML comments to mark CARL section for reliable add/remove
**When to use:** When appending to user-managed files with reversibility requirement

**Example:**
```typescript
// src/integration/agents-writer.ts

export async function integrateCarl(agentsPath: string, carlDocsPath: string): Promise<void> {
  const marker = {
    start: '<!-- CARL-START -->',
    end: '<!-- CARL-END -->'
  };
  
  const carlDocs = await fs.readFile(carlDocsPath, 'utf-8');
  const carlSection = `\n\n${marker.start}\n${carlDocs}\n${marker.end}\n`;
  
  let agentsContent = '';
  try {
    agentsContent = await fs.readFile(agentsPath, 'utf-8');
    
    // Check if already integrated
    if (agentsContent.includes(marker.start)) {
      console.log('[carl] AGENTS.md already contains CARL integration');
      return;
    }
  } catch (err) {
    // File doesn't exist - will create
  }
  
  await fs.writeFile(agentsPath, agentsContent + carlSection, 'utf-8');
  console.log('[carl] CARL integration added to AGENTS.md');
}

export async function removeCarlIntegration(agentsPath: string): Promise<void> {
  const marker = {
    start: '<!-- CARL-START -->',
    end: '<!-- CARL-END -->'
  };
  
  let agentsContent: string;
  try {
    agentsContent = await fs.readFile(agentsPath, 'utf-8');
  } catch (err) {
    console.log('[carl] AGENTS.md not found - nothing to remove');
    return;
  }
  
  const startIndex = agentsContent.indexOf(marker.start);
  const endIndex = agentsContent.indexOf(marker.end);
  
  if (startIndex === -1 || endIndex === -1) {
    console.log('[carl] No CARL integration found in AGENTS.md');
    return;
  }
  
  // Remove CARL section (including markers and surrounding whitespace)
  const before = agentsContent.substring(0, startIndex).trimEnd();
  const after = agentsContent.substring(endIndex + marker.end.length).trimStart();
  
  const newContent = before + (before && after ? '\n\n' : '') + after;
  await fs.writeFile(agentsPath, newContent, 'utf-8');
  console.log('[carl] CARL integration removed from AGENTS.md');
}
```

**Source:** Common pattern for reversible file modifications

### Pattern 3: Setup Command Extension

**What:** Extend existing setup.ts with --integrate and --remove flags
**When to use:** When adding new optional functionality to existing command

**Example:**
```typescript
// src/carl/setup.ts (EXTEND)

export interface IntegrationOptions {
  integrate?: boolean;
  remove?: boolean;
  agentsPath?: string;
}

export async function runSetup(options: {
  cwd: string;
  homeDir: string;
  templateDir?: string;
  integration?: IntegrationOptions;
}): Promise<SetupResult> {
  // Existing setup logic...
  
  // NEW: Handle integration flags
  if (options.integration?.integrate) {
    const agentsPath = options.integration.agentsPath || 
                       path.join(options.cwd, 'AGENTS.md');
    const carlDocsPath = path.resolve(__dirname, '../resources/docs/CARL-DOCS.md');
    
    await integrateCarl(agentsPath, carlDocsPath);
  }
  
  if (options.integration?.remove) {
    const agentsPath = options.integration.agentsPath ||
                       path.join(options.cwd, 'AGENTS.md');
    
    await removeCarlIntegration(agentsPath);
  }
  
  return { success: true, ... };
}
```

**Source:** Existing setup.ts structure + command flag patterns

### Pattern 4: AGENTS.md Section Content

**What:** Structure for CARL documentation in AGENTS.md
**When to use:** When writing CARL guidance to project AGENTS.md

**Example:**
```markdown
<!-- CARL-START -->

# CARL - Context Augmentation & Reinforcement Layer

CARL provides dynamic rule injection for this project. Rules load automatically when relevant to your current task.

## Quick Reference

[Content from resources/docs/CARL-DOCS.md Quick Reference section]

## How CARL Works with OpenCode

1. **Rule Precedence:** CARL rules are injected alongside OpenCode's built-in rules
   - OpenCode's AGENTS.md rules load first
   - CARL's dynamic rules load based on recall keyword matches
   - Both sets of rules apply to the current session

2. **Integration Points:**
   - `*carl` - Enter CARL help mode
   - `*carl docs` - View full CARL documentation
   - `/carl` - Domain management commands
   - `.carl/` directory - Your rule definitions

3. **Best Practices:**
   - Keep CARL rules in `.carl/` directory
   - Use recall keywords for automatic loading
   - Use star-commands (`*commandname`) for explicit triggers
   - Review `.carl/manifest` for active domains

For full documentation, see `.carl/` directory or run `*carl docs`.

<!-- CARL-END -->
```

**Source:** Existing CARL-OVERVIEW.md + CARL-DOCS.md structure + OpenCode rules documentation

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File system operations | Custom file read/write logic | fs/promises | Native Node.js, handles edge cases |
| HTML comment parsing | Regex for marker detection | String indexOf/substring | Simpler, more reliable for well-defined markers |
| Package versioning | Custom version management | npm + semver | Industry standard, tooling support |
| Plugin type safety | Untyped plugin exports | @opencode-ai/plugin types | Official SDK, catches errors at compile time |

**Key insight:** OpenCode's plugin infrastructure is mature. Don't reinvent plugin loading, distribution, or hook systems—use the official patterns.

## Common Pitfalls

### Pitfall 1: Modifying Wrong Package.json

**What goes wrong:** Publishing to wrong npm registry or with wrong package name
**Why it happens:** Dual package strategy requires switching between package.json files
**How to avoid:** 
- Use clear naming: package.json (OpenCode) vs package.claude.json (Claude Code)
- Create publish scripts that verify package name before publishing
- Use npm scope (@krisgray/) for OpenCode package

**Warning signs:** Package name doesn't match expected value in npm publish output

### Pitfall 2: AGENTS.md Encoding Issues

**What goes wrong:** Corrupted AGENTS.md file after integration (BOM, encoding mismatches)
**Why it happens:** Not specifying UTF-8 encoding or handling existing file encodings
**How to avoid:**
- Always use `utf-8` encoding in fs.readFile/fs.writeFile
- Don't add BOM when writing
- Preserve existing file encoding (assume UTF-8, warn if different detected)

**Warning signs:** Strange characters at start of AGENTS.md after integration

### Pitfall 3: Marker Collision

**What goes wrong:** User has existing `<!-- CARL-START -->` comments in AGENTS.md
**Why it happens:** HTML comments are valid markdown, users might use them
**How to avoid:**
- Use unique marker format: `<!-- CARL-START - DO NOT EDIT -->`
- Check for existing markers before adding
- Warn if markers found in unexpected locations

**Warning signs:** Integration finds existing markers in non-CARL content

### Pitfall 4: dist/ Not Built Before Publish

**What goes wrong:** Publishing npm package without compiled dist/plugin.js
**Why it happens:** Forgot to run build step before npm publish
**How to avoid:**
- Add `prepublishOnly` script: `"prepublishOnly": "npm run build"`
- Verify dist/plugin.js exists in package.json `files` array
- Test package locally with `npm link` before publishing

**Warning signs:** npm publish succeeds but plugin fails to load

### Pitfall 5: Missing Peer Dependencies

**What goes wrong:** Plugin fails to load due to missing @opencode-ai/plugin
**Why it happens:** Not declaring peerDependencies correctly
**How to avoid:**
- Declare `@opencode-ai/plugin` as peerDependency, not dependency
- Specify version range: `"^1.2.0"`
- Document in README that OpenCode must be installed first

**Warning signs:** "Cannot find module '@opencode-ai/plugin'" errors

## Code Examples

### Complete agents-writer.ts Implementation

```typescript
// src/integration/agents-writer.ts
import fs from 'fs/promises';
import path from 'path';

const MARKERS = {
  start: '<!-- CARL-START - DO NOT EDIT -->',
  end: '<!-- CARL-END - DO NOT EDIT -->'
};

export async function integrateCarl(
  agentsPath: string,
  carlDocsPath: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Read CARL documentation
    const carlDocs = await fs.readFile(carlDocsPath, 'utf-8');
    const carlSection = `\n\n${MARKERS.start}\n${carlDocs}\n${MARKERS.end}\n`;
    
    // Check if AGENTS.md exists
    let existingContent = '';
    try {
      existingContent = await fs.readFile(agentsPath, 'utf-8');
      
      // Check for existing integration
      if (existingContent.includes(MARKERS.start)) {
        return {
          success: true,
          message: '[carl] AGENTS.md already contains CARL integration'
        };
      }
    } catch (err) {
      // File doesn't exist - will create new
    }
    
    // Append CARL section
    const newContent = existingContent.trimEnd() + carlSection;
    await fs.writeFile(agentsPath, newContent, 'utf-8');
    
    return {
      success: true,
      message: `[carl] CARL integration added to ${agentsPath}`
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `[carl] Integration failed: ${errorMsg}`
    };
  }
}

export async function removeCarlIntegration(
  agentsPath: string
): Promise<{ success: boolean; message: string }> {
  try {
    const content = await fs.readFile(agentsPath, 'utf-8');
    
    const startIndex = content.indexOf(MARKERS.start);
    const endIndex = content.indexOf(MARKERS.end);
    
    if (startIndex === -1 || endIndex === -1) {
      return {
        success: true,
        message: '[carl] No CARL integration found in AGENTS.md'
      };
    }
    
    // Remove CARL section
    const before = content.substring(0, startIndex).trimEnd();
    const after = content.substring(endIndex + MARKERS.end.length).trimStart();
    const newContent = before + (before && after ? '\n\n' : '') + after;
    
    await fs.writeFile(agentsPath, newContent, 'utf-8');
    
    return {
      success: true,
      message: `[carl] CARL integration removed from ${agentsPath}`
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `[carl] Removal failed: ${errorMsg}`
    };
  }
}
```

**Source:** Pattern from existing setup.ts + HTML comment marker approach

### npm Package Build Script

```json
// package.json scripts
{
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build && node scripts/verify-dist.js",
    "publish-opencode": "npm run build && npm publish --access public",
    "publish-claude": "mv package.json package.opencode.json && mv package.claude.json package.json && npm publish && mv package.json package.claude.json && mv package.opencode.json package.json"
  }
}
```

**Source:** npm publish lifecycle + dual package strategy

### OpenCode Plugin Loading

```json
// User's opencode.json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "@krisgray/opencode-carl-plugin"
  ]
}
```

**Source:** OpenCode plugin documentation

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual plugin file copying | npm package distribution | OpenCode v1.0+ | Easier installation, version management |
| CLAUDE.md only | AGENTS.md + CLAUDE.md fallback | OpenCode v1.0+ | Supports both Claude Code and OpenCode conventions |
| Local plugins only | npm + local plugins | OpenCode v1.0+ | Ecosystem sharing, dependency management |

**Deprecated/outdated:**
- `instructions` field in opencode.json for large docs: Use AGENTS.md or external files instead
- Manual plugin installation: Use npm packages for distribution

## Open Questions

1. **Should we include TypeScript source in npm package?**
   - What we know: OpenCode plugins can be JS or TS, npm packages typically include dist/ only
   - What's unclear: Whether including src/ adds value for users who want to inspect/modify
   - Recommendation: Include dist/ only in `files` array. Users can access source via GitHub if needed.

2. **How to handle breaking changes in CARL docs structure?**
   - What we know: AGENTS.md integration is reversible via --remove flag
   - What's unclear: Process for users to update AGENTS.md when CARL-DOCS.md changes
   - Recommendation: Document in README that users should run `setup --remove` then `setup --integrate` to update. Consider adding `--update-integration` flag in future.

3. **Should setup --integrate check for .carl/ directory existence?**
   - What we know: CARL requires .carl/ directory to function
   - What's unclear: Whether integration should fail if .carl/ doesn't exist
   - Recommendation: Yes - check for .carl/ before integrating. If missing, prompt user to run `setup` first or run setup automatically.

## Validation Architecture

> Nyquist validation is disabled in config (workflow.nyquist_validation not set), skipping this section.

## Sources

### Primary (HIGH confidence)
- OpenCode Plugin Documentation (https://opencode.ai/docs/plugins/) - Plugin structure, npm distribution, hooks
- OpenCode Rules Documentation (https://opencode.ai/docs/rules/) - AGENTS.md format, instruction files
- OpenCode Config Documentation (https://opencode.ai/docs/config/) - Plugin loading, instructions field
- Existing CARL codebase (src/carl/setup.ts, resources/docs/CARL-DOCS.md) - Current implementation patterns

### Secondary (MEDIUM confidence)
- npm package documentation - Standard practices for JavaScript package distribution
- Existing CARL package.json - Current Claude Code distribution approach

### Tertiary (LOW confidence)
- None - All critical information verified with primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official OpenCode SDK and npm are well-documented and stable
- Architecture: HIGH - Patterns derived from existing codebase and official documentation
- Pitfalls: HIGH - Based on common npm/plugin distribution issues with known solutions

**Research date:** 2026-03-03
**Valid until:** 2026-04-03 (30 days - OpenCode plugin API stable, npm distribution patterns long-established)
