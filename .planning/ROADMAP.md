# Roadmap: CARL OpenCode Plugin

## Milestones

- ✅ **v1.0 MVP** - Phases 1-5 (shipped 2026-03-03)
- 🚧 **v1.1 Polish & Complete Integration** - Phase 6 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

<details>
<summary>✅ v1.0 MVP (Phases 1-5) - SHIPPED 2026-03-03</summary>

- [x] **Phase 1: Plugin Foundation & Rule Discovery** - OpenCode loads CARL locally and discovers rules with correct precedence.
- [x] **Phase 2: Matching, Injection & Command Parity** - Rules are matched/injected deterministically with command modes preserved.
- [x] **Phase 3: Session Stability & Live Updates** - Opt-in, reload, brackets, and compaction keep rule behavior stable.
- [x] **Phase 4: Setup Flow & Templates** - Users get a smooth install flow with seeded templates and docs access.
- [x] **Phase 5: OpenCode Rules Integration & Distribution** - Optional rules integration and npm distribution are available.

### Phase 1: Plugin Foundation & Rule Discovery
**Goal**: OpenCode can load CARL locally and resolve rules from global/project scopes with validation.
**Depends on**: Nothing (first phase)
**Requirements**: INST-01, RULE-01, RULE-02, RULE-03, RULE-06, SAFE-02
**Success Criteria** (what must be TRUE):
  1. User can load CARL from `.opencode/plugins/` or `~/.config/opencode/plugins/` and OpenCode recognizes the plugin.
  2. Global and project `.carl/` rules are discovered with project-over-global precedence and manifest fields parsed.
  3. When `.carl/` locations are absent, rules load from `.opencode/carl/` without failure.
  4. Invalid manifests/domains are skipped with a warning and do not crash the plugin.
**Plans**: 2 plans (complete)

Plans:
- [x] 01-plugin-foundation-rule-discovery/01-01-PLAN.md
- [x] 01-plugin-foundation-rule-discovery/01-02-PLAN.md

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
**Plans**: 4 plans (complete)

Plans:
- [x] 02-matching-injection-command-parity/02-01-PLAN.md
- [x] 02-matching-injection-command-parity/02-02-PLAN.md
- [x] 02-matching-injection-command-parity/02-03-PLAN.md
- [x] 02-matching-injection-command-parity/02-04-PLAN.md

### Phase 3: Session Stability & Live Updates
**Goal**: Rule behavior stays stable across sessions, reloads, and compaction.
**Depends on**: Phase 2
**Requirements**: RULE-04, RULE-05, CTXT-02, CTXT-03
**Success Criteria** (what must be TRUE):
  1. Project rules apply only after explicit opt-in and remain off by default.
  2. Updating `.carl/` files refreshes rule behavior without restarting OpenCode.
  3. Context brackets (fresh/moderate/depleted) influence which rules are selected in long sessions.
  4. After compaction, rule selection remains consistent with prior context state.
**Plans**: 2 plans (complete)

Plans:
- [x] 03-session-stability-live-updates/03-01-PLAN.md
- [x] 03-session-stability-live-updates/03-02-PLAN.md

### Phase 4: Setup Flow & Templates
**Goal**: Users can install CARL with seeded templates and accessible docs.
**Depends on**: Phase 3
**Requirements**: INST-02, INST-04, TEMP-01, TEMP-02
**Success Criteria** (what must be TRUE):
  1. Running setup copies the plugin and seeds `.carl/` templates when missing.
  2. Duplicate plugin loads are detected and the user sees a single warning per session.
  3. CARL command/skill documentation is accessible from OpenCode workflows.
**Plans**: 4 plans (complete)

Plans:
- [x] 04-setup-flow-templates/04-01-PLAN.md
- [x] 04-setup-flow-templates/04-02-PLAN.md
- [x] 04-setup-flow-templates/04-03-PLAN.md
- [x] 04-setup-flow-templates/04-04-PLAN.md

### Phase 5: OpenCode Rules Integration & Distribution
**Goal**: Optional rules integration via AGENTS.md and npm-based distribution available for users who want them.
**Depends on**: Phase 4
**Requirements**: INST-03, INST-05, INTE-01, INTE-03
**Success Criteria** (what must be TRUE):
  1. Setup can update AGENTS.md with CARL guidance when requested via --integrate flag.
  2. Users can find CARL usage guidance in AGENTS.md with documented precedence vs OpenCode rules.
  3. CARL can be loaded via npm from the opencode.json plugin list.
**Plans**: 3 plans (complete)

Plans:
- [x] 05-opencode-rules-integration-distribution/05-01-PLAN.md
- [x] 05-opencode-rules-integration-distribution/05-02-PLAN.md
- [x] 05-opencode-rules-integration-distribution/05-03-PLAN.md

</details>

### 🚧 v1.1 Polish & Complete Integration (In Progress)

**Milestone Goal:** Complete remaining INTE-02 requirement and polish v1.0 with better developer experience.

- [ ] **Phase 6: Integration & Developer Experience** - Complete opencode.json integration and add troubleshooting/diagnostic tools.

### Phase 6: Integration & Developer Experience
**Goal**: Users have complete OpenCode configuration integration and can troubleshoot plugin issues independently
**Depends on**: Phase 5
**Requirements**: INTE-02, DX-01, DX-02, DX-03
**Success Criteria** (what must be TRUE):
  1. User can add CARL docs to their opencode.json instructions via setup command
  2. User sees clear, actionable error messages when the plugin fails to load
  3. User can enable debug logging to understand CARL's rule matching decisions
  4. User can reference a troubleshooting guide for common issues
**Plans**: TBD

Plans:
- [ ] 06-integration-developer-experience/06-01-PLAN.md — opencode.json instructions integration (INTE-02)
- [ ] 06-integration-developer-experience/06-02-PLAN.md — Actionable error messages (DX-01)
- [ ] 06-integration-developer-experience/06-03-PLAN.md — Debug logging system (DX-02)
- [ ] 06-integration-developer-experience/06-04-PLAN.md — Troubleshooting guide (DX-03)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Plugin Foundation | v1.0 | 2/2 | Complete | 2026-03-03 |
| 2. Matching & Injection | v1.0 | 4/4 | Complete | 2026-02-26 |
| 3. Session Stability | v1.0 | 2/2 | Complete | 2026-02-26 |
| 4. Setup Flow | v1.0 | 4/4 | Complete | 2026-02-27 |
| 5. Rules Integration | v1.0 | 3/3 | Complete | 2026-03-03 |
| 6. Integration & DX | v1.1 | 0/4 | Not started | - |

---
*Roadmap created: 2026-02-25*
*Last updated: 2026-03-03 for v1.1 milestone*
