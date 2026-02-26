---
phase: 02-matching-injection-command-parity
verified: 2026-02-26T11:24:37Z
status: human_needed
score: 5/5 must-haves verified
human_verification:
  - test: "Run OpenCode with CARL plugin and issue a prompt containing a recall keyword"
    expected: "Matched domain rules appear in system context before the model responds"
    why_human: "System prompt ordering and runtime hook execution require live OpenCode validation"
  - test: "Trigger *carl and /carl in OpenCode"
    expected: "Both triggers activate CARL help/manager guidance with identical rule payloads"
    why_human: "Hook execution path and UI behavior cannot be verified by static analysis"
  - test: "Invoke a tool that touches a file path then issue a prompt with no recall keywords"
    expected: "Tool/path signals still match domains and inject rules"
    why_human: "Tool event capture and end-to-end matching depends on runtime tool payloads"
---

# Phase 2: Matching, Injection & Command Parity Verification Report

**Phase Goal:** Matched CARL rules are injected before model turns, with command modes preserved.
**Verified:** 2026-02-26T11:24:37Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | When prompts or tool usage match recall keywords, corresponding rules appear in the system prompt before the model turn. | ✓ VERIFIED | `createCarlPluginHooks` uses `experimental.chat.system.transform` to `matchDomainsForTurn` and `buildCarlInjection`, then `output.system.push(injection)` (src/integration/plugin-hooks.ts). |
| 2 | `EXCLUDE` keywords prevent rule injection even when recall keywords match. | ✓ VERIFIED | `matchDomainsForTurn` short-circuits on global exclude and blocks domain matches when excludes hit; injection uses `matchedDomains` only (src/carl/matcher.ts, src/integration/plugin-hooks.ts). |
| 3 | Always-on domains are injected alongside matched domains in deterministic order. | ✓ VERIFIED | `buildCarlInjection` builds sections (command → always-on → matched) with alphabetical ordering and dedupe (src/carl/injector.ts). |
| 4 | Users can trigger `*carl` (or `/carl` fallback) for help/manager mode and `*domain` star-commands for custom modes. | ✓ VERIFIED | `resolveCarlCommandSignals` parses `*token` commands; `/carl` recorded via `command.execute.before` and consumed in system transform (src/carl/command-parity.ts, src/integration/plugin-hooks.ts). |
| 5 | Rule matching incorporates tool usage and file path context signals. | ✓ VERIFIED | `recordToolSignals` captures tool/path tokens; `getSessionSignals` feeds `matchDomainsForTurn` (src/carl/signal-store.ts, src/integration/plugin-hooks.ts). |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `src/carl/matcher.ts` | Parity matcher with exclusion-first selection | ✓ VERIFIED | Implements global + domain exclusion, recall matching, deterministic ordering. Wired via `matchDomainsForTurn` usage in plugin hooks + parity scripts. |
| `src/carl/signal-store.ts` | Per-session signal capture for prompt/tool/path tokens | ✓ VERIFIED | Captures prompt/tool/path tokens, bounded retention, used by plugin hooks. |
| `src/carl/types.ts` | Typed contracts for matching inputs/results | ✓ VERIFIED | Defines match request/result, global exclude, domain payload contracts. |
| `scripts/carl-matching-parity-smoke.ts` | Executable parity checks for matcher behavior | ✓ VERIFIED | Standalone script exercising match fixtures. |
| `src/carl/injector.ts` | Deterministic CARL injection composer | ✓ VERIFIED | Builds `<carl-rules>` blocks with ordered sections; used in plugin hooks + parity runner. |
| `src/carl/loader.ts` | Rule payloads for always-on/matched rendering | ✓ VERIFIED | Returns domain payloads, globalExclude, devmode; used in plugin hooks. |
| `src/integration/plugin-hooks.ts` | OpenCode system-transform hook wiring | ✓ VERIFIED | Wires signal capture, matching, command resolution, and injection. |
| `.opencode/plugins/carl.ts` | Plugin entrypoint delegating to hook wiring | ✓ VERIFIED | Imports `createCarlPluginHooks` and returns it. |
| `scripts/carl-injection-smoke.ts` | Pre-turn injection parity smoke checks | ✓ VERIFIED | Standalone deterministic injection checks. |
| `src/carl/command-parity.ts` | Shared resolver for star/slash command parity | ✓ VERIFIED | Parses star commands + slash overrides, resolves command payloads. |
| `src/carl/help-text.ts` | Help/manager guidance from docs | ✓ VERIFIED | Reads `CARL-OVERVIEW.md` and `manager.md`, strips frontmatter. |
| `scripts/carl-command-parity-smoke.ts` | Command parity smoke checks | ✓ VERIFIED | Verifies *carl, *domain, /carl parity. |
| `scripts/carl-phase2-parity.ts` | End-to-end parity runner | ✓ VERIFIED | Executes matching/injection/command fixtures + critical links. |
| `scripts/fixtures/phase2/matching.json` | Matching/exclusion fixtures | ✓ VERIFIED | Contains recall/exclude/tool/path cases. |
| `scripts/fixtures/phase2/injection.json` | Injection ordering fixtures | ✓ VERIFIED | Covers ordering + dedupe. |
| `scripts/fixtures/phase2/commands.json` | Star/slash command fixtures | ✓ VERIFIED | Covers *carl, *domain, /carl parity. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| src/carl/matcher.ts | src/carl/signal-store.ts | consumes normalized session signals | ✓ VERIFIED | Indirect wiring: `getSessionSignals` in plugin hooks supplies `signals` to `matchDomainsForTurn` (src/integration/plugin-hooks.ts). |
| src/carl/matcher.ts | src/carl/types.ts | typed match contracts | ✓ VERIFIED | Types imported in matcher (src/carl/matcher.ts). |
| scripts/carl-matching-parity-smoke.ts | src/carl/matcher.ts | fixture parity checks | ✓ VERIFIED | Script imports `matchDomainsForTurn`. |
| src/integration/plugin-hooks.ts | src/carl/injector.ts | system.transform hook | ✓ VERIFIED | `experimental.chat.system.transform` calls `buildCarlInjection`. |
| src/carl/injector.ts | src/carl/loader.ts | domain rules + always-on metadata | ✓ VERIFIED | Indirect wiring: plugin hooks call `loadCarlRules` and pass payloads into `buildCarlInjection`. |
| .opencode/plugins/carl.ts | src/integration/plugin-hooks.ts | plugin hook registration | ✓ VERIFIED | Plugin entry returns `createCarlPluginHooks`. |
| src/integration/plugin-hooks.ts | src/carl/command-parity.ts | command.execute.before + prompt parsing | ✓ VERIFIED | Hook consumes command signals and calls `resolveCarlCommandSignals`. |
| src/carl/command-parity.ts | src/carl/help-text.ts | help/manager command mapping | ✓ VERIFIED | Help guidance passed from plugin hooks into resolver (`buildCarlHelpGuidance().combined`). |
| scripts/carl-command-parity-smoke.ts | src/carl/command-parity.ts | fixture parity assertions | ✓ VERIFIED | Script imports `resolveCarlCommandSignals`. |
| scripts/carl-phase2-parity.ts | src/carl/matcher.ts | matching fixtures | ✓ VERIFIED | Parity runner imports `matchDomainsForTurn`. |
| scripts/carl-phase2-parity.ts | src/carl/injector.ts | injection ordering | ✓ VERIFIED | Parity runner imports `buildCarlInjection`. |
| scripts/carl-phase2-parity.ts | src/carl/command-parity.ts | command parity assertions | ✓ VERIFIED | Parity runner imports `resolveCarlCommandSignals`. |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| MATCH-01 | 02-01, 02-04 | Match rules by recall keywords with exclude handling | ✓ SATISFIED | `matchDomainsForTurn` recall/exclude logic + fixtures (src/carl/matcher.ts; scripts/fixtures/phase2/matching.json). |
| MATCH-02 | 02-01 | Match rules using tool usage and file path context | ✓ SATISFIED | `recordToolSignals` + `getSessionSignals` feed matcher (src/carl/signal-store.ts, src/integration/plugin-hooks.ts). |
| MATCH-03 | 02-02 | Inject matched rules before model turn | ✓ SATISFIED | System transform hook appends injection to `output.system` (src/integration/plugin-hooks.ts). |
| MATCH-04 | 02-02, 02-04 | Deterministic rule ordering | ✓ SATISFIED | `buildCarlInjection` sorts domains; fixtures verify ordering (src/carl/injector.ts; scripts/fixtures/phase2/injection.json). |
| MATCH-05 | 02-02 | Always-on domains injected alongside matched | ✓ SATISFIED | `buildCarlInjection` always-on section, matcher skips always-on for recall (src/carl/injector.ts; src/carl/matcher.ts). |
| CMD-01 | 02-03, 02-04 | Preserve `*carl` trigger for help/manager mode | ✓ SATISFIED | Star command parsing and help guidance injection (src/carl/command-parity.ts; src/carl/help-text.ts). |
| CMD-02 | 02-03 | Provide `/carl` fallback | ✓ SATISFIED | `command.execute.before` records `/carl` and resolver handles overrides (src/integration/plugin-hooks.ts). |
| CMD-03 | 02-03 | Support star-command modes for custom domains | ✓ SATISFIED | `resolveCarlCommandSignals` parses `*token` commands, uses commands file rules (src/carl/command-parity.ts). |
| CMD-04 | 02-03, 02-04 | Display CARL help/manager guidance consistent with docs | ✓ SATISFIED | `buildCarlHelpGuidance` reads docs sources (resources/skills/carl-help/CARL-OVERVIEW.md, resources/commands/carl/manager.md). |
| CTXT-01 | 02-01 | Capture prompt text and tool usage for matching | ✓ SATISFIED | `recordPromptSignals` + `recordToolSignals` and retrieval (src/carl/signal-store.ts; src/integration/plugin-hooks.ts). |
| SAFE-01 | 02-01, 02-04 | Enforce EXCLUDE keywords | ✓ SATISFIED | Global/domain exclusion logic in matcher (src/carl/matcher.ts) + fixtures. |

**Orphaned requirements:** None found. Phase 2 requirements in REQUIREMENTS.md are all covered by Phase 2 plan frontmatter.

### Anti-Patterns Found

No blocking anti-patterns detected in Phase 2 key files.

### Human Verification Required

1. **Pre-turn injection behavior**

**Test:** Run OpenCode with CARL plugin and issue a prompt containing a recall keyword.
**Expected:** Matched domain rules appear in system context before the model responds.
**Why human:** Requires live OpenCode runtime validation.

2. **Star vs slash command parity**

**Test:** Trigger `*carl` and `/carl` in OpenCode.
**Expected:** Both triggers yield identical CARL help/manager guidance payloads.
**Why human:** Hook execution and UI output must be confirmed in runtime.

3. **Tool/path signal matching**

**Test:** Invoke a tool that touches a file path, then issue a prompt without recall keywords.
**Expected:** Tool/path signals still trigger matching and injection.
**Why human:** Depends on tool event payloads and OpenCode runtime flow.

### Gaps Summary

No implementation gaps found in static verification. Phase 2 logic appears complete; live runtime validation is still required.

---

_Verified: 2026-02-26T11:24:37Z_
_Verifier: Claude (gsd-verifier)_
