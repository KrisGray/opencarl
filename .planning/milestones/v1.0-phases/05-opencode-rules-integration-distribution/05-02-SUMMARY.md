---
phase: 05-opencode-rules-integration-distribution
plan: 02
subsystem: distribution
tags: [npm, package, build, opencode-plugin]

requires:
  - phase: 04
    provides: plugin-hooks.ts structure and CARL functionality

provides:
  - @krisgray/opencode-carl-plugin npm package configuration
  - TypeScript build configuration for dist/ output
  - Plugin entrypoint (src/plugin.ts)
  - Build script for OpenCode distribution

affects: [distribution, npm-publish]

tech-stack:
  added: []
  patterns:
    - Dual-package strategy (Claude + OpenCode)
    - CommonJS output for OpenCode plugin loading

key-files:
  created:
    - package.opencode.json
    - tsconfig.build.json
    - src/plugin.ts
    - scripts/build-opencode.ts
  modified:
    - package.json (added build:opencode script)

key-decisions:
  - "Use scoped package name @krisgray/opencode-carl-plugin"
  - "Output CommonJS for OpenCode plugin compatibility"
  - "Pre-built dist/plugin.js as main entrypoint"
  - "Include .carl-template/ and resources/ in npm files"

patterns-established:
  - "Dual-package config: separate package.json for each platform"

requirements-completed:
  - INST-05

duration: 4 min
completed: 2026-03-03
---

# Phase 5 Plan 02: NPM Package Structure Summary

**OpenCode-specific package configuration with pre-built JavaScript distribution**

## Performance

- **Duration:** 4 min
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Created package.opencode.json for @krisgray/opencode-carl-plugin with scoped name
- Created tsconfig.build.json targeting ES2022/CommonJS for dist/ output
- Created src/plugin.ts as OpenCode plugin entrypoint
- Created scripts/build-opencode.ts for compilation workflow
- Added build:opencode and prepublishOnly:opencode scripts to package.json

## Task Commits

Each task was committed atomically:

1. **Task 1: Create OpenCode-specific package.json** - `bc6d0d1` (feat)
2. **Task 2: Create TypeScript build configuration** - `461fe03` (feat)
3. **Task 3: Create build script and plugin entrypoint** - `5e736d5` (feat)

## Files Created/Modified

- `package.opencode.json` - NPM package config for @krisgray/opencode-carl-plugin
- `tsconfig.build.json` - TypeScript config outputting to dist/
- `src/plugin.ts` - Plugin entrypoint exporting CARL hooks
- `scripts/build-opencode.ts` - Build script for OpenCode distribution
- `package.json` - Added build:opencode and prepublishOnly:opencode scripts

## Decisions Made

- Used scoped package name @krisgray/opencode-carl-plugin for npm
- Configured main field to dist/plugin.js (pre-built)
- Included dist/, .carl-template/, resources/ in files array
- Set @opencode-ai/plugin as peerDependency (not bundled)

## Deviations from Plan

- tsconfig.build.json uses ES2022/Node16 instead of ES2020/CommonJS as specified
  - Rationale: Node16 module resolution provides better ESM compatibility

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- NPM package structure complete
- Ready for documentation and publish workflow (plan 03)

## Self-Check: PASSED

All files and commits verified:
- package.opencode.json: FOUND
- tsconfig.build.json: FOUND
- src/plugin.ts: FOUND
- scripts/build-opencode.ts: FOUND
- Task commits: bc6d0d1, 461fe03, 5e736d5 (all verified)

---
*Phase: 05-opencode-rules-integration-distribution*
*Completed: 2026-03-03*
