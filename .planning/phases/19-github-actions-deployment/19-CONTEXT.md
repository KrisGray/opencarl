# Phase 19: GitHub Actions Deployment - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Automate TypeDoc documentation deployment to GitHub Pages when releases are published. This phase adds CI/CD infrastructure for docs — it does not modify documentation content or TypeDoc configuration (completed in Phase 18).

Depends on: Phase 18 (TypeDoc Setup)
Uses: `peaceiris/actions-gh-pages@v4` (pre-decided in PROJECT.md)

</domain>

<decisions>
## Implementation Decisions

### Workflow Integration
- Add docs job to existing `publish.yml` (not a separate workflow)
- Docs job depends on `[test, e2e]`, runs in parallel with `publish` job
- Self-contained job with its own `actions/checkout` and `npm ci` — no artifact sharing
- Checkout the exact release tag/commit (not main branch)

### Deployment Timing
- No coordination between docs and npm publish completion order — either can finish first
- gh-pages branch is overwritten completely on each release (no versioned docs)
- Use existing `docs:ci` script from Phase 18

### Failure Handling
- Non-blocking — docs failure logs error but doesn't block or roll back the release
- Rely on GitHub Actions built-in status for notifications (no custom Slack/email)
- Single attempt, fail fast — no retry logic
- If Pages not configured, fail with clear error message (no auto-setup)

### Pages Setup
- Enable GitHub Pages before merging the workflow
- Orphan branch strategy — gh-pages has clean history with only docs content
- No custom baseUrl in TypeDoc — relative links work with gh-pages default
- No post-deploy verification step — trust peaceiris success report

### OpenCode's Discretion
- Exact job name in publish.yml
- Step ordering and comments within the docs job
- Whether to add workflow documentation comments

</decisions>

<specifics>
## Specific Ideas

- Workflow should feel standard for GitHub Actions — anyone familiar with peaceiris should recognize the pattern
- Docs deployment is "nice to have" not "must have" — a failure shouldn't impact npm publishing

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 19-github-actions-deployment*
*Context gathered: 2026-03-16*
