# CARL OpenCode Plugin

## What This Is

Adapt CARL from a Claude Code hook into a first-class OpenCode plugin. The plugin preserves CARL's just-in-time rule injection and management workflow while integrating with OpenCode's plugin, rules, and config conventions.

## Core Value

Keep CARL's dynamic rule injection working seamlessly inside OpenCode with full parity and minimal user friction.

## Requirements

### Validated

- ✓ Hook-based prompt scanning and domain rule injection via `.carl/manifest` and domain files — existing
- ✓ Star-command activation (`*command`) for explicit modes — existing
- ✓ Context bracket rules (fresh/moderate/depleted) — existing
- ✓ CLI installer wiring Claude settings and templates — existing

### Active

- [ ] OpenCode plugin replicates CARL hook behavior (keyword match, exclude, always-on, star-commands, context brackets)
- [ ] Local plugin distribution for OpenCode (`.opencode/plugins/` and `~/.config/opencode/plugins/`)
- [ ] Installer or setup flow for OpenCode (copy plugin, seed `.carl/` templates, ensure configuration)
- [ ] OpenCode rules integration: update `AGENTS.md` and `opencode.json` instructions when appropriate
- [ ] Preserve `*carl` trigger if possible; fall back to `/carl` if OpenCode cannot intercept `*`
- [ ] Plugin implemented in TypeScript using OpenCode plugin types
- [ ] Maintain `.carl/` locations for global and project rules

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
| Local plugin distribution | Matches OpenCode plugin loading and avoids npm publish | — Pending |
| Keep `.carl/` locations | Preserve existing CARL workflows and files | — Pending |
| Prefer `*carl` trigger | Maintains current user experience | — Pending |
| Integrate with `AGENTS.md` and `opencode.json` | Align with OpenCode rules system | — Pending |
| TypeScript plugin implementation | Aligns with OpenCode plugin types and examples | — Pending |

---
*Last updated: 2026-02-25 after initialization*
