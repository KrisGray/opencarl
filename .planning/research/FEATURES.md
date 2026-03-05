# Feature Research: OpenCARL vs CARL

**Domain:** OpenCode prompt-injection / rule-injection plugins
**Researched:** 2026-03-05
**Milestone:** v1.3 Branding & Context Migration (REFACTORING)
**Confidence:** HIGH

## Executive Summary

**OpenCARL has NO new features compared to CARL.** This is a branding and porting project, not a feature enhancement.

**What OpenCARL IS:**
- An adaptation/port of CARL (Context Augmentation & Reinforcement Layer) from Claude Code to OpenCode
- Maintains 100% functional parity with the original CARL plugin
- Simply targets a different AI platform (OpenCode instead of Claude Code)

**What the "Open" Means:**
- "Open" = "for OpenCode" (the target platform)
- NOT "Open Source" (CARL was already open source)
- NOT "new capabilities" (feature set is identical)

**Migration Scope (v1.3):**
- Rename all CARL references to OpenCARL throughout codebase
- Update command triggers, environment variables, configuration directories
- Preserve all existing functionality and user workflows

---

## Evidence from Codebase

### 1. Explicit Documentation Statements

**From README.md (line 36):**
> "OpenCARL is an **OpenCode adaptation** of CARL (Context Augmentation & Reinforcement Layer), originally created by Chris Kahler for Claude Code."

**From package.json (line 3):**
> "OpenCARL - Dynamic rule injection for OpenCode. Rules load when relevant, disappear when not. **Adapted from CARL** by Chris Kahler."

### 2. Code Investigation Results

**Search for "Open" prefixes in TypeScript source code:**
- Result: **Zero matches** (excluding file paths)
- No OpenCARL-specific classes, functions, or modules
- No conditional logic based on "Open" vs "CARL" branding

**Directory structure still uses CARL naming:**
- Source: `src/carl/` (not `src/opencarl/`)
- Commands: `/carl`, `*carl` (not `/opencarl`, `*opencarl`)
- Environment: `CARL_DEBUG` (not `OPENCARL_DEBUG`)
- Config: `.carl/` (not `.opencarl/`)

**Package metadata already rebranded:**
- Package name: `@krisgray/opencarl` ✓
- README title: "OpenCARL" ✓
- Documentation headers: "OpenCARL" ✓

**Conclusion:** Branding partially complete in package metadata, but not yet in source code.

### 3. Feature Set Analysis

**Original CARL features (for Claude Code):**
- Dynamic rule injection plugin
- Keyword matching triggers rule loading
- Star-commands (*carl, *carl docs, custom commands)
- Context-aware injection (fresh, moderate, depleted sessions)
- Global/project rule scoping
- AGENTS.md integration
- NPM distribution
- Debug logging (CARL_DEBUG)
- Troubleshooting documentation

**OpenCARL features (for OpenCode):**
- ✓ Dynamic rule injection plugin
- ✓ Keyword matching triggers rule loading
- ✓ Star-commands (*carl, *carl docs, custom commands)
- ✓ Context-aware injection (fresh, moderate, depleted sessions)
- ✓ Global/project rule scoping (.carl/ locations)
- ✓ opencode.json and AGENTS.md integration
- ✓ NPM distribution with dual-package strategy
- ✓ Debug logging (CARL_DEBUG → to be OPENCARL_DEBUG)
- ✓ Troubleshooting documentation

**Differences:** NONE (except platform-specific APIs, which is required for porting)

---

## What IS Changing (v1.3 Migration Scope)

### Rebranding Changes

| Item | Current (CARL) | Target (OpenCARL) | Status |
|------|----------------|-------------------|--------|
| Source directory | `src/carl/` | `src/opencarl/` | Pending |
| Config directory | `.carl/` | `.opencarl/` | Pending |
| Command trigger | `*carl` | `*opencarl` | Pending |
| Fallback command | `/carl` | `/opencarl` | Pending |
| Environment variable | `CARL_DEBUG` | `OPENCARL_DEBUG` | Pending |
| Package name | `@krisgray/carl` | `@krisgray/opencarl` | ✓ Done |
| Documentation | `CARL-DOCS.md` | `OPENCARL-DOCS.md` | Pending |
| README references | "CARL" | "OpenCARL" | Partial |

### Backwards Compatibility

From PROJECT.md constraints:
> "Preserving existing `.carl/` (to be renamed to `.opencarl/`) directory structure and manifest/domain file semantics."

**Implication:** The rebranding should maintain backwards compatibility where possible, particularly for existing user configurations.

---

## What is NOT Changing (Out of Scope)

From PROJECT.md "Out of Scope" section:

- ✓ **Core architecture** - Rule injection pipeline, plugin hooks remain identical
- ✓ **File structure** - `.carl/` → `.opencarl/` is just renaming (same internal structure)
- ✓ **Rule syntax** - Domain file format preserved exactly
- ✓ **Plugin types** - OpenCode plugin types unchanged
- ✓ **Test infrastructure** - Jest, Docker, CI/CD remain the same
- ✓ **Build system** - Tooling and build process unchanged

---

## True New Capabilities: **NONE**

### Clarification

**If CARL already did X and we're just rebranding, then X is NOT a new feature.**

All capabilities listed in the existing `.planning/research/FEATURES.md` (from v1.0) were already present in CARL. OpenCARL simply brings those same capabilities to the OpenCode platform.

### Feature Comparison Matrix

| Feature | CARL (Claude Code) | OpenCARL (OpenCode) | New? |
|---------|-------------------|---------------------|------|
| Dynamic rule injection | ✓ | ✓ | No |
| Keyword-based loading | ✓ | ✓ | No |
| Star-commands (*carl) | ✓ | ✓ | No |
| Context-aware injection | ✓ | ✓ | No |
| Global/project scoping | ✓ | ✓ | No |
| Integration with platform rules | AGENTS.md (Claude) | AGENTS.md + opencode.json | Platform-specific, not new |
| NPM distribution | ✓ | ✓ | No |
| Debug logging | ✓ | ✓ | No |
| Troubleshooting docs | ✓ | ✓ | No |

**Conclusion:** No truly new capabilities. All features are either identical to CARL or platform-specific adaptations required for the port.

---

## Existing Feature Set (From v1.0 Research)

For reference, here are the features that CARL had and OpenCARL preserves:

### Table Stakes (From v1.0 FEATURES.md)

| Feature | Complexity | Status in OpenCARL |
|---------|------------|---------------------|
| Local plugin install + load order | LOW | ✓ Implemented |
| Rule discovery at global + project scopes | MEDIUM | ✓ Implemented |
| Conditional rule matching (keywords/tools) | MEDIUM | ✓ Implemented |
| System prompt injection hook | HIGH | ✓ Implemented |
| Context capture from tools/messages | MEDIUM | ✓ Implemented |
| Compaction-safe state | MEDIUM | ✓ Implemented |
| Safety guardrails (do-not-read, allow/deny) | MEDIUM | ✓ Implemented |

### Differentiators (From v1.0 FEATURES.md)

| Feature | Complexity | Status in OpenCARL |
|---------|------------|---------------------|
| Domain manifest + star-commands | HIGH | ✓ Implemented |
| Context bracket heuristics | MEDIUM | ✓ Implemented |
| Rule provenance + debug tracing | MEDIUM | ✓ Implemented |
| Incremental state tracking | HIGH | ✓ Implemented |
| Rule linting + validation | MEDIUM | ✓ Implemented |
| Hybrid integration with AGENTS.md + instructions | MEDIUM | ✓ Implemented (with opencode.json) |

---

## Anti-Features (What OpenCARL Should NOT Add)

As this is a **refactoring milestone**, the following should be avoided:

| Anti-Feature | Why Avoid | Approach |
|-------------|-----------|----------|
| New rule injection logic | Not in scope | Preserve existing CARL logic |
| Different manifest syntax | Breaks existing workflows | Keep exact same format |
| New star-command syntax | Breaks existing workflows | Keep `*commandname` format |
| Platform-specific features (beyond necessary) | Defeats purpose of porting | Only adapt what's required for OpenCode API |
| Enhanced debugging (beyond rebranding) | Out of scope for v1.3 | Keep CARL_DEBUG → OPENCARL_DEBUG only |

---

## Open Questions (For v1.3 Planning)

1. **Backwards Compatibility:** Should OpenCARL support reading from both `.carl/` and `.opencarl/` directories during transition?

2. **Command Aliases:** Should `/carl` and `*carl` continue to work as deprecated aliases, or be removed completely?

3. **Environment Variable:** Should both `CARL_DEBUG` and `OPENCARL_DEBUG` be supported temporarily?

4. **Documentation Migration:** Should CARL-DOCS.md be renamed to OPENCARL-DOCS.md, or kept as-is with updated content?

**These questions are for the v1.3 roadmap planner to resolve.**

---

## Recommendations for v1.3 Roadmap

### Phase Structure

Given this is a **pure rebranding milestone**, the phase structure should be:

1. **Phase 1: Source Code Rebranding**
   - Rename `src/carl/` → `src/opencarl/`
   - Update all import statements
   - Update class/function names (if any use "CARL" prefix)

2. **Phase 2: Configuration Rebranding**
   - Rename `.carl-template/` → `.opencarl-template/`
   - Update setup scripts to use `.opencarl/`
   - Decide on backwards compatibility strategy

3. **Phase 3: Command Rebranding**
   - Update command handlers: `/carl` → `/opencarl`, `*carl` → `*opencarl`
   - Update help text and documentation
   - Update test fixtures

4. **Phase 4: Documentation Rebranding**
   - Rename `CARL-DOCS.md` → `OPENCARL-DOCS.md`
   - Update README.md and INSTALL.md
   - Update TROUBLESHOOTING.md

5. **Phase 5: Environment Variable Rebranding**
   - Update `CARL_DEBUG` → `OPENCARL_DEBUG`
   - Update all references in code and docs

6. **Phase 6: Package Metadata Finalization**
   - Verify package name is `@krisgray/opencarl`
   - Update npm scripts if needed
   - Update repository URLs

### Risk Assessment

**LOW RISK** - This is a text/string replacement exercise:
- No logic changes
- No architectural changes
- No new functionality to test
- Existing tests should pass after simple search-replace

**Caveat:** Need to ensure backwards compatibility decisions are documented clearly.

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| No new features | HIGH | Source code analysis shows 100% feature parity |
| Rebranding scope | HIGH | Explicitly stated in PROJECT.md as refactoring |
| Platform adaptation | HIGH | Documentation confirms OpenCode adaptation of CARL |
| Migration complexity | MEDIUM | Simple string replacement, but backwards compat decisions needed |
| Documentation accuracy | HIGH | README and package.json explicitly state relationship |

---

## Sources

### Primary Sources (HIGH Confidence)

1. **README.md** (lines 36-37) - Explicit statement that OpenCARL is an OpenCode adaptation of CARL
2. **package.json** (line 3) - Package description confirms adaptation from CARL
3. **PROJECT.md** (lines 1-20, 56-62) - Explicitly defines v1.3 as a "rebranding, not a rewrite" milestone
4. **Source code investigation** - grep search shows no "Open" prefixes in TypeScript code
5. **Directory structure** - Still uses `src/carl/`, `*.carl` naming

### Secondary Sources (MEDIUM Confidence)

6. **.planning/research/FEATURES.md** (v1.0) - Documents original CARL feature set
7. **TROUBLESHOOTING.md** - References CARL features without OpenCARL-specific additions
8. **CARL-DOCS.md** - Documentation covers CARL features, no new OpenCARL capabilities mentioned

### Verification Steps Taken

- ✓ Searched for "opencarl|OpenCARL|OPENCARL" in all TypeScript source files
- ✓ Verified package.json uses @krisgray/opencarl
- ✓ Verified README.md references OpenCARL adaptation
- ✓ Checked directory structure still uses CARL naming
- ✓ Read all documentation files for new feature mentions
- ✓ Reviewed PROJECT.md milestone scope definition

---

## Summary

**OpenCARL brings ZERO new features compared to CARL.**

This is a branding and porting project:
- CARL (for Claude Code) → OpenCARL (for OpenCode)
- Same feature set, different target platform
- v1.3 is a refactoring milestone: rename all CARL → OpenCARL references

**All capabilities listed in v1.0 research remain applicable to OpenCARL.** The only differences are platform-specific adaptations required to work with OpenCode's plugin API instead of Claude Code's API.

**For the v1.3 roadmap:** Focus on systematic string replacement and migration, NOT new feature development.

---

*Research for: v1.3 Branding & Context Migration*
*Researched: 2026-03-05*
*Confidence: HIGH*
