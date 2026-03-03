# CARL OpenCode Plugin

## What This Is

OpenCARL is a dynamic rule injection plugin for OpenCode that gives your AI assistant persistent memory about how you work. Rules load automatically when relevant to your current task via keyword matching, with support for star-commands, context-aware injection, and global/project rule scoping.

## Core Value

Keep CARL's dynamic rule injection working seamlessly inside OpenCode with full parity and minimal user friction.

## Current Milestone: Planning Next Release

**Shipped:** v1.1 Polish & Complete Integration (2026-03-03)

**Next milestone goals:**
- TBD via `/gsd-new-milestone`

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

### Active

(None yet — define next milestone via `/gsd-new-milestone`)

### Out of Scope

- Replacing CARL's rule syntax or domain file format — preserve existing format
- Building a separate OpenCode distribution or modifying OpenCode core
- Rewriting CARL as a server or cloud service

## Context

- **Shipped:** v1.1 (2026-03-03) - Complete OpenCode integration with developer experience improvements
- **Tech stack:** TypeScript, OpenCode plugin API
- **Key integrations:** AGENTS.md, opencode.json, npm distribution
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
*Last updated: 2026-03-03 after v1.1 milestone completion*
