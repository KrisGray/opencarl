# OpenCARL OpenCode Plugin

## What This Is

OpenCARL is a dynamic rule injection plugin for OpenCode that gives your AI assistant persistent memory about how you work. Rules load automatically when relevant to your current task via keyword matching, with support for star-commands, context-aware injection, and global/project rule scoping.

## Core Value

Keep OpenCARL's dynamic rule injection working seamlessly inside OpenCode with full parity and minimal user friction.

## Current State

**Latest Release:** v2.1 CI Badges & Coverage (shipped 2026-03-17)

### Shipped Milestones

| Milestone | Description | Shipped |
|-----------|-------------|---------|
| v1.0 | MVP - Plugin foundation, matching, injection | 2026-03-03 |
| v1.1 | Integration & Developer Experience | 2026-03-03 |
| v1.2 | Testing & QA (312 tests, 79.44% coverage) | 2026-03-18 |
| v1.3 | Branding & Context Migration (CARL → OpenCARL) | 2026-03-13 |
| v2.0.2 | Documentation Site (TypeDoc + GitHub Pages) | 2026-03-16 |
| v2.1 | CI Badges & Coverage (Codecov integration) | 2026-03-17 |

### Current Features

- Dynamic rule injection based on keyword matching
- Star-commands for explicit triggers (`*opencarl`, `*brief`, etc.)
- Context-aware rule loading (fresh/moderate/depleted session states)
- Global and project-scoped rules
- Full OpenCode plugin integration
- Comprehensive test suite (312 tests)
- API documentation at krisgray.github.io/opencarl
- CI/CD with Codecov coverage reporting

## Next Milestone

**Status:** Ready for planning

No features currently planned. Define next milestone goals when ready.

## Requirements

### Validated

- ✓ OpenCode plugin replicates CARL hook behavior (keyword match, exclude, always-on, star-commands, context brackets) — v1.0 Phases 1-3
- ✓ Local plugin distribution for OpenCode (`.opencode/plugins/` and `~/.config/opencode/plugins/`) — v1.0 Phase 1
- ✓ Installer/setup flow for OpenCode (copy plugin, seed `.opencarl/` templates, ensure configuration) — v1.0 Phase 4
- ✓ `AGENTS.md` integration with CARL usage guidance — v1.0 Phase 5
- ✓ `*opencarl` trigger working, `/opencarl` fallback available — v1.0 Phase 2
- ✓ Plugin implemented in TypeScript using OpenCode plugin types — v1.0 Phase 1
- ✓ `.opencarl/` locations maintained for global and project rules — v1.0 Phase 1
- ✓ NPM distribution via dual-package strategy — v1.0 Phase 5
- ✓ `opencode.json` instructions integration — v1.1 Phase 6
- ✓ Clear, actionable error messages — v1.1 Phase 6
- ✓ Debug logging with `OPENCARL_DEBUG=true` — v1.1 Phase 6
- ✓ Comprehensive troubleshooting guide — v1.1 Phase 6
- ✓ Jest test infrastructure with 80% coverage thresholds and GitHub Actions CI — v1.2 Phase 7
- ✓ Unit tests for core modules (parsing, matching, validation, context-brackets) — v1.2 Phases 8-9
- ✓ Session and setup unit tests (domain manager, star-commands, session overrides) — v1.2 Phase 9.1
- ✓ Integration tests for plugin lifecycle and rule injection pipeline — v1.2 Phase 10
- ✓ E2E tests with Docker and OpenCode CLI v1.2.15 — v1.2 Phase 11
- ✓ Full CI/CD pipeline with automated test execution and coverage reporting — v1.2 Phases 7, 11
- ✓ Complete CARL to OpenCARL rebranding (source code, config, docs, commands) — v1.3 Phases 12-17
- ✓ Directory migration: src/carl/ → src/opencarl/, .carl/ → .opencarl/ — v1.3 Phase 13
- ✓ Command rebranding: *carl → *opencarl, /carl → /opencarl — v1.3 Phase 14
- ✓ Environment variable rebranding: CARL_DEBUG → OPENCARL_DEBUG — v1.3 Phase 15
- ✓ Documentation rebranding across all files — v1.3 Phase 16
- ✓ Package metadata and CI/CD updates to @krisgray/opencarl — v1.3 Phase 17
- ✓ TypeDoc generates API documentation from TypeScript source — v2.0.2 Phase 18
- ✓ GitHub Actions workflow builds and deploys docs on release — v2.0.2 Phase 19
- ✓ Documentation site hosted on GitHub Pages (gh-pages branch) — v2.0.2 Phase 19
- ✓ CI workflow uploads test coverage to Codecov on every push/PR — v2.1 Phase 20
- ✓ README displays working NPM version and Codecov coverage badges — v2.1 Phase 20

### Active

None - all requirements complete.

### Out of Scope

- Preserving existing CARL workflows or file formats (this is a rebranding, not a rewrite)
- Changing the rule syntax or domain file format semantics
- Modifying OpenCode core functionality
- Building a separate distribution or modifying OpenCode core

## Context

- **Shipped:** v2.1 (2026-03-17) - Codecov integration and badge verification
- **Previous:** v2.0.2 (2026-03-16) - Documentation site with TypeDoc
- **Tech stack:** TypeScript (4,065 LOC), Jest, Docker, OpenCode CLI v1.2.15
- **Test coverage:** 312 tests (254 unit, 35 integration, 23 E2E), 79.44% overall statements
- **Key infrastructure:** Jest with ts-jest, GitHub Actions CI, Docker E2E testing, Codecov
- **Documentation:** README.md, INSTALL.md, OPENCARL-DOCS.md, TROUBLESHOOTING.md, krisgray.github.io/opencarl
- **Package:** @krisgray/opencarl (npm), Docker: opencode-opencarl:e2e

## Constraints

- **Plugin API**: Must use OpenCode plugin events and context (per https://opencode.ai/docs/plugins/).
- **Compatibility**: Preserve `.opencarl/` directory structure and manifest/domain file semantics.
- **Distribution**: Prefer local plugin files over npm packaging.
- **Triggering**: `*opencarl` is preferred; `/opencarl` allowed only as fallback.
- **Language**: Implement OpenCode plugin in TypeScript.
- **Branding consistency**: All OpenCARL/opencarl references maintained (rebranding complete)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Local plugin distribution | Matches OpenCode plugin loading and avoids npm publish | ✓ Good |
| Keep `.carl/` locations (renamed to `.opencarl/`) | Preserve existing workflows and files with updated naming | ✓ Good |
| Prefer `*opencarl` trigger | Maintains current user experience with updated name | ✓ Good |
| Integrate with `AGENTS.md` and `opencode.json` | Align with OpenCode rules system | ✓ Good |
| TypeScript plugin implementation | Aligns with OpenCode plugin types and examples | ✓ Good |
| Dual-package strategy (carl-core + @krisgray/opencarl) | Support both Claude Code and OpenCode from single repo | ✓ Good |
| Zero-overhead debug logging | Cache env var check at module load | ✓ Good |
| Relative path for opencode.json instructions | Works across project setups | ✓ Good |
| Structured errors with fix suggestions | Users get actionable guidance | ✓ Good |
| Complete CARL → OpenCARL rebranding | Brand consistency and broader naming | ✓ Good |
| TypeDoc with entryPointStrategy: expand | Directory-based entry points for src/opencarl/ | ✓ Good |
| Categories by API consumer | Configuration, Loading, Matching, Injection, Signals, Errors | ✓ Good |
| Orphan branch for gh-pages | Clean deployment history | ✓ Good |

---

*Last updated: 2026-03-17 after v2.0.2 and v2.1 milestone archival*
