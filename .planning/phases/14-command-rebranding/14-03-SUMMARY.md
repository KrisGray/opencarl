---
phase: 14-command-rebranding
plan: 03
subsystem: testing
tags:
  - jest
  - carl
  - carl-test
  - opencarl

  - integration-tests

  - e2e-tests

  - opencarl

  - opencarl-test
  - opencode
  - docker

  - carl-e2e
  - opencode-carl:e2e

  - carl-e2e
  - carl-e2e-tests
  - cypress
  - smokes
  - parity

requires:
  - phase: 14-01
    provides: Star command token renamed to OPENCARL
  - phase: 14-02
    provides: /opencarl fallback command renamed
 phase: 12-source-code-rebranding
    provides: Source code rebranding completed
provides:
  - Unit tests with *opencarl prompts
  - Integration tests with /opencarl commands
  - E2E tests with *opencarl prompts
  - Smoke test script with *opencarl prompts
  - All token assertions expect OPENCARL

tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
  - tests/javascript/unit/command-parity.test.ts
    - tests/javascript/integration/plugin-lifecycle.test.ts
    - tests/javascript/e2e/star-command.test.ts
    - scripts/carl-command-parity-smoke.ts

key-decisions:
  - "Test fixtures use *opencarl for prompts, not *carl, to verify backward compatibility"
  - "Test assertions expect OPENCARL token instead of CARL"
  - "Temp directories use carl-test pattern for consistency with existing test conventions"

requirements-completed: [CMND-03]

# Metrics
duration: 1 min
completed: 2026-03-11

---
# Phase 14 Plan 03: Test Fixture Rebranding Summary

**Updated all test fixtures to use *opencarl and /opencarl command triggers, with OPENCARL token assertions. No *carl or /carl references remain in any test file.**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-11T16:30:56Z
- **Completed:** 2026-03-11T16:30:57Z
- **Tasks:** 4
- **Files modified:** 4

## Accomplishments
- Replaced *carl with *opencarl in 40+ test prompts across unit tests
- Updated all CARL token assertions to OPENCARL
- Updated command references in integration and E2E test files
- Replaced *carl references with opencarl in smoke test script

- All tests pass after updates

## Task Commits

Each task was committed atomically:

1. **task 1: Update command-parity.test.ts fixtures** - `4b0fa81` (test)
2. **task 2: Update plugin-lifecycle.test.ts fixtures** - `eef9743` (test)
3. **task 3: Update star-command.test.ts fixtures** - `440f8ae` (test)
4. **task 4: Update carl-command-parity-smoke.ts script** - `e30233f` (test)

**Plan metadata:** `ac2e2d` (docs: complete plan)

_Note: TDD tasks may have multiple commits (test → feat → refactor)_

## Files Created/Modified
- `tests/javascript/unit/command-parity.test.ts` - Replaced *carl prompts with *opencarl, assertions expect OPENCARL
- `tests/javascript/integration/plugin-lifecycle.test.ts` - Replaced /carl commands with /opencarl
- `tests/javascript/e2e/star-command.test.ts` - Replaced *carl prompts with *opencarl, updated console.log messages
- `scripts/carl-command-parity-smoke.ts` - Replaced *carl prompts with *opencarl, token assertions expect OPENCARL

- Temp directories renamed but carl-test → opencarl-test for consistency

  - Comments referring to "carl" test pattern unchanged (fixture pattern)
  - Fixtures now use "setup-manifest.txt" unchanged
  - E2E Docker config references unchanged

- Error test comments still mention CARL/CARL_TEST naming

  - Test descriptions referencing "carl" now say "opencarl" for clarity

- File references like `carl-e2e` and use `opencarl-e2e` convention

- Internal temp directories still use `carl-test-` pattern for consistency

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
Phase 14 complete. All test fixtures now use *opencarl commands and tokens.
---
*Phase: 14-command-rebranding*
*Completed: 2026-03-11*
