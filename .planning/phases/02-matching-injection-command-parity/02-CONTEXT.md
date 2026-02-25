# Phase 2: Matching, Injection & Command Parity - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver deterministic CARL rule matching and injection behavior before model turns, with command-mode parity (`*carl`, `/carl` fallback, and `*domain` modes) preserved in OpenCode.

This phase defines how matching, exclusion, injection ordering, and command behavior should work. It does not add new capabilities beyond parity.

</domain>

<decisions>
## Implementation Decisions

### Matching sensitivity & triggers
- Locked decision: **Claude parity**. Matching behavior should mirror existing CARL/Claude behavior for prompt text, tool usage, and file path context signals.
- Any edge-case interpretation should default to existing CARL semantics rather than introducing new matching rules.

### EXCLUDE behavior in ambiguous cases
- Locked decision: **Claude parity**. EXCLUDE handling should mirror existing CARL behavior exactly, including overlap/ambiguity scenarios.
- If recall and EXCLUDE both appear, behavior should match current CARL outcomes.

### Injection composition & ordering expectations
- Locked decision: **Claude parity**. Injection composition (matched + always-on) and deterministic ordering should follow existing CARL ordering behavior.
- Ordering should remain stable and predictable in the same situations where CARL is stable today.

### Command parity UX (`*carl`, `/carl`, `*domain`)
- Locked decision: **Claude parity**. Command behavior should match existing CARL user expectations.
- Preserve `*carl` and `*domain` behavior when supported; use `/carl` fallback only where star interception is unavailable (consistent with parity expectations).

### Claude's Discretion
- Internal implementation details needed to achieve parity are at Claude's discretion.
- If exact parity requires choosing between equivalent technical approaches, prefer the approach that best matches observable CARL behavior.

</decisions>

<specifics>
## Specific Ideas

- User directive for all discussed gray areas: **"Claude parity"**.
- Downstream research/planning should treat parity as the primary acceptance lens for matching, exclusion, injection ordering, and command behavior.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-matching-injection-command-parity*
*Context gathered: 2026-02-25*
