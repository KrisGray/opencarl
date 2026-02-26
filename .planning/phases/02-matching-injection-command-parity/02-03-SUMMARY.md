---
phase: 02-matching-injection-command-parity
plan: 03
subsystem: commands
tags: [carl, commands, parity, opencode]

# Dependency graph
requires:
  - phase: 02-matching-injection-command-parity
    provides: deterministic CARL injection composer and session signal capture
provides:
  - shared command resolver for star and slash triggers
  - docs-backed CARL help/manager guidance builder
  - command parity smoke fixtures for star/slash commands
affects: [phase-02, plugin-hooks, command-parity]

# Tech tracking
tech-stack:
  added: []
  patterns: [shared command resolver, docs-backed help guidance]

key-files:
  created:
    - src/carl/command-parity.ts
    - src/carl/help-text.ts
    - scripts/carl-command-parity-smoke.ts
  modified:
    - src/carl/signal-store.ts
    - src/integration/plugin-hooks.ts

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "Command parity resolver merges star commands with slash overrides"
  - "Help guidance assembled directly from CARL docs sources"

requirements-completed: [CMD-01, CMD-02, CMD-03, CMD-04]

# Metrics
duration: 0 min
completed: 2026-02-26
---

# Phase 02 Plan 03: Star/slash command parity and help guidance Summary

**Shared command resolver for *carl/*domain and /carl fallback, with docs-backed help guidance and parity smoke checks.**

## Performance

- **Duration:** 0 min
- **Started:** 2026-02-26T11:12:24Z
- **Completed:** 2026-02-26T11:12:35Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Added a single resolver that normalizes star and slash command signals with diagnostics.
- Wired /carl fallback to the same parity path as star commands via plugin hooks.
- Sourced CARL help/manager guidance from docs and added parity smoke fixtures.

## Task Commits

Each task was committed atomically:

1. **Task 1: Build shared star/slash command resolver** - `15d7c38` (feat)
2. **Task 2: Add `/carl` fallback hook integration using shared resolver** - `c75530c` (feat)
3. **Task 3: Source help guidance from docs and validate command parity** - `f2e9621` (feat)

**Plan metadata:** _pending_

_Note: TDD tasks may have multiple commits (test → feat → refactor)_

## Files Created/Modified
- `src/carl/command-parity.ts` - Shared resolver for star/slash command signals and diagnostics.
- `src/carl/help-text.ts` - Builds CARL help/manager guidance from docs sources.
- `scripts/carl-command-parity-smoke.ts` - Parity fixtures for star/slash command behavior.
- `src/carl/signal-store.ts` - Stores prompt text and command overrides for resolver use.
- `src/integration/plugin-hooks.ts` - Routes /carl through the shared command resolver path.

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Command parity resolver and guidance wiring are in place.
- Ready to run end-to-end Phase 2 parity fixtures in Plan 04.

---
*Phase: 02-matching-injection-command-parity*
*Completed: 2026-02-26*

## Self-Check: PASSED
