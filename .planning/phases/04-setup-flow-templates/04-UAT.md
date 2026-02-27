# Phase 4: Setup Flow & Templates - UAT

**Phase:** 04-setup-flow-templates
**Status:** diagnosed
**Started:** 2026-02-27

## Tests

| # | Test | Expected Behavior | Result | Severity |
|---|------|-------------------|--------|----------|
| 1 | Setup prompt when .carl/ missing | When .carl/ directory doesn't exist, CARL injects a prompt suggesting setup | FAIL | medium |
| 2 | /carl setup seeds templates | Running `/carl setup` creates starter template files in .carl/ | FAIL | blocker |
| 2a | recordPromptSignals error | Error: ReferenceError: recordPromptSignals is not defined at plugin-hooks.ts:186 | FAIL | blocker |
| 3 | Idempotent seeding | Running setup again preserves existing files (no overwrites) | - | - |
| 4 | Duplicate plugin warning | When CARL loads multiple times, user sees exactly one warning per session | UNCERTAIN | - |
| 5 | /carl docs shows documentation | `/carl docs` or `*carl docs` displays CARL documentation | FAIL | blocker |
| 6 | Quick reference first | Docs show quick reference section before full guide | BLOCKED | - |
| 7 | Regular *carl unchanged | `*carl` without `docs` still shows help mode | BLOCKED | - |

## Summary

- **Passed:** 0
- **Failed:** 3
- **Blocked:** 2
- **Uncertain:** 1
- **Skipped:** 1
- **Total:** 7

## Issues Found

### Issue 1: recordPromptSignals is not defined (BLOCKER)
- **Test:** 2, 5
- **Error:** `ReferenceError: recordPromptSignals is not defined at plugin-hooks.ts:186`
- **Impact:** All plugin functionality is broken - commands crash, setup fails
- **Root cause:** Missing import statement in `plugin-hooks.ts`

**Analysis:**
- `plugin-hooks.ts` uses 6 functions from `signal-store.ts` but imports NONE of them:
  - `recordPromptSignals` (line 186) - ❌ not imported
  - `recordToolSignals` (line 190) - ❌ not imported
  - `recordCommandSignals` (line 196) - ❌ not imported
  - `getSessionSignals` (line 253) - ❌ not imported
  - `getSessionPromptText` (line 254) - ❌ not imported
  - `consumeCommandSignals` (line 255) - ❌ not imported
- The fix: Add `import { recordPromptSignals, recordToolSignals, recordCommandSignals, getSessionSignals, getSessionPromptText, consumeCommandSignals } from "../carl/signal-store";`

**Artifacts affected:**
- `src/integration/plugin-hooks.ts` - missing import statement

### Issue 2: Setup prompt not appearing
- **Test:** 1
- **Error:** No setup prompt injected when .carl/ is missing
- **Impact:** Users don't get guided to run setup
- **Root cause:** Related to Issue 1 - plugin crashes in `chat.message` hook before `experimental.chat.system.transform` can run setup detection

### Issue 3: Duplicate detection unverified
- **Test:** 4
- **Error:** No duplicate warnings observed
- **Impact:** Cannot confirm detection works
- **Root cause:** Plugin crashes before duplicate detection can trigger
