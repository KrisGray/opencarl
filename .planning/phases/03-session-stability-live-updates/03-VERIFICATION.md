---
phase: 03-session-stability-live-updates
verified: 2026-02-26T18:15:00Z
status: passed
score: 7/7 must-haves verified
re_verification: false
---

# Phase 3: Session Stability & Live Updates Verification Report

**Phase Goal:** Rule behavior stays stable across sessions, reloads, and compaction.
**Verified:** 2026-02-26T18:15:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth | Status | Evidence |
| --- | ----- | ------ | -------- |
| 1 | Project rules apply only when project opt-in is enabled in config and a project .carl/ directory exists; invalid project edits disable project rules. | ✓ VERIFIED | loader.ts:244,268-282 - `projectOptIn` check gates project discovery; `projectStatus="invalid"` drops all project domains/payloads |
| 2 | Editing files under .carl/ or .opencode/carl/ refreshes rule discovery on the next turn. | ✓ VERIFIED | plugin-hooks.ts:272-278 - `file.watcher.updated` → `markRulesDirty()`; rule-cache.ts:111-118 - `getCachedRules()` reloads when dirty |
| 3 | Invalid project reload warnings appear once per session. | ✓ VERIFIED | plugin-hooks.ts:197-210 - `hasSessionWarned`/`markSessionWarned` guard prevents repeat warnings; `clearSessionWarning` on valid recovery |
| 4 | Per-session override files can disable domains for the active session via inherit/true/false flags. | ✓ VERIFIED | session-overrides.ts:44-104 `loadSessionOverrides()` parses `.carl/sessions/{id}.json`; `applySessionOverrides()` filters domains by `false` flag |
| 5 | Context bracket selection is computed from token headroom and only affects CONTEXT rules. | ✓ VERIFIED | context-brackets.ts:39-54 `getContextBracket()` maps percentage to bracket; injector.ts:38-82 `renderContextRules()` only for CONTEXT domain |
| 6 | CRITICAL bracket emits a warning while using DEPLETED context rules. | ✓ VERIFIED | injector.ts:62-65,146-150 - `isCritical` check emits `formatCriticalWarning()`; `rulesBracket` mapped to DEPLETED via `getRulesBracket()` |
| 7 | After compaction, context bracket selection and rule matching continue using the remaining transcript signals with no special resets or warnings. | ✓ VERIFIED | No compaction-specific code anywhere — bracket selection uses current session token telemetry from `client.session.messages()`; no cache clears or warnings on compaction |

**Score:** 7/7 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `src/carl/rule-cache.ts` | Session-scoped rule discovery cache with dirty tracking | ✓ VERIFIED | 192 lines with `getCachedRules`, `markRulesDirty`, `isCarlPath`, session warning guard, project opt-in tracking |
| `src/carl/loader.ts` | Project validity classification and filtered payloads | ✓ VERIFIED | 419 lines with `loadCarlRules`, `loadProjectRules`, `projectStatus` tracking, session overrides integration |
| `src/carl/session-overrides.ts` | Per-session override parsing and domain gating | ✓ VERIFIED | 156 lines with `loadSessionOverrides`, `applySessionOverrides`, `isDomainDisabledBySession` |
| `src/integration/plugin-hooks.ts` | Reload invalidation and per-session warning guard | ✓ VERIFIED | 280 lines with `file.watcher.updated` handler, session warning guard, context bracket computation |
| `src/carl/context-brackets.ts` | Context remaining + bracket resolution utilities | ✓ VERIFIED | 207 lines with `getContextBracket`, `computeContextBracketData`, `selectBracketRules`, `formatCriticalWarning` |
| `src/carl/injector.ts` | Context bracket selection and critical warning output | ✓ VERIFIED | 226 lines with `renderContextRules`, bracket-aware injection, CRITICAL warning emission |
| `src/carl/types.ts` | CarlProjectStatus, bracket fields in payload | ✓ VERIFIED | Added `projectStatus`, `projectWarnings`, `bracketFlags`, `bracketRules` fields |
| `src/carl/validate.ts` | CONTEXT domain bracket parsing | ✓ VERIFIED | Lines 221-331 with `isValidContextRuleKey`, bracket flag and rule parsing |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| `plugin-hooks.ts` | `rule-cache.ts` | `file.watcher.updated` → `markRulesDirty()` | ✓ WIRED | plugin-hooks.ts:272-278 calls `markRulesDirty()` when `isCarlPath()` is true |
| `plugin-hooks.ts` | `session-overrides.ts` | session id + `.carl/sessions/{session_id}.json` | ✓ WIRED | loader.ts:370-373 calls `loadSessionOverrides(sessionCarlDir, options.sessionId)` |
| `plugin-hooks.ts` | `loader.ts` | config opt-in passed to `loadCarlRules` | ✓ WIRED | rule-cache.ts:108 stores `projectOptIn`; loader.ts:244,268 uses `projectOptIn` to gate project loading |
| `plugin-hooks.ts` | `loader.ts` | rule cache refresh | ✓ WIRED | plugin-hooks.ts:194 calls `getCachedRules({ sessionId })`; cache reloads when dirty |
| `plugin-hooks.ts` | console.warn | warn once per session | ✓ WIRED | plugin-hooks.ts:197-210 uses `hasSessionWarned`/`markSessionWarned` guard |
| `plugin-hooks.ts` | `context-brackets.ts` | session messages → bracket | ✓ WIRED | plugin-hooks.ts:142-164 `getContextBracketFromSession()` reads token telemetry |
| `injector.ts` | CONTEXT domain payload | selected bracket rules | ✓ WIRED | injector.ts:38-82 `renderContextRules()` uses `selectBracketRules()` with `contextBracket.rulesBracket` |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ----------- | ----------- | ------ | -------- |
| RULE-04 | 03-01 | Respect explicit opt-in for project rules before applying them | ✓ SATISFIED | loader.ts:244 `projectOptIn` flag; loader.ts:268 gates project loading when opt-in is false |
| RULE-05 | 03-01 | Reload rules on `.carl/` changes without restarting OpenCode | ✓ SATISFIED | rule-cache.ts `markRulesDirty()` + `getCachedRules()`; plugin-hooks.ts:272-278 file watcher |
| CTXT-02 | 03-02 | Apply context brackets (fresh/moderate/depleted) to select rules | ✓ SATISFIED | context-brackets.ts bracket computation; injector.ts bracket-aware CONTEXT rendering |
| CTXT-03 | 03-02 | Persist minimal state across compaction so rules stay consistent | ✓ SATISFIED | No compaction-specific handling — bracket selection uses remaining transcript signals; no cache clears |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | None found | ℹ️ Info | Clean implementation with no TODO/FIXME/placeholder comments |

Scanned for: `TODO|FIXME|XXX|HACK|PLACEHOLDER|placeholder|coming soon|will be here|return null|return {}|return []|=> {}`

The `return null` and `return []` patterns found are legitimate control flow (empty/disabled states), not stubs.

### Human Verification Required

No human verification required — all must-haves are programmatically verifiable.

### Gaps Summary

No gaps found. All truths verified, all artifacts substantive and wired, all requirements satisfied.

**Commits verified:**
- `43f3052` - Task 1: Rule cache with live reload invalidation
- `d2db494` - Task 2: Project opt-in gating and per-session warning guard
- `51603c5` - Task 3: Per-session overrides
- `738fdc6` - Task 1 (03-02): Context bracket selection and CONTEXT rule filtering

**Smoke tests passed:** `bun run scripts/carl-injection-smoke.ts` - all checks passed

---

_Verified: 2026-02-26T18:15:00Z_
_Verifier: Claude (gsd-verifier)_
