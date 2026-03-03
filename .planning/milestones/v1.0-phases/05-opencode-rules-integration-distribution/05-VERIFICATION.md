---
phase: 05-opencode-rules-integration-distribution
verified: 2026-03-03T13:00:00Z
status: passed
score: 3/3 must-haves verified
re_verification: No — initial verification

gaps: []

human_verification:
  - test: "Run /carl setup --integrate in a test project with existing AGENTS.md"
    expected: "CARL section appended to AGENTS.md with HTML comment markers"
    why_human: "Requires running OpenCode and testing integration flow end-to-end"
  - test: "Run /carl setup --remove after integration"
    expected: "CARL section removed from AGENTS.md, existing content preserved"
    why_human: "Requires running OpenCode and testing removal flow"
  - test: "Run npm run build:opencode && npm run publish:opencode (dry-run)"
    expected: "dist/plugin.js generated, verification passes, publish workflow executes"
    why_human: "Requires npm credentials and actual publish attempt to fully verify"
  - test: "Install @krisgray/opencode-carl-plugin from npm in fresh OpenCode project"
    expected: "Plugin loads from opencode.json plugin list, /carl commands work"
    why_human: "Requires npm publish and OpenCode plugin loading to verify"
---

# Phase 5: OpenCode Rules Integration & Distribution Verification Report

**Phase Goal:** Optional rules integration via AGENTS.md and npm-based distribution available for users who want them.
**Verified:** 2026-03-03T13:00:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth | Status | Evidence |
| --- | ----- | ------ | -------- |
| 1 | Setup can update AGENTS.md with CARL guidance when requested via --integrate flag | ✓ VERIFIED | agents-writer.ts exports integrateCarl(); plugin-hooks.ts handles /carl setup --integrate |
| 2 | Users can find CARL usage guidance in AGENTS.md with documented precedence vs OpenCode rules | ✓ VERIFIED | CARL-AGENTS.md contains "Rule Precedence" section explaining both sets apply |
| 3 | CARL can be loaded via npm from the opencode.json plugin list | ✓ VERIFIED | package.opencode.json configured; dist/plugin.js exists; README documents plugin config |

**Score:** 3/3 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `src/integration/agents-writer.ts` | AGENTS.md integration logic | ✓ VERIFIED | 119 lines; exports integrateCarl() and removeCarlIntegration() |
| `src/carl/setup.ts` | Extended setup with integration flags | ✓ VERIFIED | 303 lines; exports IntegrationOptions, runIntegration() |
| `resources/docs/CARL-AGENTS.md` | AGENTS.md section content | ✓ VERIFIED | 106 lines; includes Rule Precedence section |
| `package.opencode.json` | NPM package config | ✓ VERIFIED | name: @krisgray/opencode-carl-plugin; main: dist/plugin.js |
| `tsconfig.build.json` | TypeScript build config | ✓ VERIFIED | outDir: ./dist; module: Node16 |
| `src/plugin.ts` | Plugin entrypoint | ✓ VERIFIED | exports hooks via createCarlPluginHooks() |
| `scripts/build-opencode.ts` | Build script | ✓ VERIFIED | compiles to dist/, verifies plugin.js exists |
| `scripts/verify-dist.ts` | Pre-publish verification | ✓ VERIFIED | checks required files and directories |
| `scripts/publish-opencode.ts` | Dual-package publish | ✓ VERIFIED | handles package swap workflow |
| `README-opencode.md` | NPM documentation | ✓ VERIFIED | 112 lines; includes opencode.json config example |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| src/carl/setup.ts | src/integration/agents-writer.ts | import and call | ✓ WIRED | Imports integrateCarl, removeCarlIntegration; calls in runIntegration() |
| src/integration/plugin-hooks.ts | src/carl/setup.ts | import and call | ✓ WIRED | Imports runIntegration; calls for --integrate/--remove commands |
| package.opencode.json | dist/plugin.js | main field | ✓ WIRED | "main": "dist/plugin.js" |
| scripts/build-opencode.ts | dist/ | tsc compilation | ✓ WIRED | Uses tsconfig.build.json, verifies plugin.js exists |
| scripts/publish-opencode.ts | scripts/verify-dist.ts | verification before publish | ✓ WIRED | Runs verify-dist.ts before npm publish |
| README-opencode.md | opencode.json | configuration example | ✓ WIRED | Documents plugin list configuration |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ----------- | ----------- | ------ | -------- |
| INST-03 | 05-01 | Setup updates AGENTS.md with CARL integration when requested | ✓ SATISFIED | --integrate/--remove flags implemented |
| INST-05 | 05-02, 05-03 | Plugin distributed via npm, loaded from opencode.json plugin list | ✓ SATISFIED | package.opencode.json configured; dist/ built |
| INTE-01 | 05-01 | Update AGENTS.md with CARL usage guidance | ✓ SATISFIED | CARL-AGENTS.md content; integrateCarl() function |
| INTE-02 | — | Update opencode.json instructions to include CARL docs | ⚠️ INTENTIONALLY EXCLUDED | Per user decision in RESEARCH.md - using AGENTS.md only |
| INTE-03 | 05-01 | Document precedence between CARL and OpenCode rules | ✓ SATISFIED | CARL-AGENTS.md includes "Rule Precedence" section |

**Note on INTE-02:** This requirement appears in ROADMAP.md for Phase 5 but was explicitly excluded by user decision (documented in 05-RESEARCH.md line 57: "NOT IMPLEMENTED per user decision - using AGENTS.md only"). This is not a gap but an intentional scope decision.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| src/integration/plugin-hooks.ts | 135 | `return null` | ℹ️ Info | Legitimate early return in computeTokenUsage() when no messages - not a stub |

No blocking anti-patterns found. All implementations are substantive.

### Human Verification Required

#### 1. AGENTS.md Integration Flow

**Test:** In a test project with existing AGENTS.md, run `/carl setup --integrate`
**Expected:** CARL section appended with `<!-- CARL-START - DO NOT EDIT -->` and `<!-- CARL-END - DO NOT EDIT -->` markers
**Why human:** Requires running OpenCode and testing integration flow end-to-end

#### 2. AGENTS.md Removal Flow

**Test:** After integration, run `/carl setup --remove`
**Expected:** CARL section removed, existing AGENTS.md content preserved
**Why human:** Requires running OpenCode and testing removal flow

#### 3. NPM Build Verification

**Test:** Run `npm run build:opencode` then `npm run publish:opencode` (with --dry-run)
**Expected:** dist/plugin.js generated, verify-dist passes, publish workflow executes correctly
**Why human:** Requires npm credentials and actual publish attempt to fully verify

#### 4. NPM Package Installation

**Test:** After publishing, install @krisgray/opencode-carl-plugin in fresh OpenCode project
**Expected:** Plugin loads from opencode.json plugin list, /carl commands function correctly
**Why human:** Requires npm publish and OpenCode plugin loading to verify

### Gaps Summary

**No gaps found.** All success criteria verified:

1. ✅ **AGENTS.md Integration:** Users can run `/carl setup --integrate` to add CARL section with HTML comment markers
2. ✅ **Precedence Documentation:** CARL-AGENTS.md documents rule precedence between CARL and OpenCode
3. ✅ **NPM Distribution:** Package configured for @krisgray/opencode-carl-plugin with dist/plugin.js entrypoint

**INTE-02 Note:** The opencode.json instructions integration was explicitly excluded by user decision (documented in RESEARCH.md), not a gap.

---

_Verified: 2026-03-03T13:00:00Z_
_Verifier: OpenCode (gsd-verifier)_
