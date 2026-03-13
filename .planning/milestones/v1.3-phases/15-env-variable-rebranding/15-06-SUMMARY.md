---
phase: 15-env-variable-rebranding
plan: 06
subsystem: infra
tags: [github-actions, docker, e2e, env-vars]

# Dependency graph
requires:
  - phase: 15-env-variable-rebranding
    provides: OPENCARL_DEBUG rename baseline for CI/test coverage
provides:
  - CI workflows export OPENCARL_DEBUG for test runs
  - E2E tests and backup runner reference opencode-opencarl:e2e
affects: [15-env-variable-rebranding verification, 17-package-metadata-ci-finalization]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - CI env var alignment for debug toggles
    - E2E Docker image naming via IMAGE_NAME constants

key-files:
  created:
    - tests/e2e/run-e2e-tests.sh.backup
  modified:
    - .github/workflows/e2e-tests.yml
    - .github/workflows/test.yml
    - tests/javascript/e2e/keyword-matching.test.ts
    - tests/javascript/e2e/setup-flow.test.ts
    - tests/javascript/e2e/star-command.test.ts

key-decisions:
  - "None - followed plan as specified"

patterns-established:
  - "Set OPENCARL_DEBUG explicitly in CI steps that run tests"

requirements-completed: [ENV-02, ENV-03]

# Metrics
duration: 1 min
completed: 2026-03-12
---

# Phase 15 Plan 06: Env Variable Rebranding Gap Closure Summary

**CI workflows now export OPENCARL_DEBUG and E2E tests/backup runner reference opencode-opencarl:e2e.**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-12T17:49:01Z
- **Completed:** 2026-03-12T17:50:35Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Added OPENCARL_DEBUG to CI test and E2E workflow environments
- Updated E2E tests and backup runner to use opencode-opencarl:e2e image

## task Commits

Each task was committed atomically:

1. **task 1: add OPENCARL_DEBUG to CI workflows** - `32f1b47` (fix)
2. **task 2: update E2E test image references** - `d20fb6d` (fix)

## Files Created/Modified
- `.github/workflows/e2e-tests.yml` - sets OPENCARL_DEBUG for E2E runs
- `.github/workflows/test.yml` - sets OPENCARL_DEBUG for coverage tests
- `tests/javascript/e2e/keyword-matching.test.ts` - updates IMAGE_NAME to opencode-opencarl:e2e
- `tests/javascript/e2e/setup-flow.test.ts` - updates IMAGE_NAME to opencode-opencarl:e2e
- `tests/javascript/e2e/star-command.test.ts` - updates IMAGE_NAME to opencode-opencarl:e2e
- `tests/e2e/run-e2e-tests.sh.backup` - backup runner image name update

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Ready for 15-07 plan execution.
- No blockers identified.

---
*Phase: 15-env-variable-rebranding*
*Completed: 2026-03-12*

## Self-Check: PASSED
