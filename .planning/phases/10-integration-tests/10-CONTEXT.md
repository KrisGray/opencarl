# Phase 10: Integration Tests - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Verify that plugin components work together correctly across full workflows. This phase tests:
- Plugin lifecycle tests (initializes, registers hooks, processes messages end-to-end)
- Rule injection pipeline tests (manifest → scan → load → compose → inject)
- Domain workflow tests (setup → list → toggle)
- File operations tests (manifest changes, session persistence, global/local resolution)

Integration tests differ from unit tests by testing multiple components working together rather than isolated pieces.

</domain>

<decisions>
## Implementation Decisions

### Test Level & Mocking Strategy
- File system operations: Real file system with temp directories (realistic, catches actual file system bugs)
- OpenCode plugin API: Simulated (no external dependency, easier to control scenarios)
- Domain & rule loading: Real domain loader with test manifests (verifies actual loading behavior)
- Session persistence: Real session files with temp directory (verifies actual persistence)

### Test Organization & Workflow Structure
- Organization: By workflow type — lifecycle, injection pipeline, domain workflow, file operations (mirrors success criteria structure)
- Granularity: One comprehensive test per workflow with multiple assertions (easier to understand flow)
- Dependencies: Independent tests only — each test sets up its own state (more reliable)
- Workflow order: Logical execution order — lifecycle → injection → setup → file ops (matches actual usage)

### Test Data Complexity
- Fixture complexity: Realistic complex scenarios — multi-domain manifests, multiple active sessions, mixed global/local rules
- Edge case coverage: Yes, critical error flows — missing manifests, corrupted files, invalid sessions (but not exhaustive)
- Test fixture reuse: Yes, reuse existing unit test fixtures heavily (domain-factory, bracket-factory, etc.) for consistency
- Data mutability: Dynamic factories similar to unit tests (flexible, easier to extend)

### Assertion & Verification Strategy
- What to assert: End-to-end outputs and state changes — final injection output, session file contents, file system state
- Complex output verification: Snapshot testing for CARL injection output (capture expected once, detect regressions automatically)
- File system verification: Read and verify contents directly (assert file content, existence, structure)
- Error behavior assertions: Graceful handling and clear error messages (system doesn't crash, returns actionable error)

### OpenCode's Discretion
- Exact temp directory naming and cleanup strategy
- Snapshot file organization and naming conventions
- Test helper utilities for simulating OpenCode API
- Error message wording and formatting (within "clear and actionable" constraint)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard integration testing approaches with the captured decisions above.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 10-integration-tests*
*Context gathered: 2026-03-05*
