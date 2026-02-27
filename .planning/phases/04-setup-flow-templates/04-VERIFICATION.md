---
phase: 04-setup-flow-templates
verified: 2026-02-27T16:15:00Z
status: passed
score: 11/11 must-haves verified
---

# Phase 4: Setup Flow & Templates Verification Report

**Phase Goal:** Users can install CARL with seeded templates and accessible docs.
**Verified:** 2026-02-27T16:15:00Z
**Status:** PASSED
**Re-verification:** No - initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User sees setup prompt when .carl/ is missing | ✓ VERIFIED | `checkSetupNeeded()` returns `needed:true` when no .carl/ found; `plugin-hooks.ts` calls `buildSetupPrompt()` and pushes to `output.system` |
| 2 | Setup seeds starter templates from .carl-template/ | ✓ VERIFIED | `seedCarlTemplates()` recursively copies from template dir; `.carl-template/` exists with manifest, commands, context, global files |
| 3 | Existing files are preserved (idempotent operation) | ✓ VERIFIED | `seedCarlTemplates()` lines 124-126: `await fs.promises.access(destPath)` skips existing files |
| 4 | Setup falls back to global ~/.carl/ if project not writable | ✓ VERIFIED | `checkSetupNeeded()` lines 66-72: catch block on `fs.accessSync` falls back to `path.join(homeDir, ".carl")` |
| 5 | Duplicate plugin loads are detected | ✓ VERIFIED | `checkDuplicateLoad()` checks `loadedPluginPaths` Set; `registerPluginLoad()` called at module init |
| 6 | User sees warning once per session (not every turn) | ✓ VERIFIED | `duplicateWarningGuard` Set keyed by sessionId; `warningEmitted` flag returned from check |
| 7 | Warning includes both plugin paths and actionable guidance | ✓ VERIFIED | `getDuplicateWarning()` shows both paths and suggests removing from `opencode.json plugins array` |
| 8 | First load wins - plugin continues normally | ✓ VERIFIED | No exception thrown on duplicate; plugin continues after `console.warn()` |
| 9 | User can access CARL docs via /carl docs or *carl docs | ✓ VERIFIED | `command-parity.ts` line 174: `isDocsRequest = promptText.toLowerCase().includes('docs')` |
| 10 | Documentation includes quick reference first | ✓ VERIFIED | `buildCarlDocsGuidance()` extracts content before `---` separator; `CARL-DOCS.md` has "## Quick Reference" section |
| 11 | Full guide is available with expand option | ✓ VERIFIED | `buildCarlDocsGuidance()` returns `fullGuide` field; note about full guide added to response |

**Score:** 11/11 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/carl/setup.ts` | Setup flow logic with template seeding | ✓ VERIFIED | 252 lines, exports: `checkSetupNeeded`, `seedCarlTemplates`, `buildSetupPrompt`, `runSetup` |
| `src/integration/plugin-hooks.ts` | Setup detection on first plugin load | ✓ VERIFIED | 320 lines, contains `setupChecked` guard, calls setup functions |
| `src/carl/duplicate-detector.ts` | Duplicate plugin path detection | ✓ VERIFIED | 116 lines, exports: `registerPluginLoad`, `checkDuplicateLoad`, `getDuplicateWarning`, `clearDuplicateState` |
| `resources/docs/CARL-DOCS.md` | Bundled CARL documentation | ✓ VERIFIED | 243 lines, contains Quick Reference + Full Guide sections |
| `src/carl/help-text.ts` | Docs loading function | ✓ VERIFIED | 90 lines, exports: `buildCarlDocsGuidance`, `CarlDocsGuidance` interface |
| `src/carl/command-parity.ts` | Docs subcommand handling | ✓ VERIFIED | 211 lines, detects "docs" in prompt, calls `buildCarlDocsGuidance()` |

### Artifact Verification Details

#### src/carl/setup.ts
- **Exists:** ✓ (252 lines)
- **Substantive:** ✓ (real fs operations, idempotent logic, progress reporting)
- **Wired:** ✓ (imported in plugin-hooks.ts)
- **Exports:** `checkSetupNeeded`, `seedCarlTemplates`, `buildSetupPrompt`, `runSetup`

#### src/carl/duplicate-detector.ts
- **Exists:** ✓ (116 lines)
- **Substantive:** ✓ (path normalization, session guard, Set-based tracking)
- **Wired:** ✓ (imported in plugin-hooks.ts, called at module init)
- **Exports:** `registerPluginLoad`, `checkDuplicateLoad`, `getDuplicateWarning`, `clearDuplicateState`

#### resources/docs/CARL-DOCS.md
- **Exists:** ✓ (243 lines)
- **Substantive:** ✓ (complete documentation with Quick Reference, Full Guide, troubleshooting)
- **Wired:** ✓ (loaded by `buildCarlDocsGuidance()` in help-text.ts)

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| plugin-hooks.ts | setup.ts | `import { checkSetupNeeded, buildSetupPrompt, runSetup }` | ✓ WIRED | Line 6 import, called in transform hook and command handler |
| plugin-hooks.ts | duplicate-detector.ts | `import { registerPluginLoad, checkDuplicateLoad, getDuplicateWarning }` | ✓ WIRED | Line 8-10 import, registerPluginLoad at line 30, checkDuplicateLoad at line 228 |
| command-parity.ts | help-text.ts | `import { buildCarlDocsGuidance }` | ✓ WIRED | Line 4 import, called at line 177 for docs requests |
| setup.ts | paths.ts | `import { findProjectCarl, findGlobalCarl }` | ✓ WIRED | Line 3 import, used in checkSetupNeeded() |
| setup.ts | .carl-template/ | `seedCarlTemplates()` with fs.copyFile | ✓ WIRED | Template dir exists with manifest, commands, context, global |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| command-parity.ts | 77 | `return {}` | ℹ️ Info | Intentional - returns empty map when command file doesn't exist, not a stub |

**No blocking anti-patterns detected.**

### Template Directory Verification

```
.carl-template/
├── manifest        # Domain registry (1700 bytes)
├── commands        # Star-command definitions (5154 bytes)
├── context         # Context bracket rules (2286 bytes)
├── global          # GLOBAL rules (1095 bytes)
├── example-custom-domain  # Example for users (1592 bytes)
└── sessions/       # Session state directory
```

All template files present and substantive.

### Human Verification Required

None - all truths can be verified programmatically through code inspection.

### Gaps Summary

**No gaps found.** All must-haves verified:
- Setup detection and template seeding fully implemented
- Duplicate detection with session-scoped warnings working
- Documentation access via *carl docs and /carl docs commands complete

---

## Verification Summary

| Category | Result |
|----------|--------|
| Artifacts | 6/6 verified (exists + substantive + wired) |
| Truths | 11/11 verified |
| Key Links | 5/5 wired |
| Anti-Patterns | 0 blockers |
| Gaps | 0 |

**Phase Status:** ✅ PASSED

All phase objectives achieved. Ready to proceed to Phase 5.

---

_Verified: 2026-02-27T16:15:00Z_
_Verifier: OpenCode (gsd-verifier)_
