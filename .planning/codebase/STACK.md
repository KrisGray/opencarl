# Technology Stack

**Analysis Date:** 2026-02-25

## Languages

**Primary:**
- JavaScript (Node.js) - CLI installer in `bin/install.js`

**Secondary:**
- Python 3 - Claude hook implementation in `hooks/carl-hook.py`
- TypeScript - OpenCode plugin entrypoint and loader interface in `src/carl/`

## Runtime

**Environment:**
- Node.js >=16.7.0 (CLI requirement from `package.json`)
- Python 3 (hook executed as `python3` in `bin/install.js`)

**Package Manager:**
- npm (package manifest in `package.json`)
- Lockfile: missing (no `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`)

## Frameworks

**Core:**
- None detected (no framework dependencies listed in `package.json`)

**Testing:**
- Not detected (no test runner config files in repo)

**Build/Dev:**
- Not detected (no bundler or build config files present)

## Key Dependencies

**Critical:**
- Node core modules (`fs`, `path`, `os`, `readline`) used by installer in `bin/install.js`
- Python stdlib modules (`json`, `pathlib`, `subprocess`, `re`, `datetime`) used by hook in `hooks/carl-hook.py`
- OpenCode plugin dependencies in `.opencode/package.json` (`@opencode-ai/plugin`, `@opencode-ai/sdk`, `zod`)

**Infrastructure:**
- Shell utility `tail` invoked from `hooks/carl-hook.py` for session context parsing

## Configuration

**Environment:**
- CARL settings stored in manifest and domain files under `.carl-template/` (e.g., `.carl-template/manifest`, `.carl-template/global`, `.carl-template/commands`, `.carl-template/context`)
- Claude configuration location influenced by `CLAUDE_CONFIG_DIR` or `--config-dir` flags in `bin/install.js`

**Build:**
- Not applicable (no build pipeline files found)

## Platform Requirements

**Development:**
- Node.js >=16.7.0 to run the CLI (`package.json`)
- Python 3 available as `python3` for hook execution (`bin/install.js`, `hooks/carl-hook.py`)
- POSIX `tail` available for context reading (`hooks/carl-hook.py`)

**Production:**
- Distributed as an npm CLI package (`package.json` with `bin` entry pointing to `bin/install.js`)

---

*Stack analysis: 2026-02-25*
