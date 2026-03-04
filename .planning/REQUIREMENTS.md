# Requirements: OpenCARL v1.2 Testing & QA

**Defined:** 2026-03-03
**Core Value:** Keep CARL's dynamic rule injection working seamlessly inside OpenCode with full parity and minimal user friction.

## v1.2 Requirements

Requirements for testing milestone. Each maps to roadmap phases.

### Test Infrastructure

- [ ] **TEST-01**: Jest configured with ts-jest preset and Node test environment
- [x] **TEST-02**: Test directory structure created with fixtures and mock utilities
- [ ] **TEST-03**: Coverage thresholds set to 80% for branches, functions, lines, statements

### Unit Tests - Core Modules

- [ ] **UNIT-01**: Manifest parser tests (valid single/multi-domain, empty, malformed, STATE/ALWAYS_ON parsing)
- [ ] **UNIT-02**: Keyword scanner / matcher tests (match, exclude, always-on, case-insensitive, multi-domain)
- [ ] **UNIT-03**: Domain manager tests (load, toggle, list, view operations)
- [ ] **UNIT-04**: Rule composer / injector tests (single domain, multiple domains, global rules, context brackets)
- [ ] **UNIT-05**: Context bracket tests (fresh, moderate, depleted classification and rule selection)
- [ ] **UNIT-06**: Star-command parser tests (*carl, *carl docs, custom commands, edge cases)
- [ ] **UNIT-07**: Session manager tests (create, get, update, persist)
- [ ] **UNIT-08**: Setup/initializer tests (.carl/ scaffolding, template copy, idempotency)
- [ ] **UNIT-09**: Validation module tests (manifest validation, domain validation)

### Integration Tests

- [ ] **INTG-01**: Plugin lifecycle test (initialization, hook registration, message processing)
- [ ] **INTG-02**: Rule injection pipeline test (manifest → scan → load → compose → inject)
- [ ] **INTG-03**: Setup and domain workflow test (setup → list → toggle → verify)
- [ ] **INTG-04**: File system operations test (manifest changes, session persistence, global/local resolution)

### E2E Tests

- [ ] **E2E-01**: Docker container with OpenCode for integration testing
- [ ] **E2E-02**: Full setup flow E2E (scaffold .carl/, verify defaults, test prompts)
- [ ] **E2E-03**: Keyword matching flow E2E with real OpenCode
- [ ] **E2E-04**: Star-command flow E2E with real OpenCode

### CI/CD

- [ ] **CI-01**: GitHub Actions workflow created for test automation
- [ ] **CI-02**: Tests run on PR and push to main
- [ ] **CI-03**: Docker-based E2E tests in GitHub Actions
- [ ] **CI-04**: Coverage report generated as workflow artifact

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhancements

- **ENHN-03**: Mutation testing (Stryker.js integration)
- **ENHN-04**: Performance benchmarks for rule matching

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Python tests | TypeScript project, no Python auxiliary tooling needed |
| Mutation testing | Not critical for current coverage goals |
| Performance benchmarks | Out of scope for v1.2, consider for future |
| Visual regression testing | No UI components to test |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| TEST-01 | Phase 7 | Pending |
| TEST-02 | Phase 7 | Complete |
| TEST-03 | Phase 7 | Pending |
| UNIT-01 | Phase 8 | Pending |
| UNIT-02 | Phase 8 | Pending |
| UNIT-03 | Phase 9 | Pending |
| UNIT-04 | Phase 8 | Pending |
| UNIT-05 | Phase 8 | Pending |
| UNIT-06 | Phase 9 | Pending |
| UNIT-07 | Phase 9 | Pending |
| UNIT-08 | Phase 9 | Pending |
| UNIT-09 | Phase 9 | Pending |
| INTG-01 | Phase 10 | Pending |
| INTG-02 | Phase 10 | Pending |
| INTG-03 | Phase 10 | Pending |
| INTG-04 | Phase 10 | Pending |
| E2E-01 | Phase 11 | Pending |
| E2E-02 | Phase 11 | Pending |
| E2E-03 | Phase 11 | Pending |
| E2E-04 | Phase 11 | Pending |
| CI-01 | Phase 7 | Pending |
| CI-02 | Phase 7 | Pending |
| CI-03 | Phase 11 | Pending |
| CI-04 | Phase 7 | Pending |

**Coverage:**
- v1.2 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-03*
*Last updated: 2026-03-03 after v1.2 milestone definition*
