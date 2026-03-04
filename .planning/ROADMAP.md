# Roadmap: CARL OpenCode Plugin

## Milestones

- ✅ **v1.0 MVP** - Phases 1-5 (shipped 2026-03-03)
- ✅ **v1.1 Polish & Complete Integration** - Phase 6 (shipped 2026-03-03)
- 🔵 **v1.2 Testing & QA** - Phases 7-11 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

<details>
<summary>✅ v1.0 MVP (Phases 1-5) - SHIPPED 2026-03-03</summary>

- [x] **Phase 1: Plugin Foundation & Rule Discovery** - OpenCode loads CARL locally and discovers rules with correct precedence.
- [x] **Phase 2: Matching, Injection & Command Parity** - Rules are matched/injected deterministically with command modes preserved.
- [x] **Phase 3: Session Stability & Live Updates** - Opt-in, reload, brackets, and compaction keep rule behavior stable.
- [x] **Phase 4: Setup Flow & Templates** - Users get a smooth install flow with seeded templates and docs access.
- [x] **Phase 5: OpenCode Rules Integration & Distribution** - Optional rules integration and npm distribution are available.

</details>

<details>
<summary>✅ v1.1 Polish & Complete Integration (Phase 6) - SHIPPED 2026-03-03</summary>

- [x] **Phase 6: Integration & Developer Experience** - Complete opencode.json integration and troubleshooting/diagnostic tools.

### Phase 6: Integration & Developer Experience
**Goal**: Users have complete OpenCode configuration integration and can troubleshoot plugin issues independently
**Depends on**: Phase 5
**Requirements**: INTE-02, DX-01, DX-02, DX-03
**Success Criteria** (what must be TRUE):
  1. User can add CARL docs to their opencode.json instructions via setup command
  2. User sees clear, actionable error messages when the plugin fails to load
  3. User can enable debug logging to understand CARL's rule matching decisions
  4. User can reference a troubleshooting guide for common issues
**Plans**: 4 plans (complete)

Plans:
- [x] 06-integration-developer-experience/06-01-PLAN.md — opencode.json instructions integration (INTE-02)
- [x] 06-integration-developer-experience/06-02-PLAN.md — Actionable error messages (DX-01)
- [x] 06-integration-developer-experience/06-03-PLAN.md — Debug logging system (DX-02)
- [x] 06-integration-developer-experience/06-04-PLAN.md — Troubleshooting guide (DX-03)

</details>

<details open>
<summary>🔵 v1.2 Testing & QA (Phases 7-11) - IN PROGRESS</summary>

- [ ] **Phase 7: Test Infrastructure & CI Setup** - Jest configuration, directory structure, coverage thresholds, and GitHub Actions workflow
- [ ] **Phase 8: Core Unit Tests - Parsing & Matching** - Manifest parser, keyword scanner, rule composer, and context bracket tests
- [ ] **Phase 9: Core Unit Tests - Session & Setup** - Domain manager, star-command parser, session manager, setup/initializer, and validation tests
- [ ] **Phase 10: Integration Tests** - Plugin lifecycle, rule injection pipeline, domain workflow, and file system operations tests
- [ ] **Phase 11: E2E Tests & Docker** - Docker container setup, full workflow E2E tests with real OpenCode, and CI E2E execution

### Phase 7: Test Infrastructure & CI Setup

**Goal**: Developers have working test infrastructure with automated CI that validates code on every change.

**Depends on**: Phase 6 (v1.1 completion)

**Requirements**: TEST-01, TEST-02, TEST-03, CI-01, CI-02, CI-04

**Success Criteria** (what must be TRUE):
  1. Developer can run `npm test` and see Jest execute tests with ts-jest and Node environment
  2. Developer can view coverage reports showing branch/function/line/statement percentages
  3. CI fails build when coverage drops below 80% threshold
  4. GitHub Actions runs test suite automatically on every PR and push to main
  5. Coverage report is downloadable as workflow artifact from GitHub Actions

**Plans**: TBD

---

### Phase 8: Core Unit Tests - Parsing & Matching

**Goal**: Core parsing and matching logic is validated with comprehensive unit test coverage.

**Depends on**: Phase 7 (test infrastructure)

**Requirements**: UNIT-01, UNIT-02, UNIT-04, UNIT-05

**Success Criteria** (what must be TRUE):
  1. Developer can verify manifest parser handles valid/malformed/empty manifests correctly
  2. Developer can verify keyword scanner matches, excludes, and respects case-insensitivity
  3. Developer can verify rule composer correctly combines single/multiple domains and global rules
  4. Developer can verify context bracket logic classifies fresh/moderate/depleted sessions correctly

**Plans**: TBD

---

### Phase 9: Core Unit Tests - Session & Setup

**Goal**: Session management, setup, and validation logic is validated with comprehensive unit test coverage.

**Depends on**: Phase 7 (test infrastructure)

**Requirements**: UNIT-03, UNIT-06, UNIT-07, UNIT-08, UNIT-09

**Success Criteria** (what must be TRUE):
  1. Developer can verify domain manager load/toggle/list/view operations work correctly
  2. Developer can verify star-command parser handles *carl, *carl docs, and custom commands
  3. Developer can verify session manager creates, retrieves, updates, and persists sessions
  4. Developer can verify setup scaffolds .carl/ directory with templates idempotently
  5. Developer can verify validation module catches manifest and domain errors

**Plans**: TBD

---

### Phase 10: Integration Tests

**Goal**: Plugin components work together correctly across full workflows.

**Depends on**: Phase 8, Phase 9 (unit tests complete)

**Requirements**: INTG-01, INTG-02, INTG-03, INTG-04

**Success Criteria** (what must be TRUE):
  1. Developer can verify plugin initializes, registers hooks, and processes messages end-to-end
  2. Developer can verify manifest → scan → load → compose → inject pipeline produces correct rules
  3. Developer can verify setup → list → toggle workflow operates correctly
  4. Developer can verify file operations (manifest changes, session persistence, global/local resolution) work correctly

**Plans**: TBD

---

### Phase 11: E2E Tests & Docker

**Goal**: Real OpenCode in Docker validates complete user workflows automatically in CI.

**Depends on**: Phase 10 (integration tests complete)

**Requirements**: E2E-01, E2E-02, E2E-03, E2E-04, CI-03

**Success Criteria** (what must be TRUE):
  1. Developer can run Docker container with OpenCode and execute E2E tests locally
  2. Developer can verify full setup flow scaffolds .carl/ and creates valid defaults
  3. Developer can verify keyword matching triggers correct rule injection with real OpenCode
  4. Developer can verify star-commands work correctly with real OpenCode
  5. GitHub Actions runs E2E tests in Docker as part of CI pipeline

**Plans**: TBD

</details>

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Plugin Foundation | v1.0 | 2/2 | Complete | 2026-03-03 |
| 2. Matching & Injection | v1.0 | 4/4 | Complete | 2026-02-26 |
| 3. Session Stability | v1.0 | 2/2 | Complete | 2026-02-26 |
| 4. Setup Flow | v1.0 | 4/4 | Complete | 2026-02-27 |
| 5. Rules Integration | v1.0 | 3/3 | Complete | 2026-03-03 |
| 6. Integration & DX | v1.1 | 4/4 | Complete | 2026-03-03 |
| 7. Test Infrastructure & CI Setup | v1.2 | 0/1 | Not started | - |
| 8. Core Unit Tests - Parsing & Matching | v1.2 | 0/1 | Not started | - |
| 9. Core Unit Tests - Session & Setup | v1.2 | 0/1 | Not started | - |
| 10. Integration Tests | v1.2 | 0/1 | Not started | - |
| 11. E2E Tests & Docker | v1.2 | 0/1 | Not started | - |

---

## Coverage Validation (v1.2)

| Phase | Requirements | Count |
|-------|--------------|-------|
| 7 | TEST-01, TEST-02, TEST-03, CI-01, CI-02, CI-04 | 6 |
| 8 | UNIT-01, UNIT-02, UNIT-04, UNIT-05 | 4 |
| 9 | UNIT-03, UNIT-06, UNIT-07, UNIT-08, UNIT-09 | 5 |
| 10 | INTG-01, INTG-02, INTG-03, INTG-04 | 4 |
| 11 | E2E-01, E2E-02, E2E-03, E2E-04, CI-03 | 5 |

**Total:** 24/24 requirements mapped ✓

---

## Dependencies

```
Phase 6 (v1.1) ✓
     ↓
Phase 7 (Test Infrastructure & CI)
     ↓
Phase 8 (Unit Tests - Parsing) ──┬──→ Phase 10 (Integration Tests)
Phase 9 (Unit Tests - Session) ──┘          ↓
                                     Phase 11 (E2E Tests & Docker)
```

---
*Roadmap created: 2026-02-25*
*Last updated: 2026-03-03 after v1.2 roadmap creation*
