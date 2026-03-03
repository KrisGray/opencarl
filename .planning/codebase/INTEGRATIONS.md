# External Integrations

**Analysis Date:** 2026-02-25

## APIs & External Services

**Claude Code Hooking:**
- Claude Code hooks and settings integration via `settings.json` updates in `bin/install.js`
  - SDK/Client: Not applicable (file-based configuration in `bin/install.js`)
  - Auth: Not applicable

## Data Storage

**Databases:**
- Not detected

**File Storage:**
- Local filesystem only
  - CARL configuration stored in `.carl` directories created from `.carl-template/` (e.g., `.carl-template/manifest`)
  - Claude config stored in `.claude` directories (created/updated by `bin/install.js`)
  - Session data read from `~/.claude/projects/*/*.jsonl` in `hooks/carl-hook.py`

**Caching:**
- None

## Authentication & Identity

**Auth Provider:**
- None (no auth flows or providers referenced)

## Monitoring & Observability

**Error Tracking:**
- None

**Logs:**
- Console output only in CLI (`bin/install.js`)
- Optional stderr debug logging in hook (`hooks/carl-hook.py`)

## CI/CD & Deployment

**Hosting:**
- npm package distribution (CLI entry in `package.json`)

**CI Pipeline:**
- None detected

## Environment Configuration

**Required env vars:**
- `CLAUDE_CONFIG_DIR` (optional override for Claude config directory in `bin/install.js`)

**Secrets location:**
- Not applicable (no secret storage detected)

## Webhooks & Callbacks

**Incoming:**
- Claude Code hook entry `hooks/UserPromptSubmit` configured in `bin/install.js`

**Outgoing:**
- None

---

*Integration audit: 2026-02-25*
