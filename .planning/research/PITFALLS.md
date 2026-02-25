# Pitfalls Research

**Domain:** OpenCode plugins adapting Claude Code hooks (rule/prompt injection)
**Researched:** 2026-02-25
**Confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: Injecting rules at the wrong stage or role

**What goes wrong:**
Rules intended to be system-level guidance end up appended as user text, or injected after the model has already started the turn. The model treats them as optional or ignores them, breaking CARL parity.

**Why it happens:**
Claude Code hooks are time-based, while OpenCode uses event hooks with specific lifecycles. It is easy to pick a convenient event (e.g., `message.updated` or `tui.prompt.append`) without ensuring role/order semantics.

**How to avoid:**
Map hook behavior to OpenCode events explicitly and validate role/order. Use a dedicated prompt-assembly hook (or the earliest reliable event) and enforce that injected content is inserted as system rules (or equivalent OpenCode rules mechanism) before user input.

**Warning signs:**
Rules appear in transcripts as user text; the model contradicts injected rules; behavior differs between TUI vs CLI or between compaction cycles.

**Phase to address:**
Phase 2: Rule parsing + injection parity

---

### Pitfall 2: Scope resolution drift (global vs project rules)

**What goes wrong:**
Global `.carl/` rules override project-specific ones or vice versa, causing unpredictable behavior across machines and repos. Users report "works on my machine" rule sets.

**Why it happens:**
OpenCode loads plugins from multiple locations with a defined order; CARL expects a different precedence model. Failing to mirror CARL’s scope rules leads to accidental overrides.

**How to avoid:**
Define a deterministic precedence policy: project `.carl/` overrides global `.carl/`, and both are merged before injection. Test with fixtures for both scopes and confirm OpenCode plugin load order does not change behavior.

**Warning signs:**
Two machines with identical projects produce different injected rules; logs show rules loaded from unexpected directories.

**Phase to address:**
Phase 1: Plugin skeleton + config resolution

---

### Pitfall 3: Star-command parity loss (`*carl` vs `/carl`)

**What goes wrong:**
Explicit mode commands stop working or are triggered accidentally by normal user text. This breaks CARL’s user workflow and introduces confusing behavior.

**Why it happens:**
OpenCode command events do not necessarily capture raw `*` prefixes or may route them through different UI layers. A naive implementation treats any message containing `*carl` as a trigger.

**How to avoid:**
Bind to the explicit command execution event when available (e.g., `tui.command.execute`) and enforce an exact match with a fallback `/carl` command only if `*carl` cannot be captured. Provide a migration note in the installer.

**Warning signs:**
`*carl` is ignored in some surfaces; rules trigger on unrelated messages that mention `*carl` in text.

**Phase to address:**
Phase 2: Rule parsing + injection parity

---

### Pitfall 4: Prompt-injection through untrusted rule sources

**What goes wrong:**
Malicious text in `.carl/` files or user content is treated as trusted system rules. The model can be induced to reveal hidden instructions, call tools unsafely, or ignore constraints.

**Why it happens:**
Rule injection blurs the trust boundary between system rules and user-provided content. When any repository content can shape the system prompt, attackers can plant instructions.

**How to avoid:**
Treat `.carl/` as untrusted unless owned by the user. Require explicit user opt-in for project-level rule execution, restrict which files can be loaded, and sanitize/annotate injected content as untrusted data. Add an allowlist for rule domains and enforce a strict schema in `.carl/manifest`.

**Warning signs:**
Rules request tool usage or secrets; rules contain "ignore previous instructions" patterns; behavior changes after pulling new repo content.

**Phase to address:**
Phase 3: Security hardening

---

### Pitfall 5: Context bracket rules not enforced

**What goes wrong:**
CARL’s fresh/moderate/depleted logic is ignored, causing prompt bloat and compaction failures. The model either lacks needed rules or receives too many.

**Why it happens:**
OpenCode compaction and session updates require explicit handling; rules that worked in a single-hook model need per-turn and compaction-aware logic.

**How to avoid:**
Implement rule throttling tied to session lifecycle events. Integrate with compaction hooks so brackets persist across compaction and inject only the appropriate subset.

**Warning signs:**
Rapidly growing prompt length; rule duplication after compaction; token usage spikes on long sessions.

**Phase to address:**
Phase 4: Performance + compaction parity

---

### Pitfall 6: Plugin load-order collisions and double injection

**What goes wrong:**
The same plugin behavior runs twice (local + npm), doubling rules or tool hooks. This creates confusing, inconsistent results.

**Why it happens:**
OpenCode loads plugins from multiple sources with a defined order and does not de-duplicate local vs npm plugins with similar names.

**How to avoid:**
Ensure local distribution is the single source of truth. Name the plugin distinctly and detect duplicate initialization (e.g., a global singleton flag) to skip double injection.

**Warning signs:**
Duplicate rule blocks in prompts; logs show two initializations; behavior changes when npm config includes the same plugin.

**Phase to address:**
Phase 5: Installer + distribution

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Only support project `.carl/` | Faster MVP | Breaks parity for global rules and user workflows | MVP only, with explicit limitation in docs |
| Inject rules as plain user text | Quick to implement | Model ignores or deprioritizes rules, security ambiguity | Never |
| Skip compaction handling | Less code | Prompt grows without control; degraded long sessions | Never |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| OpenCode plugin loader | Assuming npm and local plugins are mutually exclusive | Detect duplicates and favor local plugin distribution |
| OpenCode rules system | Writing AGENTS/opencode rules but not reloading them | Update and prompt user to restart or trigger reload if supported |
| Bun dependencies | Importing external packages without `.opencode/package.json` | Declare dependencies in `.opencode/package.json` so OpenCode can install |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-parse all `.carl/` files on every event | Laggy UI, high CPU | Cache parsed rules and debounce file watcher updates | Medium projects with frequent edits |
| Unbounded rule injection | Token usage spikes, slow responses | Enforce bracket thresholds and per-turn caps | Long sessions or large rule sets |
| Logging on every message update | Large logs, slow I/O | Sample or rate-limit logs | Large projects with file watchers |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Treating repo content as trusted rules | Prompt injection and tool misuse | Require user opt-in for project rules and validate manifest schema |
| Allowing rule files to call tools implicitly | Unauthorized actions | Restrict tools by permission and require explicit user approval |
| Injecting secrets into prompts | Secret leakage via logs/compaction | Keep secrets in env, not in prompt; avoid echoing in logs |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Silent fallback from `*carl` to `/carl` | Confusing, inconsistent behavior | Inform users during install and in help text |
| No visibility into active rules | Users cannot trust behavior | Provide a command to list active rules and sources |
| Rules fail silently | Users think plugin is broken | Emit a TUI toast or log when rules are skipped |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Rule parity:** `*command`, exclude, always-on, and bracket logic verified in OpenCode events
- [ ] **Scope parity:** global + project `.carl/` precedence matches CARL behavior
- [ ] **Security boundary:** project rules require explicit user opt-in and schema validation
- [ ] **Compaction:** rule persistence across compaction tested

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Wrong injection stage/role | MEDIUM | Move injection to correct event, replay sessions in a test harness, confirm role ordering |
| Scope resolution drift | LOW | Add precedence tests, re-run with fixtures, update installer to document scope order |
| Prompt injection incident | HIGH | Disable project rules, add allowlist, rotate any exposed secrets, add warnings |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Wrong injection stage/role | Phase 2: Rule injection parity | Golden transcript tests show rules appear before user input |
| Scope resolution drift | Phase 1: Config + scope resolution | Fixture test for global/project precedence |
| Star-command parity loss | Phase 2: Command handling | UI test for `*carl` and `/carl` behavior across surfaces |
| Prompt injection via rule files | Phase 3: Security hardening | Malicious rule fixture is blocked or sandboxed |
| Context bracket rules ignored | Phase 4: Compaction parity | Long-session test with compaction retains bracket behavior |
| Load-order collisions | Phase 5: Installer + distribution | Duplicate load detection log proves single injection |

## Sources

- https://opencode.ai/docs/plugins/
- https://opencode.ai/docs/rules/
- https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html
- https://genai.owasp.org/llmrisk/llm01-prompt-injection/

---
*Pitfalls research for: OpenCode plugin adaptation from Claude Code hooks*
*Researched: 2026-02-25*
