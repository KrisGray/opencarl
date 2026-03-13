# Phase 17: Package Metadata & CI/CD Finalization - Research

**Researched:** 2026-03-13
**Domain:** Package metadata, Docker image naming, GitHub Actions CI/CD
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
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

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PKG-01 | Package name is consistent across all references (`@krisgray/opencarl`) | Identify current repo/package references and remaining legacy strings to update (notably `bin/install.js`, `scripts/publish-opencode.ts`). |
| PKG-02 | Docker image name `opencode-carl:e2e` is updated to `opencode-opencarl:e2e` | Confirm current Docker image references and search for any remaining legacy image strings. |
| PKG-03 | GitHub Actions workflows use updated package and Docker references | Inventory workflow files and document current image/env/artifact naming to update. |
| PKG-04 | All package.json metadata reflects OpenCARL branding | Check `package.json` core fields (name, description, keywords, repository/bugs/homepage) for alignment. |
| PKG-05 | E2E tests pass with updated Docker image | Map existing E2E commands and Docker build/run flow to verify post-update. |
</phase_requirements>

## Summary

Phase 17 is about consistency, not feature changes: align all package name references and metadata with `@krisgray/opencarl`, ensure the canonical Docker image name `opencode-opencarl:e2e` is the only one in use, and update CI workflow labels/artifacts. The repo already uses `@krisgray/opencarl` in `package.json`, docs, and E2E image literals, but there are still legacy package references in code and scripts (notably `bin/install.js` and `scripts/publish-opencode.ts`) that will block a clean “all references” pass.

CI already builds `opencode-opencarl:e2e` in `.github/workflows/e2e-tests.yml` and the E2E runner references that image. However, the workflows have generic job names and artifact names that may need to be rebranded to OpenCARL per the locked decisions. A repo-wide search for legacy strings will still hit `.planning/` history and other archived notes, so explicit exceptions must be documented if those files are left unchanged.

**Primary recommendation:** Plan tasks around (1) a repo-wide legacy-string sweep with explicit exceptions, (2) package metadata clean-up in `package.json`, (3) workflow label/artifact updates, and (4) a single E2E run using the updated Docker image.

## Standard Stack

### Core
| Library/Tool | Version | Purpose | Why Standard |
|--------------|---------|---------|--------------|
| npm package metadata (`package.json`) | repo-defined | Package name, metadata, publish configuration | Single source of truth for package identity and public metadata. |
| GitHub Actions | repo-defined | CI workflows for tests/E2E | Existing CI/CD system used by this repo. |
| Docker | repo-defined | E2E container builds and runs | E2E tests rely on a local image build and run. |

### Supporting
| Library/Tool | Version | Purpose | When to Use |
|--------------|---------|---------|-------------|
| `actions/setup-node` | v4 | Node setup in CI | All CI jobs running npm commands. |
| `docker/setup-buildx-action` | v3 | Docker Buildx in CI | E2E image build step. |
| `actions/cache` | v3 | Cache Docker layers | E2E image build optimization. |
| `actions/upload-artifact` | v4 | Upload logs/artifacts | CI artifacts on failure or coverage output. |
| `codecov/codecov-action` | v4 | Coverage upload | Coverage reporting in test workflow. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| GitHub Actions | Another CI provider | Out of scope; repo already standardized on GitHub Actions. |

## Architecture Patterns

### Pattern 1: Single source of truth for package identity
**What:** `package.json` defines the canonical package name and metadata, and every other reference should mirror it.
**When to use:** Any updates to package name, badges, or publish tooling.
**Example:**
```json
// Source: package.json
{
  "name": "@krisgray/opencarl",
  "description": "OpenCARL - Dynamic rule injection for OpenCode. Rules load when relevant, disappear when not. Adapted from CARL by Chris Kahler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/KrisGray/opencarl.git"
  },
  "bugs": {
    "url": "https://github.com/KrisGray/opencarl/issues"
  },
  "homepage": "https://github.com/KrisGray/opencarl#readme"
}
```

### Pattern 2: Canonical Docker image name used everywhere
**What:** Keep a single `opencode-opencarl:e2e` image tag across CI and local E2E runs.
**When to use:** E2E workflows, test scripts, and any Docker build/run commands.
**Example:**
```bash
# Source: .github/workflows/e2e-tests.yml
docker build -f tests/e2e/Dockerfile -t opencode-opencarl:e2e \
  --cache-from type=local,src=/tmp/.buildx-cache \
  --cache-to type=local,dest=/tmp/.buildx-cache-new,mode=max \
  .
```

### Anti-Patterns to Avoid
- **Multiple package name variants:** Leaving `@krisgray/opencode-carl-plugin` in scripts or help output breaks PKG-01 consistency.
- **Workflow-only renames:** Updating workflow commands but not job names/artifact names violates the CI/CD scope decisions.
- **Partial string sweeps:** Missing legacy strings in `bin/` and `scripts/` leads to user-facing inconsistencies.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Consistency checks | Custom ad-hoc scripts | Repo-wide search (`rg`/Grep) + targeted file review | Fast, auditable, and matches the locked decision for repo-wide scanning. |
| E2E verification | New CI job | Existing `test:e2e:ci` or `test:e2e:local` scripts | Keeps E2E behavior consistent with existing test harness. |

**Key insight:** This phase is alignment work; leverage existing npm scripts and CI workflows rather than adding new tooling.

## Common Pitfalls

### Pitfall 1: Legacy package name in install/publish tooling
**What goes wrong:** `bin/install.js` and `scripts/publish-opencode.ts` still mention `@krisgray/opencode-carl-plugin`, which violates PKG-01 even if docs are correct.
**Why it happens:** Those scripts are not part of doc rebranding phases and were not updated.
**How to avoid:** Include these files in the repo-wide search and update usage strings, validation checks, and publish messages.
**Warning signs:** `opencode-carl-plugin` appears in CLI help, opencode.json hints, or publish guard checks.

### Pitfall 2: CI labels and artifacts not rebranded
**What goes wrong:** Workflows pass but still use generic or legacy names, violating locked CI/CD scope.
**Why it happens:** Updating commands but skipping `name:` fields and artifact `name:` entries.
**How to avoid:** Update workflow `name`, job keys/labels, and artifact names while touching workflows.
**Warning signs:** Artifacts like `coverage-report` or `docker-logs` lack OpenCARL branding.

### Pitfall 3: Repo-wide search finds historical files
**What goes wrong:** `.planning/` history still contains legacy names; failing to explicitly exempt them blocks “all references” checks.
**Why it happens:** The repo includes historical plans and docs that intentionally preserve older names.
**How to avoid:** Document explicit exceptions for `.planning/` or other archival paths when reporting search results.
**Warning signs:** Search results dominated by `.planning/` or archived milestone files.

## Code Examples

Verified patterns from this repo:

### E2E image name in CI
```yaml
# Source: .github/workflows/e2e-tests.yml
- name: Build Docker image
  run: |
    docker build -f tests/e2e/Dockerfile -t opencode-opencarl:e2e \
      --cache-from type=local,src=/tmp/.buildx-cache \
      --cache-to type=local,dest=/tmp/.buildx-cache-new,mode=max \
      .
```

### E2E test script image name
```bash
# Source: tests/e2e/run-e2e-tests.sh
IMAGE_NAME='opencode-opencarl:e2e'
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `opencode-carl:e2e` image | `opencode-opencarl:e2e` image | 2026-03-12 (Phase 15) | E2E infrastructure aligned with OpenCARL branding. |
| `@krisgray/opencode-carl-plugin` package name references | `@krisgray/opencarl` | In progress (Phase 17) | Consistent package identity across code, docs, and CI. |

**Deprecated/outdated:**
- `@krisgray/opencode-carl-plugin` references in `bin/install.js` and `scripts/publish-opencode.ts`.

## Open Questions

1. **Should legacy package references in `.planning/` be exempted?**
   - What we know: Repo-wide search will surface historical planning documents with old names.
   - What's unclear: Whether to update or explicitly exempt archived planning files.
   - Recommendation: Treat `.planning/` as an explicit exception set and document it in verification output.

## Sources

### Primary (HIGH confidence)
- package.json — package name and metadata
- .github/workflows/e2e-tests.yml — Docker image naming and CI steps
- .github/workflows/test.yml — CI workflow naming/artifacts
- tests/e2e/run-e2e-tests.sh — local E2E runner image name
- bin/install.js — CLI/package usage references
- scripts/publish-opencode.ts — publish guard and package name validation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - derived from repo configuration and workflows
- Architecture: MEDIUM - inferred patterns from current files and prior phase decisions
- Pitfalls: MEDIUM - based on repo string search results and legacy references

**Research date:** 2026-03-13
**Valid until:** 2026-04-12
