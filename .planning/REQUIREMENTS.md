# Requirements: OpenCARL

**Defined:** 2026-03-06
**Core Value:** Keep OpenCARL's dynamic rule injection working seamlessly inside OpenCode with full parity and minimal user friction.

## v1.3 Requirements

Requirements for OpenCARL rebranding milestone. Each maps to roadmap phases.

### Source Code Rebranding

- [x] **SOURCE-01**: All TypeScript type names using "Carl" prefix are renamed to "Opencarl"
- [x] **SOURCE-02**: All function/variable names using "carl" prefix are renamed to "opencarl"
- [x] **SOURCE-03**: All import statements referencing `./carl/*` are updated to `./opencarl/*`
- [x] **SOURCE-04**: All internal code comments referencing CARL are updated to OpenCARL

### Configuration & Directory Migration

- [ ] **CONFIG-01**: `src/carl/` directory is renamed to `src/opencarl/`
- [x] **CONFIG-02**: `.carl/` configuration directory is renamed to `.opencarl/`
- [x] **CONFIG-03**: `.carl-template/` directory is renamed to `.opencarl-template/`
- [x] **CONFIG-04**: All file path references in code are updated to use new directory names
- [x] **CONFIG-05**: Setup/initializer scaffolds `.opencarl/` directory with templates

### Command Rebranding

- [ ] **CMND-01**: `*carl` command trigger is renamed to `*opencarl`
- [ ] **CMND-02**: `/carl` fallback command is renamed to `/opencarl`
- [ ] **CMND-03**: All test fixtures with `*carl` or `/carl` strings are updated
- [ ] **CMND-04**: Help text and command descriptions reference `*opencarl` and `/opencarl`

### Environment Variable Rebranding

- [ ] **ENV-01**: `CARL_DEBUG` environment variable is renamed to `OPENCARL_DEBUG`
- [ ] **ENV-02**: All CI configuration files use `OPENCARL_DEBUG`
- [ ] **ENV-03**: All test scripts use `OPENCARL_DEBUG`
- [ ] **ENV-04**: Documentation references `OPENCARL_DEBUG` instead of `CARL_DEBUG`

### Documentation Rebranding

- [ ] **DOCS-01**: `CARL-DOCS.md` is renamed to `OPENCARL-DOCS.md`
- [ ] **DOCS-02**: README.md references OpenCARL branding throughout
- [ ] **DOCS-03**: INSTALL.md uses `.opencarl/` and `*opencarl` throughout
- [ ] **DOCS-04**: TROUBLESHOOTING.md references OpenCARL and `OPENCARL_DEBUG`
- [ ] **DOCS-05**: All documentation examples use updated naming conventions

### Package Metadata & CI/CD

- [ ] **PKG-01**: Package name is consistent across all references (`@krisgray/opencarl`)
- [ ] **PKG-02**: Docker image name `opencode-carl:e2e` is updated to `opencode-opencarl:e2e`
- [ ] **PKG-03**: GitHub Actions workflows use updated package and Docker references
- [ ] **PKG-04**: All package.json metadata reflects OpenCARL branding
- [ ] **PKG-05**: E2E tests pass with updated Docker image

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Future Enhancements

- **BACKCOMP-01**: Support both `.carl/` and `.opencarl/` directories during transition
- **BACKCOMP-02**: Maintain `*carl` and `/carl` as deprecated aliases
- **NFEAT-01**: [Add future feature enhancements here]

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Changing rule syntax or domain file format semantics | This is rebranding, not a rewrite |
| Modifying OpenCode core functionality | Plugin boundaries must be respected |
| Building separate distribution channels | Local plugin distribution is sufficient |
| New features beyond rebranding | v1.3 is pure rebranding milestone |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SOURCE-01 | Phase 12 | Complete |
| SOURCE-02 | Phase 12 | Complete |
| SOURCE-03 | Phase 12 | Complete |
| SOURCE-04 | Phase 12 | Complete |
| CONFIG-01 | Phase 13 | Pending |
| CONFIG-02 | Phase 13 | Complete |
| CONFIG-03 | Phase 13 | Complete |
| CONFIG-04 | Phase 13 | Complete |
| CONFIG-05 | Phase 13 | Complete |
| CMND-01 | Phase 14 | Pending |
| CMND-02 | Phase 14 | Pending |
| CMND-03 | Phase 14 | Pending |
| CMND-04 | Phase 14 | Pending |
| ENV-01 | Phase 15 | Pending |
| ENV-02 | Phase 15 | Pending |
| ENV-03 | Phase 15 | Pending |
| ENV-04 | Phase 15 | Pending |
| DOCS-01 | Phase 16 | Pending |
| DOCS-02 | Phase 16 | Pending |
| DOCS-03 | Phase 16 | Pending |
| DOCS-04 | Phase 16 | Pending |
| DOCS-05 | Phase 16 | Pending |
| PKG-01 | Phase 17 | Pending |
| PKG-02 | Phase 17 | Pending |
| PKG-03 | Phase 17 | Pending |
| PKG-04 | Phase 17 | Pending |
| PKG-05 | Phase 17 | Pending |

**Coverage:**
- v1.3 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-06*
*Last updated: 2026-03-06 after initial definition*
