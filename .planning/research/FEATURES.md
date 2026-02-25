# Feature Research

**Domain:** OpenCode prompt-injection / rule-injection plugins
**Researched:** 2026-02-25
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Local plugin install + load order | OpenCode loads plugins from local directories and npm; rule-injection plugins must fit that flow | LOW | Must work from `.opencode/plugins/` and `~/.config/opencode/plugins/` with standard config precedence | 
| Rule discovery at global + project scopes | Users expect rules to be found in standard locations and scoped to project vs global | MEDIUM | Mirrors OpenCode config/rules scoping; avoid custom path requirements | 
| Conditional rule matching (globs/keywords/tools) | Rule injection is expected to adapt to context, not be always-on | MEDIUM | Common in existing plugin patterns; include OR logic and clear matching rules | 
| System prompt injection hook | Core value is injecting rules into the system prompt before the model runs | HIGH | Requires OpenCode plugin events and system transform hooks | 
| Context capture from tools/messages | Matching depends on knowing files/tools and prompt text | MEDIUM | Tool hooks for paths + message hooks for keywords; track per-session state | 
| Compaction-safe state | OpenCode compacts sessions; injected state must survive | MEDIUM | Use compaction hook to persist critical context | 
| Safety guardrails (do-not-read, allow/deny) | Rule injection plugins are expected to prevent unsafe or irrelevant injections | MEDIUM | Provide skip lists, size limits, and exclusions to avoid prompt bloat | 

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| CARL-style domain manifest + star-commands | Maintains existing CARL UX; explicit mode switches | HIGH | Star-commands preferred; fall back to `/carl` if needed | 
| Context bracket heuristics (fresh/moderate/depleted) | Better injection timing and reduced prompt noise | MEDIUM | Applies rules only when context quality suggests it | 
| Rule provenance + debug tracing | Users can see why a rule was injected and from where | MEDIUM | Log matched rules, conditions, and source paths | 
| Incremental state tracking (no full rescans) | Faster, more reliable injections for long sessions | HIGH | Capture paths from tool hooks; only seed from history once | 
| Rule linting + validation | Prevents broken metadata and overly-broad keywords | MEDIUM | Validate frontmatter; warn on risky patterns | 
| Hybrid integration with AGENTS.md + instructions | Aligns with OpenCode rules system while preserving CARL | MEDIUM | Combine rule sources; allow explicit precedence | 

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Auto-executing tools/commands | "Make it fix itself" | Security risk and violates user control | Use rule-only guidance + explicit commands | 
| Remote rule fetching by default | "Keep rules in one place" | Supply-chain risk and offline fragility | Optional, explicit, signed URLs only | 
| Always-on global injection with no opt-out | "Consistency across projects" | Prompt bloat and misapplied rules | Scoped rules + per-project overrides | 
| Black-box prompt rewriting | "Hide complexity" | Hard to debug and undermines trust | Transparent injection with logging | 

## Feature Dependencies

```
Rule discovery (global + project)
    └──requires──> System prompt injection hook
               └──requires──> Conditional matching engine (globs/keywords/tools)
                          └──requires──> Context capture (tool hooks + message hooks)

Compaction-safe state ──enhances──> Context capture

Rule provenance + debug tracing ──enhances──> Conditional matching engine

Context bracket heuristics ──enhances──> System prompt injection hook

Hybrid AGENTS.md integration ──conflicts──> Always-on global injection
```

### Dependency Notes

- **System prompt injection requires rule discovery:** No rules to inject without discovery at startup.
- **Conditional matching requires context capture:** Globs/keywords/tools need the latest paths, prompt text, and tool list.
- **Compaction-safe state enhances context capture:** Prevents rules from disappearing after session compression.
- **Hybrid AGENTS.md integration conflicts with always-on global injection:** Rules must respect OpenCode precedence to avoid duplicate/contradicting instructions.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] Local plugin install + load order — required for OpenCode adoption
- [ ] Rule discovery at global + project scopes — preserves CARL workflows
- [ ] Conditional rule matching + injection — core value of prompt-injection plugin
- [ ] Context capture from tools/messages — enables matching to work
- [ ] Compaction-safe state — prevents rule loss in long sessions

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Rule provenance + debug tracing — improves trust and troubleshooting
- [ ] Rule linting + validation — reduces misconfigurations
- [ ] Context bracket heuristics — reduce prompt noise

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Hybrid AGENTS.md + instructions synthesis — more complex precedence logic
- [ ] Rich rule editor UI — nice-to-have, not required for CLI-first users

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Rule discovery (global + project) | HIGH | MEDIUM | P1 |
| Conditional matching + injection | HIGH | HIGH | P1 |
| Context capture (tool + message hooks) | HIGH | MEDIUM | P1 |
| Compaction-safe state | MEDIUM | MEDIUM | P2 |
| Rule provenance + debug tracing | MEDIUM | MEDIUM | P2 |
| Context bracket heuristics | MEDIUM | MEDIUM | P2 |
| Rule linting + validation | MEDIUM | MEDIUM | P2 |
| Hybrid AGENTS.md integration | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Competitor A | Competitor B | Our Approach |
|---------|--------------|--------------|--------------|
| Rule discovery + injection | opencode-rules auto-discovers `.md`/`.mdc` rules and injects into system prompt | OpenCode built-in rules via `AGENTS.md` + `instructions` | Preserve CARL rules + support OpenCode rules integration | 
| Conditional matching | opencode-rules supports globs/keywords/tools | OpenCode rules are static unless split into files | Keep CARL keyword + exclude logic, add globs/tools support | 
| Compaction awareness | opencode-rules uses compaction hook to persist context | OpenCode compaction is configurable but not rule-aware | Use compaction hook to persist CARL context | 

## Sources

- https://opencode.ai/docs/plugins/ (plugin loading, hooks, compaction, local plugin directories)
- https://opencode.ai/docs/config/ (plugin config, precedence, `.opencode` structure)
- https://opencode.ai/docs/rules/ (AGENTS.md rules and instructions handling)
- https://raw.githubusercontent.com/frap129/opencode-rules/main/README.md (community rule-injection plugin features and hook usage)

---
*Feature research for: OpenCode prompt-injection / rule-injection plugins*
*Researched: 2026-02-25*
