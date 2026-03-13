# Project Research Summary

**Project:** OpenCARL v2.0.2 Documentation Site
**Domain:** TypeDoc API Documentation with GitHub Pages Deployment
**Researched:** 2026-03-13
**Confidence:** HIGH

## Executive Summary

OpenCARL v2.0.2 adds automated API documentation to an existing TypeScript npm package. The standard approach for this domain is TypeDoc (the industry-standard TypeScript documentation generator) deployed via GitHub Pages. Research confirms this is a well-documented, low-risk addition with clear implementation patterns.

**Recommended approach:** Add TypeDoc as a dev dependency, configure it via `typedoc.json`, and integrate a `docs` job into the existing `publish.yml` workflow. Documentation will deploy on GitHub release events only, ensuring docs always match the published npm version. Use `peaceiris/actions-gh-pages@v4` for deployment with orphan branch strategy (clean `gh-pages` history).

**Key risks:** Entry point misconfiguration (OpenCARL uses `src/plugin.ts`, not `src/index.ts`), missing `.nojekyll` file causing 404s, and TypeScript version compatibility (TypeDoc 0.28 officially supports TypeScript 5.0-5.8, but OpenCARL uses 5.9.3). All are preventable with proper configuration.

## Key Findings

### Recommended Stack

TypeDoc generates HTML API documentation directly from TypeScript source with TSDoc comments. The `peaceiris/actions-gh-pages` GitHub Action handles deployment to the `gh-pages` branch. Both are industry standards with active maintenance.

**Core technologies:**
- **typedoc ^0.28.17** — TypeScript API documentation generator — native TypeScript 5.x support, built-in GitHub Pages compatibility (`githubPages: true`), self-contained HTML output
- **peaceiris/actions-gh-pages v4.0.0** — GitHub Action for gh-pages deployment — most popular option (5.2k+ stars), works with `GITHUB_TOKEN`, simple configuration

**Alternatives considered and rejected:**
- `typedoc-plugin-markdown` — adds complexity, only needed for Docusaurus/VitePress integration
- Official GitHub `actions/deploy-pages` — more complex setup, `peaceiris` is simpler for this use case
- Docusaurus/VitePress — massive over-engineering for standalone API docs

### Expected Features

**Must have (table stakes):**
- API reference HTML — users expect to look up types, signatures, and usage
- Search functionality — essential for finding specific functions/classes
- Source code links — developers expect to click through to GitHub
- Navigation hierarchy — module/namespace/class/method browsing
- Mobile-responsive — developers read docs on phones/tablets
- Deployed on release — docs should match published npm version
- `.nojekyll` file — prevents GitHub Pages processing issues with underscore-prefixed paths

**Should have (competitive):**
- Dark/light mode — TypeDoc default theme supports this out of box
- Navigation links to repo/issues — via `navigationLinks` or `sidebarLinks` options
- README as landing page — context and quick-start guide (default behavior)
- Canonical links/sitemap — via `hostedBaseUrl` option

**Defer (v2+):**
- Custom CSS branding — after feedback on default appearance
- Versioned documentation — high complexity, typically overkill for small packages
- Custom domain (CNAME) — if SEO/hosting needs arise

### Architecture Approach

Add a `docs` job to the existing `publish.yml` workflow that runs after tests pass. TypeDoc reads `typedoc.json` for configuration and generates HTML to the `docs/` directory (gitignored). The `peaceiris/actions-gh-pages` action pushes to `gh-pages` branch with orphan commits (no shared history with main).

**Major components:**
1. **typedoc.json** — Configuration file at project root (entry points, output directory, GitHub Pages mode)
2. **docs/ directory** — TypeDoc HTML output (gitignored, generated in CI)
3. **docs job in publish.yml** — GitHub Actions workflow that builds and deploys docs on release
4. **gh-pages branch** — Orphan branch containing only docs output

### Critical Pitfalls

1. **Wrong entry point path** — OpenCARL's entry is `src/plugin.ts`, not `src/index.ts`. Prevention: use explicit `entryPoints` in typedoc.json.
2. **Missing `.nojekyll` causes 404s** — GitHub Pages ignores underscore-prefixed paths without this file. Prevention: set `githubPages: true` in typedoc.json (auto-generates `.nojekyll`).
3. **Incorrect GITHUB_TOKEN permissions** — Deployment fails with HTTP 403. Prevention: add `permissions: contents: write` to docs job.
4. **GitHub Pages source configuration mismatch** — Docs deploy but never appear. Prevention: set Pages source to "Deploy from a branch: gh-pages".
5. **TypeDoc/TypeScript version incompatibility** — TypeDoc 0.28 officially supports TS 5.0-5.8; OpenCARL uses 5.9.3. Prevention: verify compatibility before implementation.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: TypeDoc Setup & Configuration
**Rationale:** Foundation work must come first — without proper TypeDoc configuration, deployment cannot succeed. Configuration is self-contained and verifiable locally.
**Delivers:** Working local documentation generation
**Addresses:** API reference HTML, README landing page, search functionality, source links, navigation, `.nojekyll` file
**Avoids:** Wrong entry point, missing `.nojekyll`, test files in docs, TypeDoc/TS version issues, config location confusion
**Features:** P1 features (HTML generation, search, source links, README landing)

### Phase 2: GitHub Actions Workflow Integration
**Rationale:** Deployment depends on Phase 1 producing valid output. Integrates with existing `publish.yml` workflow structure.
**Delivers:** Automated docs deployment to GitHub Pages on release
**Uses:** `peaceiris/actions-gh-pages@v4`, existing `publish.yml` workflow
**Implements:** Release-triggered documentation, orphan branch strategy
**Avoids:** GITHUB_TOKEN permissions, Pages source mismatch, artifact race conditions, workflow trigger timing
**Features:** Deployed on release

### Phase Ordering Rationale

- **Phase 1 before Phase 2:** Documentation must generate successfully before deployment logic makes sense. Local verification catches configuration issues before CI complexity.
- **Grouping by verification scope:** Phase 1 is verifiable locally (`npm run docs`), Phase 2 requires CI/GitHub Pages (harder to debug).
- **Pitfall prevention order:** Critical configuration pitfalls (entry point, .nojekyll, version compatibility) are all Phase 1. Deployment pitfalls (permissions, Pages config) are Phase 2.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** TypeDoc 0.28 + TypeScript 5.9.3 compatibility — official support matrix shows 5.0-5.8; may need to verify or update TypeDoc version

Phases with standard patterns (skip research-phase):
- **Phase 2:** Well-documented GitHub Actions patterns, `peaceiris/actions-gh-pages` has clear documentation

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | TypeDoc and peaceiris/actions-gh-pages are industry standards, official docs verified |
| Features | HIGH | Table stakes are well-defined, TypeDoc provides most out of box |
| Architecture | HIGH | Clear patterns for release-triggered docs and orphan branch strategy |
| Pitfalls | HIGH | Official docs and GitHub issues provide clear prevention strategies |

**Overall confidence:** HIGH

### Gaps to Address

- **TypeScript 5.9.3 compatibility:** TypeDoc 0.28 officially supports TypeScript 5.0-5.8. OpenCARL uses 5.9.3. Verify compatibility during Phase 1 implementation — may need to check TypeDoc changelog or test locally before committing to version pin.

## Sources

### Primary (HIGH confidence)
- TypeDoc Official Documentation (https://typedoc.org/) — configuration options, output options, TypeScript compatibility
- peaceiris/actions-gh-pages (https://github.com/peaceiris/actions-gh-pages) — deployment action, configuration, GITHUB_TOKEN usage
- GitHub Actions Permissions Documentation — GITHUB_TOKEN permissions model

### Secondary (MEDIUM confidence)
- JamesIves/github-pages-deploy-action — alternative deployment action, configuration patterns
- Stack Overflow community answers — deployment patterns, common issues

### Tertiary (LOW confidence)
- API Documentation Best Practices 2025 (theneo.io) — general guidance, industry trends

---
*Research completed: 2026-03-13*
*Ready for roadmap: yes*
