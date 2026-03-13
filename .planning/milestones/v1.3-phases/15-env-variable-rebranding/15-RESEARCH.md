# Phase 15: Environment Variable Rebranding - Research

**Researched:** 2026-03-12
**Domain:** Environment variable management, Docker image naming, documentation updates
**Confidence:** HIGH

## Summary

Phase 15 requires renaming the debug environment variable from `CARL_DEBUG` to `OPENCARL_DEBUG` across all project contexts. Research confirms this is a straightforward text replacement task with specific challenges in ensuring comprehensive coverage and avoiding false positives. The core implementation is simple (updating `process.env.OPENCARL_DEBUG === "true"` patterns), but the breadth of affected files (documentation, CI, test scripts, Docker configurations) requires systematic verification. The project already has partial implementation in source code, with dist files still containing old references.

**Primary recommendation:** Systematic file-by-file replacement with comprehensive grep verification after each batch, followed by test suite validation and documentation updates.

## User Constraints

### Locked Decisions

- All file types updated: `.ts`, `.js`, `.json`, `.yaml`, `.yml`, `.sh`, `.md`
- All contexts covered: source code + CI configuration + test scripts + documentation
- Include documentation and code comments (rename "CARL_DEBUG" strings in comments, not just env var access)
- No exclusions — update everything (ignore generated dist/ and node_modules/ as expected)
- Use all approaches: grep/rg for automation, IDE "Find in Files" for review, script-based search for verification
- Recursive search: `grep -r` across entire codebase (not single-level only)
- False-positive filtering: Use regex patterns to avoid false matches (e.g., variable names like "DEBUG_MODE", file paths, or non-env-var contexts)
- Both code changes AND documentation updates must be verified (most comprehensive)
- All verification methods: manual review + automated search check + test suite validation
- Treat old name as failure: If `CARL_DEBUG` string exists after changes, block merge until fixed
- Zero test failures: All existing tests must pass after the rename (catches regressions)
- Remove immediately: No deprecation period, no dual support
- Console warning: Print deprecation message to stderr when old name is used: "CARL_DEBUG is deprecated, please use OPENCARL_DEBUG"
- No migration: Users must manually update their shell profiles (.bashrc, .zshrc) and CI configs
- Immediate versioning: Semver bump (MAJOR or MINOR required for breaking change)

### OpenCode's Discretion

- Exact regex patterns for false-positive filtering
- Console warning message wording
- Test suite validation thresholds
- Build/commit message style for the rename commits

### Deferred Ideas (OUT OF SCOPE)

- Migration script to auto-update user configurations — belongs in a separate "developer tools" phase or post-release support
- Deprecation period with dual support — explicitly out of scope for v1.3 branding
- Legacy environment variable support (read both, prioritize OPENCARL_DEBUG) — no longer needed per immediate rename decision

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ENV-01 | CARL_DEBUG environment variable is renamed to OPENCARL_DEBUG | Covered in Standard Stack and Code Examples sections |
| ENV-02 | All CI configuration files use OPENCARL_DEBUG | Covered in Architecture Patterns section |
| ENV-03 | All test scripts use OPENCARL_DEBUG | Covered in Code Examples section |
| ENV-04 | Documentation references OPENCARL_DEBUG instead of CARL_DEBUG | Covered in Code Examples section |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js | v20 | Runtime for JavaScript/TypeScript code | Official environment for process.env access |
| TypeScript | Latest | Type-safe codebase with type definitions | Official type definitions available in @types/node |
| Jest | Latest | Test framework (package.json scripts) | Official test runner used in project |
| Docker | Latest | Containerization for E2E tests (opencode-carl:e2e image) | Official container runtime for E2E testing |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Bash | System | Shell scripts for E2E test runner (tests/e2e/run-e2e-tests.sh) | Running container-based tests |
| GitHub Actions | v4 | CI/CD workflows (.github/workflows/*.yml) | Automated testing and builds |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual find-replace | IDE "Find and Replace All" | IDE patterns easier but requires manual verification for false positives |
| Single-file regex replace | Multiple grep searches | Multiple searches more precise but more verbose |

**Installation:**
```bash
npm install  # Install Jest, TypeScript dependencies
# No additional tools needed for rename task
```

## Architecture Patterns

### Recommended File Structure

```
/
├── src/
│   └── opencarl/
│       └── debug.ts      # Debug logging system (source)
├── dist/
│   ├── carl/             # Old distribution (needs rebuild)
│   └── opencarl/         # New distribution (current)
├── tests/
│   ├── javascript/
│   │   └── e2e/
│   │       ├── *.test.ts # E2E tests (use IMAGE_NAME variable)
│   │       └── *.spec.ts
│   └── e2e/
│       └── run-e2e-tests.sh # Shell script runner (uses IMAGE_NAME)
├── .github/
│   └── workflows/
│       ├── e2e-tests.yml # CI workflow (uses Docker image name)
│       └── test.yml      # Test workflow
└── [docs]/
    ├── README.md         # User-facing documentation
    ├── TROUBLESHOOTING.md # Debug mode documentation
    └── CARL-DOCS.md      # Technical documentation
```

### Pattern 1: Environment Variable Access

**What:** Standard Node.js pattern for reading environment variables with strict type checking and caching.

**When to use:** When checking if a boolean environment variable is enabled.

**Example:**
```typescript
// Source: src/opencarl/debug.ts
const DEBUG_ENABLED = process.env.OPENCARL_DEBUG === "true";

export function debugLog(category: string, message: string, data?: object): void {
  if (!DEBUG_ENABLED) {
    return; // Zero overhead when disabled
  }
  // ... logging logic
}
```

**Key characteristics:**
- String comparison to "true" for boolean flags (no JSON parsing)
- Cache at module load time to avoid runtime overhead when disabled
- Early return pattern for zero-cost logging when disabled

### Pattern 2: Docker Image Naming Convention

**What:** Semantic naming pattern: `opencode-{product}:{variant}`

**When to use:** E2E test container images and references.

**Example:**
```bash
# Shell script pattern
IMAGE_NAME="opencode-carl:e2e"

# CI workflow pattern
docker build -f tests/e2e/Dockerfile -t "$IMAGE_NAME" .
```

**Naming rationale:**
- `opencode-` prefix indicates product scope
- `-carl` indicates feature/product (will be `-opencarl` after rename)
- `:e2e` variant suffix indicates test environment

### Anti-Patterns to Avoid

- **Hardcoded image names in multiple places:** Store in variables and reference consistently
- **Missing env var caching:** Access process.env on every function call (performance impact)
- **Inconsistent casing:** Never mix "CARL_DEBUG", "CarlDebug", "carlDebug" — use consistent SCREAMING_SNAKE_CASE
- **Comment-only updates:** Document env var changes in code comments, not just inline

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Environment variable validation | Custom validators | Runtime type checking or strict comparison | Validation complexity outweighs benefits for simple boolean flags |
| False-positive filtering | Manual review of each match | Regex patterns + context-aware filtering | Comprehensive grep searches catch edge cases |
| Docker image caching | Build cache management | GitHub Actions cache action | Official solution handles edge cases and lifecycle management |
| Test coverage reporting | Custom reporters | Jest coverage (already configured) | Established tooling handles edge cases |

**Key insight:** Environment variable validation and Docker image management are well-solved problems with mature tooling. Focus effort on comprehensive coverage verification rather than building custom solutions.

## Common Pitfalls

### Pitfall 1: False Positive Matches

**What goes wrong:** Grep matches `CARL_DEBUG` in unrelated contexts like variable names (`const DEBUG_MODE = "value"`), file paths (`src/debug/logs/`), or package names (not applicable here).

**Why it happens:** String "CARL_DEBUG" is a substring of other valid strings. Simple grep without context may catch these.

**How to avoid:**
1. Use context-aware grep patterns (look for word boundaries)
2. Search in specific file types first (focus on .ts, .js, .sh, .yml, .md)
3. Manually review grep results before committing changes
4. Use `rg -w` (word boundary) or `rg -i "OPENCARL_DEBUG"` to find exact matches

**Warning signs:**
- Matches in comments that say "xDEBUG" or "DEBUG_MODE"
- Matches in file paths or variable declarations that include "debug" as part of name
- Matches in unrelated documentation about other projects

### Pitfall 2: Incomplete Coverage

**What goes wrong:** After find-replace, some `CARL_DEBUG` references remain in less-common file types (e.g., generated files, package-lock.json, unrelated .md files).

**Why it happens:** Automated find-replace often excludes certain file types by default or misses nested references.

**How to avoid:**
1. Run comprehensive grep before changes: `rg -i "CARL_DEBUG"`
2. Run grep after changes: `rg -i "CARL_DEBUG"` (should return 0 results)
3. Search in all file types: `--include="*.ts" --include="*.js" --include="*.md" --include="*.yml" --include="*.yaml" --include="*.sh" --include="*.json"`
4. Check documentation files specifically (README, TROUBLESHOOTING, CARL-DOCS)
5. Verify CI workflow files and shell scripts

**Warning signs:**
- grep still returns results after changes
- Documentation still mentions old name
- CI workflow uses old image name or env var name

### Pitfall 3: Breaking Test Suite

**What goes wrong:** Code that checks `process.env.CARL_DEBUG` continues running after rename, causing tests to fail or behave unexpectedly.

**Why it happens:** All references updated but test suite not re-run to verify, or test fixtures still use old name.

**How to avoid:**
1. Run full test suite after each batch of changes: `npm run test:coverage`
2. Run tests with env var set to new name: `OPENCARL_DEBUG=true npm test`
3. Verify zero regressions: All existing tests must pass
4. Check E2E test suite specifically (container-based tests may fail if Docker image name outdated)

**Warning signs:**
- Tests fail after changes
- E2E tests skip or fail with Docker errors
- Manual verification shows debug mode not working with new env var

### Pitfall 4: Documentation Desynchronization

**What goes wrong:** Code updated but documentation (README, TROUBLESHOOTING) still references old name, confusing users.

**Why it happens:** Documentation updates often overlooked during find-replace tasks.

**How to avoid:**
1. Include documentation files in grep search scope
2. Update documentation immediately after code changes
3. Add prominent notes in README about breaking changes
4. Use consistent language across all docs (e.g., "environment variable renamed: CARL_DEBUG → OPENCARL_DEBUG")

**Warning signs:**
- README still says `CARL_DEBUG=true`
- TROUBLESHOOTING still mentions old env var
- Multiple docs use inconsistent naming

### Pitfall 5: Docker Image Naming Confusion

**What goes wrong:** Container names or image references use inconsistent naming, causing E2E tests to fail.

**Why it happens:** Image naming used in multiple files (shell scripts, test files, CI workflows) and often out of sync.

**How to avoid:**
1. Use variables for image and container names (IMAGE_NAME, CONTAINER_NAME)
2. Update in all files at once (shell scripts, test files, CI workflows)
3. Run full E2E test suite after changes: `npm run test:e2e:ci`
4. Verify Docker images can be built and containers started successfully

**Warning signs:**
- E2E tests fail with Docker image not found
- Container names conflict between files
- CI workflows fail with Docker errors

## Code Examples

Verified patterns from source code and documentation:

### Environment Variable Access Pattern

```typescript
// Source: src/opencarl/debug.ts:10
const DEBUG_ENABLED = process.env.OPENCARL_DEBUG === "true";

export function debugLog(
  category: string,
  message: string,
  data?: object
): void {
  if (!DEBUG_ENABLED) {
    return;
  }
  // ... logging logic
}
```

**Usage pattern:**
1. Define constant at module level (cached at load time)
2. String compare to "true" for boolean flags
3. Use early return for zero-overhead when disabled

### Docker Image Reference Pattern

```bash
# Shell script (tests/e2e/run-e2e-tests.sh:23)
IMAGE_NAME="opencode-carl:e2e"

# CI workflow (.github/workflows/e2e-tests.yml:52)
docker build -f tests/e2e/Dockerfile -t "$IMAGE_NAME" .

# Test files (tests/javascript/e2e/*.test.ts)
const IMAGE_NAME = 'opencode-carl:e2e';
```

**Usage pattern:**
1. Define variable with descriptive name (IMAGE_NAME, CONTAINER_NAME)
2. Use string interpolation "$IMAGE_NAME" for Docker commands
3. Reference in build, run, and cleanup steps

### Documentation Reference Pattern

```markdown
<!-- README.md:318 -->
Enable detailed logging to see rule matching decisions:

```bash
CARL_DEBUG=true
```

This outputs rule loading, matching, and injection details to help diagnose issues.
```

**Usage pattern:**
1. Code block with `VAR_NAME=true` syntax
2. Brief description of functionality
3. Full troubleshooting guide reference

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `process.env.CARL_DEBUG === "true"` | `process.env.OPENCARL_DEBUG === "true"` | Immediate (2026-03-12) | Breaking change, requires user env var update |
| Docker image `opencode-carl:e2e` | Docker image `opencode-opencarl:e2e` | Immediate (2026-03-12) | Breaking change, requires CI/test config update |
| Environment variable comments only | Inline comments + documentation | Immediate (2026-03-12) | Better developer experience |
| Manual verification | Comprehensive grep + test suite | Immediate (2026-03-12) | Higher confidence in complete coverage |

**Deprecated/outdated:**
- `CARL_DEBUG` environment variable name (replaced with `OPENCARL_DEBUG`)
- `opencode-carl:e2e` Docker image name (replaced with `opencode-opencarl:e2e`)
- `carl-e2e` container name (replaced with `opencarl-e2e` for consistency)

## Open Questions

1. **Should we add runtime deprecation warning?**
   - **What we know:** Context says "Print deprecation message to stderr when old name is used"
   - **What's unclear:** Implementation approach (check in debug.ts? global check? lazy check?)
   - **Recommendation:** Add check in debug.ts entry point, warn once on first access

2. **What semver bump level?**
   - **What we know:** Breaking change (env var rename)
   - **What's unclear:** MAJOR vs MINOR threshold
   - **Recommendation:** MAJOR (env var changes are backward-incompatible)

3. **Test suite validation thresholds?**
   - **What we know:** "Zero test failures: All existing tests must pass"
   - **What's unclear:** How strict is "zero" vs "acceptable"
   - **Recommendation:** Zero failures. All tests must pass before merge.

4. **Regex pattern specificity?**
   - **What we know:** "Use regex patterns to avoid false positives"
   - **What's unclear:** Exact pattern (e.g., `\bCARL_DEBUG\b` vs `CARL_DEBUG=`)
   - **Recommendation:** `\bCARL_DEBUG\b` for word boundary matching

## Validation Architecture

> Skip this section entirely if workflow.nyquist_validation is false in .planning/config.json

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest (latest) |
| Config file | jest.config.js (exists in project root) |
| Quick run command | `npm run test:coverage` |
| Full suite command | `npm run test:coverage` |
| Estimated runtime | ~30-60 seconds |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ENV-01 | Debug logging uses OPENCARL_DEBUG (not CARL_DEBUG) | unit | `npm test` | ✅ yes |
| ENV-01 | `OPENCARL_DEBUG=true` enables debug mode | integration | `OPENCARL_DEBUG=true npm test` | ✅ yes |
| ENV-02 | CI workflows updated (no CARL_DEBUG references) | smoke | `rg -i "CARL_DEBUG" .github/workflows/` | ✅ yes |
| ENV-03 | Test scripts use OPENCARL_DEBUG | smoke | `rg -i "CARL_DEBUG" tests/e2e/run-e2e-tests.sh` | ✅ yes |
| ENV-04 | Documentation uses OPENCARL_DEBUG | manual | Manual review of README.md, TROUBLESHOOTING.md | ✅ yes |

### Nyquist Sampling Rate

- **Minimum sample interval:** After each batch of changes → run: `npm run test:coverage`
- **Full suite trigger:** Before merging final task of any plan wave
- **Phase-complete gate:** Full suite green before `/gsd-verify-work` runs
- **Estimated feedback latency per task:** ~30-60 seconds

### Wave 0 Gaps (must be created before implementation)

- None — existing test infrastructure covers all phase requirements

## Sources

### Primary (HIGH confidence)

- Node.js v25.8.1 documentation — process.env API, environment variable access patterns
- Source code: src/opencarl/debug.ts — Current OPENCARL_DEBUG implementation pattern
- Source code: tests/e2e/run-e2e-tests.sh — Docker image naming conventions
- Source code: .github/workflows/e2e-tests.yml — CI workflow patterns

### Secondary (MEDIUM confidence)

- Phase 15-CONTEXT.md — User decisions and implementation requirements
- GitHub repository search results — All file locations with CARL_DEBUG references

### Tertiary (LOW confidence)

- Grep search results — Discovery of affected files (low confidence as historical data)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Node.js and Docker are mature, well-documented technologies
- Architecture: HIGH - Patterns are standard and well-established
- Pitfalls: MEDIUM - Some edge cases (false positives, Docker naming) verified but may have additional cases

**Research date:** 2026-03-12
**Valid until:** 2026-04-11 (30 days for stable env var patterns)
