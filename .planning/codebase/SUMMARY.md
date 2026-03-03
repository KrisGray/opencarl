# Codebase Summary

**Analysis Date:** 2026-02-25

## What This Is

CARL is a local CLI installer plus a Claude hook runtime that injects rule context per prompt. Configuration is file-based and lives in `.carl/` (templates in `.carl-template/`). The CLI wires a hook into Claude settings and copies templates/docs.

## Core Architecture

- Installer: `bin/install.js` copies templates, hook script, and docs into `.carl/` and `.claude/`, then updates `settings.json`.
- Hook runtime: `hooks/carl-hook.py` loads manifest/domain rules, matches recall keywords, computes context bracket, and injects XML rules.
- Templates/resources: `.carl-template/` holds default domain files and `manifest`; `resources/` holds slash-command and skill docs.

## Data Flow (High-Level)

- Install: `npx carl-core` runs the CLI, which writes `.claude` hook config and seeds `.carl/`.
- Prompt: Claude calls the hook on `UserPromptSubmit`; the hook parses manifest/domains, computes context bracket from session JSONL, and emits `<carl-rules>`.

## Stack & Runtime

- Node.js CLI (>=16.7.0) + Python 3 hook; no frameworks or build tools detected.
- Pure stdlib usage; hook shells out to `tail` for session context parsing.
- Distributed as an npm package with `bin` entry.

## Integrations

- Claude Code hook configured via `settings.json` and `.claude/hooks/`.
- Local filesystem only; no external services, databases, or auth.

## Conventions

- JS uses `camelCase`; Python uses `snake_case` and inline type hints.
- Minimal tooling; no lint/format/test configs detected.

## Testing

- No automated tests or runners detected.

## Known Concerns

- `settings.json` write is lossy if parse fails; comments/formatting can be lost.
- Keyword matching uses substring search; may trigger unintended domains.
- Hook relies on external `tail`, which is fragile on non-POSIX systems.
- Session cleanup can delete invalid JSON without quarantine.
- No uninstall/rollback flow for installed hook.

---

*Summary generated from architecture, structure, stack, integrations, conventions, testing, and concerns notes.*
