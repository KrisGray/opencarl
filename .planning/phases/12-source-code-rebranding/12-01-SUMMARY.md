---
phase: 12-source-code-rebranding
plan: 01
subsystem: rebranding
tags: [typescript, types, rebranding, opencarl]

# Dependency graph
requires: []
provides:
  - Type definitions with Opencarl prefix in src/carl/types.ts
  - Error types with Opencarl prefix in src/carl/errors.ts
  - Updated type references across all source files
  - Updated type imports in test files
affects: [12-configuration-directory-migration, 13-command-rebranding]

# Tech tracking
tech-stack:
  added: []
  patterns:
  - Type naming convention: Opencarl prefix (CamelCase, lowercase "carl")
  - Compound names: OpencarlRuleDomainPayload (lowercase "c" after prefix)

key-files:
  created: []
  modified:
    - src/carl/types.ts
    - src/carl/errors.ts
    - src/carl/loader.ts
    - src/carl/injector.ts
    - src/carl/matcher.ts
    - src/carl/signal-store.ts
    - src/carl/command-parity.ts
    - src/carl/rule-cache.ts
    - src/carl/validate.ts
    - src/integration/plugin-hooks.ts
    - tests/javascript/unit/validate.test.ts
    - tests/javascript/unit/injector.test.ts
    - tests/javascript/unit/matcher.test.ts
    - tests/javascript/unit/command-parity.test.ts
    - tests/javascript/unit/rule-cache.test.ts
    - tests/javascript/integration/plugin-lifecycle.test.ts
    - tests/javascript/integration/rule-injection-pipeline.test.ts
    - tests/helpers/domain-factory.ts
    - tests/helpers/match-factory.ts

key-decisions:
  - "Use 'Opencarl' prefix (CamelCase, lowercase 'carl')"
  - "Compound names: CarlRuleDomainPayload → OpencarlRuleDomainPayload (lowercase 'c' after prefix)"
  - "Multiple 'Carl' occurrences: Replace only the prefix"

patterns-established:
  - "Pattern 1: Opencarl prefix for all TypeScript types in src/carl/"
  - "Pattern 2: Lowercase 'c' in Opencarl compound names (e.g., OpencarlRuleDomainPayload)"
  - "Pattern 3: Update both type declarations and references atomically"

requirements-completed: [SOURCE-01]

# Metrics
duration: 8 min
completed: 2026-03-06T11:54:46Z
---

# Phase 12: Source Code Rebranding Summary

**Type renaming from Carl to Opencarl prefix across TypeScript source and test files with 18 files modified, TypeScript compilation succeeds, and 169 tests passing**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-06T11:46:40Z
- **Completed:** 2026-03-06T11:54:46Z
- **Tasks:** 2
- **Files modified:** 18

## Accomplishments

- Renamed all Carl* types to Opencarl* types in source files (types.ts, errors.ts)
- Updated all type references across 10 source files (loader, injector, matcher, signal-store, command-parity, rule-cache, validate, plugin-hooks)
- Updated test imports across 7 test files to use Opencarl types
- Updated test helper files (domain-factory.ts, match-factory.ts) to use Opencarl types
- TypeScript compilation succeeds
- All affected tests pass (169 tests)

## Task Commits

Each task was committed atomically:

1. **task 1: Rename type declarations in source files** - `d277b2b` (feat)
2. **task 2: Update type references in test files** - `d277b2b` (test)

**Plan metadata:** `d277b2b` (docs: complete plan)

_Note: Both tasks were committed together in a single commit for atomicity_

## Files Created/Modified

- `src/carl/types.ts` - Renamed 14 type declarations to Opencarl prefix (CarlRuleSourceScope, CarlRuleSource, CarlRuleDiscoveryWarning, CarlProjectStatus, CarlRuleDiscoveryResult, CarlRuleDomainPayload, CarlSignalSource, CarlSessionSignals, CarlMatchDomainConfig, CarlMatchRequest, CarlExclusionSource, CarlDomainMatchResult, CarlGlobalExcludeResult, CarlMatchResult)
- `src/carl/errors.ts` - Renamed 2 error types to Opencarl prefix (CarlErrorCategory, CarlError class)
- `src/carl/loader.ts` - Updated type imports and references (CarlRuleDiscoveryResult, CarlRuleDiscoveryWarning, CarlRuleDomainPayload, CarlRuleSource, CarlProjectStatus)
- `src/carl/injector.ts` - Updated type imports and references (CarlRuleDomainPayload, CarlInjectionInput)
- `src/carl/matcher.ts` - Updated type imports and references (CarlDomainMatchResult, CarlMatchDomainConfig, CarlMatchRequest, CarlMatchResult)
- `src/carl/signal-store.ts` - Updated type import (CarlSessionSignals)
- `src/carl/command-parity.ts` - Updated type import (CarlRuleDomainPayload)
- `src/carl/rule-cache.ts` - Updated type imports (CarlRuleDiscoveryResult, CarlRuleSourceScope)
- `src/carl/validate.ts` - Updated type import (CarlRuleDiscoveryWarning)
- `src/integration/plugin-hooks.ts` - Updated type imports (CarlRuleDomainPayload, CarlMatchDomainConfig)
- `tests/javascript/unit/validate.test.ts` - Updated type import (CarlRuleDiscoveryWarning → OpencarlRuleDiscoveryWarning)
- `tests/javascript/unit/injector.test.ts` - Updated type import (CarlInjectionInput → OpencarlInjectionInput)
- `tests/javascript/unit/matcher.test.ts` - Updated type imports (CarlMatchRequest, CarlMatchDomainConfig, CarlSessionSignals → Opencarl* variants)
- `tests/javascript/unit/command-parity.test.ts` - Updated type import (CarlRuleDomainPayload → OpencarlRuleDomainPayload)
- `tests/javascript/unit/rule-cache.test.ts` - Updated type import (CarlRuleDiscoveryResult → OpencarlRuleDiscoveryResult)
- `tests/javascript/integration/plugin-lifecycle.test.ts` - Updated imports from changed source files
- `tests/javascript/integration/rule-injection-pipeline.test.ts` - Updated type import (CarlInjectionInput → OpencarlInjectionInput)
- `tests/helpers/domain-factory.ts` - Updated type imports (CarlRuleDomainPayload, CarlMatchDomainConfig → Opencarl* variants)
- `tests/helpers/match-factory.ts` - Updated type imports (CarlMatchRequest, CarlSessionSignals → Opencarl* variants)

## Decisions Made

- Used "Opencarl" prefix (CamelCase, lowercase "carl") as specified in CONTEXT.md
- Compound names: CarlRuleDomainPayload → OpencarlRuleDomainPayload (lowercase "c" after prefix)
- Multiple "Carl" occurrences: Replace only the prefix (not compound names)
- Committed both tasks together for atomicity (all type changes in one commit)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - TypeScript compilation succeeded and all tests passed after updates.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Type renaming complete and verified. Ready for next plans in Phase 12 (Source Code Rebranding):
- 12-02: Update function names and identifiers
- 12-03: Update variable names and string literals
- 12-04: Update comments and documentation

All TypeScript type declarations now use Opencarl prefix, establishing the foundational naming convention for the rebranding effort.

---
*Phase: 12-source-code-rebranding*
*Completed: 2026-03-06*
