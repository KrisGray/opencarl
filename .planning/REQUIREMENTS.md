# Requirements: CARL OpenCode Plugin

**Defined:** 2026-02-25
**Core Value:** Keep CARL's dynamic rule injection working seamlessly inside OpenCode with full parity and minimal user friction.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Installation & Distribution

- [x] **INST-01**: User can load CARL as a local OpenCode plugin from `.opencode/plugins/` and `~/.config/opencode/plugins/`
- [ ] **INST-02**: Setup flow copies the plugin and seeds `.carl/` templates when missing
- [ ] **INST-03**: Setup flow updates `opencode.json` and/or `AGENTS.md` with CARL integration when requested
- [ ] **INST-04**: Plugin detects duplicate loads and warns once per session
- [ ] **INST-05**: Plugin can be distributed via npm and loaded from `opencode.json` plugin list

### Rule Discovery & Scoping

- [x] **RULE-01**: Load global rules from `~/.carl/` (manifest + domain files)
- [x] **RULE-02**: Load project rules from `./.carl/` and apply project-over-global precedence
- [x] **RULE-03**: Support CARL manifest fields: `STATE`, `RECALL`, `EXCLUDE`, `ALWAYS_ON`
- [x] **RULE-04**: Respect explicit opt-in for project rules before applying them
- [x] **RULE-05**: Reload rules on `.carl/` changes without restarting OpenCode
- [x] **RULE-06**: Fall back to `.opencode/carl/` when `.carl/` locations are absent

### Matching & Injection

- [x] **MATCH-01**: Match rules by recall keywords with exclude handling
- [x] **MATCH-02**: Match rules using tool usage and file path context
- [x] **MATCH-03**: Inject matched rules into the system prompt before the model turn
- [x] **MATCH-04**: Maintain deterministic rule ordering in injected output
- [x] **MATCH-05**: Apply always-on domains consistently alongside matched domains

### Commands & Modes

- [x] **CMD-01**: Preserve `*carl` trigger for help/manager mode when supported
- [x] **CMD-02**: Provide `/carl` fallback when `*` triggers cannot be intercepted
- [x] **CMD-03**: Support star-command modes for custom domains (e.g., `*brief`)
- [x] **CMD-04**: Display CARL help/manager guidance consistent with existing docs

### Context & Compaction

- [x] **CTXT-01**: Capture prompt text and tool usage for matching decisions
- [ ] **CTXT-02**: Apply context brackets (fresh/moderate/depleted) to select rules
- [ ] **CTXT-03**: Persist minimal state across compaction so rules stay consistent

### Safety & Validation

- [x] **SAFE-01**: Enforce `EXCLUDE` keywords to prevent unintended rule loads
- [x] **SAFE-02**: Validate manifest/domain format and skip invalid entries with warnings

### OpenCode Rules Integration

- [ ] **INTE-01**: Update `AGENTS.md` with CARL usage guidance (project scope)
- [ ] **INTE-02**: Update `opencode.json` `instructions` to include CARL docs when requested
- [ ] **INTE-03**: Document precedence between CARL rules and OpenCode rules/instructions

### Templates & Resources

- [ ] **TEMP-01**: Copy `.carl-template/` into `.carl/` on install if missing
- [ ] **TEMP-02**: Make CARL command/skill docs available in OpenCode workflows

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhancements

- **ENHN-01**: Rich rule editor UI for managing domains and manifests
- **ENHN-02**: Remote rule fetching with signed/verified sources only

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Auto-executing tools/commands | Security risk and violates user control expectations |
| Always-on global injection with no opt-out | Causes prompt bloat and misapplied rules |
| Black-box prompt rewriting | Undermines trust and debuggability |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INST-01 | Phase 1 | Complete |
| INST-02 | Phase 4 | Pending |
| INST-03 | Phase 5 | Pending |
| INST-04 | Phase 4 | Pending |
| INST-05 | Phase 5 | Pending |
| RULE-01 | Phase 1 | Complete |
| RULE-02 | Phase 1 | Complete |
| RULE-03 | Phase 1 | Complete |
| RULE-04 | Phase 3 | Complete |
| RULE-05 | Phase 3 | Complete |
| RULE-06 | Phase 1 | Complete |
| MATCH-01 | Phase 2 | Complete |
| MATCH-02 | Phase 2 | Complete |
| MATCH-03 | Phase 2 | Complete |
| MATCH-04 | Phase 2 | Complete |
| MATCH-05 | Phase 2 | Complete |
| CMD-01 | Phase 2 | Complete |
| CMD-02 | Phase 2 | Complete |
| CMD-03 | Phase 2 | Complete |
| CMD-04 | Phase 2 | Complete |
| CTXT-01 | Phase 2 | Complete |
| CTXT-02 | Phase 3 | Pending |
| CTXT-03 | Phase 3 | Pending |
| SAFE-01 | Phase 2 | Complete |
| SAFE-02 | Phase 1 | Complete |
| INTE-01 | Phase 5 | Pending |
| INTE-02 | Phase 5 | Pending |
| INTE-03 | Phase 5 | Pending |
| TEMP-01 | Phase 4 | Pending |
| TEMP-02 | Phase 4 | Pending |
| ENHN-01 | v2 | Deferred |
| ENHN-02 | v2 | Deferred |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-25*
*Last updated: 2026-02-25 after initial definition*
