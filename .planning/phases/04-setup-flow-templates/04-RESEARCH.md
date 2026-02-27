# Phase 4: Setup Flow & Templates - Research

**Researched:** 2026-02-27
**Domain:** Plugin lifecycle, file system operations, session state management
**Confidence:** HIGH

## Summary

This phase implements automatic setup at plugin load time, template seeding, duplicate plugin detection, and documentation access. The codebase already has patterns established in Phases 1-3 that can be extended:

- **Session warning guards** (Phase 3): `sessionWarningGuard` Set pattern for "warn once per session"
- **Rule cache with dirty flag** (Phase 3): Global cache with lazy reload
- **Path resolution** (Phase 1): `findProjectCarl()`, `findGlobalCarl()`, `findFallbackCarl()`
- **Template structure**: `.carl-template/` directory with manifest, global, commands, context, sessions, example-custom-domain

**Primary recommendation:** Extend plugin-hooks.ts with setup detection on first load, reuse the sessionWarningGuard pattern for duplicate detection, and add a `docs` command handler to command-parity.ts.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js fs | 16.7+ | File operations | fs.cp (recursive copy) available natively |
| Node.js path | built-in | Cross-platform paths | Already used throughout codebase |
| Node.js os | built-in | Home directory resolution | Already used in loader.ts |

### Existing Codebase Modules (Reuse)
| Module | Purpose | How to Use |
|--------|---------|------------|
| `src/integration/paths.ts` | Find .carl directories | `findProjectCarl()`, `findGlobalCarl()` |
| `src/carl/rule-cache.ts` | Session warning guard pattern | Extend for duplicate detection |
| `src/carl/session-overrides.ts` | Session file storage | `.carl/sessions/{session_id}.json` |
| `src/carl/help-text.ts` | Load documentation | `buildCarlHelpGuidance()` |
| `src/carl/command-parity.ts` | Command resolution | Add `docs` command handling |

**Installation:**
No new dependencies required. All functionality uses Node.js built-ins and existing modules.

## Architecture Patterns

### Pattern 1: Setup at Plugin Load (INST-02, TEMP-01)

**What:** Check for `.carl/` on first plugin hook invocation, prompt user to run setup if missing.

**When to use:** At first `experimental.chat.system.transform` hook call when no .carl/ found.

**Implementation approach:**
```typescript
// Source: Based on existing plugin-hooks.ts pattern
// In plugin-hooks.ts, add setup detection state:

let setupChecked = false;
let setupNeeded = false;
let pluginPath: string | null = null; // For duplicate detection

export function createCarlPluginHooks(): Hooks {
  return {
    "experimental.chat.system.transform": async (input, output) => {
      const sessionId = input.sessionID ?? "";
      
      // Check setup on first invocation
      if (!setupChecked) {
        setupChecked = true;
        const projectCarl = findProjectCarl(process.cwd());
        const globalCarl = findGlobalCarl(os.homedir());
        
        if (!projectCarl && !globalCarl) {
          setupNeeded = true;
          // Inject setup prompt into output.system
          output.system.push(buildSetupPrompt());
        }
      }
      // ... rest of existing logic
    },
  };
}
```

### Pattern 2: Duplicate Plugin Detection (INST-04)

**What:** Track loaded plugin paths, warn once per session if same plugin loaded from different paths.

**When to use:** When multiple CARL plugin instances are registered.

**Implementation:**
```typescript
// Source: Based on rule-cache.ts sessionWarningGuard pattern

// Track loaded plugin paths (global state)
const loadedPluginPaths = new Set<string>();

function detectDuplicateLoad(currentPath: string, sessionId: string): boolean {
  // Normalize path for comparison
  const normalized = path.resolve(currentPath).replace(/\\/g, '/');
  
  for (const existingPath of loadedPluginPaths) {
    if (existingPath !== normalized) {
      // Different path - check if we've warned this session
      if (!hasDuplicateWarning(sessionId)) {
        markDuplicateWarning(sessionId);
        return true; // Signal to emit warning
      }
    }
  }
  
  loadedPluginPaths.add(normalized);
  return false;
}

// Reuse sessionWarningGuard pattern from rule-cache.ts
const duplicateWarningGuard = new Set<string>();

function hasDuplicateWarning(sessionId: string): boolean {
  return duplicateWarningGuard.has(sessionId);
}

function markDuplicateWarning(sessionId: string): void {
  duplicateWarningGuard.add(sessionId);
}
```

### Pattern 3: Idempotent Template Seeding (TEMP-01)

**What:** Copy `.carl-template/` to `.carl/` only when target doesn't exist, skip existing files.

**When to use:** During setup flow when `.carl/` is missing or incomplete.

**Implementation:**
```typescript
// Source: Based on bin/install.js copyDir() pattern

// Use Node.js 16.7+ fs.cp for recursive copy, or fallback to manual
async function seedCarlTemplates(targetDir: string, templateDir: string): Promise<SeedResult> {
  const results: SeedResult = { copied: [], skipped: [], failed: [] };
  
  // Ensure target exists
  await fs.promises.mkdir(targetDir, { recursive: true });
  
  // Copy each template file, skip if exists
  const entries = await fs.promises.readdir(templateDir, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(templateDir, entry.name);
    const destPath = path.join(targetDir, entry.name);
    
    if (entry.isDirectory()) {
      // Recurse for directories
      const subResult = await seedCarlTemplates(destPath, srcPath);
      results.copied.push(...subResult.copied.map(p => path.join(entry.name, p)));
      results.skipped.push(...subResult.skipped.map(p => path.join(entry.name, p)));
      results.failed.push(...subResult.failed.map(p => path.join(entry.name, p)));
    } else {
      // Skip if file exists (idempotent)
      try {
        await fs.promises.access(destPath);
        results.skipped.push(entry.name);
      } catch {
        await fs.promises.copyFile(srcPath, destPath);
        results.copied.push(entry.name);
      }
    }
  }
  
  return results;
}
```

### Pattern 4: Documentation Access via Command (TEMP-02)

**What:** Add `*carl docs` command that loads bundled documentation.

**When to use:** When user types `*carl docs` or `/carl docs`.

**Implementation:**
```typescript
// Source: Based on command-parity.ts and help-text.ts patterns

// In command-parity.ts, extend CARL command handling:

// In resolveCarlCommandSignals(), for token "CARL":
if (token === "CARL") {
  // Check for "docs" subcommand in promptText
  if (promptText.toLowerCase().includes('docs')) {
    const docsContent = buildCarlDocsGuidance();
    payloadRules.push(docsContent);
  } else {
    // Existing help guidance
    const guidance = input.helpGuidance ?? input.getHelpGuidance?.() ?? "";
    if (guidance) {
      payloadRules.push(guidance);
    }
  }
}

// New function in help-text.ts:
export function buildCarlDocsGuidance(options?: { docsPath?: string }): string {
  // Load docs from bundled resources
  const docsPath = options?.docsPath ?? 
    path.resolve(process.cwd(), "resources", "docs", "CARL-DOCS.md");
  return readFileSafe(docsPath);
}
```

### Recommended Project Structure

```
src/
├── integration/
│   ├── plugin-hooks.ts      # Add setup detection, duplicate warning
│   └── paths.ts             # (existing) path resolution
├── carl/
│   ├── setup.ts             # NEW: setup flow logic
│   ├── duplicate-detector.ts # NEW: duplicate plugin detection
│   ├── help-text.ts         # Extend: add docs loading
│   ├── command-parity.ts    # Extend: add docs subcommand
│   └── ... (existing modules)
.carl-template/              # (existing) starter templates
├── manifest
├── global
├── commands
├── context
├── sessions/.gitkeep
└── example-custom-domain
resources/
└── docs/
    └── CARL-DOCS.md         # NEW: bundled documentation
```

### Anti-Patterns to Avoid

- **Don't prompt on every turn** - Check setup once, cache the result
- **Don't overwrite user files** - Template seeding must skip existing files
- **Don't warn on every turn** - Duplicate warning once per session, use guard Set
- **Don't block plugin load** - Setup prompt is injected, not blocking

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Recursive directory copy | Custom copyDir loop | fs.cp (Node 16.7+) or existing pattern | Handles symlinks, permissions, edge cases |
| Session state tracking | Per-module state | rule-cache.ts patterns | Consistent session management |
| Path resolution | Manual path joins | paths.ts functions | Handles project/global/fallback logic |
| Warning suppression | Ad-hoc flags | Set-based guard pattern | Already proven in rule-cache.ts |

**Key insight:** The codebase has established patterns for session-scoped state. Reusing these ensures consistency.

## Common Pitfalls

### Pitfall 1: Setup Loop on Partial Failure
**What goes wrong:** Setup fails partway through, user sees prompt again on next turn.
**Why it happens:** `setupChecked` is true but setup didn't complete.
**How to avoid:** Track `setupAttempted` separately from `setupChecked`, persist failure state to session file.
**Warning signs:** User reports "it keeps asking me to run setup".

### Pitfall 2: Duplicate Detection False Positives
**What goes wrong:** Same canonical path reported as duplicate (e.g., symlinks, case differences).
**Why it happens:** Path comparison without normalization.
**How to avoid:** Use `path.resolve()` and normalize slashes before comparison.
**Warning signs:** Warning appears on first load when only one plugin installed.

### Pitfall 3: Template Seeding Permission Errors
**What goes wrong:** Setup fails on read-only project directories.
**Why it happens:** No fallback to global directory.
**How to avoid:** Try project first, fall back to `~/.carl/` if not writable.
**Warning signs:** Error logs show EACCES during setup.

### Pitfall 4: Docs Not Found After Install
**What goes wrong:** `*carl docs` returns empty because path resolution is wrong.
**Why it happens:** Bundled path differs from development path.
**How to avoid:** Use `import.meta.url` or `__dirname` to resolve relative to plugin location.
**Warning signs:** Docs work in dev but not after npm install.

## Code Examples

### Setup Detection in Plugin Hook
```typescript
// Source: Extension of plugin-hooks.ts pattern
import { findProjectCarl, findGlobalCarl } from "./paths";

let setupChecked = false;
const setupNeededSessions = new Set<string>();

function buildSetupPrompt(): string {
  return `[carl] Setup Required

No .carl/ configuration found. To use CARL:

1. Run: npx carl-core
2. Or type: /carl setup

This will seed starter templates to your project or home directory.`;
}

// In experimental.chat.system.transform:
if (!setupChecked) {
  setupChecked = true;
  const hasProject = findProjectCarl(process.cwd());
  const hasGlobal = findGlobalCarl(os.homedir());
  
  if (!hasProject && !hasGlobal && !setupNeededSessions.has(sessionId)) {
    setupNeededSessions.add(sessionId);
    output.system.push(buildSetupPrompt());
  }
}
```

### Duplicate Plugin Warning
```typescript
// Source: Extension of rule-cache.ts warning guard pattern
const loadedPluginPaths = new Set<string>();
const duplicateWarningGuard = new Set<string>();

function checkDuplicatePlugin(pluginPath: string, sessionId: string): string | null {
  const normalized = path.resolve(pluginPath).replace(/\\/g, '/');
  
  for (const existing of loadedPluginPaths) {
    if (existing !== normalized && !duplicateWarningGuard.has(sessionId)) {
      duplicateWarningGuard.add(sessionId);
      return `[carl] Duplicate plugin detected

Multiple CARL plugins are loaded:
  - ${existing}
  - ${normalized}

This may cause unexpected behavior. Remove one from your opencode.json plugins array.`;
    }
  }
  
  loadedPluginPaths.add(normalized);
  return null;
}
```

### Verbose Progress Feedback
```typescript
// Source: CONTEXT.md requirement for checkmarks

function logSetupStep(step: string, success: boolean): void {
  const check = success ? '✓' : '✗';
  console.log(`  ${success ? green : red}${check}${reset} ${step}`);
}

// Usage during setup:
logSetupStep('Copying plugin...', true);
logSetupStep('Seeding templates...', true);
logSetupStep('Creating sessions directory...', true);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual CLI setup (`npx carl-core`) | Automatic setup prompt at plugin load | Phase 4 | Lower friction onboarding |
| No duplicate detection | Session-scoped warning | Phase 4 | Prevent confusing behavior |
| Docs in separate repo | Bundled docs with plugin | Phase 4 | Version-matched documentation |

**Deprecated/outdated:**
- `bin/install.js` copyDir: Consider using `fs.cp` (Node 16.7+) for cleaner code, but manual copy is fine for compatibility

## Open Questions

1. **Plugin path capture for duplicate detection**
   - What we know: Plugin is loaded via OpenCode plugin system
   - What's unclear: How to get the plugin's own path at runtime
   - Recommendation: Use `import.meta.url` in ESM or `__dirname` in CJS to get plugin location

2. **Setup prompt format**
   - What we know: Should be injected into `output.system`
   - What's unclear: Whether it needs special formatting for visibility
   - Recommendation: Use `[carl]` prefix, keep message under 500 chars

3. **Docs content structure**
   - What we know: Need layered detail (quick reference + expandable)
   - What's unclear: How to handle "expand" interaction in injected system prompt
   - Recommendation: Include quick reference first, note that full docs are at GitHub URL

## Sources

### Primary (HIGH confidence)
- `src/integration/plugin-hooks.ts` - Existing hook patterns
- `src/carl/rule-cache.ts` - Session warning guard pattern
- `src/integration/paths.ts` - Path resolution functions
- `.carl-template/` - Template structure (verified by reading)

### Secondary (MEDIUM confidence)
- `bin/install.js` - Existing setup CLI implementation (reference for setup logic)
- `src/carl/command-parity.ts` - Command resolution pattern
- `src/carl/help-text.ts` - Documentation loading pattern

### Tertiary (LOW confidence)
- Node.js fs.cp API - Requires Node 16.7+, manual copy is safer fallback

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing codebase modules and Node.js built-ins
- Architecture: HIGH - Patterns established in Phases 1-3, clear extension points
- Pitfalls: MEDIUM - Edge cases around cross-platform paths need testing

**Research date:** 2026-02-27
**Valid until:** 30 days (stable patterns, unlikely to change)
