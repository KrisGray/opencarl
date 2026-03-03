# Phase 4: Setup Flow & Templates - Context

**Gathered:** 2026-02-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Running setup copies the plugin and seeds `.carl/` templates when missing. Duplicate plugin loads are detected and the user sees a single warning per session. CARL command/skill documentation is accessible from OpenCode workflows.

</domain>

<decisions>
## Implementation Decisions

### Setup Invocation
- User is prompted to run setup at plugin load if `.carl/` is missing (not manual CLI command)
- Verbose progress feedback: show each step with checkmarks ("Copying plugin... ✓" "Seeding templates... ✓")
- Re-running setup is idempotent: skip existing files, only fill in what's missing
- On partial failure: continue what you can, report all failures at end

### Template Seeding
- Starter kit templates: GLOBAL + example domains (DEVELOPMENT, CONTENT) with placeholder rules
- If `.carl/` already exists: preserve everything, never modify user content
- Location preference: project `.carl/` first, fallback to global `~/.carl/` if project not writable
- Post-seed messaging: one-time user preference prompt (project/global) with smart defaults and cross-platform fallbacks; CARL-style explicitness meets VS Code "set once, works everywhere" UX

### Documentation Access
- Access via slash/star command (`/carl docs` or `*carl docs`)
- Layered detail: start with quick reference, option to expand into full guide
- Documentation bundled with plugin (matches installed version) + link to online docs for latest
- No update checking — user manages their own plugin updates

### Duplicate Detection UX
- Duplicate = same plugin loaded from different paths (e.g., project + global)
- Warning includes actionable guidance: show both paths + suggest action (e.g., "Remove one from opencode.json")
- Session tracking via session file in `.carl/sessions/`
- On duplicate: warn once per session, continue normally (first load wins)

### OpenCode's Discretion
- Exact wording of progress messages
- Starter kit rule content/wording
- Quick reference format and structure
- Session file naming convention

</decisions>

<specifics>
## Specific Ideas

- "CARL-style explicitness meets VS Code 'set once, works everywhere' UX" — user preference stored once, works everywhere
- Warn-and-continue approach keeps CARL functional even with config issues

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-setup-flow-templates*
*Context gathered: 2026-02-27*
