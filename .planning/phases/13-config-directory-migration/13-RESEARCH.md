# Phase 13: Configuration & Directory Migration - Research

**Researched:** 2026-03-10
**Domain:** File system migration, path references, configuration scaffolding
**Confidence:** HIGH

## Summary

This phase renames two key directories and updates all code references. The `.carl/` configuration directory (user's runtime config) becomes `.opencarl/`. The `.carl-template/` template directory (bundled with package) becomes `.opencarl-template/`. This is a straightforward find-and-replace operation with clear scope.

**Critical discovery:** Phase 12 already updated some code to use `.opencarl/` naming (e.g., `setup.ts` references `.opencarl-template`), but `paths.ts` still searches for `.carl/` directories, and the physical directories on disk still use old names. This creates an inconsistency that this phase will resolve.

**Primary recommendation:** Atomic rename of directories + coordinated path updates across 3 categories: source files, tests, and scripts.

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CONFIG-02 | `.carl/` configuration directory is renamed to `.opencarl/` | Disk rename + `paths.ts` update (lines 31, 51) |
| CONFIG-03 | `.carl-template/` directory is renamed to `.opencarl-template/` | Disk rename + `package.json` files array (line 14) |
| CONFIG-04 | All file path references in code are updated | Search found 651 `.carl` refs, 96 `.carl-template` refs |
| CONFIG-05 | Setup/initializer scaffolds `.opencarl/` directory | `setup.ts:191` already uses `.opencarl-template`, `paths.ts` needs update |

</phase_requirements>

## Standard Stack

### Core
| Item | Current | Target | Location |
|------|---------|--------|----------|
| Config directory | `.carl/` | `.opencarl/` | User's project/home |
| Template directory | `.carl-template/` | `.opencarl-template/` | Package root |
| Path resolution | `findProjectOpencarl` searches `.carl` | Search `.opencarl` | `src/integration/paths.ts:31,51` |

### Files Requiring Updates

**Source files (HIGH priority):**
| File | Line(s) | Change |
|------|---------|--------|
| `src/integration/paths.ts` | 31, 51 | `.carl` → `.opencarl` |
| `bin/install.js` | 252, 286 | `.carl` → `.opencarl`, `.carl-template` → `.opencarl-template` |

**Package configuration:**
| File | Line | Change |
|------|------|--------|
| `package.json` | 14 | `".carl-template"` → `".opencarl-template"` |

**Test files (MEDIUM priority - 651 matches):**
| File | Changes Needed |
|------|----------------|
| `tests/javascript/e2e/setup-flow.test.ts` | 30+ refs to `.carl/` |
| `tests/javascript/e2e/keyword-matching.test.ts` | 10+ refs to `.carl/manifest` |
| `tests/javascript/e2e/star-command.test.ts` | 15+ refs to `.carl/manifest` |
| `tests/javascript/integration/setup-domain-workflow.test.ts` | 5+ refs |
| `tests/javascript/integration/rule-injection-pipeline.test.ts` | 4+ refs |
| `tests/javascript/integration/file-operations.test.ts` | 6+ refs |
| `tests/javascript/unit/setup.test.ts` | Comment refs |
| `tests/javascript/unit/loader.test.ts` | 5+ refs |
| `tests/javascript/unit/validate.test.ts` | 5+ refs |

**Scripts (MEDIUM priority):**
| File | Changes Needed |
|------|----------------|
| `scripts/carl-discovery-smoke.ts` | 2 refs to `.carl` |
| `scripts/carl-injection-smoke.ts` | 6 refs to `.carl` |
| `scripts/carl-phase2-parity.ts` | 1 ref to `.carl` |
| `scripts/carl-command-parity-smoke.ts` | 1 ref to `.carl-template` |
| `scripts/verify-dist.ts` | 1 ref to `.carl-template` |

## Architecture Patterns

### Current State (Inconsistent)
```
Disk:                          Code:
.carl-template/         ←──    setup.ts references ".opencarl-template"
.carl/ (user creates)   ←──    paths.ts searches ".carl"
```

### Target State (Consistent)
```
Disk:                          Code:
.opencarl-template/     ←──    setup.ts references ".opencarl-template" ✓
.opencarl/ (user)       ←──    paths.ts searches ".opencarl"
```

### Path Resolution Flow
```
1. findProjectOpencarl(cwd)
   → Walks up from cwd looking for .opencarl/manifest
   → Returns OpencarlSourcePath or null

2. findGlobalOpencarl(homeDir)
   → Checks ~/.opencarl/manifest
   → Returns OpencarlSourcePath or null

3. runSetup(cwd, homeDir, templateDir)
   → Seeds .opencarl-template/ contents to target .opencarl/
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Directory rename | Custom migration | `git mv` | Preserves history |
| Path replacement | Manual find/replace | `rg` + `sed` or IDE | 747 total references |

## Common Pitfalls

### Pitfall 1: Test Fixtures vs Source Code
**What goes wrong:** Updating source code paths but forgetting test fixtures that simulate the directory structure.
**Why it happens:** Tests create temp dirs named `.carl/` to match production behavior.
**How to avoid:** Update both `projectOpencarlDir = path.join(tempDir, '.carl')` lines in tests AND the search paths in `paths.ts`.
**Warning signs:** Integration tests fail with "No .opencarl/ directory found".

### Pitfall 2: Mixed State During Migration
**What goes wrong:** Committing partial changes breaks the build - `paths.ts` looks for `.carl/` but `setup.ts` writes `.opencarl/`.
**Why it happens:** Large number of files to update (651+ refs).
**How to avoid:** Commit all path updates in a single atomic commit. Do NOT commit partial changes.
**Warning signs:** CI passes locally but fails in fresh checkout.

### Pitfall 3: E2E Docker Tests
**What goes wrong:** E2E tests still reference `.carl/` paths while source code uses `.opencarl/`.
**Why it happens:** E2E tests verify file system state via `dockerExec('cat .carl/manifest')`.
**How to avoid:** Update E2E test assertions alongside source changes.
**Warning signs:** `directoryExists('.carl')` assertions fail.

### Pitfall 4: bin/install.js Consistency
**What goes wrong:** `bin/install.js` scaffolds to `.carl/` while `paths.ts` searches for `.opencarl/`.
**Why it happens:** `bin/install.js` is independent of TypeScript source.
**How to avoid:** Update both `carlDir` assignment (line 252) AND `carlTemplateSrc` (line 286).
**Warning signs:** Fresh installs create `.carl/` but plugin can't find it.

## Code Examples

### paths.ts Update
```typescript
// Before (line 31):
const opencarlDir = path.join(searchPath, ".carl");

// After:
const opencarlDir = path.join(searchPath, ".opencarl");

// Before (line 51):
path.join(resolvedHome, ".carl"),

// After:
path.join(resolvedHome, ".opencarl"),
```

### bin/install.js Update
```javascript
// Before (lines 251-253):
const carlDir = isGlobal
  ? path.join(os.homedir(), '.carl')
  : path.join(process.cwd(), '.carl');

// After:
const opencarlDir = isGlobal
  ? path.join(os.homedir(), '.opencarl')
  : path.join(process.cwd(), '.opencarl');

// Before (line 286):
const carlTemplateSrc = path.join(src, '.carl-template');

// After:
const opencarlTemplateSrc = path.join(src, '.opencarl-template');
```

### package.json Update
```json
// Before (line 14):
"files": ["bin", "dist", "resources", ".carl-template"]

// After:
"files": ["bin", "dist", "resources", ".opencarl-template"]
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `.carl/` config dir | `.opencarl/` config dir | This phase | Branding consistency |
| `.carl-template/` | `.opencarl-template/` | This phase | Package clarity |

**Inconsistencies to resolve:**
- `setup.ts:191` already uses `.opencarl-template` (Phase 12 change)
- `paths.ts` still searches `.carl` (this phase)
- Disk directories still use old names (this phase)

## Open Questions

1. **Should we support backward compatibility?**
   - What we know: v2.0 has BACKCOMP-01 (support both directories during transition)
   - What's unclear: Should v1.3 include backward compat or clean break?
   - Recommendation: v1.3 is pure rebranding per REQUIREMENTS.md "Out of Scope". Clean break.

2. **Should we migrate existing user configs?**
   - What we know: Users may have existing `.carl/` directories
   - What's unclear: Whether to auto-migrate on first run
   - Recommendation: No auto-migration. Users manually rename. Document in changelog.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.2.0 |
| Config file | `jest.config.js` |
| Quick run command | `npm run test:unit` |
| Full suite command | `npm test` |
| Estimated runtime | ~15 seconds (unit), ~2 minutes (full) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CONFIG-02 | Directory renamed to `.opencarl/` | integration | `npm run test:integration` | ✅ yes |
| CONFIG-03 | Template dir renamed to `.opencarl-template/` | unit | `npm run test:unit -- --testPathPattern=setup` | ✅ yes |
| CONFIG-04 | All path refs updated | unit/integration | `npm test` | ✅ yes |
| CONFIG-05 | Setup scaffolds `.opencarl/` | e2e | `npm run test:e2e` | ✅ yes |

### Nyquist Sampling Rate
- **Minimum sample interval:** After each committed task → run: `npm run test:unit`
- **Full suite trigger:** Before marking phase complete
- **Phase-complete gate:** Full suite green (`npm test`)
- **Estimated feedback latency per task:** ~15 seconds

### Wave 0 Gaps
None — existing test infrastructure covers all phase requirements.

## Sources

### Primary (HIGH confidence)
- Codebase analysis via `grep` for `.carl` and `.carl-template` patterns
- File reads of `src/integration/paths.ts`, `src/opencarl/setup.ts`, `bin/install.js`
- REQUIREMENTS.md for CONFIG-02 through CONFIG-05 specifications

### Secondary (MEDIUM confidence)
- `.planning/ROADMAP.md` for phase scope confirmation
- `.planning/phases/12-source-code-rebranding/12-13-SUMMARY.md` for Phase 12 context

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - straightforward directory and path changes
- Architecture: HIGH - clear file structure, well-defined update points
- Pitfalls: HIGH - common migration issues, easily avoided with atomic commits

**Research date:** 2026-03-10
**Valid until:** 30 days (stable file structure)
