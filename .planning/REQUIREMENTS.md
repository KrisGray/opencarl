# Requirements: OpenCARL v1.2 Testing & QA

**Defined:** 2026-03-03
**Core Value:** Keep CARL's dynamic rule injection working seamlessly inside OpenCode with full parity and minimal user friction.

## v1.2 Requirements

Requirements for testing milestone. Each maps to roadmap phases.

### Test Infrastructure

- [x] **TEST-01**: Jest configured with ts-jest preset and Node test environment
- [x] **TEST-02**: Test directory structure created with fixtures and mock utilities
- [x] **TEST-03**: Coverage thresholds set to 80% for branches, functions, lines, statements

### Unit Tests - Core Modules

- [x] **UNIT-01**: Manifest parser tests (valid single/multi-domain, empty, malformed, STATE/ALWAYS_ON parsing)
- [x] **UNIT-02**: Keyword scanner / matcher tests (match, exclude, always-on, case-insensitive, multi-domain)
- [x] **UNIT-03**: Domain manager tests (load, toggle, list, view operations)
- [x] **UNIT-04**: Rule composer / injector tests (single domain, multiple domains, global rules, context brackets)
- [x] **UNIT-05**: Context bracket tests (fresh, moderate, depleted classification and rule selection)
- [x] **UNIT-06**: Star-command parser tests (*carl, *carl docs, custom commands, edge cases)
- [x] **UNIT-07**: Session manager tests (create, get, update, persist)
- [x] **UNIT-08**: Setup/initializer tests (.carl/ scaffolding, template copy, idempotency)
- [x] **UNIT-09**: Validation module tests (manifest validation, domain validation)

### Integration Tests

- [x] **INTG-01**: Plugin lifecycle test (initialization, hook registration, message processing)
- [x] **INTG-02**: Rule injection pipeline test (manifest → scan → load → compose → inject)
- [x] **INTG-03**: Setup and domain workflow test (setup → list → toggle → verify)
- [x] **INTG-04**: File system operations test (manifest changes, session persistence, global/local resolution)

### E2E Tests

- [x] **E2E-01**: Docker container with OpenCode for integration testing
- [x] **E2E-02**: Full setup flow E2E (scaffold .carl/, verify defaults, test prompts)
- [x] **E2E-03**: Keyword matching flow E2E with real OpenCode
- [x] **E2E-04**: Star-command flow E2E with real OpenCode

### CI/CD

- [x] **CI-01**: GitHub Actions workflow created for test automation
- [x] **CI-02**: Tests run on PR and push to main
- [ ] **CI-03**: Docker-based E2E tests in GitHub Actions
- [x] **CI-04**: Coverage report generated as workflow artifact

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
| TEST-01 | Phase 7 | Complete |
| TEST-02 | Phase 7 | Complete |
| TEST-03 | Phase 7 | Complete |
| UNIT-01 | Phase 8 | Complete |
| UNIT-02 | Phase 8 | Complete |
| UNIT-03 | Phase 9.1 | Complete |
| UNIT-04 | Phase 8 | Complete |
| UNIT-05 | Phase 8 | Complete |
| UNIT-06 | Phase 9.1 | Complete |
| UNIT-07 | Phase 9.1 | Complete |
| UNIT-08 | Phase 9.1 | Complete |
| UNIT-09 | Phase 9.1 | Complete |
| INTG-01 | Phase 10 | Complete |
| INTG-02 | Phase 10 | Complete |
| INTG-03 | Phase 10 | Complete |
| INTG-04 | Phase 10 | Complete |
| E2E-01 | Phase 11 | Complete |
| E2E-02 | Phase 11 | Complete |
| E2E-03 | Phase 11 | Complete |
| E2E-04 | Phase 11 | Complete |
| CI-01 | Phase 7 | Complete |
| CI-02 | Phase 7 | Complete |
| CI-03 | Phase 11 | Pending |
| CI-04 | Phase 7 | Complete |

**Coverage:**
- v1.2 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-03*
*Last updated: 2026-03-05 after v1.2 gap-closure planning*
