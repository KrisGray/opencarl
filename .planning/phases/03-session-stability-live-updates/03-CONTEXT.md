# Phase 3: Session Stability & Live Updates - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Keep CARL rule behavior stable across sessions, live reloads, context brackets, and compaction. This phase only clarifies how stability behavior works; it does not add new capabilities beyond parity.

</domain>

<decisions>
## Implementation Decisions

### Project opt-in behavior (Claude parity)
- Opt-in is controlled by configuration + directory presence; no prompts or explicit opt-in commands.
- Project rules are present only when a project `.carl/` directory exists (local install or copied templates).
- When both global and project rules exist, **project rules override global** (project wins).
- Opt-out is per-domain: set each `{DOMAIN}_STATE=inactive` in the project manifest (no single PROJECT_STATE toggle).
- Per-session overrides may disable domains via `.carl/sessions/{session_id}.json` (inherit/true/false) in parity systems.

### Live reload behavior (Claude parity)
- Any change inside `.carl/` (manifest or domain files) triggers a reload.
- Changes apply on the **next prompt/turn** (no mid-turn hot reload).
- If any invalid manifest/domain change is detected, **disable all project rules** until fixed and warn the user.
- Reload warnings should appear **once per session**, not repeatedly.

### Context brackets behavior (Claude parity)
- Bracket state is computed from **token usage / context remaining** (not message count or time).
- Use **four brackets**: FRESH (≥60%), MODERATE (≥40%), DEPLETED (≥25%), CRITICAL (<25%).
- CRITICAL maps to depleted rules but must emit a critical warning.
- Brackets affect **only CONTEXT domain rules**; other domains load as normal via recall/always-on.
- Bracket flips **immediately** on threshold crossing (no hysteresis).

### Compaction continuity (Claude parity)
- After compaction, matching uses **whatever remains in the transcript**; no extra trimming.
- Tool/path signals still count **if they remain in the transcript**.
- No special compaction handling: no cache resets, no warnings, no behavior changes.

### Claude's Discretion
- Exact UX copy for warnings (reload invalid, critical context) as long as parity intent is preserved.

</decisions>

<specifics>
## Specific Ideas

- Bracket thresholds: FRESH ≥60%, MODERATE ≥40%, DEPLETED ≥25%, CRITICAL <25%.
- Invalid `.carl/` changes should disable project rules until corrected and warn once per session.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-session-stability-live-updates*
*Context gathered: 2026-02-26*
