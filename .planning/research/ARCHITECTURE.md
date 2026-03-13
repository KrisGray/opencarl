# Architecture Research: OpenCARL

**Domain:** OpenCARL Plugin for OpenCode
**Researched:** 2026-03-13 (Updated for Documentation Site)
**Mode:** Ecosystem

## Table of Contents

1. [Rebranding Architecture (v1.3)](#rebranding-architecture-v13) — Completed
2. [Documentation Site Architecture (v2.0.2)](#documentation-site-architecture-v202) — Current Milestone

---

# Rebranding Architecture (v1.3)

**Focus:** CARL to OpenCARL migration
**Researched:** 2026-03-05
**Status:** ✅ Complete

## Executive Summary (v1.3)

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

---
---

# Documentation Site Architecture (v2.0.2)

**Focus:** TypeDoc API documentation with GitHub Pages deployment  
**Researched:** 2026-03-13  
**Confidence:** HIGH

## Executive Summary

Add CI/CD-powered HTML API documentation to OpenCARL. TypeDoc generates docs from TypeScript source, deployed to GitHub Pages via `gh-pages` branch on release events.

**Key decisions:**
- Use `peaceiris/actions-gh-pages` for deployment (simpler than official `actions/deploy-pages`)
- Deploy on GitHub release only (docs match npm version)
- Orphan branch strategy (clean gh-pages history)

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     TRIGGER: GitHub Release                      │
│                    (on: release: types: [published])             │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────────┐
    │  test    │    │   e2e    │    │   publish    │
    │   job    │    │   job    │    │     job      │
    │(existing)│    │(existing)│    │  (existing)  │
    └──────────┘    └──────────┘    └──────────────┘
                          │
                          │ (all pass)
                          ▼
              ┌───────────────────────┐
              │      docs job         │
              │  ┌─────────────────┐  │
              │  │ npm run docs    │  │
              │  └────────┬────────┘  │
              │           ▼           │
              │  ┌─────────────────┐  │
              │  │   docs/         │  │
              │  │  (HTML output)  │  │
              │  └────────┬────────┘  │
              └───────────┼───────────┘
                          ▼
              ┌───────────────────────┐
              │ peaceiris/actions-    │
              │ gh-pages@v4           │
              │                       │
              │ Push docs/ → gh-pages │
              │ (orphan commit)       │
              └───────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │    GitHub Pages       │
              │  krisgray.github.io/  │
              │     opencarl/         │
              └───────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| TypeDoc | Generate HTML API docs from TypeScript source | `typedoc` npm package |
| typedoc.json | TypeDoc configuration (entry points, output) | JSON config file |
| npm script `docs` | Run TypeDoc with project config | `package.json` scripts |
| docs job | Build docs and deploy to gh-pages | GitHub Actions workflow |
| gh-pages branch | Host static documentation site | Git branch (orphan) |
| GitHub Pages | Serve documentation publicly | GitHub infrastructure |

## Recommended Project Structure

```
opencarl/
├── .github/
│   └── workflows/
│       ├── publish.yml      # MODIFIED: add docs job
│       ├── test.yml         # UNCHANGED
│       └── e2e-tests.yml    # UNCHANGED
├── src/
│   └── opencarl/            # UNCHANGED: TypeScript source
│       ├── plugin.ts        # Main entry point
│       ├── types.ts         # Type definitions
│       └── ...
├── docs/                    # NEW: TypeDoc output (gitignored)
│   ├── index.html
│   ├── modules/
│   └── assets/
├── typedoc.json             # NEW: TypeDoc configuration
├── package.json             # MODIFIED: add docs script
├── tsconfig.build.json      # UNCHANGED: build config
└── .gitignore               # MODIFIED: add docs/
```

### Structure Rationale

- **docs/ output directory**: Standard TypeDoc output location, gitignored (generated, not source)
- **typedoc.json**: Dedicated config file for clear separation from build config
- **Integration in publish.yml**: Docs deploy on release, ensuring docs match published npm version

## Architectural Patterns

### Pattern 1: Release-Triggered Documentation

**What:** Documentation builds and deploys only on GitHub release events.
**When:** For npm packages where docs should match published versions.
**Trade-offs:** 
- (+) Docs always match released code
- (+) No unnecessary CI runs on every PR
- (-) No preview docs for unreleased changes

**Implementation:**
```yaml
# .github/workflows/publish.yml (docs job addition)
docs:
  needs: [test, e2e]
  runs-on: ubuntu-latest
  permissions:
    contents: write
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - run: npm run docs
    - uses: peaceiris/actions-gh-pages@v4
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./docs
        force_orphan: true
```

### Pattern 2: Orphan Branch Strategy

**What:** gh-pages branch contains only docs output, no history from main.
**When:** Always for documentation sites.
**Trade-offs:**
- (+) Clean gh-pages history (single commit per deploy)
- (+) Small branch size
- (-) Cannot see docs history

**Implementation:**
```yaml
# In peaceiris/actions-gh-pages
force_orphan: true  # Creates orphan branch with single commit
```

### Pattern 3: TypeScript Entry Point Discovery

**What:** TypeDoc discovers exports from package.json `main`/`exports` fields.
**When:** For npm packages with clear entry points.
**Trade-offs:**
- (+) Single source of truth for entry points
- (+) Docs match what npm publishes
- (-) Requires proper package.json exports

**Configuration:**
```json
// typedoc.json
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": ["./src/opencarl/plugin.ts"],
  "out": "docs",
  "name": "OpenCARL API Documentation",
  "readme": "./README.md",
  "githubPages": true,
  "excludePrivate": true,
  "excludeInternal": true,
  "tsconfig": "./tsconfig.build.json"
}
```

## Data Flow

### Documentation Build Flow

```
GitHub Release Event
        │
        ▼
┌───────────────────┐
│ npm ci            │  Install dependencies
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ npm run docs      │  TypeDoc reads:
│                   │  - typedoc.json
│                   │  - tsconfig.build.json
│                   │  - src/opencarl/**/*.ts
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ docs/             │  Generated HTML:
│ ├── index.html    │  - Module list
│ ├── modules/      │  - API reference
│ │   └── *.html    │  - Type definitions
│ └── assets/       │  - Search index
│     ├── style.css │
│     └── main.js   │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ peaceiris/        │  Push to gh-pages:
│ actions-gh-pages  │  - Force orphan commit
│                   │  - Single commit per deploy
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ GitHub Pages      │  Serves at:
│                   │  https://krisgray.github.io/opencarl/
└───────────────────┘
```

### Build Order in CI

```
1. test job (existing)      ─┐
2. e2e job (existing)       ─┼─► all must pass
3. publish job (existing)   ─┤
4. docs job (NEW)           ─┘
```

**Important:** The docs job runs in parallel with publish job but depends on test+e2e passing. If docs fails, npm publish still succeeds (non-blocking).

## Integration Points

### With Existing CI

| Integration Point | Current State | Change Required |
|-------------------|---------------|-----------------|
| `publish.yml` | Triggers on release | Add `docs` job |
| `package.json` | Has `build`, `test` scripts | Add `docs` script |
| `.gitignore` | Ignores `dist/`, `coverage/` | Add `docs/` |
| `tsconfig.build.json` | TypeScript build config | Reference from typedoc.json |

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| GitHub Pages | `peaceiris/actions-gh-pages` | Requires `contents: write` permission |
| npm registry | `npm publish` (existing) | Unchanged, independent of docs |

### New Files vs Modified Files

| File | Action | Purpose |
|------|--------|---------|
| `typedoc.json` | **NEW** | TypeDoc configuration |
| `.github/workflows/publish.yml` | **MODIFY** | Add docs job |
| `package.json` | **MODIFY** | Add `docs` script, typedoc devDependency |
| `.gitignore` | **MODIFY** | Add `docs/` directory |
| `docs/` | **NEW (gitignored)** | TypeDoc output |

## Implementation Details

### typedoc.json Configuration

```json
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": ["./src/opencarl/plugin.ts"],
  "out": "docs",
  "name": "OpenCARL API Documentation",
  "readme": "./README.md",
  "githubPages": true,
  "excludePrivate": true,
  "excludeInternal": true,
  "excludeNotDocumented": false,
  "includeVersion": true,
  "tsconfig": "./tsconfig.build.json",
  "cleanOutputDir": true,
  "sort": ["source-order"],
  "navigation": {
    "includeCategories": true,
    "includeGroups": true
  }
}
```

**Key options explained:**
- `entryPoints`: Single entry at `plugin.ts` (main module exports)
- `githubPages: true`: Generates `.nojekyll` file for GitHub Pages compatibility
- `excludePrivate`: Hides `private` members
- `excludeInternal`: Hides `@internal` tagged members
- `includeVersion`: Adds package version to header
- `tsconfig`: Uses same config as build

### package.json Additions

```json
{
  "scripts": {
    "docs": "typedoc",
    "docs:watch": "typedoc --watch"
  },
  "devDependencies": {
    "typedoc": "^0.28.0"
  }
}
```

### .gitignore Addition

```
# TypeDoc output
docs/
```

### GitHub Actions Workflow Addition

Add to `.github/workflows/publish.yml` after the `publish` job:

```yaml
  docs:
    needs: [test, e2e]
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate documentation
        run: npm run docs

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
          force_orphan: true
          user_name: 'github-actions[bot]'
          user_email: 'github-actions[bot]@users.noreply.github.com'
          commit_message: 'docs: Update API documentation for ${{ github.ref_name }}'
```

## gh-pages Branch Management

### Branch Strategy

```
main branch:          gh-pages branch:
├── src/              └── docs/
├── package.json          ├── index.html
├── typedoc.json          ├── modules/
└── ...                   └── assets/

(Completely separate - no shared history)
```

### How peaceiris/actions-gh-pages Works

1. Checks out repository
2. Configures git with provided user
3. Copies `publish_dir` contents
4. Creates orphan commit (no parent history)
5. Force-pushes to `gh-pages` branch

### First-Time Setup (Manual)

After first deployment, configure GitHub Pages in repo settings:

1. Go to Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: `gh-pages` / `(root)`
4. Save

**Note:** The first deployment with `GITHUB_TOKEN` may fail until Pages is configured. After configuration, subsequent deployments work automatically.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Committing docs/ to main

**What people do:** Add docs/ output to git and commit alongside source.
**Why it's wrong:** Bloats repo, merge conflicts, drifts from source.
**Do this instead:** Gitignore docs/, generate in CI, deploy to gh-pages.

### Anti-Pattern 2: Running docs job without test dependency

**What people do:** Add docs job without `needs: [test, e2e]`.
**Why it's wrong:** Docs could publish for broken code.
**Do this instead:** Always depend on test jobs passing.

### Anti-Pattern 3: Using main branch for GitHub Pages

**What people do:** Configure GitHub Pages to serve from main/docs.
**Why it's wrong:** Ties docs to main branch, no clean separation.
**Do this instead:** Use dedicated gh-pages branch with orphan commits.

### Anti-Pattern 4: Different TypeScript configs

**What people do:** Create separate tsconfig.docs.json with different settings.
**Why it's wrong:** Docs may not match published package behavior.
**Do this instead:** Use same `tsconfig.build.json` as build.

## Documentation Architecture Sources

- TypeDoc Documentation: https://typedoc.org/ (HIGH confidence)
- TypeDoc Configuration: https://typedoc.org/documents/Options.Configuration.html (HIGH confidence)
- peaceiris/actions-gh-pages: https://github.com/peaceiris/actions-gh-pages (HIGH confidence)
- actions/deploy-pages: https://github.com/actions/deploy-pages (HIGH confidence)
- GitHub Pages Documentation: https://docs.github.com/en/pages (HIGH confidence)
