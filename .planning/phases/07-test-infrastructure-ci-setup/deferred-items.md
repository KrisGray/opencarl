# Deferred Items

Items discovered during plan execution that are out of scope for the current task.

## Phase 07-01: Jest Test Infrastructure Setup

### Pre-existing TypeScript Compilation Errors

**Discovered during:** Task 4 (coverage collection)

**Issue:** Multiple source files in `src/` have TypeScript compilation errors related to esModuleInterop:
- `import fs from "fs"` - Module has no default export
- `import path from "path"` - Module can only be default-imported using the 'esModuleInterop' flag
- `import os from "os"` - Module has no default export
- Property 'at' does not exist on type 'string[][]'

**Affected files:**
- src/carl/command-parity.ts
- src/carl/duplicate-detector.ts
- src/carl/help-text.ts
- src/carl/loader.ts
- src/carl/rule-cache.ts
- src/carl/session-overrides.ts
- src/carl/signal-store.ts
- src/carl/setup.ts
- src/carl/validate.ts
- src/integration/agents-writer.ts
- src/integration/opencode-config.ts
- src/integration/paths.ts
- src/integration/plugin-hooks.ts

**Impact:** 
- Coverage collection fails when running `npm run test:coverage` (Jest cannot instrument these files)
- Pre-existing issue, not caused by Jest setup
- Does not affect test execution (tests run successfully)
- Coverage threshold enforcement works correctly (fails at 0% as expected)

**Recommendation:** 
- Add `"esModuleInterop": true` to tsconfig.json
- Update imports to use `import * as fs from "fs"` or namespace imports
- This should be addressed in a future phase before writing unit tests for these modules

**Out of scope rationale:** These are pre-existing codebase issues unrelated to the test infrastructure setup. Fixing them would require modifying source files outside the scope of this plan.
