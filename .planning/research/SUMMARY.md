# Project Research Summary

**Project:** OpenCARL v1.3 Branding & Context Migration
**Domain:** OpenCode Plugin Rebranding (Refactoring)
**Researched:** 2026-03-05
**Confidence:** HIGH

## Executive Summary

OpenCARL v1.3 is a **pure rebranding milestone** that brings zero new features. This is a straightforward text replacement exercise: CARL (originally for Claude Code) is being ported to OpenCode with updated branding. The recommended approach is systematic find-and-replace following a specific order to minimize breakage: types/imports first, then environment variables, then directory names last.

The key risk is missing references across the 1,870 CARL occurrences in 86 files. The most critical dependencies are environment variables (`CARL_DEBUG` → `OPENCARL_DEBUG`), directory paths (`src/carl/` → `src/opencarl/`, `.carl/` → `.opencarl/`), and command triggers (`*carl` → `*opencarl`). Mitigation requires comprehensive grep searches and incremental verification after each batch of changes. Backwards compatibility decisions (supporting both old and new paths temporarily) need to be made during planning but do not change the core migration strategy.

## Key Findings

### Recommended Stack

No new technology stack required for this milestone. This is a refactoring effort with 100% feature parity to CARL.

**Core technologies:**
- **Node.js >=16.7.0** — Runtime requirement, preserve exactly
- **TypeScript 5.9.3** — Plugin types compatibility, preserve exactly
- **@opencode-ai/plugin ^1.2.0** — OpenCode integration, preserve exactly
- **Jest 30.2.0** — Existing test suite, preserve exactly

**Naming changes only:**
- Environment variable: `CARL_DEBUG` → `OPENCARL_DEBUG`
- Source directory: `src/carl/` → `src/opencarl/`
- Config directory: `.carl/` → `.opencarl/`
- Commands: `*carl` → `*opencarl`, `/carl` → `/opencarl`

### Expected Features

**OpenCARL has NO new features** compared to CARL. This is a port, not a feature enhancement.

**Preserved features (from CARL):**
- Dynamic rule injection plugin — keyword matching triggers rule loading
- Star-commands (`*opencarl`) — explicit triggers and help system
- Context-aware injection — fresh/moderate/depleted session detection
- Global/project rule scoping — `.opencarl/` directory structure
- opencode.json and AGENTS.md integration — hybrid rule injection
- Debug logging — `OPENCARL_DEBUG` environment variable

**Rebranding changes only:**
- All user-facing text: "CARL" → "OpenCARL"
- Configuration directories: `.carl/` → `.opencarl/`
- Command triggers: `*carl` → `*opencarl`
- Environment variables: `CARL_DEBUG` → `OPENCARL_DEBUG`

### Architecture Approach

No architectural changes required. The "Open" prefix is a branding choice, not an OpenCode architectural pattern. OpenCode plugins use `opencode-<feature>` naming convention, but our scoped package `@krisgray/opencarl` is already correct.

**Major components:**
1. **Core modules (`src/opencarl/`)** — Rule injection pipeline, matching, caching, debug logging (15 modules, renamed from `src/carl/`)
2. **Integration layer (`src/integration/`)** — OpenCode hook registration, opencode.json writing, path resolution (unchanged)
3. **Plugin entry (`src/plugin.ts`)** — Main plugin export with hook registration (unchanged)

**Data flow remains identical:** User Prompt → plugin-hooks.ts → signal-store.ts → rule-cache.ts → loader.ts → matcher.ts → context-brackets.ts → injector.ts → OpenCode session

### Critical Pitfalls

1. **Missed environment variable references** — `CARL_DEBUG` appears in code, tests, documentation, and CI configs. Prevention: Use comprehensive grep pattern `rg -i "CARL_DEBUG"` before starting, search all file types including CI workflows.

2. **Directory renaming breaks import paths** — Renaming `src/carl/` to `src/opencarl/` without updating imports causes TypeScript compilation errors. Prevention: Update import statements BEFORE renaming directories, verify compilation after each batch.

3. **Docker image name references** — `opencode-carl:e2e` appears in `.github/workflows/e2e-tests.yml` and test scripts. Prevention: Search Docker-specific patterns, check all workflow files, run E2E tests locally after changes.

4. **Package name inconsistencies** — Multiple package name variants exist (`@krisgray/opencarl`, `@krisgray/opencode-carl-plugin`, `@krisgray/carl`). Prevention: Establish single source of truth in package.json, update all references consistently.

5. **TypeScript type names** — Exported types like `CarlRuleDomainPayload`, `CarlMatchDomainConfig` must be renamed. Prevention: Search type definitions systematically, use TypeScript language server to find references, verify compilation.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Source Code Rebranding
**Rationale:** Import statements must be updated BEFORE renaming directories to avoid breakage. This is the foundational change that affects everything else.
**Delivers:** Renamed `src/carl/` to `src/opencarl/`, updated all TypeScript type names and function names
**Addresses:** Core source code references
**Avoids:** Pitfall #2 (directory renaming breaks import paths) by updating imports first

### Phase 2: Configuration & Directory Migration
**Rationale:** Directory paths are referenced throughout the codebase. After types/imports are updated, directory names can be safely renamed.
**Delivers:** Renamed `.carl/` to `.opencarl/`, updated all path references, renamed `.carl-template/`
**Uses:** Path resolution from `src/integration/paths.ts`
**Implements:** Configuration directory handling

### Phase 3: Command Rebranding
**Rationale:** Command triggers are user-facing strings. After internal paths are updated, command handlers can be updated.
**Delivers:** Updated `*carl` → `*opencarl` and `/carl` → `/opencarl`, updated test fixtures and mock expectations
**Avoids:** Pitfall #6 (command trigger references) by updating all test expectations

### Phase 4: Environment Variable Rebranding
**Rationale:** Environment variables are used across code, tests, CI, and documentation. This is a cross-cutting change that touches multiple areas.
**Delivers:** Updated `CARL_DEBUG` → `OPENCARL_DEBUG` in code, tests, CI configs, and documentation
**Avoids:** Pitfall #1 (missed environment variable references) by using comprehensive grep searches

### Phase 5: Documentation Rebranding
**Rationale:** Documentation files reference renamed components and can be updated after code changes are complete.
**Delivers:** Renamed `CARL-DOCS.md` → `OPENCARL-DOCS.md`, updated README, INSTALL.md, TROUBLESHOOTING.md
**Avoids:** Pitfall #8 (documentation file name references)

### Phase 6: Package Metadata & CI/CD Finalization
**Rationale:** Package name and CI/CD configs must reflect the final state after all code changes.
**Delivers:** Verified package name consistency, updated Docker image names, updated CI workflows
**Avoids:** Pitfall #3 (Docker image name references) and Pitfall #4 (package name inconsistencies)

### Phase Ordering Rationale

- **Why this order:** Imports must change before directories (Phase 1 → 2) to prevent compilation errors. Commands and environment variables are cross-cutting but easier to update after internal structure is settled (Phase 3 → 4). Documentation is always last (Phase 5) because it reflects the final state. CI/CD finalization (Phase 6) verifies everything works end-to-end.

- **Why this grouping:** Each phase groups related changes that can be verified independently (compilation, tests, E2E). This reduces risk by enabling incremental rollback if something breaks.

- **How this avoids pitfalls:** The order directly addresses the top 5 critical pitfalls: imports updated before directories (Pitfall #2), comprehensive grep for environment variables (Pitfall #1), Docker checks in CI phase (Pitfall #3), package name verification (Pitfall #4), and comprehensive search for command references (Pitfall #6).

### Research Flags

**No phases need deeper research during planning** — all patterns are well-established and documented.

**All phases use standard patterns** (skip research-phase):
- **Phase 1:** TypeScript type renaming — standard IDE operations, no research needed
- **Phase 2:** Directory path updates — standard file operations, no research needed
- **Phase 3:** Command string replacements — standard string search-replace, no research needed
- **Phase 4:** Environment variable updates — Unix conventions well-documented
- **Phase 5:** Documentation updates — markdown file operations, no research needed
- **Phase 6:** Package metadata and CI/CD — npm and GitHub Actions well-documented

**Open question for planning:** Backwards compatibility strategy. Should OpenCARL support reading from both `.carl/` and `.opencarl/` directories during transition? This is a UX decision, not a technical research question.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | No new tech needed, all references from existing codebase |
| Features | HIGH | Code analysis confirms 100% feature parity, documentation explicitly states rebranding only |
| Architecture | HIGH | OpenCode plugin patterns well-documented, no changes needed beyond renaming |
| Pitfalls | HIGH | 1,870 CARL references counted, specific patterns identified, prevention strategies clear |

**Overall confidence:** HIGH

### Gaps to Address

- **Backwards compatibility:** Decision needed on whether to support both `.carl/` and `.opencarl/` directories during transition. Recommendation from research: Support both temporarily with deprecation warning, but this is a planning decision.

- **Command alias strategy:** Decision needed on whether `/carl` and `*carl` should continue to work as deprecated aliases. Research recommends removal for clean break, but planning should decide.

- **Documentation migration:** Decision needed on whether to rename `CARL-DOCS.md` to `OPENCARL-DOCS.md` or keep as-is with updated content. Research recommends rename for consistency.

All gaps are planning decisions, not research gaps. The technical approach is clear and well-supported by existing codebase patterns.

## Sources

### Primary (HIGH confidence)
- **OpenCode Plugin Documentation** — https://opencode.ai/docs/plugins/ — Official plugin architecture
- **OpenCode Ecosystem** — https://opencode.ai/docs/ecosystem/ — List of all plugins, naming patterns
- **README.md** (lines 36-37) — Explicit statement that OpenCARL is an OpenCode adaptation of CARL
- **package.json** (line 3) — Package description confirms adaptation from CARL
- **PROJECT.md** (lines 1-20, 56-62) — Explicitly defines v1.3 as a "rebranding, not a rewrite" milestone
- **Codebase grep analysis** — 1,870 CARL references across 86 files

### Secondary (MEDIUM confidence)
- **NPM package naming** — https://docs.npmjs.com/package-name-guidelines/ — Naming conventions
- **opencode-helicone-session package.json** — Example plugin structure for comparison
- **TROUBLESHOOTING.md** — References CARL features without OpenCARL-specific additions
- **CARL-DOCS.md** — Documentation covers CARL features, no new OpenCARL capabilities mentioned

### Tertiary (LOW confidence)
- **Websearch on "Open" prefix naming** — Common pattern in open-source projects (OpenSSL, OpenSSH, OpenAI) but not an official convention
- **Stack Overflow: Renaming a published NPM module** — General patterns for package renaming

---
*Research completed: 2026-03-05*
*Ready for roadmap: yes*
