---
phase: 03-session-stability-live-updates
plan: 02
subsystem: context
tags: [context-brackets, token-telemetry, rule-filtering, session-stability]

requires:
  - phase: 03-01
    provides: Session override system and invalid project rule handling
provides:
  - Context bracket computation from token headroom
  - CONTEXT domain rule filtering by bracket
  - CRITICAL warning when context < 25%
  - Session token telemetry integration in plugin hooks
affects: [injection, plugin-hooks, loader]

tech-stack:
  added: []
  patterns:
    - Context bracket selection (FRESH/MODERATE/DEPLETED/CRITICAL)
    - Token telemetry reading from OpenCode session messages
    - Per-bracket rule organization in CONTEXT domain files

key-files:
  created:
    - src/carl/context-brackets.ts
  modified:
    - src/carl/injector.ts
    - src/carl/loader.ts
    - src/carl/types.ts
    - src/carl/validate.ts
    - src/integration/plugin-hooks.ts
    - scripts/carl-injection-smoke.ts

key-decisions:
  - "CRITICAL bracket uses DEPLETED rules with explicit warning"
  - "Context remaining computed from token usage via session messages API"
  - "No compaction-specific handling - bracket selection uses remaining transcript signals"

patterns-established:
  - "Bracket thresholds: FRESH >=60%, MODERATE >=40%, DEPLETED >=25%, CRITICAL <25%"
  - "CONTEXT domain files use {BRACKET}_RULES flags and {BRACKET}_RULE_N entries"

requirements-completed: [CTXT-02, CTXT-03]

duration: 10 min
completed: 2026-02-26
---

# Phase 3 Plan 2: Context Bracket Selection Summary

**Context bracket selection with FRESH/MODERATE/DEPLETED/CRITICAL thresholds, filtering CONTEXT rules by token headroom**

## Performance

- **Duration:** 10 min
- **Started:** 2026-02-26T16:43:43Z
- **Completed:** 2026-02-26T16:53:16Z
- **Tasks:** 1
- **Files modified:** 7

## Accomplishments

- Added `context-brackets.ts` with bracket computation utilities (thresholds, selection, formatting)
- Parsed CONTEXT domain files into bracket flags + per-bracket rule lists (mirroring carl-hook.py)
- Integrated context bracket filtering into injection pipeline
- Connected session token telemetry to plugin hooks for bracket computation
- CRITICAL bracket (<25%) emits warning while using DEPLETED rules
- Maintained compaction continuity with no special resets or cache clears

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement context bracket selection and CONTEXT rule filtering** - `738fdc6` (feat)

**Plan metadata:** (to be committed)

## Files Created/Modified

- `src/carl/context-brackets.ts` - Context bracket utilities (computation, selection, formatting)
- `src/carl/injector.ts` - Bracket-aware injection with CONTEXT filtering and CRITICAL warning
- `src/carl/loader.ts` - Includes bracketFlags and bracketRules in CONTEXT domain payload
- `src/carl/types.ts` - Added bracketFlags and bracketRules to CarlRuleDomainPayload
- `src/carl/validate.ts` - Parse CONTEXT domain with bracket-specific entries
- `src/integration/plugin-hooks.ts` - Compute context bracket from session token telemetry
- `scripts/carl-injection-smoke.ts` - Added context bracket verification tests

## Decisions Made

- **CRITICAL uses DEPLETED rules**: When context falls below 25%, the CRITICAL bracket uses DEPLETED rules but emits a warning to recommend compaction or spawning a fresh agent
- **Token telemetry source**: Uses `client.session.messages()` token usage fields (input_tokens + cache_read_input_tokens)
- **No compaction special handling**: Bracket selection and rule matching continue using whatever transcript signals remain after compaction

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation followed the plan without issues.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Context bracket system complete and tested
- Ready for Phase 4 or any remaining session stability work
- All smoke tests passing with context bracket verification

## Self-Check: PASSED

- Verified: src/carl/context-brackets.ts exists
- Verified: commit 738fdc6 exists in git history
- Verified: bun run scripts/carl-injection-smoke.ts passes

---
*Phase: 03-session-stability-live-updates*
*Completed: 2026-02-26*
