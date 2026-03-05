# Phase 11 Context: E2E Tests & Docker

## Overview

**Phase:** 11 - E2E Tests & Docker
**Milestone:** v1.2 Testing & QA
**Status:** Planning

**Goal:** Real OpenCode in Docker validates complete user workflows automatically in CI

## Requirements

From ROADMAP.md:

- **E2E-01**: Docker container with OpenCode for integration testing
- **E2E-02**: Full setup flow E2E (scaffold .carl/, verify defaults, test prompts)
- **E2E-03**: Keyword matching flow E2E with real OpenCode
- **E2E-04**: Star-command flow E2E with real OpenCode
- **CI-03**: Docker-based E2E tests in GitHub Actions

## Decisions

### User Decisions (Locked)

These decisions were made during `/gsd-discuss-phase 11` and MUST be implemented exactly:

#### 1. Test Scenarios

**Scope:** E2E tests focused on happy paths + one representative error per flow. Edge cases handled in unit/integration tests.

**Test List (5 tests):**

| # | Test Name | Description | Type |
|---|-----------|-------------|------|
| 1 | **Setup flow** | Fresh install creates `.carl/` with valid defaults | Happy path |
| 2 | **Setup idempotency** | Re-running setup preserves valid config | Happy path |
| 3 | **Keyword matching** | Message with keywords triggers correct rule injection | Happy path |
| 4 | **Keyword case-insensitive** | "keyword", "KEYWORD", "KeyWord" all work | Edge case |
| 5 | **Star-command flow** | `*carl status`, `*carl list`, `*carl toggle` work | Happy path |

**Rationale:**
- E2E tests are expensive (slow, resource-heavy, hard to debug)
- Testing pyramid: few E2E smoke tests, lots of unit/integration tests
- Edge cases better tested at lower levels

**Skip in E2E:**
- Empty .carl/, corrupted sessions, concurrent sessions → covered in Phase 9/10
- Reload (`*carl reload`) → niche, tested in integration
- Bracket behavior → Phase 8 unit tests
- Session persistence → Phase 10 integration tests

---

#### 2. Docker Environment

**Base Image Strategy:**
- ✅ **Option 2: Minimal Node.js Image + Install OpenCode**
  - Lightweight, full control over versions
  - Faster rebuilds
  - Predicable build process

**Version Management:**
- ✅ **OpenCode:** Lock to specific version (e.g., `v1.2.3`) for reproducible CI
- ✅ **Node.js:** Use current LTS (as of 2026-03: Node 20.x LTS)
- ✅ **Plugin:** Install from local source during Docker build

**Testing Framework:**
- ✅ **Shell Script + OpenCode CLI**
  - Simplest for testing *carl commands and keyword injection
  - Mimics real user interaction
  - No additional dependencies needed

**Test Isolation:**
- ✅ **Reuse container with cleanup**
  - Balance of speed and safety
  - Volume wipe between tests (fast, clean isolation)

**Dockerfile Location:** `tests/e2e/Dockerfile`

**Expected Docker Structure:**
```
tests/e2e/
├── Dockerfile              # OpenCode + plugin build
├── docker-compose.yml      # Optional: for local development
└── fixtures/               # Test data
```

---

#### 3. Test Execution

**Local Development:**
- ✅ **Opt-in:** Full support available via `npm run test:e2e:local`
  - Developer can run E2E tests locally before pushing (if Docker installed)
  - CI catches failures for those without Docker
  - Two execution paths maintained

**Parallel Execution:**
- ✅ **Sequential:** Tests run one after another
  - Simpler, deterministic, easier to debug
  - 5 tests is manageable (estimated 5-10 min total)

**Test Data Strategy:**
- ✅ **Git-tracked fixtures**
  - `tests/e2e/fixtures/` with sample manifests, prompts, sessions
  - Templates for setup tests
  - Sample manifests for keyword matching tests
  - Version-controlled, predictable, easy to review

**Cleanup Strategy:**
- ✅ **Volume wipe:** After each test, delete `.carl/` directory
  - Fast enough for 5 tests
  - Clean isolation without container restart overhead

**Test Script Location:** `tests/e2e/run-e2e-tests.sh`

**Local Command:**
```bash
npm run test:e2e:local  # Runs Docker-based E2E tests
```

---

#### 4. Assertion Strategy

**Primary Validation:**
- ✅ **File system verification**
  - Check `.carl/` directory structure
  - Validate session files content
  - Verify rule injection in session state
  - Concrete, verifiable, less brittle than output parsing

**Secondary Validation:**
- ✅ **Output parsing**
  - Parse OpenCode stdout/stderr for expected messages
  - Validate user-facing responses (e.g., "CARL rules loaded: 3")
  - Complements file system checks

**Critical Assertions Per Test:**

| Test | Assertions |
|------|------------|
| **Setup** | `.carl/` exists, `manifest.json` valid JSON, `prompts/` has files |
| **Idempotency** | Second run doesn't overwrite valid files |
| **Keyword matching** | Rule injection present in session file or output |
| **Case-insensitive** | Both "KEYWORD" and "keyword" trigger injection |
| **Star-commands** | `*carl status` returns domains, toggle updates state |

**Artifacts on Failure:**
- ✅ **All of the following:**
  - OpenCode stdout/stderr logs
  - `.carl/` directory tree (tarball in CI, print in local)
  - Session files content
  - Docker container logs

**Test Result Location:**
- CI: Upload artifacts to GitHub Actions
- Local: Print to console, save to `test-results/e2e/`

---

#### 5. CI Integration

**When to Run E2E Tests:**
- ✅ **PR + Scheduled (nightly)**
  - Balance speed and coverage
  - PR tests catch issues quickly
  - Nightly run ensures comprehensive validation

**Caching Strategy:**
- ✅ **Docker layer caching**
  - Use GitHub Actions `cache` action for Docker layers
  - Significant speedup on subsequent builds
  - Simple to implement, no extra maintenance

**Failure Handling:**
- ✅ **Retry once, then block PR**
  - Retry failed test once (handles transient failures: network, Docker glitches)
  - Second failure blocks PR merge
  - Enforces quality while allowing for flakiness

**Artifact Retention:**

| Artifact | Upload When | Retention |
|----------|-------------|----------|
| E2E test logs | Always | 7 days |
| Docker container logs | On failure | 14 days |
| `.carl/` directory state | On failure | 14 days |
| Screenshot/visual output | On failure (if applicable) | 14 days |
| Coverage report | Always | 30 days |

**Workflow File:** `.github/workflows/e2e-tests.yml`

**Workflow Structure:**
```yaml
name: E2E Tests
on:
  pull_request:
  push:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'  # Nightly at 2 AM UTC
```

---

## OpenCode's Discretion

The following areas are left to OpenCode's judgment:

### Docker Configuration
- Specific OpenCode version to lock to (choose stable release as of planning date)
- Dockerfile optimization details (multi-stage if beneficial)
- Docker Compose configuration for local dev (optional)

### Test Script Implementation
- Specific shell commands to interact with OpenCode
- Error handling and retry logic in test script
- Logging verbosity and formatting

### Fixture Design
- Specific manifest structures for keyword matching tests
- Prompt templates for setup tests
- Test data organization within `tests/e2e/fixtures/`

### Assertion Details
- Exact patterns for output parsing (regex vs. substring)
- Specific JSON paths to check in session files
- Snapshot format for `.carl/` directory state

### CI Configuration
- Exact GitHub Actions syntax and caching implementation
- Job matrix configuration (if testing multiple Node versions)
- Notification setup on failures (optional)

---

## Existing Constraints

From STATE.md:

1. **Tests run via shell script and/or GitHub Actions** (user requirement)
2. **E2E tests use real OpenCode in Docker container** (user requirement)
3. **80% coverage threshold enforced** (user requirement) — applies to unit/integration, E2E is separate

---

## Existing Decisions (From Prior Phases)

From STATE.md v1.2 Decisions:

- **Jest with ts-jest preset** — Used for unit/integration tests
- **Docker for E2E tests** — Confirmed, isolated/reproducible OpenCode environment
- **GitHub Actions for CI** — Native GitHub integration
- **Separate unit test phases by domain** — Natural grouping

From STATE.md Technical Notes:

- **Test directory:** `tests/javascript/` (unit/integration)
- **Fixtures directory:** `tests/fixtures/` (manifests, prompts, sessions)
- **E2E Docker:** OpenCode container with plugin mounted
- **Detailed test plan:** `.planning/OPENCARL_TEST_PLAN.md`

---

## Dependencies

**Phase 11 Depends On:**
- Phase 10 (Integration Tests) — Must be complete before E2E testing
- Phase 9.1 (Close Phase 9 Unit Test Gaps) — Should be complete

**Integration Points:**
- Reuse fixtures from `tests/fixtures/` if applicable
- Follow Jest patterns from Phase 7 for assertion style
- Align with GitHub Actions workflow from Phase 7

---

## Technical Context

### OpenCode Plugin Architecture

The CARL plugin integrates with OpenCode via:

1. **Plugin Discovery:** OpenCode loads plugins from specified locations
2. **Hook Registration:** Plugin registers message processing hooks
3. **Rule Injection:** Plugin injects CARL rules into OpenCode context
4. **Command Processing:** Plugin handles `*carl` star-commands

**For E2E Testing:**
- Need to verify OpenCode correctly discovers and loads the plugin
- Need to verify plugin correctly injects rules based on keywords
- Need to verify plugin correctly responds to star-commands

### Docker Considerations

**Plugin Installation:**
- Plugin can be installed via npm during Docker build
- Or mounted as volume from local source (for faster iteration)
- Decision: Install from local source during build (per user decision)

**OpenCode Version:**
- Check OpenCode GitHub for latest stable release
- Lock to specific version for reproducibility
- Update version in Dockerfile as needed

**Container Lifecycle:**
1. Build image (OpenCode + CARL plugin)
2. Start container
3. Mount test fixtures and scripts
4. Run test sequence
5. Capture logs and artifacts
6. Stop container

### Test Script Flow

**Expected E2E Test Flow:**

```bash
# 1. Start Docker container
docker run -d --name carl-e2e -v $(pwd):/workspace opencode-carl:latest

# 2. Run test 1: Setup flow
docker exec carl-e2e *carl setup
# Assert: .carl/ directory exists with valid structure

# 3. Run test 2: Idempotency
docker exec carl-e2e *carl setup
# Assert: Existing files not overwritten

# 4. Run test 3: Keyword matching
docker exec carl-e2e "This message has KEYWORD"
# Assert: Rule injection in session state

# 5. Run test 4: Case-insensitive
docker exec carl-e2e "This message has keyword"
# Assert: Same rule injection as test 3

# 6. Run test 5: Star-commands
docker exec carl-e2e *carl status
# Assert: Returns domains list

# 7. Cleanup
docker stop carl-e2e
docker rm carl-e2e
```

---

## Success Criteria

From ROADMAP.md, Phase 11 Success Criteria:

1. **Developer can run Docker container with OpenCode and execute E2E tests locally**
   - Command: `npm run test:e2e:local` works
   - Docker container builds successfully
   - Tests complete with clear pass/fail output

2. **Developer can verify full setup flow scaffolds .carl/ and creates valid defaults**
   - Test 1 (setup flow) passes
   - `.carl/manifest.json` is valid JSON
   - `.carl/prompts/` contains template files

3. **Developer can verify keyword matching triggers correct rule injection with real OpenCode**
   - Test 3 (keyword matching) passes
   - Rules appear in session state or output
   - Correct rules selected for keywords

4. **Developer can verify star-commands work correctly with real OpenCode**
   - Test 5 (star-command flow) passes
   - `*carl status` shows domains
   - `*carl list` lists available domains
   - `*carl toggle` enables/disables domains

5. **GitHub Actions runs E2E tests in Docker as part of CI pipeline**
   - `.github/workflows/e2e-tests.yml` exists
   - Workflow runs on PR and scheduled nightly
   - Tests pass in CI environment
   - Artifacts uploaded on failure

---

## Deferred Ideas

Items discussed but deferred to future releases:

- Visual regression testing (screenshots of OpenCode UI)
- Performance benchmarking for E2E test runs
- Multi-version testing (test against multiple OpenCode versions)
- Parallel test execution infrastructure
- Advanced test isolation (fresh container per test)

---

## Next Steps

After this CONTEXT.md is created:

1. Execute `/gsd-plan-phase 11` to create PLAN.md files
2. Plans will break down into 2-3 plans with 2-3 tasks each
3. Execute `/gsd-execute-phase 11` to implement plans
4. Verify Phase 11 completion

---

**Context Created:** 2026-03-05
**Last Updated:** 2026-03-05 during `/gsd-discuss-phase 11`
