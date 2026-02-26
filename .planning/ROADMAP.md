# Roadmap: CARL OpenCode Plugin

## Overview

Deliver CARL parity inside OpenCode by first establishing reliable plugin loading and rule discovery, then matching/injection and command parity, followed by session stability (opt-in, reload, compaction), and finally setup resources plus OpenCode rules integration and distribution options.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Plugin Foundation & Rule Discovery** - OpenCode loads CARL locally and discovers rules with correct precedence.
- [x] **Phase 2: Matching, Injection & Command Parity** - Rules are matched/injected deterministically with command modes preserved. (completed 2026-02-26)
- [ ] **Phase 3: Session Stability & Live Updates** - Opt-in, reload, brackets, and compaction keep rule behavior stable.
- [ ] **Phase 4: Setup Flow & Templates** - Users get a smooth install flow with seeded templates and docs access.
- [ ] **Phase 5: OpenCode Rules Integration & Distribution** - Optional rules integration and npm distribution are available.

## Phase Details

### Phase 1: Plugin Foundation & Rule Discovery
**Goal**: OpenCode can load CARL locally and resolve rules from global/project scopes with validation.
**Depends on**: Nothing (first phase)
**Requirements**: INST-01, RULE-01, RULE-02, RULE-03, RULE-06, SAFE-02
**Success Criteria** (what must be TRUE):
  1. User can load CARL from `.opencode/plugins/` or `~/.config/opencode/plugins/` and OpenCode recognizes the plugin.
  2. Global and project `.carl/` rules are discovered with project-over-global precedence and manifest fields parsed.
  3. When `.carl/` locations are absent, rules load from `.opencode/carl/` without failure.
  4. Invalid manifests/domains are skipped with a warning and do not crash the plugin.
**Plans**: 2 plans

Plans:
- [ ] 01-plugin-foundation-rule-discovery/01-01-PLAN.md — OpenCode plugin entrypoint and local deps
- [ ] 01-plugin-foundation-rule-discovery/01-02-PLAN.md — Rule discovery loader, validation, and fallback

### Phase 2: Matching, Injection & Command Parity
**Goal**: Matched CARL rules are injected before model turns, with command modes preserved.
**Depends on**: Phase 1
**Requirements**: MATCH-01, MATCH-02, MATCH-03, MATCH-04, MATCH-05, CMD-01, CMD-02, CMD-03, CMD-04, CTXT-01, SAFE-01
**Success Criteria** (what must be TRUE):
  1. When prompts or tool usage match recall keywords, the corresponding rules appear in the system prompt before the model turn.
  2. `EXCLUDE` keywords prevent rule injection even when recall keywords match.
  3. Always-on domains are injected alongside matched domains in deterministic order.
  4. Users can trigger `*carl` (or `/carl` fallback) to access help/manager mode and `*domain` star-commands for custom modes.
  5. Rule matching incorporates tool usage and file path context signals.
**Plans**: 4 plans

Plans:
- [ ] 02-matching-injection-command-parity/02-01-PLAN.md — Parity matcher and session signal capture
- [ ] 02-matching-injection-command-parity/02-02-PLAN.md — Deterministic pre-turn system injection wiring
- [ ] 02-matching-injection-command-parity/02-03-PLAN.md — Star/slash command parity and help guidance
- [ ] 02-matching-injection-command-parity/02-04-PLAN.md — End-to-end Phase 2 parity fixture runner

### Phase 3: Session Stability & Live Updates
**Goal**: Rule behavior stays stable across sessions, reloads, and compaction.
**Depends on**: Phase 2
**Requirements**: RULE-04, RULE-05, CTXT-02, CTXT-03
**Success Criteria** (what must be TRUE):
  1. Project rules apply only after explicit opt-in and remain off by default.
  2. Updating `.carl/` files refreshes rule behavior without restarting OpenCode.
  3. Context brackets (fresh/moderate/depleted) influence which rules are selected in long sessions.
  4. After compaction, rule selection remains consistent with prior context state.
**Plans**: 2 plans

Plans:
- [x] 03-session-stability-live-updates/03-01-PLAN.md — Project opt-in gating and live reload caching
- [ ] 03-session-stability-live-updates/03-02-PLAN.md — Context brackets and compaction continuity

### Phase 4: Setup Flow & Templates
**Goal**: Users can install CARL with seeded templates and accessible docs.
**Depends on**: Phase 3
**Requirements**: INST-02, INST-04, TEMP-01, TEMP-02
**Success Criteria** (what must be TRUE):
  1. Running setup copies the plugin and seeds `.carl/` templates when missing.
  2. Duplicate plugin loads are detected and the user sees a single warning per session.
  3. CARL command/skill documentation is accessible from OpenCode workflows.
**Plans**: TBD

Plans:
- [ ] TBD during planning

### Phase 5: OpenCode Rules Integration & Distribution
**Goal**: Optional rules integration and npm-based distribution are available for users who want them.
**Depends on**: Phase 4
**Requirements**: INST-03, INST-05, INTE-01, INTE-02, INTE-03
**Success Criteria** (what must be TRUE):
  1. Setup can update `opencode.json` and/or `AGENTS.md` with CARL guidance when requested.
  2. Users can find CARL usage guidance in `AGENTS.md` and `opencode.json` with documented precedence vs OpenCode rules.
  3. CARL can be loaded via npm from the `opencode.json` plugin list.
**Plans**: TBD

Plans:
- [ ] TBD during planning

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Plugin Foundation & Rule Discovery | 0/TBD | Not started | - |
| 2. Matching, Injection & Command Parity | 0/TBD | Complete    | 2026-02-26 |
| 3. Session Stability & Live Updates | 1/2 | In Progress | - |
| 4. Setup Flow & Templates | 0/TBD | Not started | - |
| 5. OpenCode Rules Integration & Distribution | 0/TBD | Not started | - |
