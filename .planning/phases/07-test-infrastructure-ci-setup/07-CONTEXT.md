# Phase 7: Test Infrastructure & CI Setup - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up Jest test framework with ts-jest, establish test directory structure, enforce 80% coverage threshold, and create GitHub Actions workflow that runs tests automatically on code changes. This phase does NOT include writing actual tests - those are Phases 8-11.

</domain>

<decisions>
## Implementation Decisions

### CI Workflow Design
- **Triggers:** Run on push to main + all pull requests
- **Draft PRs:** Skip CI for draft PRs (save CI minutes)
- **Coverage enforcement:** Fail build immediately when coverage drops below 80%
- **Test execution:** Run tests in parallel with `maxWorkers=2` (balance speed vs resources)

### Coverage Reporting
- **Report formats:** Generate Console + HTML + lcov coverage reports
- **HTML artifacts:** Upload HTML coverage report as downloadable GitHub Actions artifact
- **Coverage service:** Upload coverage to Codecov for tracking and trending
- **README badge:** Add live coverage percentage badge to README.md using shields.io or codecov
- **Threshold scope:** Global threshold only (allows flexibility in per-file coverage while maintaining overall quality)

### Local Test Execution
- **Available scripts:**
  - `npm test` - run all tests once
  - `npm run test:watch` - watch mode for development
  - `npm run test:coverage` - generate coverage report
  - `npm run test:unit` - run unit tests only
  - `npm run test:integration` - run integration tests only
  - `npm run test:e2e` - run e2e tests only

### Test Organization & Discovery
- **Test structure:** Mirror `src/` directory structure in `tests/javascript/`
  - Unit tests: `tests/javascript/unit/`
  - Integration tests: `tests/javascript/integration/`
  - E2E tests: `tests/javascript/e2e/`
- **Test discovery:** Use standard Jest patterns (`**/*.test.ts`, `**/*.spec.ts`)
- **Test fixtures:** Dedicated `tests/fixtures/` directory
  - `tests/fixtures/manifests/` - sample manifest files
  - `tests/fixtures/carl-directories/` - sample .carl/ directory structures
  - `tests/fixtures/prompts/` - sample prompt text for keyword matching
  - `tests/fixtures/sessions/` - sample session state files

### OpenCode's Discretion
- Exact Jest configuration file location (`jest.config.ts` vs `jest.config.js`)
- Specific coverage reporter output formatting
- Error message formatting in test failures
- Test timeout values for different test types

</decisions>

<specifics>
## Specific Ideas

- Coverage badge should be visible at top of README for quick status visibility
- Watch mode should be optimized for development workflow (re-run related tests on file changes)
- Coverage reports should clearly show which lines are covered/uncovered
- CI workflow should be fast enough to provide quick feedback (< 5 minutes ideal)
- Test scripts should follow npm conventions and be intuitive for developers

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 07-test-infrastructure-ci-setup*
*Context gathered: 2026-03-04*
