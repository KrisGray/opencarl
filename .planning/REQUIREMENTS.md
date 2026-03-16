# Requirements: OpenCARL v2.0.2 Documentation Site

**Defined:** 2026-03-13
**Core Value:** Keep OpenCARL's dynamic rule injection working seamlessly inside OpenCode with full parity and minimal user friction.

## v1 Requirements

Requirements for v2.0.2 release. Each maps to roadmap phases.

### Documentation Generation

- [x] **DOCS-01**: TypeDoc generates HTML API documentation from TypeScript source
- [x] **DOCS-02**: Source code links allow click-through to GitHub
- [x] **DOCS-03**: README.md serves as documentation landing page

### CI/CD Deployment

- [x] **CICD-01**: Docs build and deploy automatically on GitHub release events
- [x] **CICD-02**: Documentation deployed to gh-pages branch with orphan commits
- [ ] **CICD-03**: Documentation site hosted on GitHub Pages at krisgray.github.io/opencarl

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Documentation Enhancements

- **DOCS-04**: Custom branding/styling applied to TypeDoc output
- **DOCS-05**: Versioned documentation for multiple npm versions

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Deploy on every push | Would create noise; release-triggered ensures docs match published versions |
| Custom domain | Subdomain is sufficient; no SEO/hosting need identified |
| Markdown output | HTML is standard for API docs; adds complexity without benefit |
| Docusaurus/VitePress | Over-engineering for standalone API docs; TypeDoc is sufficient |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DOCS-01 | Phase 18 | Complete |
| DOCS-02 | Phase 18 | Complete |
| DOCS-03 | Phase 18 | Complete |
| CICD-01 | Phase 19 | Complete |
| CICD-02 | Phase 19 | Complete |
| CICD-03 | Phase 19 | Pending |

**Coverage:**
- v1 requirements: 6 total
- Mapped to phases: 6
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after roadmap creation*
