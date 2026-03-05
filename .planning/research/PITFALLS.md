# Domain Pitfalls

**Domain:** CARL → OpenCARL Rebranding Migration
**Researched:** 2026-03-05

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Missed Environment Variable References
**What goes wrong:** `CARL_DEBUG` environment variable is referenced in multiple locations (debug code, tests, documentation, CI configs). Missing even one reference causes:
- Debug mode not working for users
- Tests failing in CI
- Documentation being misleading
- Inconsistent behavior across environments

**Why it happens:** Environment variables are accessed via `process.env.CARL_DEBUG` in code, referenced in shell commands in CI scripts, and documented in README/TROUBLESHOOTING files. Easy to miss when doing global find-replace.

**Consequences:**
- Debug logging silently fails (no clear error)
- Test coverage drops unexpectedly
- Users frustrated by non-functional debug mode
- CI/CD pipeline failures

**Prevention:**
1. Create comprehensive grep pattern: `rg -i "CARL_DEBUG"` before starting
2. Search in all file types: `--glob '!node_modules/*' --glob '!.git/*'`
3. Use literal string search (not regex) to catch case variations
4. After replacement, run tests with `OPENCARL_DEBUG=true` to verify
5. Check CI logs for environment variable references

**Detection:**
- Debug logging not appearing when `OPENCARL_DEBUG=true` is set
- Tests that previously passed now fail mysteriously
- Search results still showing `CARL_DEBUG` after migration

### Pitfall 2: Directory Renaming Breaks Import Paths
**What goes wrong:** Renaming `src/carl/` to `src/opencarl/` and `.carl/` to `.opencarl/` without updating all import statements causes TypeScript compilation errors and runtime failures.

**Why it happens:**
- Import statements use relative paths: `from "../carl/types"`
- Directory references in loader code: checking for `.carl/` existence
- Path resolution in tests and fixtures
- Template files that reference directory structure

**Consequences:**
- TypeScript compilation errors (`Module not found`)
- Runtime failures (cannot resolve imports)
- Tests failing with file not found errors
- Plugin not loading at all

**Prevention:**
1. Use TypeScript-aware find-replace tool for imports
2. Before renaming, identify all import paths: `rg "from.*['\"].*carl['\"]"`
3. Update import statements BEFORE renaming directories
4. Verify compilation after each batch of changes
5. Run full test suite after directory rename

**Detection:**
- `tsc` compilation errors
- Jest errors about missing modules
- Tests failing with "Cannot find module"
- Plugin not loading in OpenCode

### Pitfall 3: Docker Image Name References in CI/CD
**What goes wrong:** Docker image name `opencode-carl:e2e` is referenced in `.github/workflows/e2e-tests.yml`, test scripts, and Dockerfile. Missing these causes E2E test infrastructure to fail.

**Why it happens:**
- Docker image names are strings that look different from code references
- CI workflow files are often overlooked in codebase-wide searches
- E2E test runner script (`.sh`) has hardcoded image name

**Consequences:**
- E2E tests fail to build Docker image
- CI/CD pipeline breaks completely
- No E2E feedback until deployment

**Prevention:**
1. Search for Docker-specific patterns: `rg "opencode-carl:e2e"` and `rg "docker build"`
2. Check all workflow files: `.github/workflows/*.yml`
3. Update Dockerfile and image references together
4. Run E2E tests locally after changes
5. Verify CI workflow syntax with `act` or similar tools

**Detection:**
- CI workflow fails at Docker build step
- E2E tests fail locally with Docker errors
- Image not found in registry

### Pitfall 4: Package Name Inconsistencies
**What goes wrong:** Multiple package names exist in codebase:
- `@krisgray/opencarl` (current package.json)
- `@krisgray/opencode-carl-plugin` (scripts and documentation)
- `@krisgray/carl` (historical references)

Inconsistencies break installation, publishing, and user onboarding.

**Why it happens:**
- Package name changed partway through development
- Dual-package strategy (carl-core + OpenCode plugin) created confusion
- Install script checks for specific package names
- Documentation references multiple package variants

**Consequences:**
- Users install wrong package
- Publishing fails (package already exists with different name)
- Install script detection logic breaks
- npm install/deprecate commands target wrong package

**Prevention:**
1. Establish single source of truth: `package.json` name field
2. Search all package name references: `rg "@krisgray.*carl"`
3. Update install script logic to use single canonical name
4. Update all documentation consistently
5. Test install script with actual npm commands

**Detection:**
- Install script fails to detect package
- npm publish reports "package already exists"
- Users report installation failures
- grep shows multiple package name variants

## Moderate Pitfalls

### Pitfall 5: Test Fixture Path Hardcoding
**What goes wrong:** Test fixtures have hardcoded paths to `.carl/` directories. When directory is renamed to `.opencarl/`, tests fail with file not found errors.

**Prevention:**
1. Search all fixture files for `.carl/`: `rg "\.carl/" tests/`
2. Update fixtures to use new `.opencarl/` paths
3. Check snapshot files for path references
4. Run full test suite after fixture updates
5. Use path constants instead of hardcoded strings where possible

### Pitfall 6: Command Trigger References
**What goes wrong:** `*carl` and `/carl` command triggers are referenced in:
- Test fixtures (star-command tests)
- Help text and documentation
- Mock OpenCode CLI scripts
- User guides and tutorials

Missing these causes command detection to fail.

**Prevention:**
1. Search for command patterns: `rg "\*carl"` and `rg "/carl"`
2. Update all test expectations for command tokens
3. Update help text and documentation
4. Update mock CLI scripts
5. Test star-command and slash-command detection manually

### Pitfall 7: TypeScript Type Names
**What goes wrong:** TypeScript types like `CarlRuleDomainPayload`, `CarlMatchDomainConfig`, `CarlSessionSignals` are exported and used throughout codebase. Missing these causes type errors and compilation failures.

**Prevention:**
1. Search for type definitions: `rg "type.*Carl" --glob "*.ts"`
2. Update all type names systematically
3. Use TypeScript language server or IDE to find references
4. Verify compilation after type renames
5. Check for exported types in `types.ts`

### Pitfall 8: Documentation File Names
**What goes wrong:** Documentation files have CARL in their names (`CARL-DOCS.md`, `CARL-AGENTS.md`, `CARL-OVERVIEW.md`). These are also referenced in code and other documentation.

**Prevention:**
1. Rename files first: `CARL-DOCS.md` → `OPENCARL-DOCS.md`
2. Update all references to renamed files
3. Check for references in code (e.g., help text, setup scripts)
4. Update internal links between documentation files
5. Verify all documentation builds correctly

### Pitfall 9: Mock Expectations in Tests
**What goes wrong:** Test mocks have hardcoded expectations for "CARL" strings, domain names, and error messages. After renaming, these expectations fail.

**Prevention:**
1. Search for "CARL" in test files: `rg "CARL" tests/ --type ts`
2. Update mock expectations to use new names
3. Check snapshot files for string references
4. Use constants for domain names where possible
5. Run full test suite and update snapshots

### Pitfall 10: Binary Script Name References
**What goes wrong:** `bin/opencarl` is the entry point, but references in code, documentation, and user guides may still use `carl` or `opencode-carl-plugin`.

**Prevention:**
1. Check package.json `bin` field
2. Search for binary references: `rg "opencarl" --glob "*.js"`
3. Update install script to use correct binary name
4. Update all user documentation
5. Test binary execution locally

## Minor Pitfalls

### Pitfall 11: Comments and Debug Messages
**What goes wrong:** Code comments, debug logs, and console messages contain "CARL" references that don't break functionality but create confusion.

**Prevention:**
1. Search comments: `rg "//.*CARL"` and `rg "#.*CARL"`
2. Update debug log prefixes: `[carl]` → `[opencarl]`
3. Update error messages and console output
4. Review inline code comments for accuracy
5. Run application and check all log output

### Pitfall 12: Domain Names in Manifest Files
**What goes wrong:** Default domain names in manifest templates (e.g., `CARL` domain) may need updates for consistency.

**Prevention:**
1. Check manifest template files: `resources/.carl-template/manifest`
2. Update default domain names if they reference CARL
3. Ensure domain names align with new branding
4. Test manifest parsing with updated templates
5. Document any domain name changes for users

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Directory renaming | Import path breakage | Update imports BEFORE renaming directories |
| Test updates | Mock expectation failures | Run test suite after each batch of updates |
| Documentation | Internal link breakage | Update file names first, then references |
| CI/CD | Docker image name mismatches | Test E2E workflow locally |
| Package publishing | Wrong package name targeted | Verify package name in all publish scripts |
| User migration | Environment variable confusion | Provide clear migration guide |

## Migration Checklist

### Before Starting
- [ ] Run `rg -i "carl" --glob '!node_modules/*' --glob '!.git/*' -c` to count references
- [ ] Create backup branch: `git checkout -b pre-rebrand-backup`
- [ ] Document current package name(s) for rollback reference

### Find-and-Replace Strategy
- [ ] Replace in this order to minimize breakage:
  1. TypeScript types and interfaces
  2. Import statements
  3. Environment variables
  4. Test fixtures and mocks
  5. Documentation strings and comments
  6. Directory names (LAST)
  7. File names (LAST)

### Verification After Each Batch
- [ ] Run TypeScript compilation: `npm run build`
- [ ] Run unit tests: `npm run test:unit`
- [ ] Run integration tests: `npm run test:integration`
- [ ] Check test coverage hasn't dropped significantly

### Final Verification
- [ ] Run full test suite: `npm run test:coverage`
- [ ] Run E2E tests locally: `npm run test:e2e:local`
- [ ] Verify debug mode works: `OPENCARL_DEBUG=true npm test`
- [ ] Check all documentation builds correctly
- [ ] Verify CI workflow syntax
- [ ] Test install script: `node bin/install.js`
- [ ] Verify no remaining CARL references: `rg -i "carl" --glob '!node_modules/*' --glob '!.git/*'`

## Sources

- npm documentation on deprecation: https://docs.npmjs.com/cli/commands/npm-deprecate
- npm unpublish policy: https://docs.npmjs.com/policies/unpublish
- Stack Overflow: Renaming a published NPM module (HIGH confidence)
- GitHub gist: npm package renaming patterns (MEDIUM confidence)
- Codebase analysis: 1,870 CARL references across 86 files (HIGH confidence)
