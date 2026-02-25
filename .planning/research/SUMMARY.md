# Project Research Summary

**Project:** CARL OpenCode Plugin
**Domain:** OpenCode plugin for prompt/rule injection (CARL parity)
**Researched:** 2026-02-25
**Confidence:** MEDIUM

## Executive Summary

This project adapts CARL’s just‑in‑time rule injection into a first‑class OpenCode plugin. Experts build this by leveraging OpenCode’s official plugin hooks to load `.carl/` rules (global + project), match them deterministically against context, and inject them into the system prompt before the model turn. The guiding principle is parity with existing CARL workflows while respecting OpenCode’s plugin lifecycle, rule precedence, and compaction behavior.

The recommended approach is a TypeScript plugin using `@opencode-ai/plugin` hooks with a clear separation between CARL rule logic and OpenCode glue. Build a deterministic rule loader/matcher/injector pipeline, wire it to prompt/command hooks, and add compaction‑safe state plus caching. Distribution should start with local plugins (per OpenCode load paths), with optional future npm packaging.

Key risks are incorrect injection stage/role, scope resolution drift between global vs project rules, and unsafe rule ingestion from untrusted repositories. Mitigation requires explicit hook mapping tests (golden transcripts), deterministic precedence fixtures, opt‑in project rule execution with schema validation, and compaction-aware throttling to prevent prompt bloat.

## Key Findings

### Recommended Stack

OpenCode’s official plugin API and SDK (v1.2.14) are the stable, type‑safe surface for intercepting prompts and injecting instructions. TypeScript (5.9.3) and Bun (1.3.9) align with OpenCode’s runtime and installation behavior; Node 24 LTS is recommended for CI/tooling parity. Zod helps validate rule schemas and tool args; shescape is useful for any shell‑adjacent operations.

**Core technologies:**
- **@opencode-ai/plugin 1.2.14**: Hook registration and prompt interception — official, matches OpenCode lifecycle.
- **@opencode-ai/sdk 1.2.14**: Typed session/logging utilities — supported in plugin context.
- **TypeScript 5.9.3**: Safe, typed plugin authoring — aligns with OpenCode examples.
- **Bun 1.3.9**: Dependency install/runtime in plugin context — OpenCode uses Bun for local plugins.

### Expected Features

The MVP must deliver rule discovery across global + project scopes, conditional matching, system prompt injection, and compaction‑safe state. Differentiators include provenance/debug tracing and bracket‑based injection heuristics. More complex integrations (e.g., AGENTS.md synthesis) are best deferred to v2 until core parity is stable.

**Must have (table stakes):**
- Local plugin install + correct load order — users expect OpenCode‑native installation.
- Rule discovery at global + project scopes — preserves CARL workflows.
- Conditional rule matching + injection — core value.
- Context capture from tools/messages — enables matching.
- Compaction‑safe state — prevents rule loss in long sessions.

**Should have (competitive):**
- Rule provenance + debug tracing — improves trust and debuggability.
- Context bracket heuristics — reduces prompt noise under compaction.
- Rule linting + validation — prevents misconfiguration.

**Defer (v2+):**
- Hybrid AGENTS.md/instructions synthesis — complex precedence conflicts.
- Rich rule editor UI — not needed for CLI‑first users.

### Architecture Approach

Use an event‑driven hook pipeline with deterministic rule resolution. Separate the CARL engine (loader/matcher/injector) from OpenCode hook wiring. Maintain a cache with file watcher updates, and compose injections with explicit bracket levels and provenance headers.

**Major components:**
1. **Rule loader** — reads `.carl/manifest` and domain files with validation + caching.
2. **Matcher/scorer** — deterministic matching (keywords, exclusions, always‑on, star‑commands).
3. **Prompt injector** — assembles bracketed rule blocks and injects into system prompt.
4. **Command handler** — parses `*carl`/`/carl` and forces rule modes.
5. **Watcher/cache** — debounced file watcher for hot reload and performance.

### Critical Pitfalls

1. **Wrong injection stage/role** — map hooks explicitly and ensure system‑level insertion before user prompt.
2. **Scope resolution drift** — deterministic precedence: project overrides global with fixtures/tests.
3. **Star‑command parity loss** — bind to explicit command execution; fallback to `/carl` with user notice.
4. **Untrusted rule ingestion** — require opt‑in for project rules, validate schema, allowlist domains.
5. **Compaction ignored** — persist minimal state across compaction and enforce bracket caps.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Plugin skeleton + scope resolution
**Rationale:** Establish correct load locations and precedence early to avoid scope drift.
**Delivers:** Plugin entrypoint, path resolution (global + project), rule loader with schema validation.
**Addresses:** Local install/load order, rule discovery.
**Avoids:** Scope resolution drift.

### Phase 2: Rule matching + injection parity
**Rationale:** Core user value is correct matching and system prompt injection.
**Delivers:** Matcher/scorer, prompt injector, `*carl`/`/carl` command handling, deterministic ordering.
**Addresses:** Conditional matching, system prompt injection, star‑command behavior.
**Avoids:** Wrong injection stage/role; star‑command parity loss.

### Phase 3: Security hardening + provenance
**Rationale:** Rule injection crosses trust boundaries; must be safe by design.
**Delivers:** Opt‑in project rule execution, allowlist domains, rule provenance/debug tracing, linting.
**Addresses:** Safety guardrails, provenance, validation.
**Avoids:** Prompt injection via untrusted rules.

### Phase 4: Compaction + performance parity
**Rationale:** Long‑session stability and prompt budgets depend on compaction handling.
**Delivers:** Compaction‑safe state, context bracket heuristics, caching + debounce.
**Addresses:** Compaction‑safe state, bracketed injection, performance traps.
**Avoids:** Prompt bloat and duplication after compaction.

### Phase 5: Installer + OpenCode rules integration
**Rationale:** Distribution and optional AGENTS/opencode integration depend on stable core.
**Delivers:** Installer/setup flow, optional AGENTS.md/opencode.json helpers, duplicate load detection.
**Addresses:** Local distribution, hybrid rules integration.
**Avoids:** Load‑order collisions and double injection.

### Phase Ordering Rationale

- Dependency chain: rule discovery → injection → compaction safety → installer/integration.
- Architecture favors a stable CARL engine before OpenCode‑specific integrations.
- Early phases mitigate the highest‑impact pitfalls (scope drift, wrong injection stage).

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** Validate exact OpenCode hooks for system‑role prompt injection and command execution across TUI/CLI.
- **Phase 3:** Security boundary details (what OpenCode considers trusted vs untrusted sources).

Phases with standard patterns (skip research‑phase):
- **Phase 1:** File discovery + precedence are well‑documented in OpenCode plugin docs.
- **Phase 4:** Caching and compaction handling follow established patterns from OpenCode hooks.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official OpenCode docs + npm registry versions. |
| Features | MEDIUM | Mix of official docs + community plugin patterns. |
| Architecture | MEDIUM | Based on OpenCode hooks with inferred CARL parity needs. |
| Pitfalls | MEDIUM | Grounded in official docs + OWASP guidance, needs validation in OpenCode specifics. |

**Overall confidence:** MEDIUM

### Gaps to Address

- **Hook specificity:** Confirm the earliest reliable hook for system‑prompt injection and verify role ordering in OpenCode.
- **Command capture:** Validate `*carl` handling across TUI/CLI surfaces; confirm fallback behavior.
- **Compaction API behavior:** Ensure compaction hooks preserve state and do not duplicate injections.
- **Trust model:** Define explicit opt‑in and schema validation policy for project‑level rules.

## Sources

### Primary (HIGH confidence)
- https://opencode.ai/docs/plugins/ — plugin hooks, load paths, Bun usage
- https://opencode.ai/docs/config/ — config precedence and `.opencode` structure
- https://opencode.ai/docs/rules/ — AGENTS.md and instructions behavior
- https://registry.npmjs.org/@opencode-ai/plugin/latest — version 1.2.14
- https://registry.npmjs.org/@opencode-ai/sdk/latest — version 1.2.14

### Secondary (MEDIUM confidence)
- https://raw.githubusercontent.com/frap129/opencode-rules/main/README.md — community rule injection patterns

### Tertiary (LOW confidence)
- https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html — general LLM prompt injection mitigations
- https://genai.owasp.org/llmrisk/llm01-prompt-injection/ — general risk framing

---
*Research completed: 2026-02-25*
*Ready for roadmap: yes*
