---
phase: 06-integration-developer-experience
plan: 01
subsystem: integration
tags: [opencode, config, setup, cli]

# Dependency graph
requires: []
provides:
  - opencode.json integration for CARL documentation
  - readOpenCodeConfig, mergeCarlInstructions, writeOpenCodeConfig utilities
  - integrateOpencode function for setup command
affects: [setup, developer-experience]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Idempotent config merging (no duplicates)
    - Graceful handling of missing config files
    - Path-relative instruction references

key-files:
  created:
    - src/integration/opencode-config.ts
  modified:
    - src/carl/setup.ts
    - src/integration/plugin-hooks.ts

key-decisions:
  - Use relative path ./resources/docs/CARL-DOCS.md for opencode.json instructions
  - Convert string instructions to array when merging
  - Idempotent check uses path inclusion matching

patterns-established:
  - "Config read/write pattern: readOpenCodeConfig → mergeCarlInstructions → writeOpenCodeConfig"
  - "Integration function returns IntegrationResult with success boolean and message"

requirements-completed: [INTE-02]

# Metrics
duration: 4min
completed: 2026-03-03
---

# Phase 6 Plan 1: OpenCode Config Integration Summary

**Add --integrate-opencode flag to setup command that merges CARL docs into opencode.json instructions field**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-03T17:01:53Z
- **Completed:** 2026-03-03T17:05:59Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created opencode.json config utilities module with read/merge/write functions
- Added integrateOpencode function to setup.ts
- Added /carl setup --integrate-opencode command handler
- Implemented idempotent merging (no duplicates on repeated runs)
- Preserved existing instructions when adding CARL docs

## Task Commits

Each task was committed atomically:

1. **Task 1: Create opencode.json config utilities** - `abe3133` (feat)
2. **Task 2: Add --integrate-opencode flag to setup** - `b1e73e5` (feat)

**Plan metadata:** (pending)

_Note: TDD tasks may have multiple commits (test → feat → refactor)_

## Files Created/Modified
- `src/integration/opencode-config.ts` - OpenCode config read/merge/write utilities
- `src/carl/setup.ts` - Added integrateOpencode function and updated IntegrationOptions
- `src/integration/plugin-hooks.ts` - Added command handler for --integrate-opencode

## Decisions Made
- Used relative path `./resources/docs/CARL-DOCS.md` for instruction reference (works across project setups)
- Converted string instructions to array format for consistency
- Idempotency check uses path inclusion matching to handle edge cases

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None - all verification tests passed on first attempt.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- OpenCode config integration complete
- Ready for next integration DX improvements

---
*Phase: 06-integration-developer-experience*
*Completed: 2026-03-03*
