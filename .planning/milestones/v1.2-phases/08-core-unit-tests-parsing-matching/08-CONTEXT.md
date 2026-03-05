# Phase 8: Core Unit Tests - Parsing & Matching - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Write comprehensive unit tests for core parsing and matching modules (manifest parser, keyword scanner, rule composer, context bracket logic). Tests verify existing code handles valid input, edge cases, and error conditions correctly. Requirements: UNIT-01, UNIT-02, UNIT-04, UNIT-05.

</domain>

<decisions>
## Implementation Decisions

### Test Organization
- Mirror source structure — one test file per source file with matching names
- Keep `tests/` directory separate from `src/` (cleaner separation, easier to exclude from builds)
- Create `tests/helpers/` for shared test utilities (mock factories, test data builders, custom matchers)
- Use `.test.ts` suffix (Jest default convention, no config changes needed)

### Test Data Strategy
- Use mix of inline, fixtures, and factories for different purposes:
  - **Inline** — trivial cases (empty, single field, obvious errors)
  - **Fixtures** — complex/realistic data (valid manifests, multi-domain scenarios)
  - **Factories** — generating variations (different domain counts, keyword combinations)
- Sufficient variety — cover each requirement category with representative cases, not exhaustive permutations
- Realistic data — match actual CARL manifest patterns (tests become usage documentation)

### Edge Case Depth
- Pragmatic approach — cover what requirements specify plus obvious error paths
- Add more edge cases only if bugs are found or specific edge cases are known risks
- Test known edge cases from development explicitly (documents fixed bugs, prevents regressions)

### Test Style & Naming
- BDD-style descriptive test names — "should parse valid single-domain manifest correctly"
- Nested describe blocks for grouping — `describe(module) → describe(function) → describe(category)`
- Organize by behavior/functionality, not by requirement ID
- Self-documenting tests with minimal comments — add comments only for non-obvious edge cases or known bugs

### OpenCode's Discretion
- Exact fixture file names and structure within `tests/fixtures/`
- Exact factory function signatures in `tests/helpers/`
- Specific test case variations within each category

</decisions>

<specifics>
## Specific Ideas

- "Tests should feel like documentation of real CARL usage" — realistic data helps future developers understand how manifests work
- Nested describe structure mirrors how Jest output appears — module → function → category makes failing tests easy to locate

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 08-core-unit-tests-parsing-matching*
*Context gathered: 2026-03-04*
