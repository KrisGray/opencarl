# Roadmap: OpenCARL OpenCode Plugin

## Milestones

- ✅ **v1.0 MVP** - Phases 1-5 (shipped 2026-03-03)
- ✅ **v1.1 Polish & Complete Integration** - Phase 6 (shipped 2026-03-03)
- ✅ **v1.2 Testing & QA** - Phases 7-11 (shipped 2026-03-18)
- 🚧 **v1.3 Branding & Context Migration** - Phases 12-17 (in progress)

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

<details>
<summary>✅ v1.2 Testing & QA (Phases 7-11) - SHIPPED 2026-03-18</summary>

See [.planning/milestones/v1.2-ROADMAP.md](.planning/milestones/v1.2-ROADMAP.md) for full details.

- [x] **Phase 7: Test Infrastructure & CI Setup** - Jest configuration, directory structure, coverage thresholds, and GitHub Actions workflow
- [x] **Phase 8: Core Unit Tests - Parsing & Matching** - Manifest parser, keyword scanner, rule composer, and context bracket tests
- [x] **Phase 9: Core Unit Tests - Session & Setup** - Domain manager, star-command parser, session manager, setup/initializer, and validation tests
- [x] **Phase 9.1 (INSERTED): Close Phase 9 Unit Test Gaps** - Complete missing/partial Phase 9 unit tests and verification
- [x] **Phase 10: Integration Tests** - Plugin lifecycle, rule injection pipeline, domain workflow, and file system operations tests
- [x] **Phase 11: E2E Tests & Docker** - Docker container setup, full workflow E2E tests with real OpenCode, and CI E2E execution

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

**Plans**: 5 plans

Plans:
- [x] 08-01-PLAN.md — Test fixtures and helper factories (Wave 0)
- [ ] 08-02-PLAN.md — Manifest parser tests -UNIT-01 (Wave 1)
- [x] 08-03-PLAN.md — Keyword scanner tests -UNIT-02 (Wave 1)
- [ ] 08-04-PLAN.md — Context bracket tests-UNIT-05 (Wave 1)
- [ ] 08-05-PLAN.md — Rule composer/injector tests-UNIT-04 (Wave 2)

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

**Plans**: 5 plans

Plans:
- [ ] 09-01-PLAN.md — Test helpers (session-state-factory, setup-mocks) (Wave 0)
- [ ] 09-02-PLAN.md — Command parity tests - UNIT-06 (Wave 1)
- [ ] 09-03-PLAN.md — Validation domain rules tests - UNIT-09 (Wave 1)
- [ ] 09-04-PLAN.md — Session overrides tests - UNIT-03, UNIT-07 (Wave 2)
- [ ] 09-05-PLAN.md — Setup tests - UNIT-08 (Wave 2)

---

### Phase 9.1 (INSERTED): Close Phase 9 Unit Test Gaps

**Goal**: Phase 9 unit test requirements are fully satisfied and verified.

**Depends on**: Phase 9 (unit test plans executed)

**Requirements**: UNIT-03, UNIT-06, UNIT-07, UNIT-08, UNIT-09

**Gap Closure**: Closes audit gaps from v1.2 milestone audit (Phase 9 unverified + missing tests).

**Success Criteria** (what must be TRUE):
  1. Domain manager tests exist and cover load/toggle/list/view operations
  2. Star-command parser tests cover *carl, *carl docs, and custom commands
  3. Session manager tests cover create/get/update/persist
  4. Setup/initializer tests cover .carl/ scaffolding and idempotency
  5. Validation tests cover manifest + domain validation paths
  6. Phase 9 verification report exists and passes

**Plans**: 2 plans

Plans:
- [ ] 09.1-01-PLAN.md — Domain/session manager tests (loader, rule-cache, signal-store)
- [ ] 09.1-02-PLAN.md — Phase 9.1 verification report + requirement evidence

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

**Plans**: 4 plans

Plans:
- [ ] 10-01-PLAN.md — Plugin lifecycle tests (INTG-01)
- [ ] 10-02-PLAN.md — Rule injection pipeline tests (INTG-02)
- [ ] 10-03-PLAN.md — Setup and domain workflow tests (INTG-03)
- [ ] 10-04-PLAN.md — File system operations tests (INTG-04)

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

**Plans**: 4 plans

Plans:
- [x] 11-01-PLAN.md — Docker container with OpenCode for E2E testing (E2E-01)
- [x] 11-02-PLAN.md — E2E tests for setup, keyword matching, and star-commands (E2E-02, E2E-03, E2E-04)
- [x] 11-03-PLAN.md — GitHub Actions workflow for E2E tests (CI-03)
- [ ] 11-04-PLAN.md — Add 5th fixture file to close verification gap

</details>

### 🚧 v1.3 Branding & Context Migration (In Progress)

**Milestone Goal:** Replace all CARL branding with OpenCARL across source code, configuration, commands, environment variables, documentation, and package metadata

#### Phase 12: Source Code Rebranding
**Goal**: Update all TypeScript type names, function/variable names, and import statements from CARL to OpenCARL
**Depends on**: Phase 11
**Requirements**: SOURCE-01, SOURCE-02, SOURCE-03, SOURCE-04
**Success Criteria** (what must be TRUE):
  1. All TypeScript types use "Opencarl" prefix (e.g., CarlRuleDomainPayload → OpencarlRuleDomainPayload)
  2. All functions and variables use "opencarl" prefix throughout the codebase
  3. Import statements reference ./opencarl/* paths instead of ./carl/*
  4. Internal code comments reference OpenCARL branding consistently
**Plans**: 4 plans

Plans:
- [ ] 12-01-PLAN.md — Rename type declarations and references (SOURCE-01)
- [ ] 12-02-PLAN.md — Rename function/variable declarations and references (SOURCE-02)
- [ ] 12-03-PLAN.md — Update import statements to opencarl paths (SOURCE-03)
- [ ] 12-04-PLAN.md — Update code comments to OpenCARL branding (SOURCE-04)

---

#### Phase 13: Configuration & Directory Migration
**Goal**: Rename directories and update all file path references
**Depends on**: Phase 12
**Requirements**: CONFIG-01, CONFIG-02, CONFIG-03, CONFIG-04, CONFIG-05
**Success Criteria** (what must be TRUE):
  1. src/carl/ directory is renamed to src/opencarl/
  2. .carl/ configuration directory is renamed to .opencarl/
  3. .carl-template/ directory is renamed to .opencarl-template/
  4. All file path references in code use new directory names
  5. Setup flow scaffolds .opencarl/ directory with updated templates
**Plans**: TBD

Plans:
- [ ] 13-01: Rename src/carl/ to src/opencarl/ (CONFIG-01)
- [ ] 13-02: Rename .carl/ to .opencarl/ (CONFIG-02)
- [ ] 13-03: Rename .carl-template/ to .opencarl-template/ (CONFIG-03)
- [ ] 13-04: Update file path references (CONFIG-04)
- [ ] 13-05: Update setup scaffolding (CONFIG-05)

---

#### Phase 14: Command Rebranding
**Goal**: Update command triggers from CARL to OpenCARL
**Depends on**: Phase 13
**Requirements**: CMND-01, CMND-02, CMND-03, CMND-04
**Success Criteria** (what must be TRUE):
  1. *carl command trigger is renamed to *opencarl
  2. /carl fallback command is renamed to /opencarl
  3. All test fixtures with *carl or /carl strings are updated
  4. Help text and command descriptions reference *opencarl and /opencarl
**Plans**: TBD

Plans:
- [ ] 14-01: Rename *carl to *opencarl trigger (CMND-01)
- [ ] 14-02: Rename /carl to /opencarl fallback (CMND-02)
- [ ] 14-03: Update test fixtures (CMND-03)
- [ ] 14-04: Update help text and descriptions (CMND-04)

---

#### Phase 15: Environment Variable Rebranding
**Goal**: Update environment variable from CARL_DEBUG to OPENCARL_DEBUG across all contexts
**Depends on**: Phase 14
**Requirements**: ENV-01, ENV-02, ENV-03, ENV-04
**Success Criteria** (what must be TRUE):
  1. Code references OPENCARL_DEBUG instead of CARL_DEBUG
  2. All CI configuration files use OPENCARL_DEBUG
  3. All test scripts use OPENCARL_DEBUG
  4. Documentation references OPENCARL_DEBUG instead of CARL_DEBUG
**Plans**: TBD

Plans:
- [ ] 15-01: Rename CARL_DEBUG to OPENCARL_DEBUG in code (ENV-01)
- [ ] 15-02: Update CI configurations (ENV-02)
- [ ] 15-03: Update test scripts (ENV-03)
- [ ] 15-04: Update documentation references (ENV-04)

---

#### Phase 16: Documentation Rebranding
**Goal**: Rename documentation files and update all OpenCARL branding references
**Depends on**: Phase 15
**Requirements**: DOCS-01, DOCS-02, DOCS-03, DOCS-04, DOCS-05
**Success Criteria** (what must be TRUE):
  1. CARL-DOCS.md is renamed to OPENCARL-DOCS.md
  2. README.md references OpenCARL branding throughout
  3. INSTALL.md uses .opencarl/ and *opencarl throughout
  4. TROUBLESHOOTING.md references OpenCARL and OPENCARL_DEBUG
  5. All documentation examples use updated naming conventions
**Plans**: TBD

Plans:
- [ ] 16-01: Rename CARL-DOCS.md to OPENCARL-DOCS.md (DOCS-01)
- [ ] 16-02: Update README.md (DOCS-02)
- [ ] 16-03: Update INSTALL.md (DOCS-03)
- [ ] 16-04: Update TROUBLESHOOTING.md (DOCS-04)
- [ ] 16-05: Update all documentation examples (DOCS-05)

---

#### Phase 17: Package Metadata & CI/CD Finalization
**Goal**: Verify package consistency and update Docker/CI references
**Depends on**: Phase 16
**Requirements**: PKG-01, PKG-02, PKG-03, PKG-04, PKG-05
**Success Criteria** (what must be TRUE):
  1. Package name @krisgray/opencarl is consistent across all references
  2. Docker image name is opencode-opencarl:e2e
  3. GitHub Actions workflows use updated package and Docker references
  4. package.json metadata reflects OpenCARL branding
  5. E2E tests pass with updated Docker image
**Plans**: TBD

Plans:
- [ ] 17-01: Verify package name consistency (PKG-01)
- [ ] 17-02: Update Docker image name (PKG-02)
- [ ] 17-03: Update GitHub Actions workflows (PKG-03)
- [ ] 17-04: Update package.json metadata (PKG-04)
- [ ] 17-05: Verify E2E tests pass (PKG-05)

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Plugin Foundation | v1.0 | 2/2 | Complete | 2026-03-03 |
| 2. Matching & Injection | v1.0 | 4/4 | Complete | 2026-02-26 |
| 3. Session Stability | v1.0 | 2/2 | Complete | 2026-02-26 |
| 4. Setup Flow | v1.0 | 4/4 | Complete | 2026-02-27 |
| 5. Rules Integration | v1.0 | 3/3 | Complete | 2026-03-03 |
| 6. Integration & DX | v1.1 | 4/4 | Complete | 2026-03-03 |
| 7. Test Infrastructure & CI Setup | v1.2 | 3/3 | Complete | 2026-03-04 |
| 8. Core Unit Tests - Parsing & Matching | v1.2 | 5/5 | Complete | 2026-03-04 |
| 9. Core Unit Tests - Session & Setup | v1.2 | 5/5 | Complete | 2026-03-04 |
| 9.1. Close Phase 9 Unit Test Gaps | v1.2 | 2/2 | Complete | 2026-03-05 |
| 10. Integration Tests | v1.2 | 4/4 | Complete | 2026-03-05 |
| 11. E2E Tests & Docker | v1.2 | 4/4 | Complete | 2026-03-05 |
| 12. Source Code Rebranding | 1/4 | In Progress|  | - |
| 13. Configuration & Directory Migration | v1.3 | 0/5 | Not started | - |
| 14. Command Rebranding | v1.3 | 0/4 | Not started | - |
| 15. Environment Variable Rebranding | v1.3 | 0/4 | Not started | - |
| 16. Documentation Rebranding | v1.3 | 0/5 | Not started | - |
| 17. Package Metadata & CI/CD Finalization | v1.3 | 0/5 | Not started | - |

---

## Coverage Validation (v1.3)

| Phase | Requirements | Count |
|-------|--------------|-------|
| 12 | SOURCE-01, SOURCE-02, SOURCE-03, SOURCE-04 | 4 |
| 13 | CONFIG-01, CONFIG-02, CONFIG-03, CONFIG-04, CONFIG-05 | 5 |
| 14 | CMND-01, CMND-02, CMND-03, CMND-04 | 4 |
| 15 | ENV-01, ENV-02, ENV-03, ENV-04 | 4 |
| 16 | DOCS-01, DOCS-02, DOCS-03, DOCS-04, DOCS-05 | 5 |
| 17 | PKG-01, PKG-02, PKG-03, PKG-04, PKG-05 | 5 |

**Total:** 25/25 requirements mapped ✓

---

## Dependencies

```
Phase 11 (v1.2) ✓
     ↓
Phase 12: Source Code Rebranding
     ↓
Phase 13: Configuration & Directory Migration
     ↓
Phase 14: Command Rebranding
     ↓
Phase 15: Environment Variable Rebranding
     ↓
Phase 16: Documentation Rebranding
     ↓
Phase 17: Package Metadata & CI/CD Finalization
```

**Rationale for v1.3 phase ordering:**
- **Import statements before directories (Phase 12 → 13):** Updating imports first prevents TypeScript compilation errors when directories are renamed
- **Commands after directories (Phase 14):** Command triggers depend on updated internal paths
- **Environment variables cross-cutting (Phase 15):** Updated after code structure is settled to minimize rework
- **Documentation last (Phase 16):** Documentation reflects the final state of all code changes
- **CI/CD finalization (Phase 17):** Package metadata and Docker images must reflect the final, tested state

---
*Roadmap created: 2026-02-25*
*Last updated: 2026-03-06 after v1.3 roadmap creation*
