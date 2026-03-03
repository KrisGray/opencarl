# Architecture

**Analysis Date:** 2026-02-25

## Pattern Overview

**Overall:** CLI installer + runtime hook engine + file-based configuration

**Key Characteristics:**
- Node.js CLI installs templates, commands, and hook into Claude config (`bin/install.js`).
- Python hook evaluates prompt context and injects XML rules on every user prompt (`hooks/carl-hook.py`).
- Behavior configured via plain-text domain files in `.carl/` with a manifest registry (`.carl-template/manifest`).

## Layers

**Installer (CLI):**
- Purpose: Copy templates/resources and register the hook with Claude settings.
- Location: `bin/install.js`
- Contains: File system copying, settings.json wiring, optional CLAUDE.md block insertion.
- Depends on: Node core modules (`fs`, `path`, `os`, `readline`).
- Used by: `npx carl-core` / `carl-core` binary from `package.json`.

**Hook Runtime (Injection Engine):**
- Purpose: Load domains, compute context bracket, match keywords, and emit injected rules.
- Location: `hooks/carl-hook.py`
- Contains: Manifest parsing, session management, keyword matching, rule formatting.
- Depends on: Local `.carl/` files; Claude hook input JSON.
- Used by: Claude Code `UserPromptSubmit` hook (`hooks/carl-hook.py`).

**Templates & Resources:**
- Purpose: Provide default domains and management guidance.
- Location: `.carl-template/*`, `resources/commands/carl/*`, `resources/skills/*`
- Contains: Domain files (`global`, `context`, `commands`), manifest template, markdown command/skill docs.
- Depends on: Installer copying to user `.carl/` and `.claude/` directories.
- Used by: End users and `/carl:manager` workflow (`resources/commands/carl/manager.md`).

## Data Flow

**Install Flow (CLI):**

1. User runs `npx carl-core` (binary defined in `package.json`).
2. CLI copies hook to `.claude/hooks/carl-hook.py` (`bin/install.js`).
3. CLI copies command/skill docs into `.claude/commands/carl` and `.claude/skills` (`bin/install.js`).
4. CLI copies `.carl-template/` into `.carl/` if not present (`bin/install.js`).
5. CLI updates `settings.json` to register the hook (`bin/install.js`).

**Prompt Injection Flow (Hook):**

1. Claude calls `hooks/carl-hook.py` with JSON input (hook event).
2. Hook locates nearest `.carl/manifest` by walking up `cwd` (`hooks/carl-hook.py`).
3. Hook parses manifest and domain files (`hooks/carl-hook.py`).
4. Hook computes context bracket from session JSONL usage (`hooks/carl-hook.py`).
5. Hook matches recall keywords and star-commands to load rules (`hooks/carl-hook.py`).
6. Hook emits `<carl-rules>` XML in `hookSpecificOutput.additionalContext` (`hooks/carl-hook.py`).

**State Management:**
- Per-session overrides stored as `.carl/sessions/{uuid}.json` (`hooks/carl-hook.py`).
- Context bracket selection based on token usage from Claude session transcript (`hooks/carl-hook.py`).

## Key Abstractions

**Manifest Registry:**
- Purpose: Enables/disables domains and defines recall/always-on behavior.
- Examples: `.carl-template/manifest`
- Pattern: KEY=VALUE entries like `{DOMAIN}_STATE`, `{DOMAIN}_RECALL`.

**Domain Files:**
- Purpose: Store rule lists for a domain.
- Examples: `.carl-template/global`, `.carl-template/context`, `.carl-template/commands`, `.carl-template/example-custom-domain`
- Pattern: `{DOMAIN}_RULE_N=...` entries with comments.

**Context Brackets:**
- Purpose: Adapt rule injection to remaining context percentage.
- Examples: `.carl-template/context` with FRESH/MODERATE/DEPLETED rules.
- Pattern: `{BRACKET}_RULES=true` + `{BRACKET}_RULE_N=...`.

**Star-Commands:**
- Purpose: Explicit command-triggered rule injection.
- Examples: `.carl-template/commands`
- Pattern: `*commandname` in prompt → `{COMMAND}_RULE_N=...`.

**Session Overrides:**
- Purpose: Per-session toggles for domains and dev mode.
- Examples: `.carl/sessions/{uuid}.json` (created by `hooks/carl-hook.py`).
- Pattern: `overrides` map of `{DOMAIN}_STATE` and `DEVMODE`.

## Entry Points

**CLI Binary:**
- Location: `bin/install.js`
- Triggers: `npx carl-core` / `carl-core` binary.
- Responsibilities: Install hook/resources/templates; wire `settings.json`; optionally add CLAUDE.md block.

**Hook Script:**
- Location: `hooks/carl-hook.py`
- Triggers: Claude Code `UserPromptSubmit` hook.
- Responsibilities: Parse config, match domains, inject XML rules.

## Error Handling

**Strategy:** Guarded IO with fallbacks, early exits on missing config.

**Patterns:**
- `try/except` around JSON and file reads (`hooks/carl-hook.py`).
- If `.carl/manifest` is missing, hook exits without injecting (`hooks/carl-hook.py`).
- CLI warns and rebuilds settings.json on parse failure (`bin/install.js`).

## Cross-Cutting Concerns

**Logging:** Console output in CLI; optional debug logging in hook (`hooks/carl-hook.py`).
**Validation:** Minimal; relies on manifest key format and domain file prefix conventions (`hooks/carl-hook.py`).
**Authentication:** Not applicable (local file-based configuration only).

---

*Architecture analysis: 2026-02-25*
