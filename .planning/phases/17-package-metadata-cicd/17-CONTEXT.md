# Phase 17: Package Metadata & CI/CD Finalization - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Verify package consistency and update Docker/CI references so OpenCARL branding is consistent across package metadata, Docker image names, and CI workflows. E2E tests must pass with the updated Docker image. No new capabilities beyond metadata/CI alignment.

</domain>

<decisions>
## Implementation Decisions

### Package identity surface
- Align all public-facing metadata and internal references to the package name
- Use `@krisgray/opencarl` everywhere (docs, workflows, badges, metadata)
- Link to both npm package page and GitHub repo where relevant
- Update all existing badges to the new package name

### Docker image naming
- Single canonical image: `opencode-opencarl:e2e`
- Keep current path style unless a registry namespace is already used
- Default to `:e2e` with env var override allowed
- Remove all legacy image name references

### CI/CD touch scope
- Update all workflows that reference package or Docker image (not just E2E)
- Rename all CI job names/labels to OpenCARL
- Update all artifact names to OpenCARL
- Replace all CARL path references found in workflows while touching them

### Verification expectations
- Run full E2E suite once after changes
- Require repo-wide search for legacy strings; allow explicit exceptions if any exist
- Verify package.json core metadata: name, description, keywords, repository/bugs/homepage
- Update YAML workflows only; no local/remote workflow runs required

### OpenCode's Discretion
- None explicitly granted

</decisions>

<specifics>
## Specific Ideas

No specific references or examples provided — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 17-package-metadata-cicd*
*Context gathered: 2026-03-13*
