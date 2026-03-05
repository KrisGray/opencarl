# Architecture Patterns

**Domain:** OpenCARL Plugin for OpenCode
**Researched:** 2026-03-05
**Mode:** Ecosystem (Migration Focus)

## Executive Summary

**OpenCARL does NOT require any architectural changes beyond renaming.** The OpenCode ecosystem does not have special patterns for "Open" prefixed plugins. This is a pure rebranding exercise.

**Key finding:** The "Open" in OpenCARL is a branding choice, not an OpenCode architectural pattern. All OpenCode plugins use the `opencode-<feature>` naming convention, not `<feature>-opencode` or `<feature>-open`.

## Recommended Architecture for OpenCARL

**No changes to current architecture.** Preserve the existing CARL architecture exactly, only renaming references.

### Current Architecture (CARL)

```
src/
├── carl/                    # Core plugin logic (→ src/opencarl/)
│   ├── command-parity.ts    # Command handling (*carl → *opencarl)
│   ├── context-brackets.ts  # Token-based context awareness
│   ├── debug.ts             # Debug logging (CARL_DEBUG → OPENCARL_DEBUG)
│   ├── duplicate-detector.ts
│   ├── errors.ts
│   ├── help-text.ts
│   ├── injector.ts          # Rule injection pipeline
│   ├── loader.ts            # Rule file loading (.carl/ → .opencarl/)
│   ├── matcher.ts           # Keyword matching
│   ├── rule-cache.ts
│   ├── session-overrides.ts
│   ├── setup.ts
│   ├── signal-store.ts
│   ├── types.ts
│   └── validate.ts
├── integration/             # OpenCode integration layer
│   ├── agents-writer.ts
│   ├── opencode-config.ts
│   ├── paths.ts
│   └── plugin-hooks.ts      # Hook registration (OpenCode events)
└── plugin.ts                # Main plugin export
```

### Migrated Architecture (OpenCARL)

```
src/
├── opencarl/                # Core plugin logic (renamed from carl/)
│   ├── command-parity.ts    # *opencarl command handling
│   ├── context-brackets.ts  # Token-based context awareness
│   ├── debug.ts             # OPENCARL_DEBUG env var
│   ├── duplicate-detector.ts
│   ├── errors.ts
│   ├── help-text.ts
│   ├── injector.ts          # Rule injection pipeline
│   ├── loader.ts            # .opencarl/ directory handling
│   ├── matcher.ts           # Keyword matching
│   ├── rule-cache.ts
│   ├── session-overrides.ts
│   ├── setup.ts
│   ├── signal-store.ts
│   ├── types.ts
│   └── validate.ts
├── integration/             # OpenCode integration layer (unchanged)
│   ├── agents-writer.ts
│   ├── opencode-config.ts
│   ├── paths.ts
│   └── plugin-hooks.ts
└── plugin.ts                # Main plugin export
```

## OpenCode Plugin Naming Patterns

### Observed Patterns in Ecosystem

| Plugin | Package Name | Pattern |
|--------|--------------|---------|
| Helicone Session | `opencode-helicone-session` | `opencode-<feature>` |
| Wakatime | `opencode-wakatime` | `opencode-<feature>` |
| Daytona | `opencode-daytona` | `opencode-<feature>` |
| Type Inject | `opencode-type-inject` | `opencode-<feature>` |
| Dynamic Context Pruning | `opencode-dynamic-context-pruning` | `opencode-<feature>` |
| Workspace | `opencode-workspace` | `opencode-<feature>` |
| Background Agents | `opencode-background-agents` | `opencode-<feature>` |

**Pattern:** `opencode-<feature>` is the standard convention.

### Package Metadata Pattern

From `opencode-helicone-session/package.json`:

```json
{
  "name": "opencode-helicone-session",
  "description": "OpenCode plugin for Helicone session tracking",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "peerDependencies": {
    "@opencode-ai/plugin": ">=0.15.0"
  },
  "keywords": [
    "opencode",
    "helicone",
    "session",
    "plugin"
  ]
}
```

### OpenCARL Package Metadata (Current)

```json
{
  "name": "@krisgray/opencarl",
  "description": "OpenCARL - Dynamic rule injection for OpenCode",
  "main": "dist/plugin.js",
  "types": "dist/plugin.d.ts",
  "peerDependencies": {
    "@opencode-ai/plugin": "^1.2.0"
  }
}
```

**Status:** ✅ **Already correct.** Using scoped package `@krisgray/opencarl` is appropriate and aligns with OpenCode ecosystem.

## Component Boundaries

### Core Modules (src/opencarl/)

| Module | Responsibility | Communicates With |
|--------|----------------|------------------|
| `loader.ts` | Load rule files from `.opencarl/` | `matcher.ts`, `injector.ts` |
| `matcher.ts` | Match keywords to domains | `loader.ts`, `signal-store.ts` |
| `injector.ts` | Build injection strings | `matcher.ts`, `context-brackets.ts` |
| `debug.ts` | Debug logging (OPENCARL_DEBUG) | All modules |
| `setup.ts` | Initialize `.opencarl/` directories | File system, CLI commands |
| `command-parity.ts` | Handle `*opencarl` star-commands | `injector.ts`, `help-text.ts` |
| `context-brackets.ts` | Token-based context awareness | `injector.ts` |
| `rule-cache.ts` | Cache loaded rules per session | All modules |

### Integration Layer (src/integration/)

| Module | Responsibility | Communicates With |
|--------|----------------|------------------|
| `plugin-hooks.ts` | Register OpenCode hooks | Core modules (`opencarl/`) |
| `opencode-config.ts` | Write `opencode.json` instructions | `setup.ts`, file system |
| `agents-writer.ts` | Write `AGENTS.md` instructions | File system |
| `paths.ts` | Resolve `.opencarl/` directory paths | File system, environment |

### Data Flow

```
User Prompt → plugin-hooks.ts
                ↓
            signal-store.ts (record signals)
                ↓
            rule-cache.ts (get cached rules)
                ↓
            loader.ts (load rule files)
                ↓
            matcher.ts (match keywords)
                ↓
            context-brackets.ts (compute context)
                ↓
            injector.ts (build injection)
                ↓
            OpenCode session
```

## Patterns to Follow

### Pattern 1: Plugin Hook Registration

**What:** OpenCode plugins register hooks via the `@opencode-ai/plugin` SDK.

**When:** Required for all OpenCode plugins.

**Example (current, no changes needed):**

```typescript
// src/plugin.ts
import { createCarlPluginHooks } from "./integration/plugin-hooks";

export default {
  hooks: createCarlPluginHooks(),
};

// src/integration/plugin-hooks.ts
export function createCarlPluginHooks(): Hooks {
  return {
    "chat.message": async (input, output) => { /* ... */ },
    "tool.execute.before": async (input, output) => { /* ... */ },
    "command.execute.before": async (input) => { /* ... */ },
    "experimental.chat.system.transform": async (input, output) => { /* ... */ },
  };
}
```

**Migration:** No changes needed. Keep as-is.

### Pattern 2: Environment Variable Naming

**What:** OpenCode plugins use uppercase environment variables with plugin prefix.

**Current (CARL):** `CARL_DEBUG`

**Migrated (OpenCARL):** `OPENCARL_DEBUG`

**Example:**

```typescript
// src/opencarl/debug.ts (after migration)
const isDebugEnabled = process.env.OPENCARL_DEBUG === "true";

export function debugLog(...args: unknown[]) {
  if (isDebugEnabled) {
    console.log("[opencarl]", ...args);
  }
}
```

**Migration:** Replace all `CARL_DEBUG` references with `OPENCARL_DEBUG`.

### Pattern 3: Directory Naming

**What:** OpenCode plugins use `.opencode/` for project-scoped configuration.

**Current (CARL):** `.carl/` directories

**Migrated (OpenCARL):** `.opencarl/` directories

**Example:**

```typescript
// src/integration/paths.ts (after migration)
export const OPENCARL_DIR = ".opencarl";
export const GLOBAL_OPENCARL_DIR = path.join(os.homedir(), ".opencarl");
```

**Migration:** Replace all `.carl/` references with `.opencarl/`.

### Pattern 4: Command Naming

**What:** OpenCode plugins use star-commands (`*command`) for explicit triggers.

**Current (CARL):** `*carl`

**Migrated (OpenCARL):** `*opencarl`

**Fallback:** `/opencarl` (for shell compatibility)

**Example:**

```typescript
// src/opencarl/command-parity.ts (after migration)
export function resolveCarlCommandSignals({
  promptText,
  commandOverrides,
  commandsPayload,
  getHelpGuidance,
}: {
  promptText: string;
  commandOverrides: string[];
  commandsPayload: CarlRuleDomainPayload;
  getHelpGuidance: () => string;
}) {
  // Check for *opencarl trigger
  const hasStarCommand = commandOverrides.includes("opencarl");

  // Check for /opencarl fallback
  const hasSlashCommand = promptText.includes("/opencarl");

  // ... logic unchanged
}
```

**Migration:** Replace `*carl` with `*opencarl`, add `/opencarl` fallback.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Changing Module Structure

**What:** Restructuring `src/carl/` into a different organization.

**Why bad:** Unnecessary risk, creates diff noise, breaks existing test infrastructure.

**Instead:** Keep module structure exactly the same, only rename `src/carl/` to `src/opencarl/`.

### Anti-Pattern 2: Over-Engineering "Open" Patterns

**What:** Assuming "Open" prefix requires special treatment (e.g., `open-*` commands, `OPEN_*` env vars).

**Why bad:** No basis in OpenCode ecosystem. "Open" is just part of the name.

**Instead:** Use standard patterns: `*opencarl` command, `OPENCARL_DEBUG` env var, `.opencarl/` directory.

### Anti-Pattern 3: Breaking Backwards Compatibility Unnecessarily

**What:** Immediately removing `.carl/` support without transition period.

**Why bad:** Users may have existing `.carl/` directories.

**Instead:** Support both `.carl/` and `.opencarl/` during transition, deprecate `.carl/` in future version.

## Scalability Considerations

**Not applicable for v1.3 rebranding milestone.** This is a pure refactoring, no performance or scalability changes.

## Module Organization Comparison

### Current (CARL) vs Migrated (OpenCARL)

| Aspect | CARL | OpenCARL | Change |
|--------|------|----------|--------|
| Package name | `@krisgray/opencarl` (already correct) | `@krisgray/opencarl` | ✅ None |
| Source directory | `src/carl/` | `src/opencarl/` | Rename only |
| Config directory | `.carl/` | `.opencarl/` | Rename only |
| Star command | `*carl` | `*opencarl` | Rename only |
| Slash command | `/carl` | `/opencarl` | Rename only |
| Debug env var | `CARL_DEBUG` | `OPENCARL_DEBUG` | Rename only |
| Log prefix | `[carl]` | `[opencarl]` | Rename only |
| Documentation | `CARL-DOCS.md` | `OPENCARL-DOCS.md` | Rename only |
| Module structure | 15 modules in `carl/` | 15 modules in `opencarl/` | ✅ None |
| Hook registration | `createCarlPluginHooks()` | `createCarlPluginHooks()` | ✅ None |
| Integration layer | `integration/` | `integration/` | ✅ None |

## Migration Checklist

### File Structure
- [ ] Rename `src/carl/` → `src/opencarl/`
- [ ] No changes to module organization
- [ ] No changes to integration layer (`src/integration/`)

### Code References
- [ ] Update all imports: `../carl/` → `../opencarl/`
- [ ] Update directory constants: `.carl/` → `.opencarl/`
- [ ] Update env var checks: `CARL_DEBUG` → `OPENCARL_DEBUG`
- [ ] Update log prefixes: `[carl]` → `[opencarl]`
- [ ] Update command strings: `"carl"` → `"opencarl"`
- [ ] Update help text references

### Documentation
- [ ] Rename `CARL-DOCS.md` → `OPENCARL-DOCS.md`
- [ ] Update README references
- [ ] Update INSTALL.md references
- [ ] Update TROUBLESHOOTING.md references

### Tests
- [ ] Update all test file names and paths
- [ ] Update test fixtures (`.carl-template` → `.opencarl-template`)
- [ ] Update test assertions for log output
- [ ] Update command string assertions

### Package Metadata
- [ ] ✅ Already using `@krisgray/opencarl`
- [ ] Update description text
- [ ] Update keywords

## Sources

- [OpenCode Plugin Documentation](https://opencode.ai/docs/plugins/) - Official plugin architecture (HIGH confidence)
- [OpenCode Ecosystem](https://opencode.ai/docs/ecosystem/) - List of all plugins, naming patterns (HIGH confidence)
- [opencode-helicone-session package.json](https://raw.githubusercontent.com/H2Shami/opencode-helicone-session/main/package.json) - Example plugin structure (MEDIUM confidence)
- [OCX Plugin Architecture](https://deepwiki.com/kdcokenny/ocx/6.1-plugin-architecture) - Advanced plugin patterns (MEDIUM confidence)
