# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-18)

**Core value:** Keep OpenCARL's dynamic rule injection working seamlessly inside OpenCode with full parity and minimal user friction
**Current focus:** v1.3 Branding & Context Migration - Phase 12 (Source Code Rebranding)

## Current Position

**Current Phase:** 12
**Current Phase Name:** Source Code Rebranding
**Total Phases:** 17
**Current Plan:** 8
**Total Plans in Phase:** 8
**Status:** Phase complete — ready for verification
**Last Activity:** 2026-03-10
**Last Activity Description:** v1.3 roadmap created, 6 phases planned for CARL → OpenCARL rebranding
**Progress:** [██████████] 100%

---

## Performance Metrics

**Velocity:**
- Total plans completed: 43 (v1.0: 17, v1.1: 4, v1.2: 22)
- Total execution time: ~3 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Plugin Foundation | 2 | 25 min | 12.5 min |
| 2. Matching & Injection | 4 | 16 min | 4 min |
| 3. Session Stability | 2 | 20 min | 10 min |
| 4. Setup Flow | 4 | 16 min | 4 min |
| 5. Rules Integration | 3 | 4 min | 1.3 min |
| 6. Integration & DX | 4 | 19 min | 4.75 min |
| 7. Test Infrastructure & CI Setup | 3 | 15 min | 5 min |
| 8. Core Unit Tests - Parsing & Matching | 5 | 19 min | 3.8 min |
| 9. Core Unit Tests - Session & Setup | 5 | 23 min | 4.6 min |
| 9.1. Close Phase 9 Unit Test Gaps | 2 | 9 min | 4.5 min |
| 10. Integration Tests | 4 | 18 min | 4.5 min |
| 11. E2E Tests & Docker | 4 | 17 min | 4.25 min |

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
| Phase 12-source-code-rebranding P02 | 13 min | 2 tasks | 9 files |
| Phase 12-source-code-rebranding P03 | 9 min | 2 tasks | 46 files |
| Phase 12-source-code-rebranding P04 | 24.5 min | 2 tasks | 22 files |
| Phase 12-source-code-rebranding P08 | 0 min | 1 tasks | 1 files |
| Phase 12-source-code-rebranding P08 | 0 min | 1 tasks | 1 files |
| Phase 12 P05 | 1 min | 1 tasks | 1 files |
| Phase 12 P13 | 4 min | 1 tasks | 6 files |
| Phase 12 P15 | 1 min | 1 tasks | 2 files |
| Phase 12 P09 | 0 min | 1 tasks | 0 files |
| Phase 12 P11 | 1 min | 1 tasks | 0 files |
| Phase 12 P06 | 0 min | 1 tasks | 0 files |
| Phase 12 P14 | 1 min | 1 tasks | 1 files |
| Phase 12-source-code-rebranding P10 | 0 min | 1 tasks | 0 files |
| Phase 12 P07 | 2 min | 1 tasks | 2 files |
| Phase 12 P12 | 2 min | 1 tasks | 6 files |
| Phase 12 P16 | 0 min | 1 tasks | 0 files |

## Milestone Progress

### v1.3 Branding & Context Migration (Current)

**Milestone Goal:** Replace all CARL branding with OpenCARL across source code, configuration, commands, environment variables, documentation, and package metadata

| Phase | Status | Progress |
|-------|--------|----------|
| 12. Source Code Rebranding | Not started | ░░░░░░░░░░ 0% |
| 13. Configuration & Directory Migration | Not started | ░░░░░░░░░░ 0% |
| 14. Command Rebranding | Not started | ░░░░░░░░░░ 0% |
| 15. Environment Variable Rebranding | Not started | ░░░░░░░░░░ 0% |
| 16. Documentation Rebranding | Not started | ░░░░░░░░░░ 0% |
| 17. Package Metadata & CI/CD Finalization | Not started | ░░░░░░░░░░ 0% |

### Prior Milestones

- **v1.2 Testing & QA** - Shipped 2026-03-18 ✓ (312 tests, 79.44% coverage)
- **v1.1 Polish & Complete Integration** - Shipped 2026-03-03 ✓
- **v1.0 MVP** - Shipped 2026-03-03 ✓

---

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.

**v1.3 Decisions:**
- Pure rebranding milestone (no new features)
- Phase order: imports before directories to prevent compilation errors
- Environment variables cross-cutting (updated after structure settled)
- Documentation last (reflects final state)
- CI/CD finalization (verifies end-to-end with Docker)

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
- [Phase 12]: Compound names: CarlRuleDomainPayload → OpencarlRuleDomainPayload (lowercase 'c' after prefix) — Maintains readable naming convention
- [Phase 12]: Use 'Opencarl' prefix (CamelCase, lowercase 'carl') — Rebranding from CARL to OpenCARL requires type prefix updates
- [Phase 12-source-code-rebranding]: Function naming: opencarl prefix (camelCase) — Renamed all functions from carl to opencarl prefix following camelCase convention
- [Phase 12-source-code-rebranding]: Variable naming: opencarl prefix (camelCase) — Renamed all variables from carl to opencarl prefix following camelCase convention
- [Phase 12-source-code-rebranding]: Interface renaming: Carl* → Opencarl* — Renamed all interface types from Carl prefix to Opencarl prefix
- [Phase 12-source-code-rebranding]: Import path updates: src/carl/ → src/opencarl/ — Directory renamed and all import paths updated to match new naming convention
- [Phase 12-source-code-rebranding]: Variable naming: projectCarlDir → projectOpencarlDir, etc. — Test variables updated to match renamed OpencarlRuleDiscoveryOverrides interface
- [Phase 12]: None - followed plan with a targeted bug fix to unblock tests
- [Phase ?]: None - followed plan as specified
- [Phase 12]: No changes required; batch A integration/e2e tests already reference src/opencarl paths

### Active Constraints

1. All CARL → OpenCARL, carl → opencarl references must be updated (branding consistency)
2. Import statements must be updated BEFORE renaming directories (prevent breakage)
3. All 25 v1.3 requirements must be mapped to exactly one phase (coverage validation)

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

**Last session:** 2026-03-10T11:31:08.269Z
**Stopped At:** Completed 12-16-PLAN.md
**Resume File:** None

### Recent Activity

| Date | Action | Result |
|------|--------|--------|
| 2026-03-06 | v1.3 roadmap created | 6 phases (12-17), 25 requirements mapped ✓ |
| 2026-03-05 | v1.2 completed | 312 tests, 79.44% coverage, shipped ✓ |
| 2026-03-05 | Plan 11-04 complete | Star-command fixture added (5 files now in fixtures/) |
| 2026-03-05 | Plan 11-03 complete | GitHub Actions CI for E2E tests (e2e-tests.yml) |
| 2026-03-05 | Plan 11-02 complete | E2E test suites for setup, keyword, star-command tests |
| 2026-03-05 | Plan 11-01 complete | Docker infrastructure for E2E testing |

---
*State initialized: 2026-02-25*
*Last updated: 2026-03-06 after v1.3 roadmap creation*
