---
phase: 13-config-directory-migration
plan: 04
type: execute
wave: 2
autonomous: true
requires:
  - CONFIG-04
---

# Dependency Graph
requires: [02]
provides:
  - All script files now use .opencarl paths instead of .carl
  - Verification scripts check .opencarl-template directory

# Tech Stack
tech-stack:
  added: []
  patterns: []

# Key Files
key-files:
  created: []
  modified:
    - scripts/carl-discovery-smoke.ts
    - scripts/carl-injection-smoke.ts
    - scripts/carl-phase2-parity.ts
    - scripts/carl-command-parity-smoke.ts
    - scripts/verify-dist.ts
    - scripts/fixtures/phase2/injection.json

key-decisions: []

requirements-completed:
  - CONFIG-04

---

# Metrics
duration: 0 min (work completed in parallel with 13-03)
completed: 2026-03-10T15:50:00Z
---

---

# Phase 13: Update script path references

## Performance
- **Duration:** 0 min (consolidated with 13-03)
- **Started:** 2026-03-10T14:48:17Z
- **Completed:** 2026-03-10T14:48:17Z
- **Tasks:** 3
- **Files modified:** 6
- **Commits:** 1 consolidated commit (e12fe0c)

---

## Accomplishments
- Updated path references in all smoke test scripts from `.carl` to `.opencarl`
- Scripts updated: carl-discovery-smoke.ts, carl-injection-smoke.ts, carl-phase2-parity.ts, carl-command-parity-smoke.ts
- Updated verify-dist.ts to check `.opencarl-template` directory
- Updated fixtures/phase2/injection.json with new path references

## Decisions Made
- Consolidated script updates with integration test updates in single commit for atomicity

## Deviations from Plan
Work was completed in commit e12fe0c alongside 13-03 integration test updates, rather than in separate commits. All verification steps pass.

## Issues Encountered
None - all script path updates applied successfully

## User Setup Required
None - no external service configuration required

## Next Phase Readiness
Ready for phase verification. All 4 plans in phase 13 complete.

---

*Phase: 13-config-directory-migration*
*Completed: 2026-03-10*
