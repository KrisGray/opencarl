# Roadmap: OpenCARL OpenCode Plugin

## Milestones

- ✅ **v1.0 MVP** - Phases 1-5 (shipped 2026-03-03)
- ✅ **v1.1 Polish & Complete Integration** - Phase 6 (shipped 2026-03-03)
- ✅ **v1.2 Testing & QA** - Phases 7-11 (shipped 2026-03-18)
- ✅ **v1.3 Branding & Context Migration** - Phases 12-17 (shipped 2026-03-13)
- 🚧 **v2.0.2 Documentation Site** - Phases 18-19 (in progress)

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

**Phase 6: Integration & Developer Experience**
**Goal**: Users have complete OpenCode configuration integration and can troubleshoot plugin issues independently
**Depends on**: Phase 5
**Requirements**: INTE-02, DX-01, DX-02, DX-03
**Success Criteria** (what must be TRUE):
  1. User can add CARL docs to their opencode.json instructions via setup command
  2. User sees clear, actionable error messages when the plugin fails to load
  3. User can enable debug logging to understand CARL's rule matching decisions
  4. User can reference a troubleshooting guide for common issues
**Plans**: 8 plans (gap closure)

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

### 🚧 v2.0.2 Documentation Site (In Progress)

**Milestone Goal:** Add CI/CD-powered HTML API documentation hosted on GitHub Pages.

- [x] **Phase 18: TypeDoc Setup** - Configure TypeDoc for local HTML documentation generation (completed 2026-03-16)
- [ ] **Phase 19: GitHub Actions Deployment** - Automate docs deployment on release

## Phase Details

### Phase 18: TypeDoc Setup
**Goal**: Developers can generate complete API documentation locally
**Depends on**: Phase 17 (rebranding complete)
**Requirements**: DOCS-01, DOCS-02, DOCS-03
**Success Criteria** (what must be TRUE):
  1. Running `npm run docs` generates HTML documentation in docs/ directory
  2. Documentation includes clickable source code links to GitHub
  3. README.md appears as the documentation landing page
  4. All exported TypeScript types and functions appear in the generated docs
**Plans**: 2 plans

Plans:
- [ ] 18-01-PLAN.md — Install TypeDoc and create configuration with source links and README integration
- [ ] 18-02-PLAN.md — Add @category JSDoc tags for organized documentation navigation

### Phase 19: GitHub Actions Deployment
**Goal**: Documentation publishes automatically on release
**Depends on**: Phase 18
**Requirements**: CICD-01, CICD-02, CICD-03
**Success Criteria** (what must be TRUE):
  1. Publishing a GitHub release triggers docs build and deployment
  2. gh-pages branch contains only the generated documentation (orphan commits)
  3. Documentation is publicly accessible at krisgray.github.io/opencarl
  4. Docs deployment integrates cleanly with existing publish.yml workflow
**Plans**: 2 plans

Plans:
- [ ] 19-01-PLAN.md — Add docs job to publish.yml with peaceiris deployment
- [ ] 19-02-PLAN.md — Configure GitHub Pages and verify deployment

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
| 18. TypeDoc Setup | 2/2 | Complete    | 2026-03-16 | - |
| 19. GitHub Actions Deployment | 1/2 | In Progress|  | - |

---

## Coverage Validation

Coverage validation has been archived with each milestone. See:
- [v1.3 Coverage](.planning/milestones/v1.3-REQUIREMENTS.md)
- [v1.2 Coverage](.planning/milestones/v1.2-REQUIREMENTS.md)
- [v2.0.2 Coverage](.planning/REQUIREMENTS.md)

---

## Dependencies

```
v1.0 Phases 1-5 ✓
v1.1 Phase 6 ✓
v1.2 Phases 7-11 ✓
v1.3 Phases 12-17 ✓
v2.0.2 Phases 18-19 (in progress)
```

---
*Roadmap created: 2026-02-25*
*Last updated: 2026-03-13 after v2.0.2 roadmap creation*
