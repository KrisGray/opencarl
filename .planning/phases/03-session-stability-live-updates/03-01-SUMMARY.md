---
phase: 03-session-stability-live-updates
plan: 01
subsystem: session
tags: [cache, live-reload, opt-in, session-overrides, warning-guard]

requires:
  - phase: 02-matching-injection-command-parity
    provides: Rule matching and injection pipeline
provides:
  - Session-scoped rule cache with dirty tracking
  - Project opt-in gating with per-session warning guard
  - Per-session domain overrides from .carl/sessions/{id}.json
affects: [live-reload, session-stability, project-rules]

tech-stack:
  added: []
  patterns:
    - "Cache with dirty flag for lazy reload"
    - "Per-session warning guard using Set"
    - "Session overrides file parsing"

key-files:
  created:
    - src/carl/rule-cache.ts
    - src/carl/session-overrides.ts
  modified:
    - src/carl/loader.ts
    - src/carl/types.ts
    - src/integration/plugin-hooks.ts

key-decisions:
  - "Rule cache is global but checks dirty flag before returning cached result"
  - "Per-session overrides stored in .carl/sessions/{session_id}.json"
  - "Session overrides can only disable domains, not enable missing ones"
  - "Invalid project rules emit warning once per session, not per turn"

patterns-established:
  - "Pattern: Cache with dirty flag - mark dirty on file change, reload lazily on next access"
  - "Pattern: Session warning guard - Set of session IDs to warn only once"

requirements-completed:
  - RULE-04
  - RULE-05

duration: 10 min
completed: 2026-02-26
---

# Phase 3 Plan 1: Session Stability & Live Updates Summary

**Rule cache with live reload invalidation, project opt-in gating with per-session warnings, and per-session domain overrides**

## Performance

- **Duration:** 10 min
- **Started:** 2026-02-26T16:29:16Z
- **Completed:** 2026-02-26T16:39:22Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Session-scoped rule cache that reloads only when .carl files change
- Project opt-in gating that drops invalid project rules and warns once per session
- Per-session override files that can disable domains for specific sessions

## Task Commits

Each task was committed atomically:

1. **Task 1: Add rule cache with live reload invalidation** - `43f3052` (feat)
2. **Task 2: Enforce project opt-in gating and warn once per session** - `d2db494` (feat)
3. **Task 3: Apply per-session overrides to domain activation** - `51603c5` (feat)

**Plan metadata:** (pending)

_Note: All tasks completed without additional refactor commits_

## Files Created/Modified

- `src/carl/rule-cache.ts` - Session-scoped rule cache with dirty tracking and warning guard
- `src/carl/session-overrides.ts` - Per-session override loader from .carl/sessions/{id}.json
- `src/carl/loader.ts` - Extended with project opt-in, validity tracking, session overrides
- `src/carl/types.ts` - Added CarlProjectStatus, projectStatus/projectWarnings to result
- `src/integration/plugin-hooks.ts` - Wired cache, warning guard, session ID to getCachedRules

## Decisions Made

- Cache is global (shared across sessions) but reloads when dirty flag is set by file watcher
- Session overrides file path: `.carl/sessions/{session_id}.json` with `domains` object
- Override values: `inherit` (default), `true` (ignored - can't enable missing), `false` (disable)
- Invalid project rules warning uses console.warn with session ID guard

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all smoke tests passed on first attempt.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Rule cache infrastructure complete for live reload support
- Project validity tracking ready for integration with config opt-in
- Session overrides ready for per-session domain gating
- Ready for 03-02 (context brackets implementation)

---
*Phase: 03-session-stability-live-updates*
*Completed: 2026-02-26*

## Self-Check: PASSED

- All 5 key files verified on disk
- All 3 task commits found in git history
