# Phase 18: TypeDoc Setup - Research

**Researched:** 2026-03-16
**Domain:** TypeDoc documentation generation for TypeScript
**Confidence:** HIGH

## Summary

TypeDoc 0.28.x is the industry-standard documentation generator for TypeScript projects. The key compatibility concern from STATE.md is **resolved**: TypeDoc 0.28.9+ added official TypeScript 5.9 support via PR #2989. Configuration is straightforward with typedoc.json at project root.

**Primary recommendation:** Install typedoc@^0.28.17 (latest stable), create typedoc.json with category-based grouping, source links to origin/commit, README as homepage, and add `npm run docs` script.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Navigation Structure**: Category-based grouping by functionality (not by code structure); moderate granularity: 5-7 top-level categories; categories should reflect what API consumers care about (e.g., "Configuration", "Rules", "Signals") rather than file organization
- **Source Links**: Link to specific commit hash (exact code version at generation time); include line numbers in source links for precise navigation; point to `origin` remote (KrisGray/opencarl), not upstream
- **README Integration**: README.md content appears as the documentation homepage; use full README as-is from repo root; API documentation accessible from sidebar navigation
- **Theme/Branding**: Use default TypeDoc theme (no custom styling); dark/light mode: auto-detect system preference with toggle

### OpenCode's Discretion
- Exact category names/groupings (user said "by functionality" with 5-7 categories — planner decides specific groupings)
- TypeDoc configuration file location (typedoc.json at root is standard)
- Any additional TypeDoc options not discussed (visibility filters, search config, etc.)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DOCS-01 | TypeDoc generates HTML API documentation from TypeScript source | TypeDoc 0.28.x with `entryPoints` targeting `src/opencarl/`; `out` option for `docs/` directory |
| DOCS-02 | Source code links allow click-through to GitHub | `gitRemote: "origin"`, `gitRevision` with commit hash, automatic line number linking; sourceLinkTemplate optional customization |
| DOCS-03 | README.md serves as documentation landing page | `readme: "./README.md"` (or omit for auto-discovery); README rendered as homepage index |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| typedoc | ^0.28.17 | TypeScript documentation generator | Industry standard, 1052+ npm dependents, active maintenance, TypeScript-native |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| typedoc-plugin-markdown | optional | Markdown output instead of HTML | NOT recommended — user wants HTML only |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| TypeDoc | Docusaurus/VitePress | Over-engineering for standalone API docs; TypeDoc is sufficient per REQUIREMENTS.md Out of Scope |
| TypeDoc | JSDoc | JSDoc requires manual type annotations; TypeDoc reads TypeScript directly |

**Installation:**
```bash
npm install --save-dev typedoc
```

## Architecture Patterns

### Recommended Project Structure
```
opencarl/
├── typedoc.json          # TypeDoc configuration
├── README.md             # Documentation homepage (auto-detected)
├── package.json          # Add "docs" script
├── src/opencarl/         # Source entry points
│   ├── types.ts          # Core types
│   ├── loader.ts         # Rule loading
│   ├── injector.ts       # Rule injection
│   ├── matcher.ts        # Pattern matching
│   ├── signal-store.ts   # Session signals
│   └── ...               # Other modules
└── docs/                 # Generated output (gitignored)
```

### Pattern 1: Category-Based Grouping
**What:** Use `@category` JSDoc tag to organize exports by functionality, not file structure.
**When to use:** When you want intuitive navigation for API consumers.

**Example:**
```typescript
/**
 * @category Configuration
 */
export interface OpencarlRuleSource {
  scope: OpencarlRuleSourceScope;
  path: string;
  domains: string[];
}

/**
 * @category Matching
 */
export interface OpencarlMatchRequest {
  promptText: string;
  signals: OpencarlSessionSignals;
  domains: Record<string, OpencarlMatchDomainConfig>;
}

/**
 * @category Signals
 */
export interface OpencarlSessionSignals {
  promptTokens: string[];
  toolTokens: string[];
  pathTokens: string[];
}
```

**Source:** https://typedoc.org/documents/Tags._category.html

### Pattern 2: Source Link Configuration
**What:** Configure TypeDoc to link source files to GitHub at exact commit with line numbers.
**When to use:** All documentation deployments.

**Example typedoc.json:**
```json
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": ["src/opencarl/"],
  "out": "docs",
  "gitRemote": "origin",
  "gitRevision": "main",
  "sourceLinkExternal": true
}
```

**Notes:**
- `gitRemote: "origin"` — links to KrisGray/opencarl (not upstream)
- `gitRevision: "main"` or use `{branch}` for current branch, or specific commit hash
- Line numbers are included automatically in source links
- For CI, get commit hash via `git rev-parse HEAD`

**Source:** https://typedoc.org/documents/Options.Input.html

### Pattern 3: README as Homepage
**What:** TypeDoc automatically uses README.md as the documentation landing page.
**When to use:** Always — default behavior.

```json
{
  "readme": "./README.md"
}
```

Or omit — TypeDoc auto-discovers README.md next to package.json.

**Source:** https://typedoc.org/documents/Options.Input.html#readme

### Pattern 4: npm run docs Script
**What:** Add docs script to package.json for local generation.
**When to use:** Standard developer workflow.

```json
{
  "scripts": {
    "docs": "typedoc"
  }
}
```

### Anti-Patterns to Avoid
- **Categorize by file structure:** Use `@category` tags for functional grouping, not reflection of directory structure
- **Omitting @category tags:** Results in "Other" default category; plan requires 5-7 intentional categories
- **Using upstream remote:** `gitRemote` defaults to `origin`; don't change to `upstream`

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Source link generation | Custom URL templating | `gitRemote`, `gitRevision` options | TypeDoc handles GitHub URL formatting, line numbers, and path resolution |
| Category ordering | Manual sorting logic | `categoryOrder` option | Built-in support with wildcard `*` for unspecified |
| README rendering | Custom markdown processing | `readme` option or auto-discovery | TypeDoc integrates README as index page automatically |
| Dark/light theme toggle | Custom CSS/JS | Default theme | Built-in system preference detection with manual toggle |

**Key insight:** TypeDoc's default theme already supports dark/light auto-detect with toggle. No configuration needed.

## Common Pitfalls

### Pitfall 1: Missing @category Tags
**What goes wrong:** All exports end up in "Other" category
**Why it happens:** `@category` must be explicitly added to each exported member
**How to avoid:** Audit all exports and add `@category` tags during implementation
**Warning signs:** Docs show single "Other" category or missing category section

### Pitfall 2: Wrong Git Remote
**What goes wrong:** Source links point to upstream fork instead of origin
**Why it happens:** Default is `origin` but some docs suggest `upstream` for forks
**How to avoid:** Ensure `gitRemote: "origin"` in config (or omit since it's default)
**Warning signs:** Source links show ChristopherKahler/carl instead of KrisGray/opencarl

### Pitfall 3: TypeScript Version Warning
**What goes wrong:** Warning about unsupported TypeScript version
**Why it happens:** Using TypeDoc < 0.28.9 with TypeScript 5.9
**How to avoid:** Install typedoc@^0.28.9 or later (0.28.17 is current)
**Warning signs:** "You are running with an unsupported TypeScript version" warning

### Pitfall 4: docs/ Not Gitignored
**What goes wrong:** Generated docs committed to repo
**Why it happens:** Forgetting to add docs/ to .gitignore
**How to avoid:** Add `docs/` to .gitignore (Phase 19 deploys to gh-pages, not main)
**Warning signs:** Large generated HTML files in git status

## Code Examples

### Complete typedoc.json Configuration
```json
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": ["src/opencarl/"],
  "out": "docs",
  "readme": "./README.md",
  "gitRemote": "origin",
  "gitRevision": "main",
  "sourceLinkExternal": true,
  "categorizeByGroup": false,
  "defaultCategory": "Other",
  "categoryOrder": ["Configuration", "Rules", "Matching", "Signals", "Utilities", "*"],
  "navigation": {
    "includeCategories": true
  },
  "excludePrivate": true,
  "excludeProtected": false,
  "excludeInternal": true,
  "hideGenerator": false,
  "githubPages": true
}
```

### npm run docs Script
```json
{
  "scripts": {
    "docs": "typedoc",
    "docs:ci": "typedoc --gitRevision $(git rev-parse HEAD)"
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| entryPointStrategy: "expand" | entryPointStrategy: "resolve" (default) | v0.22 | Better handling of exports; use entryPoints globs |
| marked for markdown | markdown-it for markdown | v0.26 | markdownItOptions replaces markedOptions |
| manual media/ includes | Auto-detected image links | v0.26 | Images in comments/docs auto-copied |

**Deprecated/outdated:**
- `--media` option: Removed in v0.26; images auto-detected and copied
- `--includes` option: Removed in v0.26; use `@document` tag instead
- `markedOptions`: Replaced by `markdownItOptions` in v0.26

## Open Questions

1. **Exact category names for OpenCARL**
   - What we know: 5-7 categories, functionality-based
   - What's unclear: Specific names (suggested: Configuration, Rules, Matching, Signals, Utilities, Errors, State)
   - Recommendation: Planner should analyze src/opencarl/ exports and define 5-7 meaningful categories

2. **Entry point strategy**
   - What we know: Source is in src/opencarl/ with multiple files
   - What's unclear: Single entry file vs. directory glob
   - Recommendation: Use `entryPoints: ["src/opencarl/"]` which auto-discovers all TypeScript files; creates clean module structure

## Sources

### Primary (HIGH confidence)
- TypeDoc Official Docs - https://typedoc.org/documents/Options.Input.html - entryPoints, gitRemote, gitRevision, readme options
- TypeDoc Official Docs - https://typedoc.org/documents/Options.Organization.html - categorizeByGroup, categoryOrder, defaultCategory
- TypeDoc Official Docs - https://typedoc.org/documents/Tags._category.html - @category tag syntax
- TypeDoc CHANGELOG - https://github.com/TypeStrong/typedoc/blob/master/CHANGELOG.md - TypeScript 5.9 support in v0.28.9 (#2989)

### Secondary (MEDIUM confidence)
- TypeDoc Releases - https://github.com/TypeStrong/typedoc/releases - v0.28.17 current, TypeScript 5.9 support confirmed
- npm typedoc - https://www.npmjs.com/package/typedoc - 1052 dependents, actively maintained

### Tertiary (LOW confidence)
- None required - all critical information from primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - TypeDoc is well-established, official docs comprehensive
- Architecture: HIGH - Configuration patterns documented, @category well-supported
- Pitfalls: HIGH - Common issues documented in official docs and changelog

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (TypeDoc is stable; 30 days safe window)
