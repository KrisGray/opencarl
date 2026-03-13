# Phase 16: Documentation Rebranding - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Rename documentation files and update all OpenCARL branding references, including examples. This phase only updates documentation content and filenames, not product behavior.

</domain>

<decisions>
## Implementation Decisions

### Branding terms and casing
- Use "OpenCARL" in prose.
- Use `*opencarl` and `/opencarl` in all command examples.
- Use `.opencarl/` and `.opencarl-template/` in directory/path examples.
- Use `OPENCARL_DEBUG` in all env var examples.

### Legacy mention policy
- Remove or replace all CARL references; no "formerly CARL" notes anywhere.
- Do not include legacy pointers or migration notes in docs.

### Example conventions
- Always use updated commands, paths, and env vars in examples.
- Use the scoped package name `@krisgray/opencarl` wherever a package name appears.

### Change scope in docs
- Minimal rename pass only: update branding terms, paths, examples, headings, code blocks, and internal links that include old names.
- No broader copy edits beyond those replacements.

### OpenCode's Discretion
- None.

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

*Phase: 16-documentation-rebranding*
*Context gathered: 2026-03-13*
