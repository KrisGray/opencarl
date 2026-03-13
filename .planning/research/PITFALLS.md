# Domain Pitfalls: TypeDoc + GitHub Pages for TypeScript npm Packages

**Domain:** Adding API documentation site to existing TypeScript npm package
**Context:** Subsequent milestone — Adding documentation to existing OpenCARL project
**Researched:** 2026-03-13
**Confidence:** HIGH (Official TypeDoc docs, GitHub Actions docs, multiple community sources)

---

## Critical Pitfalls

Mistakes that cause rewrites, failed deployments, or broken documentation sites.

### Pitfall 1: Wrong Entry Point Path

**What goes wrong:**
TypeDoc fails to generate documentation or generates empty/incomplete docs because the entry point file doesn't exist or doesn't match your package's actual exports.

**Why it happens:**
- Developers assume `src/index.ts` exists when their project uses `src/plugin.ts` or another entry point
- TypeDoc's auto-discovery uses `package.json` `exports`/`main` fields, but these may point to compiled JS, not TypeScript source
- Changing entry points during refactoring breaks documentation without obvious errors

**Consequences:**
- Empty documentation site
- "Module not found" errors during doc generation
- CI/CD pipeline fails silently (docs build with no content)

**Prevention:**
1. Verify entry point exists: `ls src/plugin.ts` (or your actual entry)
2. Match entry point to `package.json` main/types fields (but use `.ts` source, not `.js` dist)
3. Use explicit `entryPoints` in `typedoc.json` rather than relying on auto-discovery
4. For OpenCARL specifically: entry point is `src/plugin.ts`, NOT `src/index.ts`

**Detection:**
- Run `npx typedoc --showConfig` to verify resolved entry points
- Check generated docs for "No exports found" or empty modules
- CI step should fail if docs output directory is empty or missing expected files

**Phase to address:** Phase 1 (TypeDoc Setup & Configuration)

---

### Pitfall 2: Missing `.nojekyll` File Causes 404s

**What goes wrong:**
Documentation deploys successfully but users get 404 errors when navigating to certain pages — specifically those with paths starting with underscore (e.g., `_classes/`, `_modules/`).

**Why it happens:**
- GitHub Pages uses Jekyll by default, which ignores files/folders starting with `_`
- TypeDoc generates assets with underscore prefixes for internal organization
- Deployment appears successful but content is inaccessible

**Consequences:**
- Users see 404 errors for API pages
- Documentation site appears broken
- Confusing debugging since deployment "succeeded"

**Prevention:**
1. Enable TypeDoc's `--githubPages` option (defaults to `true` in v0.23+), which auto-generates `.nojekyll`
2. OR manually add `.nojekyll` file to your docs output directory before deployment
3. Verify `.nojekyll` exists in deployed gh-pages branch root

**Detection:**
- Check if URLs with `_` prefix return 404
- Inspect gh-pages branch root for `.nojekyll` file
- Local preview works but deployed version has 404s

**Phase to address:** Phase 1 (TypeDoc Setup & Configuration)

---

### Pitfall 3: Incorrect GITHUB_TOKEN Permissions

**What goes wrong:**
GitHub Actions workflow fails during deployment with cryptic permission errors (typically HTTP 403 or 422).

**Why it happens:**
- GitHub Actions changed default permissions model — many repos now default to restricted permissions
- Deploying to Pages requires both `pages: write` AND `id-token: write`
- Existing workflows may have `id-token: write` for npm provenance but miss `pages: write`

**Consequences:**
- "Permission denied" errors in CI
- Deployment fails after successful build
- Confusing error messages that don't clearly indicate permission issue

**Prevention:**
```yaml
jobs:
  deploy-docs:
    permissions:
      pages: write      # Required for Pages deployment
      id-token: write   # Required for OIDC token verification
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
```

**Detection:**
- Check Actions logs for "Permission denied" or HTTP 403/422
- Verify workflow has explicit `permissions:` block
- Compare against working `actions/deploy-pages` examples

**Phase to address:** Phase 2 (GitHub Actions Workflow)

---

### Pitfall 4: GitHub Pages Source Configuration Mismatch

**What goes wrong:**
Documentation builds and uploads successfully in Actions but never appears at the Pages URL, or old content persists.

**Why it happens:**
- GitHub Pages can be configured to use "Deploy from a branch" OR "GitHub Actions"
- Using `actions/deploy-pages` requires "GitHub Actions" as the source
- Using `peaceiris/actions-gh-pages` or `JamesIves/github-pages-deploy-action` pushes to `gh-pages` branch and requires "Deploy from a branch"

**Consequences:**
- Docs deploy in Actions but never update the live site
- Confusion about which deployment method to use
- Two different deployment methods fighting each other

**Prevention:**
1. For `actions/deploy-pages` + `actions/upload-pages-artifact`: Set Pages source to "GitHub Actions"
2. For direct branch push actions: Set Pages source to "Deploy from a branch" → "gh-pages"
3. Document the chosen approach in repo settings
4. Only use ONE deployment method, not both

**Detection:**
- Check Settings → Pages → Source in GitHub
- Compare deployment method in workflow with Pages source setting
- Look for multiple competing deployments in Actions history

**Phase to address:** Phase 2 (GitHub Actions Workflow)

---

### Pitfall 5: Test Files Included in Documentation Despite Exclusions

**What goes wrong:**
TypeDoc processes test files and fails with type errors from test utilities (Jest matchers, testing library types), even though tests are "excluded".

**Why it happens:**
- TypeDoc's `--exclude` only controls what appears in OUTPUT documentation
- TypeDoc still COMPILES all files referenced by entry points (including imported tests)
- Test files often import types from `@types/jest` or similar that cause compilation errors
- TypeDoc uses TypeScript's compiler, which validates all reachable code

**Consequences:**
- Doc generation fails with Jest/testing type errors
- Developers confused why "excluded" files cause problems
- Workaround attempts (adding more exclusions) don't help

**Prevention:**
1. Use `tsconfig.json` `exclude` to prevent test files from being compiled at all
2. Ensure `skipLibCheck: true` in tsconfig to avoid errors from `@types/*` packages
3. Structure code so tests don't need to be imported by production code
4. For OpenCARL: already has `"exclude": ["node_modules", "dist", "**/*.test.ts", "scripts"]` in tsconfig.build.json

**Detection:**
- TypeDoc errors mention test files or test utilities
- Errors reference `@types/jest`, `@testing-library/*`, etc.
- `tsc` would also fail on the same files

**Phase to address:** Phase 1 (TypeDoc Setup & Configuration)

---

### Pitfall 6: TypeDoc/TypeScript Version Incompatibility

**What goes wrong:**
TypeDoc fails with cryptic errors about TypeScript types, or produces incorrect documentation.

**Why it happens:**
- TypeDoc has strict TypeScript version requirements (see compatibility table)
- Using TypeDoc 0.28 with TypeScript outside 5.0-5.8 range causes issues
- npm may resolve to incompatible versions if not explicitly pinned

**Consequences:**
- "TypeScript version not supported" errors
- Incorrect type rendering in documentation
- CI fails after dependency updates

**Prevention:**
1. Check TypeDoc's TypeScript version compatibility matrix before upgrading
2. Pin compatible versions in `package.json`
3. Test doc generation after any TypeScript or TypeDoc update
4. For OpenCARL: TypeScript 5.9.3 is newer than TypeDoc 0.28's officially supported range (5.0-5.8) — verify compatibility or consider updating TypeDoc

**Detection:**
- TypeDoc errors mention TypeScript version
- Documentation shows incorrect type signatures
- Check TypeDoc release notes for TS version changes

**Phase to address:** Phase 1 (TypeDoc Setup & Configuration)

---

## Moderate Pitfalls

### Pitfall 7: Artifact Upload/Deploy Race Condition

**What goes wrong:**
Deploy step fails because artifact isn't ready yet, or uses wrong artifact.

**Why it happens:**
- `actions/deploy-pages` needs artifact from previous step/job
- Forgetting `needs: build` in deploy job
- Wrong artifact name in `artifact_name` input

**Consequences:**
- "Artifact not found" errors
- Deployment of empty/wrong content
- Flaky CI behavior

**Prevention:**
```yaml
jobs:
  build-docs:
    steps:
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./docs  # TypeDoc output directory

  deploy-docs:
    needs: build-docs  # CRITICAL: wait for build
    steps:
      - uses: actions/deploy-pages@v4
```

**Detection:**
- CI logs show artifact not found
- Docs deployment runs before build completes
- Check for missing `needs:` in workflow

**Phase to address:** Phase 2 (GitHub Actions Workflow)

---

### Pitfall 8: Clean Output Directory Not Configured

**What goes wrong:**
Old documentation files persist in output, creating confusion or broken links.

**Why it happens:**
- TypeDoc doesn't clean output directory by default
- Incremental builds can leave orphaned files
- Deleted modules still have HTML files in output

**Consequences:**
- Broken links to removed modules
- Stale documentation confusing users
- Larger than necessary deployment artifacts

**Prevention:**
1. Set `--cleanOutputDir` or `"cleanOutputDir": true` in typedoc.json
2. OR add explicit `rm -rf docs` step before TypeDoc in CI

**Detection:**
- Old modules still appear in docs after removal
- Links to removed code still work (but 404 in source)
- Compare docs output with current source structure

**Phase to address:** Phase 1 (TypeDoc Setup & Configuration)

---

### Pitfall 9: Missing Package Version in Documentation

**What goes wrong:**
Documentation doesn't show which version it corresponds to, causing confusion when multiple versions exist.

**Why it happens:**
- `--includeVersion` is `false` by default
- Users can't tell if docs are for installed version or latest

**Consequences:**
- Users confused about which version docs describe
- Breaking changes not visible in docs
- Difficult to debug version-specific issues

**Prevention:**
```json
{
  "includeVersion": true
}
```

**Detection:**
- Version number not visible in docs header
- No way to identify docs version from URL or page content

**Phase to address:** Phase 1 (TypeDoc Setup & Configuration)

---

## Minor Pitfalls

### Pitfall 10: Configuration File Location Confusion

**What goes wrong:**
TypeDoc doesn't pick up configuration changes, or uses wrong config file.

**Why it happens:**
- TypeDoc checks multiple config locations: `typedoc.json`, `typedoc.jsonc`, package.json `typedocOptions`, tsconfig.json `typedocOptions`
- Precedence rules can be confusing
- Different team members using different approaches

**Consequences:**
- Config changes don't take effect
- Different behavior locally vs CI
- Time wasted debugging config issues

**Prevention:**
- Use dedicated `typedoc.json` file (clearest approach)
- Don't split config between multiple locations
- Run `npx typedoc --showConfig` to verify which config is used

**Detection:**
- Config changes don't affect output
- `--showConfig` shows unexpected values
- Different team members see different behavior

**Phase to address:** Phase 1 (TypeDoc Setup & Configuration)

---

### Pitfall 11: Workflow Trigger Timing

**What goes wrong:**
Documentation deploys on every push instead of only on releases, or vice versa.

**Why it happens:**
- Trigger configuration (`on: release` vs `on: push`) mismatched with intent
- Wanting docs to match published npm version but triggering on main push

**Consequences:**
- Unnecessary CI resource usage
- Docs out of sync with published package
- Confusing version history

**Prevention:**
1. Use `on: release: types: [published]` for production docs
2. Consider separate workflow for preview docs on PRs
3. Match trigger to existing publish.yml workflow for consistency

**Detection:**
- Docs update on push instead of release
- Docs version doesn't match npm package version
- CI running more often than expected

**Phase to address:** Phase 2 (GitHub Actions Workflow)

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip TypeDoc in CI to speed builds | Faster CI runs | Docs get out of sync, broken releases with bad docs | Never |
| Use global TypeDoc install | Avoid devDependency | Version mismatches between devs, CI failures | Never |
| Manual doc deployment (not automated) | Simpler initial setup | Forgetting to deploy, docs outdated | Only for personal projects |
| Skip `--cleanOutputDir` | Slightly faster incremental builds | Orphaned files, broken links, confusion | Never |
| Skip version in docs | Simpler config | Users can't identify docs version | Never |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| GitHub Pages | Setting source to "gh-pages branch" when using `actions/deploy-pages` | Set source to "GitHub Actions" |
| GitHub Pages | Forgetting `id-token: write` permission | Include both `pages: write` AND `id-token: write` |
| GitHub Actions | Running deploy in same job as build without artifact | Use separate jobs with `needs:` and `actions/upload-pages-artifact` |
| npm provenance | Assuming `id-token: write` is only for npm | Also needed for GitHub Pages OIDC |
| TypeDoc | Putting config in tsconfig.json when package.json has exports | Use dedicated `typedoc.json` for clarity |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Docs generate locally:** Often fails in CI due to different environment — verify in CI before merging
- [ ] **Workflow completes:** Often deploys wrong artifact or to wrong Pages source — verify live URL works
- [ ] **All pages load:** Often `.nojekyll` missing causes 404s on `_` prefixed paths — test navigation
- [ ] **Version shown:** Often `includeVersion` not set — verify version appears in docs header
- [ ] **Correct entry point:** Often using wrong file — verify exported members match expectations
- [ ] **Tests still pass:** Often adding TypeDoc config breaks compilation — run full test suite
- [ ] **Pages URL accessible:** Often permissions correct but URL not accessible — verify site loads
- [ ] **Docs match published version:** Often docs deploy on wrong trigger — verify version alignment

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Wrong entry point | LOW | Fix `entryPoints` in typedoc.json, regenerate |
| Missing .nojekyll | LOW | Add file, redeploy — immediate fix |
| Permission errors | LOW | Add missing permissions to workflow, re-run |
| Source config mismatch | LOW | Change Pages source in Settings, re-run workflow |
| Test file errors | MEDIUM | Fix tsconfig.json exclude, may need code restructuring |
| Version incompatibility | MEDIUM | Pin compatible versions, may need TypeDoc upgrade |
| Artifact race condition | LOW | Add `needs:` to workflow, re-run |
| Clean output dir | LOW | Enable option and regenerate |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Wrong entry point | Phase 1 (TypeDoc Setup) | `npx typedoc --showConfig` shows correct entry |
| Missing .nojekyll | Phase 1 (TypeDoc Setup) | Check `githubPages: true` in config or file exists |
| GITHUB_TOKEN permissions | Phase 2 (GitHub Actions) | Workflow has explicit permissions block |
| Pages source mismatch | Phase 2 (GitHub Actions) | Settings → Pages → Source matches workflow approach |
| Test files in docs | Phase 1 (TypeDoc Setup) | TypeDoc runs without Jest/testing type errors |
| TypeDoc/TS version | Phase 1 (TypeDoc Setup) | Compatibility verified before pinning versions |
| Artifact race condition | Phase 2 (GitHub Actions) | Deploy job has `needs: build-docs` |
| Clean output dir | Phase 1 (TypeDoc Setup) | `cleanOutputDir: true` in config |
| Missing version | Phase 1 (TypeDoc Setup) | `includeVersion: true` in config |
| Config location | Phase 1 (TypeDoc Setup) | Single typedoc.json file used |
| Workflow trigger | Phase 2 (GitHub Actions) | Trigger matches publish workflow |

---

## OpenCARL-Specific Notes

Based on project analysis:

1. **Entry point:** `src/plugin.ts` (not `src/index.ts`)
2. **TypeScript version:** 5.9.3 — newer than TypeDoc 0.28's officially supported range (5.0-5.8), verify compatibility
3. **Existing tsconfig:** `tsconfig.build.json` already excludes test files
4. **Existing CI:** `publish.yml` has `id-token: write` but needs `pages: write` added for docs deployment
5. **Trigger:** Should trigger on release (same as npm publish) to keep docs in sync with published versions
6. **Existing workflow structure:** `publish.yml` has separate test/e2e/publish jobs — docs can follow same pattern

---

## Sources

- [TypeDoc Official Documentation](https://typedoc.org/documents/Overview.html) - HIGH confidence
- [TypeDoc Input Options](https://typedoc.org/documents/Options.Input.html) - HIGH confidence
- [TypeDoc Configuration Options](https://typedoc.org/documents/Options.Configuration.html) - HIGH confidence
- [actions/deploy-pages GitHub](https://github.com/actions/deploy-pages) - HIGH confidence
- [GitHub Actions Permissions Documentation](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/controlling-permissions-for-github_token) - HIGH confidence
- [Stack Overflow: TypeDoc exclude test files](https://stackoverflow.com/questions/66431304/how-to-properly-exclude-test-files-from-tsdoc-typedoc) - MEDIUM confidence
- [GitHub Community: .nojekyll 404 issues](https://github.com/orgs/community/discussions/23166) - HIGH confidence
- [TypeDoc Issue #648: Underscore 404s](https://github.com/TypeStrong/typedoc/issues/648) - HIGH confidence
- [TypeDoc Issue #1680: Auto .nojekyll](https://github.com/TypeStrong/typedoc/issues/1680) - HIGH confidence
- [actions/deploy-pages Issue #406: Intermittent failures](https://github.com/actions/deploy-pages/issues/406) - MEDIUM confidence

---
*Pitfalls research for: TypeDoc + GitHub Pages documentation deployment*
*Researched: 2026-03-13*
