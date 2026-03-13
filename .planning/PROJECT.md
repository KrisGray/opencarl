# OpenCARL OpenCode Plugin

## What This Is

OpenCARL is a dynamic rule injection plugin for OpenCode that gives your AI assistant persistent memory about how you work. Rules load automatically when relevant to your current task via keyword matching, with support for star-commands, context-aware injection, and global/project rule scoping.

## Core Value

Keep OpenCARL's dynamic rule injection working seamlessly inside OpenCode with full parity and minimal user friction.

## Current Milestone: Planning Next Milestone

**Status:** v1.3 shipped (2026-03-13). Ready to plan v2.0.

**Next milestone:** Define scope and requirements for next iteration.

## Requirements

### Validated

- ✓ OpenCode plugin replicates CARL hook behavior (keyword match, exclude, always-on, star-commands, context brackets) — v1.0 Phases 1-3
- ✓ Local plugin distribution for OpenCode (`.opencode/plugins/` and `~/.config/opencode/plugins/`) — v1.0 Phase 1
- ✓ Installer/setup flow for OpenCode (copy plugin, seed `.carl/` templates, ensure configuration) — v1.0 Phase 4
- ✓ `AGENTS.md` integration with CARL usage guidance — v1.0 Phase 5
- ✓ `*carl` trigger working, `/carl` fallback available — v1.0 Phase 2
- ✓ Plugin implemented in TypeScript using OpenCode plugin types — v1.0 Phase 1
- ✓ `.carl/` locations maintained for global and project rules — v1.0 Phase 1
- ✓ NPM distribution via dual-package strategy — v1.0 Phase 5
- ✓ `opencode.json` instructions integration — v1.1 Phase 6
- ✓ Clear, actionable error messages — v1.1 Phase 6
- ✓ Debug logging with `CARL_DEBUG=true` — v1.1 Phase 6
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

### Active

(No active requirements — milestone complete, ready for next planning phase)

### Out of Scope

- Preserving existing CARL workflows or file formats (this is a rebranding, not a rewrite)
- Changing the rule syntax or domain file format semantics
- Modifying OpenCode core functionality
- Building a separate distribution or modifying OpenCode core

## Context

- **Shipped:** v1.3 (2026-03-13) - Complete CARL to OpenCARL rebranding across 6 phases, 51 plans
- **Previous:** v1.2 (2026-03-18) - Comprehensive test infrastructure with 312 tests
- **Tech stack:** TypeScript (4,065 LOC), Jest, Docker, OpenCode CLI v1.2.15
- **Test coverage:** 312 tests (254 unit, 35 integration, 23 E2E), 79.44% overall statements
- **Key infrastructure:** Jest with ts-jest, GitHub Actions CI, Docker E2E testing
- **Documentation:** README.md, INSTALL.md, OPENCARL-DOCS.md, TROUBLESHOOTING.md
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

---
*Last updated: 2026-03-13 after v1.3 milestone completion*
