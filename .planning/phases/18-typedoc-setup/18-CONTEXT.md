# Phase 18: TypeDoc Setup - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Configure TypeDoc for local HTML documentation generation. Developers run `npm run docs` to generate HTML API docs in the `docs/` directory. Documentation includes clickable source code links to GitHub, README as landing page, and all exported TypeScript types/functions.

This phase is configuration only — deployment automation is Phase 19.

</domain>

<decisions>
## Implementation Decisions

### Navigation Structure
- Category-based grouping by functionality (not by code structure)
- Moderate granularity: 5-7 top-level categories
- Categories should reflect what API consumers care about (e.g., "Configuration", "Rules", "Signals") rather than file organization

### Source Links
- Link to specific commit hash (exact code version at generation time)
- Include line numbers in source links for precise navigation
- Point to `origin` remote (KrisGray/opencarl), not upstream

### README Integration
- README.md content appears as the documentation homepage
- Use full README as-is from repo root
- API documentation accessible from sidebar navigation

### Theme/Branding
- Use default TypeDoc theme (no custom styling)
- Dark/light mode: auto-detect system preference with toggle

### OpenCode's Discretion
- Exact category names/groupings (user said "by functionality" with 5-7 categories — planner decides specific groupings)
- TypeDoc configuration file location (typedoc.json at root is standard)
- Any additional TypeDoc options not discussed (visibility filters, search config, etc.)

</decisions>

<specifics>
## Specific Ideas

- Categories should feel intuitive for someone using the API, not someone maintaining the codebase
- Source links with line numbers help developers jump directly to relevant code

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 18-typedoc-setup*
*Context gathered: 2026-03-16*
