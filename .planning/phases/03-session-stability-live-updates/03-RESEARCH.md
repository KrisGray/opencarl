# Phase 3: Session Stability & Live Updates - Research

**Researched:** 2026-02-26
**Domain:** OpenCode plugin lifecycle, session state, live reload, context management
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RULE-04 | Respect explicit opt-in for project rules before applying them | Ensure opt-in is tied to `.carl/` presence + manifest state; avoid implicit project activation elsewhere. |
| RULE-05 | Reload rules on `.carl/` changes without restarting OpenCode | Use OpenCode plugin file watcher event to trigger cache refresh; apply on next turn. |
| CTXT-02 | Apply context brackets (fresh/moderate/depleted) to select rules | Implement bracket selector that chooses CONTEXT rules based on token headroom. |
| CTXT-03 | Persist minimal state across compaction so rules stay consistent | Persist bracket/signal state through compaction or rehydrate from compacted transcript. |
</phase_requirements>

## Summary

Phase 3 needs a stable, session-aware rules pipeline: project rules should only activate when a `.carl/` directory exists, reload cleanly when `.carl/` changes, and use context brackets to pick the right CONTEXT rules. The current plugin reloads rule files on every turn via `loadCarlRules()` in `experimental.chat.system.transform`, but it does not implement opt-in gating beyond `.carl/` presence, does not track invalid-reload warnings once-per-session, and does not apply context bracket selection. Session signals are in-memory only and currently accumulate across the full session regardless of compaction, which conflicts with the “use whatever remains in transcript” requirement.

OpenCode plugin hooks provide two key integration points: `experimental.session.compacting` to inject state into compaction, and file watcher events (`file.watcher.updated`) for live reload. Token usage is available in `client.session.messages()` (per-message token telemetry), which can be used with a model context-size map to compute remaining context for bracket selection. The exact payload of watcher and session events is not documented in the official plugin docs, so the implementation should confirm event payloads by inspecting OpenCode plugin type definitions or testing against a running session.

**Primary recommendation:** Keep the existing per-turn rule load, add a session-scoped rule cache + warning tracker, implement CONTEXT bracket selection based on token headroom, and reset or rehydrate signal state at compaction to align with the compacted transcript.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|-------------|
| @opencode-ai/plugin | 1.2.15 | Plugin hooks + session/tool interfaces | Official OpenCode plugin API in use in repo. |
| @opencode-ai/sdk | 1.2.14 | Client session access | Used by plugins to read session messages and metadata. |
| zod | 4.1.8 | Manifest/rule validation | Already used in `src/carl/validate.ts`. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Node.js | >=16.7.0 | Runtime | Required by `package.json` in root. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| OpenCode file watcher events | Custom FS watchers | Higher complexity and inconsistent with OpenCode lifecycle. |
| OpenCode compaction hook | Manual transcript parsing | Risks drifting from actual compaction behavior. |

**Installation:**
```bash
npm install @opencode-ai/plugin @opencode-ai/sdk zod
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── carl/              # rule parsing, matching, injection
├── integration/       # OpenCode plugin hooks + paths
└── ...
```

### Pattern 1: Per-turn rule resolution in system transform
**What:** Load rules and match domains at `experimental.chat.system.transform` for each user turn.
**When to use:** Rule selection depends on current prompt + session signals and must update at next turn.
**Example:**
```typescript
// Source: src/integration/plugin-hooks.ts
"experimental.chat.system.transform": async (input, output) => {
  const discovery = loadCarlRules();
  const matchResult = matchDomainsForTurn({
    promptText,
    signals,
    domains: domainConfigs,
    globalExclude: discovery.globalExclude,
  });
  const injection = buildCarlInjection({
    domainPayloads: discovery.domainPayloads,
    matchedDomains: matchResult.matchedDomains,
  });
  if (injection) output.system.push(injection);
}
```

### Pattern 2: Compaction context preservation
**What:** Use `experimental.session.compacting` to add state that must survive compaction.
**When to use:** Session signal state or bracket state must align after compaction.
**Example:**
```typescript
// Source: https://opencode.ai/docs/plugins/index
"experimental.session.compacting": async (input, output) => {
  output.context.push("\n## CARL State\n- ...\n");
}
```

### Pattern 3: Live reload on file watcher update
**What:** Subscribe to OpenCode file watcher events to refresh cached rule state.
**When to use:** Only re-parse rules when `.carl/` files change, then apply on next turn.
**Example:**
```typescript
// Source: https://opencode.ai/docs/plugins/index (event list)
"file.watcher.updated": async (input) => {
  // if path under .carl/, mark cache dirty for next turn
}
```

### Anti-Patterns to Avoid
- **Persistent old signals after compaction:** Signal store keeps prior tokens even if transcript was compacted; must reset or rehydrate.
- **Reload warning spam:** Warnings should be once-per-session, not on every turn.
- **Context brackets applied globally:** Brackets must only affect CONTEXT domain rules.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Live reload detection | Custom FS watcher | OpenCode `file.watcher.updated` event | Keeps behavior aligned with OpenCode lifecycle. |
| Compaction continuity | Manual transcript parse | `experimental.session.compacting` hook | Matches OpenCode compaction flow. |
| Logging | `console.log` | `client.app.log` | Structured logs in OpenCode UI/logs. |

**Key insight:** OpenCode already exposes lifecycle hooks; use them to keep CARL state in sync without reinventing session management.

## Common Pitfalls

### Pitfall 1: Context bracket source mismatch
**What goes wrong:** Brackets are computed from message count or wall time, violating parity.
**Why it happens:** Token telemetry or model context limit is not exposed in current code.
**How to avoid:** Use `client.session.messages()` token usage + model context map; document assumptions.
**Warning signs:** Bracket flips do not correlate with token burn rate.

### Pitfall 2: Compaction keeps stale signals
**What goes wrong:** Session signal store still includes tokens that were compacted away.
**Why it happens:** Signal store is in-memory only and never reset on compaction.
**How to avoid:** On compaction, clear or rehydrate signal store to match compacted transcript.
**Warning signs:** Matched domains reference older prompts no longer in transcript.

### Pitfall 3: Reloading invalid rules silently
**What goes wrong:** Invalid manifest/domain changes fall back to global rules with no warning.
**Why it happens:** `loadCarlRules()` surfaces warnings but nothing emits or suppresses once-per-session warnings.
**How to avoid:** Track invalid reload state per session and emit a single warning; disable project rules until fixed.
**Warning signs:** Rules “disappear” without user feedback after editing `.carl/` files.

## Code Examples

Verified patterns from official sources:

### Inject compaction context
```typescript
// Source: https://opencode.ai/docs/plugins/index
export const CompactionPlugin: Plugin = async () => {
  return {
    "experimental.session.compacting": async (input, output) => {
      output.context.push("\n## Custom Context\n- Persist state here\n");
    },
  };
};
```

### Read token telemetry from session messages (plugin ecosystem)
```typescript
// Source: https://raw.githubusercontent.com/ramtinJ95/opencode-tokenscope/main/plugin/tokenscope.ts
const response = await client.session.messages({ path: { id: sessionID } });
const messages = (response as any)?.data ?? response ?? [];
// messages[].info.tokens includes cache/input/output usage
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static prompts only | Dynamic rule injection + plugin hooks | Existing in repo | Enables per-turn rule selection + live updates. |

**Deprecated/outdated:**
- Manual rule reloads or restart requirements are not aligned with OpenCode plugin hooks.

## Open Questions

1. **Where is model context limit exposed in OpenCode plugin APIs?**
   - What we know: token usage appears in `client.session.messages()` (telemetry fields) via ecosystem plugin.
   - What's unclear: official API surface for context limit / remaining context.
   - Recommendation: inspect `@opencode-ai/plugin` types or run a test plugin to log session info fields.

2. **What is the payload for `file.watcher.updated` and `session.compacted` events?**
   - What we know: events exist in OpenCode plugin event list.
   - What's unclear: path shape, debounce behavior, and session correlation.
   - Recommendation: log event payloads in a dev build before finalizing cache strategy.

## Sources

### Primary (HIGH confidence)
- https://opencode.ai/docs/plugins/index - plugin hooks and event list, compaction hook examples
- `src/integration/plugin-hooks.ts`
- `src/carl/loader.ts`
- `src/carl/signal-store.ts`

### Secondary (MEDIUM confidence)
- https://raw.githubusercontent.com/ramtinJ95/opencode-tokenscope/main/plugin/tokenscope.ts - session message telemetry usage
- https://raw.githubusercontent.com/ramtinJ95/opencode-tokenscope/main/plugin/tokenscope-lib/types.ts - token usage fields shape

### Tertiary (LOW confidence)
- https://github.com/anomalyco/opencode/issues/10575 - indicates token usage tracking exists

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - versions pulled from repo and plugin deps.
- Architecture: MEDIUM - OpenCode hook behavior documented but event payloads not.
- Pitfalls: MEDIUM - inferred from repo behavior + parity requirements.

**Research date:** 2026-02-26
**Valid until:** 2026-03-26
