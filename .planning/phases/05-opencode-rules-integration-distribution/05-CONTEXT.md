# Phase 5: OpenCode Rules Integration & Distribution - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Optional rules integration (writing CARL guidance to OpenCode config files) and npm-based distribution so users can load CARL from opencode.json. Integration is opt-in, not automatic. Distribution enables loading from npm registry.

</domain>

<decisions>
## Implementation Decisions

### Integration Content
- Write full CARL documentation to AGENTS.md (parity with existing Claude Code CARL integration)
- Do NOT modify opencode.json instructions field
- Research required: Examine existing Claude Code CARL integration approach and match it for OpenCode
- Include same sections/structure as Claude Code setup

### Integration Trigger
- Add `--integrate` flag to setup command (e.g., `setup --integrate`)
- User must explicitly request integration (opt-in, not automatic)
- If AGENTS.md exists, append CARL section to end (preserve existing content)
- Provide `--remove` flag to remove CARL integration from AGENTS.md (undo mechanism)
- Use HTML comment markers to identify CARL section:
  - Start marker: `<!-- CARL-START -->`
  - End marker: `<!-- CARL-END -->`
  - These markers enable reliable section identification and removal

### NPM Package Structure
- Package name: `@krisgray/opencode-carl-plugin` (personal scope)
- Include pre-built JavaScript in dist/ (users load dist/plugin.js directly)
- Research required: Determine what files are standard to include in npm package
  - Likely: dist/, .carl-template/, docs/, README, LICENSE, CHANGELOG
  - Research should examine common OpenCode plugin package structures

### Update Flow
- Manual npm update only — no auto-checking from CARL
- Use semver versioning (major.minor.patch)
- Communicate breaking changes via CHANGELOG + semver major version bump
- Manual publish via `npm publish` (no CI/CD automation required)
- Users responsible for discovering and installing updates via standard npm workflow

### OpenCode's Discretion
- Exact format/structure of AGENTS.md CARL section (researcher to examine Claude Code setup)
- Which npm package files to include beyond core requirements
- README content and documentation structure for npm package

</decisions>

<specifics>
## Specific Ideas

- "I want parity with CARL that runs within claude code" — match existing Claude Code CARL integration approach
- Integration should be reversible — user can remove it if needed
- Keep opencode.json clean — don't modify it

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-opencode-rules-integration-distribution*
*Context gathered: 2026-03-03*
