# Phase 9: Core Unit Tests - Session & Setup - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Write comprehensive unit tests for session management, setup/initialization, star-command parsing, and validation modules. Tests verify existing code handles stateful operations, file system interactions, and validation logic correctly. Requirements: UNIT-03, UNIT-06, UNIT-07, UNIT-08, UNIT-09.

</domain>

<decisions>
## Implementation Decisions

### File System Testing Strategy

- **Mock fs operations** for all file system interactions (setup, session persistence) — use `jest.mock('fs')` to mock the entire fs module for speed and isolation
- **Hybrid approach for validation** — Use test fixtures (from Phase 8) for valid cases, inline mock data for edge cases and malformed inputs
- **Mock entire fs module** — Use `jest.mock('fs')` rather than dependency injection or partial mocking — standard Jest pattern, complete control
- **Real FS validation in Phase 10/11** — File system edge cases (permissions, race conditions, real I/O) are caught in integration and E2E tests

### Stateful Module Testing

- **Fresh instance per test** — Each test creates new manager/session instances with clean state for maximum isolation
- **Verify final state only** — Test assertions check end result, not intermediate states — tests behavior, not implementation details
- **All async/await** — Even with mocked fs, keep tests async to match production API patterns
- **New state factories** — Create separate factories for runtime state (domain-state-factory.ts, session-state-factory.ts) distinct from Phase 8 content factories

### Test Data & State Management

- **Partial override pattern** — Factories use `Partial<T>` with spread operator for type-safe, flexible customization: `createState({ globalRules: false })`
- **Shallow merge only** — No deep merging — for nested state, use sub-factories or provide full nested objects in overrides
- **Custom setup helpers** — `setupDomainManagerTest()`, `setupSessionManagerTest()` helpers return fresh mocks and instances — explicit, reusable, flexible
- **Invalid state inline** — Define invalid/malformed test data directly in tests for clarity — extract to helper only if repeated 3+ times

### Edge Case Depth

- **Representative error coverage** — Test 2-3 variations per error type (not exhaustive, not minimal) — shows error handling is consistent
- **Idempotency with state preservation** — For setup, test that second run preserves manual changes from first run, not just "doesn't crash"
- **Verify error message content** — Check actual error text (not just type or existence) — error messages are user-facing API
- **Pragmatic edge cases** — Test what requirements specify + obvious edge cases — skip exotic scenarios (concurrent modifications, expired sessions) for Phase 10/11

### Integration vs Unit Boundaries

- **Setup: hybrid unit** — Mock fs operations, but use real path construction logic (paths are pure functions)
- **Session persistence: full cycle** — Test create → persist → load cycle with mocked fs to catch serialization bugs
- **Star-command parser: pure unit** — Text parsing only (string → command object), no routing or handler logic
- **Validation: structure + cross-field** — Test field presence, types, AND cross-field dependencies (e.g., ALWAYS_ON overrides STATE)

### Test Organization & Style

- **Follow Phase 8 patterns** — Mirror source structure, tests/ directory separate, BDD-style names, nested describe blocks
- **New helper files in tests/helpers/** — domain-state-factory.ts, session-state-factory.ts, setup-mocks.ts
- **Reuse Phase 8 fixtures** — tests/fixtures/manifests/ and tests/fixtures/carl-directories/ for validation tests
- **Self-documenting tests** — Minimal comments, clear test names, realistic data patterns

### OpenCode's Discretion

- Exact factory function signatures and return types
- Specific test case variations within each error category
- Exact error message wording (as long as it's actionable and clear)
- Number of test cases per operation (2-4 is reasonable range)
- Naming conventions for setup helper functions

</decisions>

<specifics>
## Specific Ideas

- "Tests should feel like documentation of real CARL usage" — realistic state patterns help developers understand session and domain workflows
- "Fresh instance per test is standard Jest pattern" — any Jest developer will recognize and understand immediately
- "Error messages are part of the API" — tests verify what users actually see when things go wrong
- "Partial override with spread is the TypeScript way" — matches how modern TypeScript code handles configuration

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 09-core-unit-tests-session-setup*
*Context gathered: 2026-03-04*
