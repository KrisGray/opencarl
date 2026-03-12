---
phase: 15-env-variable-rebranding
plan: 07
subsystem: infra
tags: [env-vars, semver, opencarl]

# Dependency graph
requires:
  - phase: 14-command-rebranding
    provides: Command rebranding complete for OpenCARL naming
provides:
  - Deprecation warning when CARL_DEBUG is set
  - Major version bump to 2.0.0 for env var breaking change
affects: [phase-16-documentation-rebranding, phase-17-package-metadata]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - stderr deprecation warning emitted at module load when legacy env var is present

key-files:
  created: []
  modified:
    - src/opencarl/debug.ts
    - package.json

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "Legacy env vars emit a one-time stderr warning without re-enabling behavior"

requirements-completed: [ENV-01]

# Metrics
duration: 1 min
completed: 2026-03-12
---

# Phase 15 Plan 07: Deprecation Warning + Version Bump Summary

**CARL_DEBUG now emits a deprecation warning and the package version is bumped to 2.0.0 for the breaking env var rename.**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-12T17:49:03Z
- **Completed:** 2026-03-12T17:50:31Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added a module-load stderr warning when CARL_DEBUG is present
- Bumped package version to 2.0.0 to signal the breaking change

## task Commits

Each task was committed atomically:

1. **task 1: emit CARL_DEBUG deprecation warning** - `88d02bd` (feat)
2. **task 2: bump version for breaking change** - `cc955af` (chore)

**Plan metadata:** pending

## Files Created/Modified
- `src/opencarl/debug.ts` - Emit CARL_DEBUG deprecation warning at module initialization
- `package.json` - Major version bump to 2.0.0

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Ready to continue remaining Phase 15 gap-closure plans (15-05, 15-06, 15-08)

---
*Phase: 15-env-variable-rebranding*
*Completed: 2026-03-12*

## Self-Check: PASSED
- FOUND: .planning/phases/15-env-variable-rebranding/15-07-SUMMARY.md
- FOUND: 88d02bd
- FOUND: cc955af
