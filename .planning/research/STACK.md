# Technology Stack

**Project:** OpenCARL Rebranding (v1.3)
**Researched:** 2026-03-05
**Type:** REFACTORING MILESTONE

## Recommended Stack Changes

This milestone is a **refactoring effort** focused on name changes only. No new libraries, frameworks, or build tools are required.

### Package Naming (Already Complete)

| Technology | Current | Target | Status | Why |
|------------|---------|--------|--------|-----|
| Package name | `@krisgray/opencarl` | `@krisgray/opencarl` | ✓ Complete | NPM naming guidelines require unique, descriptive, lowercase names. Scoped packages (@scope/name) are the recommended pattern. |
| Binary name | `opencarl` | `opencarl` | ✓ Complete | Already updated in package.json bin field. |

**NPM Naming Guidelines Verified** (HIGH confidence):
- No uppercase letters ✓
- Unique and descriptive ✓
- Scoped naming for namespace organization ✓
- Source: https://docs.npmjs.com/package-name-guidelines/

**"Open" Prefix Convention** (MEDIUM confidence):
- No official "Open" prefix convention found in npm documentation
- Common pattern in open-source projects (OpenSSL, OpenSSH, OpenAI, OpenCode)
- "OpenCARL" follows established naming patterns
- Source: websearch on "Open prefix naming" + npm guidelines

### Command Triggers (Needs Migration)

| Component | Current | Target | File | Complexity |
|-----------|---------|--------|------|------------|
| Star command pattern | `\*([a-zA-Z]+)` | No change | `src/carl/command-parity.ts` | Low - pattern unchanged |
| Command handler check | `commandName === "carl"` | `commandName === "opencarl"` | `src/integration/plugin-hooks.ts` | Low - string comparison |
| Star command token | `*carl` → `*opencarl` | `*opencarl` | `src/carl/command-parity.ts` | Low - token name change |

**OpenCode Plugin Registration** (HIGH confidence):
- Plugins are TypeScript/JavaScript modules exporting hooks
- No special plugin name registration required
- Plugin name in package.json does not affect runtime behavior
- Source: https://opencode.ai/docs/plugins/

### Environment Variables (Needs Migration)

| Variable | Current | Target | Pattern | Status |
|----------|---------|--------|---------|--------|
| Debug flag | `CARL_DEBUG` | `OPENCARL_DEBUG` | SCREAMING_SNAKE_CASE | Needs update |
| Usage | `process.env.CARL_DEBUG === "true"` | `process.env.OPENCARL_DEBUG === "true"` | Module load caching | Good pattern |

**Environment Variable Best Practices** (MEDIUM confidence):
- Use SCREAMING_SNAKE_CASE (all caps, underscores)
- Prefix with app name to avoid collisions (OPENCARL_)
- Cache at module load for zero-overhead when disabled
- Source: Standard Unix env var conventions

### Configuration Directory (Needs Migration)

| Location | Current | Target | Backwards Compat |
|----------|---------|--------|------------------|
| Global rules | `~/.carl/` | `~/.opencarl/` | Optional support for `.carl/` |
| Project rules | `.carl/` | `.opencarl/` | Optional support for `.carl/` |
| Template dir | `.carl-template` | `.opencarl-template` | Keep both during migration |

**Directory Naming** (MEDIUM confidence):
- Dot-prefixed directories for config (`.opencarl/`)
- OpenCode uses `.opencode/` pattern
- Backwards compatibility recommended for user migration
- Source: https://opencode.ai/docs/config/

### Source Code Structure (Needs Migration)

| Path | Current | Target | Impact |
|------|---------|--------|--------|
| Source directory | `src/carl/` | `src/opencarl/` | All imports, file paths |
| Module exports | `createCarlPluginHooks` | `createOpenCarlPluginHooks` | Function names |
| Type names | `CarlRuleDomainPayload` | `OpenCarlRuleDomainPayload` | Type definitions |
| Internal references | Multiple | Multiple | Throughout codebase |

## Migration Checklist

### Required Changes

- [ ] **package.json**:
  - [ ] Keywords: Remove "carl", add "opencarl" (line 32)
  - [ ] Files array: Update `.carl-template` → `.opencarl-template` (line 14)
  - [ ] Description: Already mentions "OpenCARL" ✓

- [ ] **Environment Variable**:
  - [ ] `src/carl/debug.ts`: `CARL_DEBUG` → `OPENCARL_DEBUG` (line 10)
  - [ ] `src/carl/debug.ts`: Update log prefix `[carl:debug]` → `[opencarl:debug]` (line 38)

- [ ] **Command Handling**:
  - [ ] `src/integration/plugin-hooks.ts`: `commandName === "carl"` → `"opencarl"` (line 215)
  - [ ] `src/integration/plugin-hooks.ts`: Update console.log messages `[carl]` → `[opencarl]` (lines 228, 229, 310, 376)
  - [ ] `src/carl/command-parity.ts`: Token check `token === "CARL"` → `"OPENCARL"` (line 172)
  - [ ] `src/carl/command-parity.ts`: Docs path `CARL-DOCS.md` → `OPENCARL-DOCS.md` (line 181)

- [ ] **Directory Structure**:
  - [ ] Rename `src/carl/` → `src/opencarl/`
  - [ ] Update all import paths
  - [ ] Update function/type names (Carl → OpenCarl)

- [ ] **Tests and Fixtures**:
  - [ ] Update test directory names
  - [ ] Update fixture references
  - [ ] Update test assertions

### Optional Backwards Compatibility

- [ ] Support reading from `~/.carl/` if `~/.opencarl/` not found
- [ ] Support `.carl/` in project if `.opencarl/` not found
- [ ] Add deprecation warning when using old paths
- [ ] Document migration path in CARL-DOCS.md → OPENCARL-DOCS.md

## No Changes Required

### Core Technology Stack (Preserve Exactly)

| Component | Technology | Version | Why Keep |
|-----------|-----------|---------|----------|
| Runtime | Node.js | >=16.7.0 | Engine requirement |
| Language | TypeScript | 5.9.3 | Plugin types compatibility |
| Plugin API | @opencode-ai/plugin | ^1.2.0 | OpenCode integration |
| Testing | Jest | 30.2.0 | Existing test suite |
| Build | tsc | 5.9.3 | TypeScript compiler |
| CI/CD | GitHub Actions | - | Existing pipeline |

### Architecture Patterns (Preserve Exactly)

- Zero-overhead debug logging (cached at module load)
- Rule injection pipeline
- Star-command handling
- Context bracket computation
- Duplicate plugin detection
- Session overrides
- Devmode logging

## Installation

No installation changes required. Build and test scripts remain identical.

```bash
# Build
npm run build

# Test
npm run test

# Publish (after rebrand)
npm run publish
```

## Sources

| Topic | Source | Confidence |
|-------|--------|------------|
| NPM package naming | https://docs.npmjs.com/package-name-guidelines/ | HIGH |
| OpenCode plugin registration | https://opencode.ai/docs/plugins/ | HIGH |
| Environment variable conventions | websearch + Unix standards | MEDIUM |
| "Open" prefix patterns | websearch on open source naming | MEDIUM |
| Directory naming | https://opencode.ai/docs/config/ | HIGH |

## Migration Impact Assessment

| Component | Lines to Change | Risk Level | Notes |
|-----------|-----------------|------------|-------|
| package.json metadata | ~2 | Low | Keywords, template path |
| Environment variables | ~2 | Low | Only one var used |
| Command handling | ~5 | Low | String comparisons, logs |
| Directory structure | All imports | Medium | Path updates across codebase |
| Function/type names | ~50+ | Medium | Carl* → OpenCarl* naming |
| Tests/fixtures | ~100+ | Low | Mostly path renames |
| Documentation | Multiple | Low | String replacements |

**Total estimated changes:** ~150-200 lines across ~50 files
**Recommended approach:** Automated find-replace + manual verification
