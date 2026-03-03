---
phase: 01-plugin-foundation-rule-discovery
plan: 01
subsystem: infra
tags: [opencode, plugin, typescript, setup]

# Dependency graph
requires: []
provides:
  - Local OpenCode plugin manifest for CARL dependencies
  - Plugin entrypoint wiring to CARL loader interface
  - Setup flow for global/project plugin installation
affects: [rule-discovery]

# Tech tracking
tech-stack:
  added: ["@opencode-ai/plugin@1.2.14", "@opencode-ai/sdk@1.2.14", "zod@4.1.8"]
  patterns:
    - "OpenCode plugin entrypoint logs discovery summary and warnings on startup"

key-files:
  created:
    - .opencode/package.json
    - .opencode/plugins/carl.ts
    - src/carl/types.ts
    - src/carl/loader.ts
    - scripts/install-global-plugin.ts
    - scripts/setup-plugin.ts
  modified: []

key-decisions:
  - "Global plugin entrypoint imports the loader via absolute path derived at install time to ensure shared loader usage."

patterns-established:
  - "Setup flow supports --scope global|project with global default."

requirements-completed: [INST-01]

# Metrics
duration: 13 min
completed: 2026-02-25
---

# Phase 1 Plan 01: Plugin Foundation Entry Point Summary

**Local and global OpenCode plugin entrypoints now load CARL with a shared loader interface and a stable discovery summary log.**

## Performance

- **Duration:** 13 min
- **Started:** 2026-02-25T16:30:59Z
- **Completed:** 2026-02-25T16:44:51Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Added a minimal local OpenCode plugin package manifest with required dependencies.
- Implemented a CARL plugin entrypoint that invokes the loader interface and reports discovery summaries.
- Delivered setup and install scripts to create global or project plugin entrypoints.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create local OpenCode plugin package manifest** - `f983158` (feat)
2. **Task 2: Add plugin entrypoint and loader interface** - `6fb72f4` (feat)
3. **Task 3: Add setup flow and global plugin install helper** - `e45dd09` (feat)

**Plan metadata:** _pending_

_Note: TDD tasks may have multiple commits (test → feat → refactor)_

## Files Created/Modified
- `.opencode/package.json` - Local plugin dependency manifest for OpenCode.
- `.opencode/plugins/carl.ts` - OpenCode plugin entrypoint that logs discovery summary.
- `src/carl/types.ts` - Shared rule discovery types for loader output.
- `src/carl/loader.ts` - Minimal loader returning empty discovery result.
- `scripts/install-global-plugin.ts` - Helper that writes the global plugin entrypoint.
- `scripts/setup-plugin.ts` - Setup flow to install global or project entrypoints.

## Decisions Made
- Global plugin entrypoint imports the loader via absolute path derived at install time to ensure shared loader usage.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed setup script import for .ts helper**
- **Found during:** Task 3 (setup flow verification)
- **Issue:** `node scripts/setup-plugin.ts` failed to resolve `./install-global-plugin` because the helper file uses a `.ts` extension.
- **Fix:** Updated the setup script to require `./install-global-plugin.ts` explicitly.
- **Files modified:** `scripts/setup-plugin.ts`
- **Verification:** `node scripts/setup-plugin.ts --scope global`
- **Committed in:** `e45dd09`

**2. [Rule 1 - Bug] Corrected generated plugin summary logging**
- **Found during:** Task 3 (global entrypoint verification)
- **Issue:** Generated global plugin entrypoint logged template strings literally instead of interpolating values.
- **Fix:** Adjusted template generation to emit real template literals for summary and warning logs.
- **Files modified:** `scripts/install-global-plugin.ts`
- **Verification:** `node scripts/setup-plugin.ts --scope global` and inspection of `~/.config/opencode/plugins/carl.ts`
- **Committed in:** `e45dd09`

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes were required for the setup flow and global entrypoint to function correctly. No scope creep.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
Plugin entrypoints and setup flow are in place, ready for rule discovery implementation in Plan 01-02.

---
*Phase: 01-plugin-foundation-rule-discovery*
*Completed: 2026-02-25*

## Self-Check: PASSED
