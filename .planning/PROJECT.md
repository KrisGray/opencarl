# CARL OpenCode Plugin

## What This Is

Adapt CARL from a Claude Code hook into a first-class OpenCode plugin. The plugin preserves CARL's just-in-time rule injection and management workflow while integrating with OpenCode's plugin, rules, and config conventions.

## Core Value

Keep CARL's dynamic rule injection working seamlessly inside OpenCode with full parity and minimal user friction.

## Current Milestone: v1.1 Polish & Complete Integration

**Goal:** Complete remaining INTE-02 requirement and polish the v1.0 implementation with better DX.

**Target features:**
- INTE-02: Update `opencode.json` `instructions` to include CARL docs when requested
- Polish & fixes: tests, rough edges, technical debt cleanup
- Better DX: improved error messages, debug logging, troubleshooting guides

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

### Active

- [ ] Complete INTE-02: `opencode.json` instructions integration
- [ ] Polish: tests for edge cases, fix rough edges, address technical debt
- [ ] Better DX: improved error messages, debug logging, troubleshooting guides

### Out of Scope

- Replacing CARL's rule syntax or domain file format — preserve existing format
- Building a separate OpenCode distribution or modifying OpenCode core
- Rewriting CARL as a server or cloud service

## Context

- CARL currently installs a Claude Code hook and injects rules from `.carl/` domains based on keyword matching.
- OpenCode supports plugins via `.opencode/plugins/` and `~/.config/opencode/plugins/`, plus npm packages.
- OpenCode rules can be set via `AGENTS.md` and `opencode.json` instructions.

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
| Integrate with `AGENTS.md` and `opencode.json` | Align with OpenCode rules system | ◆ Partial (AGENTS.md done, opencode.json instructions pending) |
| TypeScript plugin implementation | Aligns with OpenCode plugin types and examples | ✓ Good |
| Dual-package strategy (carl-core + @krisgray/opencode-carl-plugin) | Support both Claude Code and OpenCode from single repo | ✓ Good |

---
*Last updated: 2026-03-03 after v1.1 milestone started*
