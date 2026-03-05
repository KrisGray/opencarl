# OpenCARL OpenCode Plugin

## What This Is

OpenCARL is a dynamic rule injection plugin for OpenCode that gives your AI assistant persistent memory about how you work. Rules load automatically when relevant to your current task via keyword matching, with support for star-commands, context-aware injection, and global/project rule scoping.

## Core Value

Keep OpenCARL's dynamic rule injection working seamlessly inside OpenCode with full parity and minimal user friction.

## Current Milestone: v1.3 Branding & Context Migration (INITIATED2026-03-18)

**Goal:** Replace all instances of "CARL" with "OpenCARL" and "carl" with "opencarl" throughout the codebase.

**Target scope:**
- Source code: src/carl/ → src/opencarl/
- Configuration: .carl/ → .opencarl/
- Commands: *carl → *opencarl
- Documentation: All CARL references → OpenCARL
- Tests and fixtures: Update all references

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

### Active

- [ ] Rebrand CARL to OpenCARL throughout codebase (source code, config, docs)
- [ ] Update all import statements and references
- [ ] Update directory names (src/carl/ → src/opencarl/, .carl/ → .opencarl/)
- [ ] Update command references (*carl → *opencarl)
- [ ] Update all test files and fixtures
- [ ] Update environment variable references (CARL_DEBUG → OPENCARL_DEBUG)
- [ ] Verify all CARL references replaced
- [ ] Update documentation and README files

### Out of Scope

- Preserving existing CARL workflows or file formats (this is a rebranding, not a rewrite)
- Changing the rule syntax or domain file format semantics
- Modifying OpenCode core functionality
- Building a separate distribution or modifying OpenCode core

## Context

- **Shipped:** v1.2 (2026-03-18) - Comprehensive test infrastructure with 312 tests
- **Tech stack:** TypeScript, Jest, Docker, OpenCode CLI v1.2.15
- **Test coverage:** 312 tests (254 unit, 35 integration, 23 E2E), 79.44% overall statements
- **Key infrastructure:** Jest with ts-jest, GitHub Actions CI, Docker E2E testing
- **Documentation:** README.md, INSTALL.md, CARL-DOCS.md, TROUBLESHOOTING.md

## Constraints

- **Plugin API**: Must use OpenCode plugin events and context (per https://opencode.ai/docs/plugins/).
- **Compatibility**: Preserve existing `.carl/` (to be renamed to `.opencarl/`) directory structure and manifest/domain file semantics.
- **Distribution**: Prefer local plugin files over npm packaging.
- **Triggering**: `*opencarl` is preferred; `/opencarl` allowed only as fallback.
- **Language**: Implement OpenCode plugin in TypeScript.
- **Branding consistency**: All CARL → OpenCARL, carl → opencarl references must be updated

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Local plugin distribution | Matches OpenCode plugin loading and avoids npm publish | ✓ Good |
| Keep `.carl/` locations (to be renamed) | Preserve existing CARL workflows and files | ✓ Good |
| Prefer `*carl` trigger (to be renamed) | Maintains current user experience | ✓ Good |
| Integrate with `AGENTS.md` and `opencode.json` | Align with OpenCode rules system | ✓ Good |
| TypeScript plugin implementation | Aligns with OpenCode plugin types and examples | ✓ Good |
| Dual-package strategy (carl-core + @krisgray/opencarl) | Support both Claude Code and OpenCode from single repo | ✓ Good |
| Zero-overhead debug logging | Cache env var check at module load | ✓ Good |
| Relative path for opencode.json instructions | Works across project setups | ✓ Good |
| Structured errors with fix suggestions | Users get actionable guidance | ✓ Good |
| Rebrand CARL → OpenCARL | Brand consistency and broader naming | — Pending |

---
*Last updated: 2026-03-18 after v1.3 milestone initiation*
