# Architecture Research

**Domain:** OpenCode plugin architecture for prompt-injection (CARL parity)
**Researched:** 2026-02-25
**Confidence:** MEDIUM

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     OpenCode Runtime                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Plugin Entry │  │ Hook Router  │  │ Event Stream │        │
│  └─────┬────────┘  └─────┬────────┘  └─────┬────────┘        │
│        │                 │                 │                 │
├────────┴─────────────────┴─────────────────┴────────────────┤
│                         CARL Plugin                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Rule     │  │ Matcher  │  │ Prompt       │  │ Command   │ │
│  │ Loader   │  │ /Scorer  │  │ Injector     │  │ Handler   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────────┘  └────┬──────┘ │
│       │             │            │                  │        │
├───────┴─────────────┴────────────┴──────────────────┴────────┤
│                File System + OpenCode Rules                  │
│    .carl/manifest + domain files + AGENTS.md/opencode.json   │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Plugin entrypoint | Register hooks, own lifecycle | TypeScript `Plugin` export in `.opencode/plugins/` |
| Rule loader | Read `.carl/manifest` and domain files (global + project) | FS reader + schema validation + caching |
| Matcher/scorer | Keyword match, exclusions, always-on rules, star commands | Rule engine with deterministic ordering |
| Prompt injector | Compose rule blocks and context brackets into prompt | Hook handler that appends/updates prompt parts |
| Command handler | Detect `*carl`/`*command` and map to rule modes | TUI/command hook that rewrites prompt scope |
| Watcher/cache | Track manifest/domain changes for hot reload | `file.watcher.updated` hook + in-memory cache |
| Rules integrator | Sync/seed `AGENTS.md` and `opencode.json` hints | One-time installer or opt-in hook |

## Recommended Project Structure

```
.opencode/
├── plugins/
│   └── carl-plugin.ts       # Plugin entrypoint and hook wiring
├── package.json             # Local deps for plugin if needed
└── README.md                # Optional local plugin notes
src/
├── carl/
│   ├── loader.ts            # Manifest + domain file loading
│   ├── matcher.ts           # Keyword match/exclude/always-on logic
│   ├── injector.ts          # Prompt assembly + context brackets
│   ├── commands.ts          # Star-command parsing + routing
│   ├── cache.ts             # In-memory cache + mtime tracking
│   └── types.ts             # Rule + manifest types
└── integration/
    ├── opencode-rules.ts    # AGENTS.md/opencode.json helpers
    └── paths.ts             # Global/project path resolution
```

### Structure Rationale

- **.opencode/plugins/:** Keep the plugin load location aligned with OpenCode discovery rules.
- **src/carl/:** Isolate CARL logic from OpenCode glue to preserve portability and testing.
- **src/integration/:** Separate cross-cutting file writes from rule evaluation.

## Architectural Patterns

### Pattern 1: Event-Driven Hook Pipeline

**What:** Subscribe to OpenCode events and route them through a single rule pipeline.
**When to use:** Prompt injection or policy enforcement plugins.
**Trade-offs:** Simple integration, but must be careful about hook ordering and side effects.

**Example:**
```typescript
export const CarlPlugin: Plugin = async (ctx) => {
  const engine = createCarlEngine(ctx)
  return {
    "tui.prompt.append": async (input, output) => {
      const injection = await engine.buildInjection(input.prompt)
      output.append = `${output.append}\n${injection}`
    },
  }
}
```

### Pattern 2: Deterministic Rule Resolution

**What:** Always compute injections from the same ordered inputs (manifest → domains → matches).
**When to use:** Any rule system with overrides and exclusions.
**Trade-offs:** Predictable behavior, but requires explicit precedence rules.

**Example:**
```typescript
const rules = mergeRules(globalRules, projectRules)
const matched = matchRules(rules, { query, starCommand })
const ordered = sortByPrecedence(matched)
```

### Pattern 3: Prompt Composition with Context Brackets

**What:** Inject different rule blocks based on context budgets (fresh/moderate/depleted).
**When to use:** Long-running sessions where prompt size varies.
**Trade-offs:** Better relevance under compaction, but adds branching complexity.

## Data Flow

### Request Flow

```
[User prompt]
    ↓
[Hook: tui.prompt.append] → [Rule loader] → [Matcher/scorer]
    ↓                         ↓                ↓
[Prompt injector] ← [Context bracket] ← [Rule selection]
    ↓
[Final prompt to model]
```

### State Management

```
[In-memory cache]
    ↓ (load)
[Manifest/domains] ← [File watcher] → [Cache refresh]
```

### Key Data Flows

1. **Prompt injection:** user prompt → rule resolution → bracketed injection appended.
2. **Star-command routing:** prompt input → command handler → forced rule set → injection.
3. **Rule updates:** file change event → cache invalidation → next prompt recompute.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Local plugin with in-memory cache is sufficient. |
| 1k-100k users | Add debounce on file watcher and memoize rule resolution. |
| 100k+ users | Keep plugin stateless; move heavy parsing to build-time tools if needed. |

### Scaling Priorities

1. **First bottleneck:** file IO on every prompt; fix with cache + mtime checks.
2. **Second bottleneck:** rule matching per prompt; fix with precomputed indexes.

## Anti-Patterns

### Anti-Pattern 1: Injecting without provenance

**What people do:** Append large rule blobs without identifying source or bracket.
**Why it's wrong:** Hard to debug and violates user expectations about rule origin.
**Do this instead:** Add a short header with source (global/project/domain) and bracket level.

### Anti-Pattern 2: Global-only rule resolution

**What people do:** Ignore project `.carl/` files when global rules exist.
**Why it's wrong:** Breaks expected local overrides.
**Do this instead:** Merge global + project with explicit precedence and exclusions.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| None | Local filesystem + OpenCode hooks | Prefer local plugin distribution. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Plugin entrypoint ↔ CARL engine | Direct function calls | Keep OpenCode-specific types at the boundary. |
| CARL engine ↔ Filesystem | Read + cache + watcher | Avoid writes except installer/setup. |
| CARL engine ↔ OpenCode rules | File helpers | Update `AGENTS.md`/`opencode.json` only when configured. |

## Suggested Build Order

1. **Rule loader + types:** foundation for manifest/domain compatibility.
2. **Matcher/scorer:** implement precedence, exclusions, always-on, star-command logic.
3. **Prompt injector:** compose brackets and injection output.
4. **Plugin entrypoint:** wire OpenCode hooks (e.g., `tui.prompt.append`, `command.executed`).
5. **Watcher/cache:** optimize IO and enable hot reload.
6. **Rules integrator + installer:** optional setup for `AGENTS.md`/`opencode.json`.

## Sources

- https://opencode.ai/docs/plugins/ (official plugin structure, events, load order)

---
*Architecture research for: OpenCode plugin architecture for prompt injection*
*Researched: 2026-02-25*
