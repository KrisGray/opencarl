# Phase 2: Matching, Injection & Command Parity - Research

**Researched:** 2026-02-25
**Domain:** CARL parity engine on OpenCode plugin hooks (matching, command handling, pre-turn system injection)
**Confidence:** MEDIUM-HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

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

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MATCH-01 | Match rules by recall keywords with exclude handling | Mirror `hooks/carl-hook.py` matching: global EXCLUDE short-circuits all matching; per-domain EXCLUDE blocks that domain before recall match. |
| MATCH-02 | Match rules using tool usage and file path context | Add a session signal store populated by `tool.execute.before/after` args; normalize file paths and tool names into searchable tokens used alongside prompt text. |
| MATCH-03 | Inject matched rules into the system prompt before the model turn | Use `experimental.chat.system.transform` hook (runs before LLM stream) to append CARL blocks as system content. |
| MATCH-04 | Maintain deterministic rule ordering in injected output | Enforce canonical order: bracket/context (if enabled) -> explicit command rules -> always-on domains -> matched domains; stable sort by domain name within each class unless parity fixtures require custom order. |
| MATCH-05 | Apply always-on domains consistently alongside matched domains | Preserve CARL semantics: `GLOBAL` treated always-on when active; manifest `*_ALWAYS_ON=true` domains loaded each turn, merged with matched set (deduped). |
| CMD-01 | Preserve `*carl` trigger for help/manager mode when supported | Parse user text for star-command tokens and map `*carl` to COMMANDS domain CARL rules; keep behavior in normal prompts. |
| CMD-02 | Provide `/carl` fallback when `*` triggers cannot be intercepted | Implement explicit slash command path via OpenCode command execution route + `command.execute.before` hook to inject equivalent CARL parts. |
| CMD-03 | Support star-command modes for custom domains (e.g., `*brief`) | Reuse commands-file pattern `{COMMAND}_RULE_N`, detect one or more `*name` tokens, inject corresponding command rule groups. |
| CMD-04 | Display CARL help/manager guidance consistent with existing docs | Use resources in `resources/skills/carl-help/CARL-OVERVIEW.md` and `resources/commands/carl/manager.md` as source-of-truth output content. |
| CTXT-01 | Capture prompt text and tool usage for matching decisions | Prompt text is available in message parts; tool usage available through tool hooks and persisted tool parts (`MessageV2.ToolPart.state.input`). |
| SAFE-01 | Enforce `EXCLUDE` keywords to prevent unintended rule loads | Preserve hard exclusion precedence and add explicit tests for overlap/ambiguity and recall+exclude collisions. |
</phase_requirements>

## Summary

Phase 2 should be planned as a parity port from the current Claude hook engine (`hooks/carl-hook.py`) into OpenCode plugin hooks, not as a new matching design. The existing CARL behavior already defines precedence, ordering, and command semantics: global exclusion first, per-domain exclusion second, always-on plus matched domain composition, explicit star-command rule injection, and deterministic formatting. The plan should treat that file and `.carl-template/*` as behavioral fixtures.

OpenCode has a reliable pre-turn insertion point for system-level instructions: `experimental.chat.system.transform`. In OpenCode core, this hook is triggered before model streaming and before message conversion to provider payload, which is exactly where Phase 2 needs injection. OpenCode also exposes command and tool hooks (`command.execute.before`, `tool.execute.before`, `tool.execute.after`) that can supply command parity and tool/file-path context signals without patching OpenCode core.

Main planning risk is not API availability; it is semantic drift from CARL parity (especially EXCLUDE precedence, ordering stability, and command edge cases). Plan this phase around golden parity fixtures derived from `hooks/carl-hook.py` behavior and run them against a TypeScript matcher/injector pipeline.

**Primary recommendation:** Build a dedicated CARL parity engine module (`matcher + injector + signal store`) and wire it to `experimental.chat.system.transform`, with slash-command fallback through `command.execute.before`, validated by parity fixture tests copied from current Python behavior.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@opencode-ai/plugin` | 1.2.14 | Hook interface (`experimental.chat.system.transform`, `tool.execute.*`, `command.execute.before`) | Official OpenCode plugin surface; includes exact hooks needed for this phase. |
| `@opencode-ai/sdk` | 1.2.14 | Optional typed logging + session interactions | First-party SDK used by plugin runtime context. |
| TypeScript | 5.9.x | CARL parity engine implementation | Matches existing project direction and OpenCode plugin examples. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Existing `src/carl/validate.ts` parser | in-repo | Reuse manifest/domain parsing semantics from Phase 1 | Use directly; avoid introducing parser drift. |
| Zod | 4.1.8 | Input normalization and guardrails | Optional for signal-store schemas and parsing utility boundaries. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `experimental.chat.system.transform` | inject as user text in message hooks | Breaks system-priority semantics and parity; not acceptable. |
| Hooking only prompt text | Tool/file-path signal extraction from session history only | Works partially, but weaker deterministic capture than explicit tool hooks. |

**Installation:**
```bash
bun add @opencode-ai/plugin@1.2.14 @opencode-ai/sdk@1.2.14
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── carl/
│   ├── loader.ts                # existing source discovery + precedence
│   ├── validate.ts              # existing manifest/domain parsing
│   ├── matcher.ts               # parity matching (recall/exclude/always-on)
│   ├── command-parity.ts        # star + slash command normalization
│   ├── signal-store.ts          # per-session prompt/tool/path signals
│   ├── injector.ts              # deterministic composition + block rendering
│   └── types.ts                 # shared parity result types
└── integration/
    └── plugin.ts                # hook wiring for OpenCode
```

### Pattern 1: Pre-Turn System Injection
**What:** Build CARL block before each model turn by mutating `output.system` in `experimental.chat.system.transform`.
**When to use:** Every user turn that may need CARL behavior.
**Example:**
```typescript
// Source: anomalyco/opencode packages/opencode/src/session/llm.ts
"experimental.chat.system.transform": async ({ sessionID }, output) => {
  const injection = await carlEngine.buildSystemBlock(sessionID)
  if (injection) output.system.push(injection)
}
```

### Pattern 2: Signal Accumulation for CTXT-01
**What:** Persist minimal per-session signals from user text + tool calls + file paths.
**When to use:** Matching decisions for current turn.
**Example:**
```typescript
// Source: plugin hook contracts + MessageV2 tool state
"tool.execute.before": async ({ sessionID, tool }, output) => {
  signalStore.recordTool(sessionID, tool, output.args)
  signalStore.recordPaths(sessionID, extractPaths(output.args))
}
```

### Pattern 3: Deterministic Composition Pipeline
**What:** Separate selection from rendering; render from an ordered, deduped selection plan.
**When to use:** Any injection generation.
**Example:**
```typescript
const selected = selectDomains({ manifest, promptSignals, toolSignals })
const ordered = orderDomains(selected) // stable deterministic order
return renderCarlRulesBlock(ordered)
```

### Anti-Patterns to Avoid
- **Injecting as non-system content:** loses precedence and can break parity.
- **Regex-only matching without normalization:** repeats known substring false-positive bug unless explicitly intended by parity tests.
- **Command handling in multiple places without a single resolver:** creates drift between `*domain` and `/carl` fallback behavior.
- **Relying on plugin load order for domain order:** domain order must be explicit in CARL engine, not implicit in plugin sequencing.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Hook lifecycle emulation | Custom event timing assumptions | Official OpenCode hook points (`experimental.chat.system.transform`, `command.execute.before`, `tool.execute.*`) | Core already guarantees turn timing. |
| New manifest parser | Ad hoc parser in matcher | Reuse existing `parseManifest`/`parseDomainRules` | Avoid semantic divergence from Phase 1 and CARL files. |
| Slash command framework | Bespoke command router | OpenCode command system + `command.execute.before` | Native command execution path already exists. |

**Key insight:** Most Phase 2 failure modes are semantic mismatch, not missing primitives. Reuse existing parsing and OpenCode hooks; spend effort on parity tests.

## Common Pitfalls

### Pitfall 1: EXCLUDE precedence drift
**What goes wrong:** Domains load even when exclusion terms are present.
**Why it happens:** Matching order implemented as recall-first instead of exclusion-first.
**How to avoid:** Enforce CARL order: global exclude -> domain exclude -> recall match.
**Warning signs:** Fixtures where recall+exclude coexist pass unexpectedly.

### Pitfall 2: Non-deterministic output ordering
**What goes wrong:** Same input yields different rule block order.
**Why it happens:** Iteration over object keys/maps without explicit sorting policy.
**How to avoid:** Convert to sorted arrays before render; lock ordering in tests.
**Warning signs:** Snapshot tests flap between runs.

### Pitfall 3: Command parity split-brain
**What goes wrong:** `*carl` and `/carl` produce different behavior.
**Why it happens:** Separate logic paths with no shared resolver.
**How to avoid:** Single command resolver function used by both star-token detection and slash-command hook.
**Warning signs:** Help text/rule sets differ by trigger surface.

### Pitfall 4: Tool/path context captured too late
**What goes wrong:** Matching ignores recent tool/file context.
**Why it happens:** Only reading current user prompt; no accumulated session signals.
**How to avoid:** Update signal store in `tool.execute.before/after`, consume on next injection build.
**Warning signs:** File-centric domains never load unless prompt text explicitly mentions paths.

## Code Examples

Verified patterns from current sources:

### Exclusion-first matching (CARL parity)
```python
# Source: hooks/carl-hook.py
global_excluded = check_exclusions(prompt_lower, global_exclude)
if global_excluded:
    return matched, excluded, global_excluded

if domain_exclusions:
    excluded[domain] = domain_exclusions
    continue
```

### OpenCode pre-turn system injection hook
```typescript
// Source: anomalyco/opencode packages/opencode/src/session/llm.ts
await Plugin.trigger(
  "experimental.chat.system.transform",
  { sessionID: input.sessionID, model: input.model },
  { system },
)
```

### Slash command interception before prompt execution
```typescript
// Source: anomalyco/opencode packages/opencode/src/session/prompt.ts
await Plugin.trigger(
  "command.execute.before",
  { command: input.command, sessionID: input.sessionID, arguments: input.arguments },
  { parts },
)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Claude hook (`UserPromptSubmit`) returns `hookSpecificOutput.additionalContext` | OpenCode plugins mutate system prompt via `experimental.chat.system.transform` | OpenCode plugin API (current) | Equivalent pre-turn injection can be achieved without core patching. |
| Command behavior encoded in prompt scanner only | OpenCode supports command execution hooks and slash command config | OpenCode command/plugin evolution | `/carl` fallback can be native and deterministic. |

**Deprecated/outdated:**
- Planning around `tui.prompt.append` for authoritative system injection is outdated for this phase; use system transform hook.

## Open Questions

1. **Exact star-command interception boundary in all OpenCode surfaces**
   - What we know: Star tokens in user text can be parsed from message text; slash commands have dedicated flow.
   - What's unclear: Whether every input surface preserves raw `*token` text identically before preprocessing.
   - Recommendation: Add parity fixtures for TUI, SDK prompt API, and command-invocation paths; if any surface strips stars, route users to `/carl` fallback there.

2. **Keyword tokenization strictness for parity**
   - What we know: Current Python parity uses `re.search(re.escape(keyword))`, which allows substring matches.
   - What's unclear: Whether to preserve this bug-for-bug now or tighten matching immediately.
   - Recommendation: Preserve current behavior in Phase 2 for strict parity; schedule stricter tokenization as a separate opt-in change.

## Sources

### Primary (HIGH confidence)
- https://raw.githubusercontent.com/anomalyco/opencode/1172fa418e9aa5e0fcfccea326c6c9d35e1d57fd/packages/plugin/src/index.ts - authoritative plugin hook contracts (`experimental.chat.system.transform`, `command.execute.before`, `tool.execute.*`).
- https://raw.githubusercontent.com/anomalyco/opencode/1172fa418e9aa5e0fcfccea326c6c9d35e1d57fd/packages/opencode/src/session/llm.ts - confirms system transform is executed before model stream.
- https://raw.githubusercontent.com/anomalyco/opencode/1172fa418e9aa5e0fcfccea326c6c9d35e1d57fd/packages/opencode/src/session/prompt.ts - confirms command and tool hook trigger points.
- `hooks/carl-hook.py` - current CARL parity source behavior for matching, exclusions, command detection, ordering.

### Secondary (MEDIUM confidence)
- https://opencode.ai/docs/plugins/ - plugin loading, event list, load order documentation.
- https://opencode.ai/docs/commands/ - slash-command config and behavior in OpenCode.
- `.carl-template/manifest`, `.carl-template/commands`, `.carl-template/context` - canonical CARL file semantics to preserve.
- `resources/skills/carl-help/CARL-OVERVIEW.md`, `resources/commands/carl/manager.md` - expected help/manager guidance content.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - pinned to current OpenCode package versions already in repo.
- Architecture: HIGH - verified directly in OpenCode source files (hook contracts + call sites).
- Pitfalls: MEDIUM - parity risks are clear, but cross-surface star-command behavior still needs runtime verification.

**Research date:** 2026-02-25
**Valid until:** 2026-03-27
