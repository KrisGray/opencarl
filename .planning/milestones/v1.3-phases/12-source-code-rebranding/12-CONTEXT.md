# Phase 12: Source Code Rebranding - Context

**Gathered:** 2026-03-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Update all TypeScript type names, function/variable names, and import statements from CARL to OpenCARL. This phase includes the `src/carl/` → `src/opencarl/` directory rename performed atomically with import updates. Other directory renames (.carl/, .carl-template/), command triggers, environment variables, and documentation remain in later phases (13-17).

</domain>

<decisions>
## Implementation Decisions

### Type naming convention
- Use `Opencarl` prefix (CamelCase, lowercase "carl")
- Compound names: `CarlRuleDomainPayload` → `OpencarlRuleDomainPayload` (lowercase "c" after prefix)
- Multiple "Carl" occurrences: Replace only the prefix (e.g., `CarlSomethingCarlElse` → `OpencarlSomethingCarlElse`)
- All types follow the same rule: generics, interfaces, type aliases — no special cases

### Function/variable naming strategy
- Rename ALL functions and variables (not just internal ones)
- No backward compatibility aliases — clean break
- Follow existing patterns: snake_case `carl_xxx` → `opencarl_xxx`, camelCase `carlXxx` → `opencarlXxx`
- Private members rename fully: `_carlXxx` → `_opencarlXxx`, `#carlXxx` → `#opencarlXxx`

### Import statement approach
- Update imports in Phase 12 (before directory rename, per ROADMAP rationale to prevent compilation errors)
- Rename directory in same plan as imports — atomic change to avoid temporary mismatch
- Keep current import style: relative imports `./carl/*` → `./opencarl/*`
- Type-only imports handled same way as regular imports

### Code comment rebranding scope
- Substantive comments only — update only meaningful comments about functionality
- JSDoc follows same rules as regular comments
- Replace mentions only — minimal changes, not full rewrites
- Update TODO/FIXME comments — consistent rebranding throughout

</decisions>

<specifics>
## Specific Ideas

No specific requirements — rebranding follows the decisions captured above.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 12-source-code-rebranding*
*Context gathered: 2026-03-06*
