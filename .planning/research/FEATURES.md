# Feature Research

**Domain:** TypeDoc API Documentation with GitHub Pages Deployment
**Project:** OpenCARL v2.0.2 Documentation Site
**Researched:** 2026-03-13
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **API reference HTML** | Standard expectation for TypeScript npm packages - users need to look up types, signatures, and usage | LOW | TypeDoc generates automatically from TSDoc comments. Single config file needed. |
| **Search functionality** | Essential for finding specific functions/classes in API surface | LOW | TypeDoc includes built-in client-side search. No server needed. |
| **Source code links** | Developers expect to click through to GitHub source | LOW | TypeDoc auto-generates via `gitRevision` option. Links to exact line numbers. |
| **Navigation hierarchy** | Module/namespace/class/method browsing is expected | LOW | TypeDoc default theme provides tree navigation. |
| **Mobile-responsive** | Developers read docs on phones/tablets | LOW | TypeDoc default theme is responsive. |
| **Deployed on release** | Docs should match published npm version | MEDIUM | Requires GitHub Actions workflow integration with existing release process. |
| **No Jekyll processing** | TypeDoc generates files starting with `_` (scoped packages) which Jekyll ignores | LOW | TypeDoc creates `.nojekyll` automatically when `githubPages: true` (default). |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Hosted base URL / Canonical links** | SEO benefits, proper sitemap generation | LOW | Set `hostedBaseUrl` option. TypeDoc generates sitemap.xml automatically. |
| **Custom branding** | Professional appearance matching project identity | MEDIUM | Via `customCss`, `customFooterHtml`, `favicon` options. |
| **Version-specific docs** | Users can reference docs matching their installed version | HIGH | Requires multi-version setup. Typically overkill for small packages. |
| **Dark/light mode** | Developer preference, accessibility | LOW | TypeDoc default theme supports this out of box. |
| **Navigation links to repo/issues** | Quick access to related resources | LOW | Via `navigationLinks` or `sidebarLinks` options. |
| **Include README as landing page** | Context and quick-start guide before API reference | LOW | Set `readme` option to `./README.md` (default behavior). |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Deploy on every push** | "I want to see docs update immediately" | Creates version drift between npm package and docs. Users may see unreleased API. | Deploy only on release events to ensure docs match published version. |
| **Versioned docs (multiple versions)** | "Support users on older versions" | Significantly increases complexity: subpaths, version switching UI, build time. Most small packages don't need this. | Document breaking changes in CHANGELOG. Link to tagged releases in GitHub. |
| **Custom theme from scratch** | "Match our brand exactly" | High maintenance burden, breaks with TypeDoc updates, defeats purpose of using TypeDoc. | Use `customCss` to override specific styles. Default theme is well-tested. |
| **Search in comments** | "Find all mentions of X" | Increases search index size 10x or more. Slows page load. | Default search covers names and signatures. |

## Feature Dependencies

```
TypeDoc Configuration
    └──requires──> TypeScript source with TSDoc comments

GitHub Actions Workflow
    └──requires──> TypeDoc Configuration
    └──requires──> Existing release workflow (publish.yml)

gh-pages Branch
    └──requires──> GitHub Actions Workflow
    └──requires──> Repository Settings (Pages source = gh-pages branch)

GitHub Pages Site
    └──requires──> gh-pages Branch
```

### Dependency Notes

- **TypeDoc requires TSDoc comments:** If source lacks JSDoc/TSDoc comments, output will be sparse (signatures only). Not a blocker but affects quality.
- **Workflow depends on release:** Must integrate with existing `publish.yml` trigger (`release: types: [published]`). Do NOT create parallel trigger.
- **GitHub Pages requires one-time setup:** User must visit Settings > Pages > select "Deploy from branch: gh-pages" after first deployment attempt.

## Integration with Existing Release Workflow

The existing `publish.yml` workflow:
- Triggers on `release: types: [published]`
- Runs test + E2E tests
- Publishes to npm with provenance

**Recommended approach:** Add docs deployment as a separate job in `publish.yml` that runs AFTER npm publish succeeds. This ensures:
1. Docs only update when npm publish succeeds
2. No race conditions between npm and docs
3. Single source of truth (release event)

```yaml
# In publish.yml, add after publish job:
docs:
  needs: [test, e2e, publish]
  runs-on: ubuntu-latest
  permissions:
    contents: write
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - run: npx typedoc
    - uses: JamesIves/github-pages-deploy-action@v4
      with:
        folder: docs
        branch: gh-pages
```

## MVP Definition

### Launch With (v2.0.2)

Minimum viable documentation site — what's needed to be useful.

- [ ] TypeDoc generates HTML API reference from TypeScript source — Core value
- [ ] GitHub Actions workflow deploys to gh-pages on release — Automation
- [ ] README.md as landing page — Context and quick start
- [ ] Source links to GitHub — Developer expectation
- [ ] Built-in search — Navigation aid
- [ ] `.nojekyll` file — Prevents GitHub Pages processing issues

### Add After Validation (v2.x)

Features to add once core is working.

- [ ] Custom CSS for branding — After feedback on default appearance
- [ ] `hostedBaseUrl` for canonical links — After domain decision
- [ ] Sidebar links to npm/GitHub — Polish

### Future Consideration (v3+)

Features to defer until product-market fit is established.

- [ ] Versioned documentation — If user demand justifies complexity
- [ ] Custom domain (CNAME) — If SEO/hosting needs arise
- [ ] typedoc-plugin-markdown for alternative output — If integration needs arise

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| TypeDoc HTML generation | HIGH | LOW | P1 |
| GitHub Actions deployment | HIGH | LOW | P1 |
| Source links | HIGH | LOW | P1 |
| Search (built-in) | MEDIUM | LOW | P1 (free) |
| README landing page | MEDIUM | LOW | P1 (default) |
| `.nojekyll` file | HIGH | LOW | P1 (automatic) |
| Custom CSS branding | LOW | MEDIUM | P2 |
| Canonical links/sitemap | LOW | LOW | P2 |
| Sidebar/nav links | LOW | LOW | P2 |
| Versioned docs | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## TypeDoc Configuration Recommendations

Based on research, recommended `typedoc.json` structure:

```json
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": ["src/index.ts"],
  "out": "docs",
  "name": "OpenCARL API",
  "readme": "./README.md",
  "githubPages": true,
  "cleanOutputDir": true,
  "includeVersion": true,
  "gitRevision": "main",
  "sourceLinkExternal": true,
  "navigationLinks": {
    "GitHub": "https://github.com/kris-gray/opencarl",
    "npm": "https://www.npmjs.com/package/@krisgray/opencarl"
  },
  "excludePrivate": true,
  "excludeInternal": true
}
```

### Key Options Explained

| Option | Value | Rationale |
|--------|-------|-----------|
| `githubPages` | `true` | Creates `.nojekyll` automatically |
| `includeVersion` | `true` | Shows package version in header |
| `gitRevision` | `"main"` | Links point to main branch |
| `sourceLinkExternal` | `true` | Opens source links in new tab |
| `excludePrivate` | `true` | Hide private members |
| `excludeInternal` | `true` | Hide `@internal` members |

## Deployment Action Comparison

Two popular actions for gh-pages deployment:

| Criterion | JamesIves/github-pages-deploy-action | peaceiris/actions-gh-pages |
|-----------|--------------------------------------|---------------------------|
| Stars | 4.6k | 5.2k |
| Maintenance | Active | Active |
| `GITHUB_TOKEN` support | Yes | Yes |
| Clean deploy | Yes (default) | Yes (default) |
| Configuration simplicity | Very simple | Simple |

**Recommendation:** `JamesIves/github-pages-deploy-action@v4` — simpler configuration, widely used, good documentation.

## Sources

- [TypeDoc Official Documentation](https://typedoc.org/documents/Options.html) — HIGH confidence, official source
- [TypeDoc Output Options](https://typedoc.org/documents/Options.Output.html) — HIGH confidence, official source
- [JamesIves/github-pages-deploy-action](https://github.com/JamesIves/github-pages-deploy-action) — HIGH confidence, official GitHub
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages) — HIGH confidence, official GitHub
- [API Documentation Best Practices 2025](https://www.theneo.io/blog/api-documentation-best-practices-guide-2025) — MEDIUM confidence, industry article
- [Stack Overflow: Deploying typedoc to gh-pages](https://stackoverflow.com/questions/51126679/deploying-typedoc-to-gh-pages) — LOW confidence, community content

---
*Feature research for: TypeDoc API Documentation with GitHub Pages*
*Researched: 2026-03-13*
