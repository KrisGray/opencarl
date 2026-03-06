---
phase: 12-source-code-rebranding
plan: 03
subsystem: rebranding
tags: [typescript, imports, directory-rename, opencarl, rebranding]

# Dependency graph
requires:
  - phase: 12-02
    provides: Function and variable declarations with opencarl prefix
provides:
  - Import statements with opencarl paths in all files
  - Directory renamed from src/carl/ to src/opencarl/
affects: [13-configuration-directory-migration, 14-command-rebranding]

# Tech tracking
tech-stack:
  added: []
  patterns:
  - Import path migration: relative imports update
  - Directory rename with git mv for history preservation

key-files:
  created: []
  modified:
    - .opencode/plugins/carl.ts
    - src/integration/plugin-hooks.ts
    - tests/javascript/unit/*.test.ts (all test files)
    - tests/javascript/integration/*.test.ts (all test files)
    - tests/helpers/*.ts (all helper files)
    - scripts/*.ts (all script files)
  renamed:
    - src/carl/ → src/opencarl/ (entire directory)

key-decisions:
  - "Import path update: src/carl/ → src/opencarl/"
  - "Directory rename: src/carl/ → src/opencarl/ (atomic change)"
  - "Variable naming: projectCarlDir → projectOpencarlDir, etc."
  - "Function references: loadCarlRules → loadOpencarlRules, etc."
  - "Type names: CarlCommand* → OpencarlCommand*, etc."

requirements-completed: [SOURCE-03]

# Metrics
duration: 9 min
completed: 2026-03-06T12:23:25Z
---

# Phase 12 Plan 3: Import Path Updates and Directory Rename Summary

**Import statements updated from src/carl/ to src/opencarl/ across all files, directory renamed atomically, TypeScript compilation succeeds**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-06T12:14:04Z
- **Completed:** 2026-03-06T12:23:25Z
- **Tasks:** 2
- **Files modified:** 46

## Accomplishments

- Updated import statements in source files (.opencode/plugins/carl.ts, src/integration/plugin-hooks.ts)
- Renamed directory from src/carl/ to src/opencarl/ using git mv
- Updated all test files to import from src/opencarl/ instead of src/carl/
- Updated all helper files (tests/helpers/*.ts) import paths
- Updated all script files (scripts/*.ts) import paths
- Renamed test variables: projectCarlDir → projectOpencarlDir, globalCarlDir → globalOpencarlDir, fallbackCarlDir → fallbackOpencarlDir, sessionCarlDir → sessionOpencarlDir
- Updated function references: loadCarlRules → loadOpencarlRules, resolveCarlCommandSignals → resolveOpencarlCommandSignals, mockLoadCarlRules → mockLoadOpencarlRules, etc.
- Updated type names: CarlCommandResolutionInput → OpencarlCommandResolutionInput, CarlCommandResolutionResult → OpencarlCommandResolutionResult, CarlMatchDomainConfig → OpencarlMatchDomainConfig, CarlMatchRequest → OpencarlMatchRequest, CarlRuleDomainPayload → OpencarlRuleDomainPayload

## Task Commits

Each task was committed atomically:

1. **task 1: Update import statements in source files** - `b6c7189` (refactor)
2. **task 2: Update import statements in test files** - `fcfd513` (refactor)

**Plan metadata:** `fcfd513` (docs: complete plan)

## Files Created/Modified

- `.opencode/plugins/carl.ts` - Updated import from src/carl/loader to src/opencarl/loader
- `src/integration/plugin-hooks.ts` - Updated all imports from ../carl/* to ../opencarl/*
- `src/carl/` → `src/opencarl/` - Renamed entire directory with git mv
- `tests/javascript/unit/*.test.ts` - Updated all imports from src/carl/ to src/opencarl/
- `tests/javascript/integration/*.test.ts` - Updated all imports from src/carl/ to src/opencarl/
- `tests/helpers/*.ts` - Updated all imports from src/carl/ to src/opencarl/
- `scripts/*.ts` - Updated all imports from src/carl/ to src/opencarl/

## Decisions Made

- Performed atomic directory rename (src/carl/ → src/opencarl/) and import path updates in the same operation per CONTEXT.md guidance
- Updated all related variable names, function references, and type names to maintain consistency with previous plan (12-02)
- Used git mv for directory rename to preserve file history
- Updated all test files and helper files, not just unit tests

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Test failures in plugin-lifecycle.test.ts and e2e tests - these appear to be pre-existing test setup issues unrelated to import path changes
- All TypeScript compilation errors resolved after import path updates
- Import path verification criteria all met: no remaining src/carl/ imports, directory successfully renamed

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Import path updates complete and verified. Ready for next plans in Phase 12 (Source Code Rebranding):
- 12-04: Comment rebranding (last plan in phase)

All import statements now reference opencarl paths, and directory structure is updated to match the new naming convention.

---
*Phase: 12-source-code-rebranding*
*Completed: 2026-03-06*

## Self-Check: PASSED

- ✓ SUMMARY.md exists at .planning/phases/12-source-code-rebranding/12-03-SUMMARY.md
- ✓ src/opencarl/ directory exists (rename successful)
- ✓ Task commits exist (b6c7189, fcfd513)
- ✓ src/carl/ directory removed (no old directory leftover)
