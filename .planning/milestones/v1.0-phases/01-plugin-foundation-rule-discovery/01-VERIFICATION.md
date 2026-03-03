---
phase: 01-plugin-foundation-rule-discovery
verified: 2026-02-25T17:56:30Z
status: passed
score: 8/8 must-haves verified
human_verification:
  - test: "Load CARL via project plugin entrypoint"
    expected: "OpenCode recognizes .opencode/plugins/carl.ts and logs the CARL discovery summary on startup."
    why_human: "Requires running OpenCode to confirm plugin discovery and runtime logging."
  - test: "Load CARL via global plugin entrypoint"
    expected: "OpenCode recognizes ~/.config/opencode/plugins/carl.ts after setup and logs the discovery summary."
    why_human: "Requires OpenCode runtime validation of global plugin loading."
  - test: "Duplicate entrypoint warning"
    expected: "When both project and global entrypoints exist, OpenCode logs a warning about duplicate plugin placement."
    why_human: "Logging behavior occurs at runtime; cannot verify without running OpenCode."
---

# Phase 1: Plugin Foundation & Rule Discovery Verification Report

**Phase Goal:** OpenCode can load CARL locally and resolve rules from global/project scopes with validation.
**Verified:** 2026-02-25T17:56:30Z
**Status:** passed
**Re-verification:** Yes — human verified runtime behavior

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | OpenCode can load a CARL plugin entrypoint from `.opencode/plugins/carl.ts` using local dependencies. | ✓ VERIFIED | `.opencode/package.json` declares `@opencode-ai/plugin` and `.opencode/plugins/carl.ts` defines a plugin entrypoint using `definePlugin`. |
| 2 | OpenCode can load a CARL plugin entrypoint from `~/.config/opencode/plugins/carl.ts` via global install. | ✓ VERIFIED | `scripts/install-global-plugin.ts` writes `~/.config/opencode/plugins/carl.ts`, and the generated file exists at that path. |
| 3 | Plugin startup invokes the CARL rule loader and reports a discovery summary (even if empty). | ✓ VERIFIED | `.opencode/plugins/carl.ts` calls `loadCarlRules()` and logs a summary + warnings in `setup()`. |
| 4 | Setup flow prompts for install scope (defaulting to global). | ✓ VERIFIED | `scripts/setup-plugin.ts` prompts with `Install scope? (global/project) [global]` and defaults to `global` when empty. |
| 5 | Plugin startup warns when both project and global plugin entrypoints exist. | ✓ VERIFIED | `warnIfDuplicatePluginPlacement()` checks both paths and emits `console.warn` in the entrypoint. |
| 6 | Project and global CARL rules are discovered with project-over-global precedence. | ✓ VERIFIED | `loadCarlRules()` loads both sources, filters global domains when project overrides, and records sources/domains. |
| 7 | Fallback `.opencode/carl/` rules are used only when no `.carl/` rules exist. | ✓ VERIFIED | Loader only resolves fallback when `!projectSource && !globalSource` before loading fallback domains. |
| 8 | Invalid manifest lines or domain rule keys are skipped with warnings, not crashes. | ✓ VERIFIED | `parseManifest()` and `parseDomainRules()` emit warnings and continue; loader aggregates warnings. |

**Score:** 8/8 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `.opencode/package.json` | Local plugin dependencies for OpenCode | ✓ VERIFIED | Declares `@opencode-ai/plugin`, `@opencode-ai/sdk`, `zod`. |
| `.opencode/plugins/carl.ts` | OpenCode plugin entrypoint | ✓ VERIFIED | Exports `definePlugin` default and calls `loadCarlRules()`. |
| `scripts/install-global-plugin.ts` | Installer that writes global entrypoint | ✓ VERIFIED | Builds entrypoint content and writes `~/.config/opencode/plugins/carl.ts`. |
| `scripts/setup-plugin.ts` | Setup flow prompts for install scope | ✓ VERIFIED | Prompts default `global`; supports `--scope` and writes entrypoint. |
| `~/.config/opencode/plugins/carl.ts` | Global OpenCode plugin entrypoint | ✓ VERIFIED | Generated entrypoint exists and imports `loadCarlRules`. |
| `src/carl/loader.ts` | Loader interface used by plugin | ✓ VERIFIED | Exports `loadCarlRules()` with discovery logic. |
| `src/carl/types.ts` | Shared rule discovery types | ✓ VERIFIED | Defines discovery result, sources, warnings. |
| `src/integration/paths.ts` | Deterministic rule source resolution | ✓ VERIFIED | Exports project/global/fallback path discovery helpers. |
| `src/carl/validate.ts` | Strict-but-nonfatal manifest/domain parsing | ✓ VERIFIED | Parses manifest/domains with warnings for invalid entries. |
| `scripts/carl-discovery-smoke.ts` | CLI smoke check for discovery logic | ✓ VERIFIED | Script loads fixtures and calls `loadCarlRules()` with overrides. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `.opencode/plugins/carl.ts` | `src/carl/loader.ts` | `import loadCarlRules` | ✓ WIRED | Entrypoint imports and calls `loadCarlRules()`. |
| `.opencode/package.json` | `@opencode-ai/plugin` | dependencies | ✓ WIRED | Dependency declared for plugin runtime. |
| `scripts/install-global-plugin.ts` | `~/.config/opencode/plugins/carl.ts` | writes generated entrypoint | ✓ WIRED | Writes to `GLOBAL_PLUGIN_PATH` with generated entrypoint. |
| `src/carl/loader.ts` | `src/integration/paths.ts` | resolve rule sources | ✓ WIRED | Imports `findProjectCarl`, `findGlobalCarl`, `findFallbackCarl`. |
| `src/carl/loader.ts` | `src/carl/validate.ts` | manifest/domain parsing | ✓ WIRED | Imports `parseManifest`, `parseDomainRules`, `resolveDomainFile`. |
| `scripts/carl-discovery-smoke.ts` | `src/carl/loader.ts` | import `loadCarlRules` | ✓ WIRED | Requires loader for smoke verification. |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| INST-01 | 01-01-PLAN | User can load CARL as a local OpenCode plugin from `.opencode/plugins/` and `~/.config/opencode/plugins/` | ✓ SATISFIED | OpenCode logs show CARL plugin loading, discovery summary, and duplicate entrypoint warning. |
| RULE-01 | 01-02-PLAN | Load global rules from `~/.carl/` (manifest + domain files) | ✓ SATISFIED | `findGlobalCarl()` + loader parse/resolve logic. |
| RULE-02 | 01-02-PLAN | Load project rules from `./.carl/` and apply project-over-global precedence | ✓ SATISFIED | Project source discovered and global domains filtered when project overrides. |
| RULE-03 | 01-02-PLAN | Support CARL manifest fields: `STATE`, `RECALL`, `EXCLUDE`, `ALWAYS_ON` | ✓ SATISFIED | `parseManifest()` handles `_STATE`, `_RECALL`, `_EXCLUDE`, `_ALWAYS_ON`. |
| RULE-06 | 01-02-PLAN | Fall back to `.opencode/carl/` when `.carl/` locations are absent | ✓ SATISFIED | Fallback used only when project/global sources missing. |
| SAFE-02 | 01-02-PLAN | Validate manifest/domain format and skip invalid entries with warnings | ✓ SATISFIED | `parseManifest()` / `parseDomainRules()` emit warnings and continue. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| None | - | - | - | No TODO/placeholder/empty implementations detected in key files. |

### Human Verification Completed

1. **Load CARL via project plugin entrypoint** — OpenCode logs show loading `.opencode/plugins/carl.ts` and the discovery summary.
2. **Load CARL via global plugin entrypoint** — `scripts/setup-plugin.ts --scope global` completed and OpenCode logs show discovery summary.
3. **Duplicate entrypoint warning** — Logs include the duplicate entrypoint warning when both entrypoints are present.

### Gaps Summary

All automated and human verification items are complete.

---

_Verified: 2026-02-25T17:11:04Z_
_Verifier: Claude (gsd-verifier)_
