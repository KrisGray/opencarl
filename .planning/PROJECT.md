# CARL OpenCode Plugin

## What This Is

OpenCARL is a dynamic rule injection plugin for OpenCode that gives your AI assistant persistent memory about how you work. Rules load automatically when relevant to your current task via keyword matching, with support for star-commands, context-aware injection, and global/project rule scoping.

## Core Value

Keep CARL's dynamic rule injection working seamlessly inside OpenCode with full parity and minimal user friction.

## Current Milestone: v1.2 Testing & Quality Assurance (SHIPPED 2026-03-18)

**Delivered:** Comprehensive test infrastructure with unit, integration, and E2E testing.

**Shipped features:**
- Jest test framework with ts-jest, 80% coverage thresholds, and comprehensive test scripts
- Test fixtures and helper factories for manifest parsing, keyword matching, and rule injection (126 tests)
- Session and setup unit tests with 149 passing tests across 7 test suites
- Integration tests with 35 passing tests covering plugin lifecycle and rule injection pipeline
- Docker E2E testing with OpenCode CLI v1.2.15, sequential test runner, and 23 E2E tests
- Full CI/CD pipeline with GitHub Actions workflows for unit/integration/E2E tests

**Test coverage:**
- Unit tests: 254 tests across 11 test suites
- Integration tests: 35 tests across 4 test suites
- E2E tests: 23 tests in Docker container
- Total: 312 tests
- Overall coverage: 79.44% (statements), 80.74% (functions)

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

(None yet — define next milestone via `/gsd-new-milestone`)

### Out of Scope

- Replacing CARL's rule syntax or domain file format — preserve existing format
- Building a separate OpenCode distribution or modifying OpenCode core
- Rewriting CARL as a server or cloud service

## Context

- **Shipped:** v1.2 (2026-03-18) - Comprehensive test infrastructure with 312 tests
- **Tech stack:** TypeScript, Jest, Docker, OpenCode CLI v1.2.15
- **Test coverage:** 312 tests (254 unit, 35 integration, 23 E2E), 79.44% overall statements
- **Key infrastructure:** Jest with ts-jest, GitHub Actions CI, Docker E2E testing
- **Documentation:** README.md, INSTALL.md, CARL-DOCS.md, TROUBLESHOOTING.md

## Constraints

- **Plugin API**: Must use OpenCode plugin events and context (per https://opencode.ai/docs/plugins/).
- **Compatibility**: Preserve existing `.carl/` directory structure and manifest/domain file semantics.
- **Distribution**: Prefer local plugin files over npm packaging.
- **Triggering**: `*carl` is preferred; `/carl` allowed only as fallback.
- **Language**: Implement OpenCode plugin in TypeScript.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Local plugin distribution | Matches OpenCode plugin loading and avoids npm publish | ✓ Good |
| Keep `.carl/` locations | Preserve existing CARL workflows and files | ✓ Good |
| Prefer `*carl` trigger | Maintains current user experience | ✓ Good |
| Integrate with `AGENTS.md` and `opencode.json` | Align with OpenCode rules system | ✓ Good |
| TypeScript plugin implementation | Aligns with OpenCode plugin types and examples | ✓ Good |
| Dual-package strategy (carl-core + @krisgray/opencarl) | Support both Claude Code and OpenCode from single repo | ✓ Good |
| Zero-overhead debug logging | Cache env var check at module load | ✓ Good |
| Relative path for opencode.json instructions | Works across project setups | ✓ Good |
| Structured errors with fix suggestions | Users get actionable guidance | ✓ Good |

---
*Last updated: 2026-03-18 after v1.2 milestone completion*
