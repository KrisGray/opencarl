# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-03)

**Core value:** Keep CARL's dynamic rule injection working seamlessly inside OpenCode with full parity and minimal user friction.
**Current focus:** v1.2 Testing & QA - Phase 11

## Current Position

**Current Phase:** 11
**Current Phase Name:** E2E Tests & Docker
**Total Phases:** 11
**Current Plan:** Not started
**Total Plans in Phase:** 4
**Status:** Milestone complete
**Last Activity:** 2026-03-05
**Last Activity Description:** Phase 11 complete

**Progress:** [██████████] 100%

---

## Performance Metrics

**Velocity:**
- Total plans completed: 21 (v1.0: 17, v1.1: 4)
- Total execution time: ~2 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Plugin Foundation | 2 | 25 min | 12.5 min |
| 2. Matching & Injection | 4 | 16 min | 4 min |
| 3. Session Stability | 2 | 20 min | 10 min |
| 4. Setup Flow | 4 | 16 min | 4 min |
| 5. Rules Integration | 3 | 4 min | 1.3 min |
| 6. Integration & DX | 4 | 19 min | 4.75 min |

**v1.2 Progress:**
- Phases: 2/5 (Phase 7 & 8 in progress)
- Requirements: 8/24 (Phase 7 complete, UNIT-02, UNIT-04 complete)

---
| Phase 07-02 P02 | 3 min | 3 tasks | 8 files |
| Phase 07 P01 | 4 | 4 tasks | 4 files |
| Phase 07-03 P03 | 5 min | 3 tasks | 2 files |
| Phase 08 P02 | 2 min | 5 tasks | 2 files |
| Phase 08-04 P04 | 2 min | 6 tasks | 1 files |
| Phase 08-05 P05 | 5 min | 7 tasks | 1 files |
| Phase 09-core-unit-tests-session-setup P09 | 3 min | 3 tasks | - files |
| Phase 09.1-close-phase-9-unit-test-gaps P01 | 7 min | 3 tasks | 7 files |
| Phase 09.1 P02 | 2 min | 2 tasks | 4 files |
| Phase 11-e2e-tests-docker P02 | 3 min | 3 tasks | 3 files |
| Phase 11-e2e-tests-docker P03 | 2 min | 1 task | 1 file |
| Phase 11-e2e-tests-docker P04 | 0 min | 1 task | 1 file |

## Milestone Progress

### v1.2 Testing & QA (Current)

| Phase | Status | Progress |
|-------|--------|----------|
| 7. Test Infrastructure & CI Setup | Complete | ██████████ 100% |
| 8. Core Unit Tests - Parsing & Matching | Complete | ██████████ 100% |
| 9. Core Unit Tests - Session & Setup | Complete | ██████████ 100% |
| 10. Integration Tests | Complete | ██████████ 100% |
| 11. E2E Tests & Docker | In Progress | ████░░░░░░ 75% |

### Prior Milestones

- **v1.1 Polish & Complete Integration** - Shipped 2026-03-03 ✓
- **v1.0 MVP** - Shipped 2026-03-03 ✓

---

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.

**v1.2 Decisions:**
- Jest with ts-jest preset (TypeScript project, industry standard)
- 80% coverage threshold (balance quality vs velocity)
- Docker for E2E tests (isolated, reproducible OpenCode environment)
- GitHub Actions for CI (native GitHub integration)
- Separate unit test phases by domain (natural grouping)

**v1.1 Decisions:**
- Zero-overhead debug logging (cache env var check)
- Relative path for opencode.json instructions
- Structured errors with actionable fix suggestions
- Comprehensive troubleshooting guide

**v1.0 Decisions (archived):**
- See .planning/milestones/v1.0-ROADMAP.md
- [Phase 07]: Coverage reporters: text, lcov, html (text for console, lcov for CI, html for visual)
- [Phase 08-03]: BDD-style nested describes for test organization — Groups tests by functionality for easy navigation and failing tests
- [Phase 08]: Added temp directory cleanup hooks (beforeEach/afterEach) for consistent inline test data approach
- [Phase 08]: Fixed import syntax in validate.ts using namespace imports (* as)
- [Phase 08-04]: Fixed test destructuring order to match actual parseContextFile return type [bracketFlags, bracketRules]
- [Phase 08-05]: Context bracket tests must match rulesBracket rules, not bracket name — buildCarlInjection uses rulesBracket to select rules, not the display bracket
- [Phase 09-01]: Use namespace imports (* as fs) with esModuleInterop for TypeScript compatibility — Default imports (import fs from 'fs') incompatible with TypeScript configuration; namespace imports work with esModuleInterop enabled

### Active Constraints

1. Tests run via shell script and/or GitHub Actions (user requirement)
2. E2E tests use real OpenCode in Docker container (user requirement)
3. 80% coverage threshold enforced (user requirement)

### Technical Notes

- Test directory: `tests/javascript/` (per test plan)
- Fixtures directory: `tests/fixtures/` (manifests, prompts, sessions)
- E2E Docker: OpenCode container with plugin mounted
- Coverage artifacts: Uploaded to GitHub Actions
- Detailed test plan: `.planning/OPENCARL_TEST_PLAN.md`

### Pending Todos

None.

### Blockers/Concerns

None.

---

## Session Continuity

**Last session:** 2026-03-05T16:22:22Z
**Stopped at:** Completed 11-04-PLAN.md
**Resume file:** None

### Recent Activity

| Date | Action | Result |
|------|--------|--------|
| 2026-03-05 | Plan 11-04 complete | Star-command fixture added (5 files now in fixtures/) |
| 2026-03-05 | Plan 11-03 complete | GitHub Actions CI for E2E tests (e2e-tests.yml) |
| 2026-03-05 | Plan 11-02 complete | E2E test suites for setup, keyword, star-command tests |
| 2026-03-05 | Plan 11-01 complete | Docker infrastructure for E2E testing |

---
*State initialized: 2026-02-25*
*Last updated: 2026-03-05 after Plan 11-04 completion*
