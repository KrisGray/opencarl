# Phase 1: Plugin Foundation & Rule Discovery - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

OpenCode can load CARL locally and resolve rules from global/project scopes with validation.

</domain>

<decisions>
## Implementation Decisions

### Rule source precedence
- `.carl/` wins over `.opencode/carl/` when both exist; `.opencode/carl/` is fallback only.
- Project scope overrides global when both define the same domain.
- If a project domain is inactive, global domain still applies.
- If project `.carl/` manifest is missing/invalid, fall back to global rules.

### Manifest strictness
- Unknown manifest keys: warn and ignore.
- Malformed manifest lines: skip line with warning.
- Active domain with missing file: warn and skip that domain.
- Invalid rule keys inside a domain: skip invalid rules with warning; keep valid ones.

### Domain file inclusion
- Domain files are no-extension filenames (e.g., `global`, `context`, `commands`).
- Only domains referenced in the manifest are loaded; extra files are ignored.
- Domain filenames must be lowercase; warn on other casing.
- Ignore comments and blank lines in domain files.

### Plugin placement guidance
- Recommend global plugin install by default; allow project installs as needed.
- If both global and project plugin files exist, allow but warn about duplicates.
- Setup flow should prompt for install scope, defaulting to global.
- Preferred plugin filename: `carl.ts`.

### Claude's Discretion
- Exact warning message wording and logging format.
- How warnings are throttled to avoid noise.

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-plugin-foundation-rule-discovery*
*Context gathered: 2026-02-25*
