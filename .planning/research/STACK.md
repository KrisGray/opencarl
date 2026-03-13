# Stack Research

**Domain:** TypeDoc API Documentation with GitHub Pages Deployment
**Project:** OpenCARL v2.0.2 Documentation Site
**Researched:** 2026-03-13
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| typedoc | ^0.28.17 | TypeScript API documentation generator | Industry standard for TypeScript docs; native TypeScript 5.9.x support; built-in GitHub Pages compatibility (`githubPages: true` creates `.nojekyll`); HTML output works directly with GitHub Pages |
| peaceiris/actions-gh-pages | v4.0.0 | GitHub Action for gh-pages deployment | Most popular option (5.2k+ stars); simple configuration; works with `GITHUB_TOKEN` (no secrets management needed); actively maintained |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| typedoc (CLI) | Generate docs from TypeScript source | Runs via `npx typedoc` — no global install needed |

## Installation

```bash
# Dev dependency only
npm install -D typedoc
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| peaceiris/actions-gh-pages | JamesIves/github-pages-deploy-action | Both are equally capable; peaceiris has slightly more usage/stars |
| peaceiris/actions-gh-pages | Official GitHub actions (configure-pages + upload-pages-artifact + deploy-pages) | Official actions required if using GitHub Enterprise or need fine-grained control; peaceiris is simpler for public repos |
| HTML output | typedoc-plugin-markdown | Use markdown plugin ONLY if integrating with a larger documentation site (Docusaurus, VitePress); adds complexity for standalone API docs |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| typedoc-plugin-markdown (for this project) | Adds unnecessary complexity; HTML output is self-contained and works directly with GitHub Pages | Standard HTML output |
| typedoc-plugin-coverage | Overkill for a 4K LOC library; useful for large enterprise projects | Basic TypeDoc |
| typedoc-plugin-missing-exports | Can expose internal implementation details you don't want documented | Export only what's needed, document intentionally |
| Custom TypeDoc themes | Default theme is clean, functional, and well-maintained | Default theme |
| JSDoc + TypeScript | TypeDoc parses TypeScript directly and produces better output with less configuration | TypeDoc |
| Docusaurus/VitePress for API docs alone | Massive over-engineering for a single library's API reference | TypeDoc HTML output |

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| typedoc@0.28.x | typescript@5.0.x - 5.9.x | Peer dependency explicitly supports 5.9.x |
| peaceiris/actions-gh-pages@v4 | All GitHub Actions runners | Linux, macOS, Windows supported |

## Integration with Existing CI

### Existing Setup
- **Workflow:** `.github/workflows/publish.yml` triggers on release
- **Node:** 20
- **Package manager:** npm with `npm ci`
- **Build command:** `npm run build` (TypeScript compilation)

### Recommended Integration

Add a `docs` job to the existing `publish.yml` workflow (runs after tests pass):

```yaml
# Add to publish.yml
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

    - name: Generate API documentation
      run: npx typedoc --out docs src/plugin.ts

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v4
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./docs
```

### TypeDoc Configuration

Minimal `typedoc.json` in project root:

```json
{
  "entryPoints": ["src/plugin.ts"],
  "out": "docs",
  "githubPages": true,
  "hideGenerator": false,
  "includeVersion": true,
  "readme": "./README.md"
}
```

Key options explained:
- `githubPages: true` — Creates `.nojekyll` file (required for scoped packages like `@krisgray/opencarl`)
- `hideGenerator: false` — Keep TypeDoc attribution (good practice)
- `includeVersion: true` — Shows version number in docs

## Sources

- **TypeDoc 0.28.17** — npm registry (verified 2026-03-13)
  - Latest release: 2026-02-13
  - Peer deps: TypeScript 5.0.x through 5.9.x explicitly supported
- **TypeDoc Output Options** — https://typedoc.org/documents/Options.Output.html
  - `githubPages` option documented
  - HTML output is default and self-contained
- **peaceiris/actions-gh-pages** — https://github.com/peaceiris/actions-gh-pages
  - v4.0.0 (latest release verified 2026-03-13)
  - 5.2k+ stars, actively maintained
  - Works with `GITHUB_TOKEN` (no manual secret setup needed)
- **typedoc-plugin-markdown** — npm registry
  - v4.10.0, requires typedoc 0.28.x
  - Only needed for Docusaurus/VitePress integration — over-engineering for this use case

---
*Stack research for: TypeDoc API Documentation with GitHub Pages*
*Researched: 2026-03-13*
