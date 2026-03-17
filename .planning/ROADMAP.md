# Roadmap: OpenCARL OpenCode Plugin

## Milestones

- ✅ **v1.0 MVP** - Phases 1-5 (shipped 2026-03-03)
- ✅ **v1.1 Polish & Complete Integration** - Phase 6 (shipped 2026-03-03)
- ✅ **v1.2 Testing & QA** - Phases 7-11 (shipped 2026-03-18)
- ✅ **v1.3 Branding & Context Migration** - Phases 12-17 (shipped 2026-03-13)
- ✅ **v2.0.2 Documentation Site** - Phases 18-19 (shipped 2026-03-16)
- ✅ **v2.1 CI Badges & Coverage** - Phase 20 (shipped 2026-03-17)

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

</details>

<details>
<summary>✅ v1.3 Branding & Context Migration (Phases 12-17) - SHIPPED 2026-03-13</summary>

See [.planning/milestones/v1.3-ROADMAP.md](.planning/milestones/v1.3-ROADMAP.md) for full details.

- [x] **Phase 12: Source Code Rebranding** - All TypeScript types, functions, variables, and comments renamed from Carl to Opencarl
- [x] **Phase 13: Configuration & Directory Migration** - Directory migration and path updates (.carl/ → .opencarl/)
- [x] **Phase 14: Command Rebranding** - Command triggers renamed (*carl → *opencarl, /carl → /opencarl)
- [x] **Phase 15: Environment Variable Rebranding** - Environment variable renamed (CARL_DEBUG → OPENCARL_DEBUG)
- [x] **Phase 16: Documentation Rebranding** - All documentation files and examples updated
- [x] **Phase 17: Package Metadata & CI/CD Finalization** - Package.json, Docker, and CI/CD aligned with @krisgray/opencarl

</details>

<details>
<summary>✅ v2.0.2 Documentation Site (Phases 18-19) - SHIPPED 2026-03-16</summary>

See [.planning/milestones/v2.0.2-ROADMAP.md](.planning/milestones/v2.0.2-ROADMAP.md) for full details.

- [x] **Phase 18: TypeDoc Setup** - Configure TypeDoc for local HTML documentation generation
- [x] **Phase 19: GitHub Actions Deployment** - Automate docs deployment on release

</details>

<details>
<summary>✅ v2.1 CI Badges & Coverage (Phase 20) - SHIPPED 2026-03-17</summary>

See [.planning/milestones/v2.1-ROADMAP.md](.planning/milestones/v2.1-ROADMAP.md) for full details.

- [x] **Phase 20: Codecov Integration & Badges** - Upload coverage to Codecov and display NPM/Codecov badges

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
| 7. Test Infrastructure & CI Setup | v1.2 | 3/3 | Complete | 2026-03-04 |
| 8. Core Unit Tests - Parsing & Matching | v1.2 | 5/5 | Complete | 2026-03-04 |
| 9. Core Unit Tests - Session & Setup | v1.2 | 5/5 | Complete | 2026-03-04 |
| 9.1. Close Phase 9 Unit Test Gaps | v1.2 | 2/2 | Complete | 2026-03-05 |
| 10. Integration Tests | v1.2 | 4/4 | Complete | 2026-03-05 |
| 11. E2E Tests & Docker | v1.2 | 4/4 | Complete | 2026-03-05 |
| 12. Source Code Rebranding | v1.3 | 22/22 | Complete | 2026-03-11 |
| 13. Configuration & Directory Migration | v1.3 | 6/6 | Complete | 2026-03-11 |
| 14. Command Rebranding | v1.3 | 7/7 | Complete | 2026-03-11 |
| 15. Environment Variable Rebranding | v1.3 | 8/8 | Complete | 2026-03-12 |
| 16. Documentation Rebranding | v1.3 | 4/4 | Complete | 2026-03-13 |
| 17. Package Metadata & CI/CD Finalization | v1.3 | 4/4 | Complete | 2026-03-13 |
| 18. TypeDoc Setup | v2.0.2 | 2/2 | Complete | 2026-03-16 |
| 19. GitHub Actions Deployment | v2.0.2 | 2/2 | Complete | 2026-03-16 |
| 20. Codecov Integration & Badges | v2.1 | 1/1 | Complete | 2026-03-17 |

---

## Coverage Validation

Coverage validation has been archived with each milestone. See:
- [v1.2 Coverage](.planning/milestones/v1.2-REQUIREMENTS.md)
- [v1.3 Coverage](.planning/milestones/v1.3-REQUIREMENTS.md)
- [v2.0.2 Coverage](.planning/milestones/v2.0.2-REQUIREMENTS.md)
- [v2.1 Coverage](.planning/milestones/v2.1-REQUIREMENTS.md)

---

## Dependencies

```
v1.0 Phases 1-5 ✓
v1.1 Phase 6 ✓
v1.2 Phases 7-11 ✓
v1.3 Phases 12-17 ✓
v2.0.2 Phases 18-19 ✓
v2.1 Phase 20 ✓
```

---
*Roadmap created: 2026-02-25*
*Last updated: 2026-03-17 - v2.0.2 and v2.1 milestones archived*
