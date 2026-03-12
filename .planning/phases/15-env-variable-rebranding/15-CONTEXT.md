# Phase 15: Environment Variable Rebranding - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Update environment variable from CARL_DEBUG to OPENCARL_DEBUG across all contexts (source code, CI configuration, test scripts, documentation). This is a cross-cutting rename affecting multiple file types and contexts. No new features, no deprecation period, just immediate rename.

</domain>

<decisions>
## Implementation Decisions

### Coverage scope
- All file types updated: `.ts`, `.js`, `.json`, `.yaml`, `.yml`, `.sh`, `.md`
- All contexts covered: code files + CI configuration files + test scripts + documentation files
- Include documentation and code comments (rename "CARL_DEBUG" strings in comments, not just env var access)
- No exclusions — update everything (ignore generated dist/ and node_modules/ as expected)

### Search strategy
- Use all approaches: grep/rg for automation, IDE "Find in Files" for review, script-based search for verification
- All file patterns: target source code + config + documentation files
- Recursive search: `grep -r` across entire codebase (not single-level only)
- False-positive filtering: Use regex patterns to avoid false matches (e.g., variable names like "DEBUG_MODE", file paths, or non-env-var contexts)

### Verification approach
- Both code changes AND documentation updates must be verified (most comprehensive)
- All verification methods: manual review + automated search check + test suite validation
- Treat old name as failure: If `CARL_DEBUG` string exists after changes, block merge until fixed
- Zero test failures: All existing tests must pass after the rename (catches regressions)

### Breaking change handling
- Remove immediately: No deprecation period, no dual support
- Console warning: Print deprecation message to stderr when old name is used: "CARL_DEBUG is deprecated, please use OPENCARL_DEBUG"
- No migration: Users must manually update their shell profiles (.bashrc, .zshrc) and CI configs
- Immediate versioning: Semver bump (MAJOR or MINOR required for breaking change)

### OpenCode's Discretion
- Exact regex patterns for false-positive filtering
- Console warning message wording
- Test suite validation thresholds
- Build/commit message style for the rename commits

</decisions>

<specifics>
## Specific Ideas

- Update README.md prominently: "Environment variable renamed: CARL_DEBUG → OPENCARL_DEBUG (immediate, no deprecation)"
- Add inline comments in source files explaining the rename for future maintainers
- Run full test suite after each major change batch to catch regressions early
- Use grep with verbose flags to see line numbers for manual verification

</specifics>

<deferred>
## Deferred Ideas

- Migration script to auto-update user configurations — belongs in a separate "developer tools" phase or post-release support
- Deprecation period with dual support — explicitly out of scope for v1.3 branding
- Legacy environment variable support (read both, prioritize OPENCARL_DEBUG) — no longer needed per immediate rename decision

</deferred>

---

*Phase: 15-env-variable-rebranding*
*Context gathered: 2026-03-11*
