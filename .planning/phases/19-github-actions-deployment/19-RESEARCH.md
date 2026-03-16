# Phase 19: GitHub Actions Deployment - Research

**Researched:** 2026-03-16
**Domain:** GitHub Actions CI/CD, GitHub Pages deployment
**Confidence:** HIGH

## Summary

This phase adds a `docs` job to the existing `publish.yml` workflow to automatically deploy TypeDoc-generated documentation to GitHub Pages when releases are published. The implementation uses `peaceiris/actions-gh-pages@v4` (pre-decided) with orphan branch strategy for clean gh-pages history. Documentation deploys independently of npm publishing with non-blocking failure handling.

**Primary recommendation:** Add a `docs` job that runs in parallel with `publish`, depends on `[test, e2e]`, uses the existing `docs:ci` script, and deploys to gh-pages with `force_orphan: true`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Add docs job to existing `publish.yml` (not a separate workflow)
- Docs job depends on `[test, e2e]`, runs in parallel with `publish` job
- Self-contained job with its own `actions/checkout` and `npm ci` — no artifact sharing
- Checkout the exact release tag/commit (not main branch)
- Use `peaceiris/actions-gh-pages@v4` (pre-decided)
- No coordination between docs and npm publish completion order — either can finish first
- gh-pages branch is overwritten completely on each release (no versioned docs)
- Use existing `docs:ci` script from Phase 18
- Non-blocking — docs failure logs error but doesn't block or roll back the release
- Rely on GitHub Actions built-in status for notifications (no custom Slack/email)
- Single attempt, fail fast — no retry logic
- If Pages not configured, fail with clear error message (no auto-setup)
- Enable GitHub Pages before merging the workflow
- Orphan branch strategy — gh-pages has clean history with only docs content
- No custom baseUrl in TypeDoc — relative links work with gh-pages default
- No post-deploy verification step — trust peaceiris success report

### OpenCode's Discretion
- Exact job name in publish.yml
- Step ordering and comments within the docs job
- Whether to add workflow documentation comments

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CICD-01 | Docs build and deploy automatically on GitHub release events | Existing `publish.yml` triggers on `release: types: [published]` — add `docs` job to this workflow |
| CICD-02 | Documentation deployed to gh-pages branch with orphan commits | `peaceiris/actions-gh-pages@v4` with `force_orphan: true` creates clean branch with only latest commit |
| CICD-03 | Documentation site hosted on GitHub Pages at krisgray.github.io/opencarl | GitHub Pages enabled on repo settings → gh-pages branch → site serves at `https://<username>.github.io/<repo>` |
</phase_requirements>

## Standard Stack

### Core
| Component | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| peaceiris/actions-gh-pages | v4 | Deploy static files to gh-pages | 5.3k+ GitHub stars, actively maintained, proven pattern for docs deployment |
| actions/checkout | v4 | Checkout repository | Official GitHub action, already in use |
| actions/setup-node | v4 | Setup Node.js | Official GitHub action, already in use |

### Existing Infrastructure (Phase 18)
| Component | Purpose | Details |
|-----------|---------|---------|
| `docs:ci` script | Build docs with correct git revision | `typedoc --gitRevision $(git rev-parse HEAD)` |
| typedoc.json | TypeDoc configuration | Outputs to `docs/`, `githubPages: true` already set |
| TypeDoc | ^0.28.17 | Documentation generator |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| peaceiris/actions-gh-pages | Official `actions/deploy-pages` | Official is newer but requires more config; peaceiris is battle-tested with simpler API |
| Separate docs workflow | Single workflow | Separate adds complexity; single workflow matches CONTEXT.md decision |

## Architecture Patterns

### Recommended Workflow Structure

```yaml
# Add to existing .github/workflows/publish.yml
# After the existing 'publish' job

  docs:
    needs: [test, e2e]
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build documentation
        run: npm run docs:ci

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
          force_orphan: true
```

### Pattern: Orphan Branch Deployment
**What:** `force_orphan: true` creates gh-pages branch with single commit containing only docs content
**When to use:** When you want clean history without polluting gh-pages with historical builds
**Example:**
```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v4
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./docs
    force_orphan: true  # Creates orphan branch with clean history
```

### Pattern: Non-blocking Deployment
**What:** Job failure doesn't affect other jobs in workflow
**When to use:** When docs are "nice to have" and shouldn't block npm publish
**Implementation:** By default, jobs run independently; one job failure doesn't fail others that don't depend on it

### Anti-Patterns to Avoid
- **Using `continue-on-error: true`**: Would hide failures; let job fail naturally and report status
- **Adding `if: always()` to docs job**: Would run even if tests fail; docs should only deploy after passing tests
- **Sharing artifacts between publish and docs**: Adds complexity without benefit; self-contained job is simpler

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Deploying to gh-pages | Custom git commands in workflow | peaceiris/actions-gh-pages | Handles orphan branches, CNAME, .nojekyll, edge cases |
| Node.js setup | Custom install script | actions/setup-node | Official action with caching support |
| Retry logic | Shell retry loops | (nothing) | CONTEXT.md explicitly says no retry logic |

**Key insight:** peaceiris handles edge cases (first deployment, branch creation, force push) that are error-prone to implement manually.

## Common Pitfalls

### Pitfall 1: Missing `permissions: contents: write`
**What goes wrong:** `GITHUB_TOKEN` can't push to gh-pages branch
**Why it happens:** Default `GITHUB_TOKEN` has read-only permissions
**How to avoid:** Add `permissions: contents: write` to the job level
**Warning signs:** Error "Write access to repository not granted" or HTTP 403

### Pitfall 2: First Deployment Fails
**What goes wrong:** First deployment with `GITHUB_TOKEN` fails because Pages not configured
**Why it happens:** GitHub requires manual Pages setup before first deployment
**How to avoid:** Enable GitHub Pages in repo settings BEFORE merging workflow
**Warning signs:** "pages_build_attempts" error or deployment not found

### Pitfall 3: Wrong `publish_dir`
**What goes wrong:** Deploys empty or wrong content
**Why it happens:** TypeDoc outputs to `docs/` but action defaults to `public/`
**How to avoid:** Set `publish_dir: ./docs` (matches typedoc.json `out: "docs"`)

### Pitfall 4: Checkout Wrong Ref
**What goes wrong:** Docs built from wrong commit/tag
**Why it happens:** Default checkout uses workflow trigger ref, may not match release tag
**How to avoid:** CONTEXT.md says checkout exact release tag — `actions/checkout@v4` on release event automatically checks out the tag

## Code Examples

### Complete Docs Job (Verified Pattern)
```yaml
docs:
  needs: [test, e2e]
  runs-on: ubuntu-latest
  permissions:
    contents: write
  steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build documentation
      run: npm run docs:ci

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v4
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./docs
        force_orphan: true
```

### GitHub Pages Setup (Manual Step)
Before merging the workflow:
1. Go to Repository Settings → Pages
2. Under "Build and deployment" → "Source", select "Deploy from a branch"
3. Select `gh-pages` branch and `/ (root)` folder
4. Save (may need to create a placeholder gh-pages branch first via the workflow)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Deploy on every push | Deploy on release only | Project decision | Cleaner docs history matching npm versions |
| Versioned docs | Single version overwrite | CONTEXT.md decision | Simpler implementation, always current |
| Custom deployment scripts | peaceiris/actions-gh-pages | Industry standard | Proven, maintained, handles edge cases |

**Deprecated/outdated:**
- Manual git commands for gh-pages deployment: Use peaceiris action instead

## Open Questions

1. **GitHub Pages URL structure**
   - What we know: Will be at `krisgray.github.io/opencarl` (repo name)
   - What's unclear: Whether custom CNAME is needed (CONTEXT.md says no)
   - Recommendation: Use default URL, no CNAME configuration needed

## Sources

### Primary (HIGH confidence)
- [peaceiris/actions-gh-pages GitHub](https://github.com/peaceiris/actions-gh-pages) - Official README with all options documented
- [GitHub Actions permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication) - GITHUB_TOKEN permissions documentation
- Existing `publish.yml` workflow - Current project patterns

### Secondary (MEDIUM confidence)
- Phase 18 implementation - `docs:ci` script and typedoc.json configuration
- Project STATE.md - Context about completed phases

### Tertiary (LOW confidence)
- None - All critical information verified from primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - peaceiris is well-documented and widely adopted
- Architecture: HIGH - Pattern is standard for docs deployment, matches existing workflow structure
- Pitfalls: HIGH - Common issues well-documented in peaceiris README and GitHub issues

**Research date:** 2026-03-16
**Valid until:** 6 months - peaceiris v4 is stable, unlikely to change significantly

---
*Phase 19: GitHub Actions Deployment - Research*
*Generated by gsd-phase-researcher*
