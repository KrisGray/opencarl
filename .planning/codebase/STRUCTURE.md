# Codebase Structure

**Analysis Date:** 2026-02-25

## Directory Layout

```
carl/
├── bin/                     # CLI entry point
├── hooks/                   # Claude hook runtime
├── resources/               # Command and skill docs/templates
├── .carl-template/          # Default CARL configuration templates
├── .opencode/                # Local OpenCode plugin package + entrypoint
├── scripts/                  # OpenCode setup/install helpers
├── src/                      # OpenCode plugin TypeScript sources
├── assets/                  # README images
├── README.md                # Product overview and usage
├── INSTALL.md               # Install instructions
├── CARL-BLOCK.md            # CLAUDE.md integration block reference
├── AUDIT-CLAUDEMD.md        # CLAUDE.md audit notes
├── package.json             # Package metadata and bin config
└── LICENSE                  # License
```

## Directory Purposes

**bin:**
- Purpose: CLI installer for CARL.
- Contains: Node.js entry point.
- Key files: `bin/install.js`

**hooks:**
- Purpose: Hook runtime injected into Claude Code.
- Contains: Python hook script.
- Key files: `hooks/carl-hook.py`

**resources:**
- Purpose: Slash-command and skill documentation copied into `.claude/`.
- Contains: Markdown command/skill guides and templates.
- Key files: `resources/commands/carl/manager.md`, `resources/skills/carl-manager/SKILL.md`

**.carl-template:**
- Purpose: Default `.carl/` configuration files copied during install.
- Contains: `manifest`, `global`, `context`, `commands`, `example-custom-domain`.
- Key files: `.carl-template/manifest`, `.carl-template/global`, `.carl-template/context`

**.opencode:**
- Purpose: OpenCode plugin entrypoint and local dependencies.
- Contains: `package.json`, `plugins/carl.ts`.
- Key files: `.opencode/package.json`, `.opencode/plugins/carl.ts`

**scripts:**
- Purpose: OpenCode plugin setup and global install helpers.
- Contains: `install-global-plugin.ts`, `setup-plugin.ts`.

**src:**
- Purpose: TypeScript source for CARL OpenCode plugin logic.
- Contains: `carl/loader.ts`, `carl/types.ts`.

**assets:**
- Purpose: README imagery.
- Contains: SVG screenshots.
- Key files: `assets/terminal.svg`

## Key File Locations

**Entry Points:**
- `bin/install.js`: CLI installer invoked by `carl-core` binary.
- `hooks/carl-hook.py`: Hook executed by Claude `UserPromptSubmit` event.
- `.opencode/plugins/carl.ts`: OpenCode plugin entrypoint for CARL.

**Configuration:**
- `package.json`: CLI bin definition and engine requirements.
- `.carl-template/manifest`: Template domain registry.

**Core Logic:**
- `hooks/carl-hook.py`: Rule matching, session handling, injection formatting.
- `src/carl/loader.ts`: CARL rule discovery interface for OpenCode plugin.

**Documentation:**
- `README.md`: Product overview, configuration, usage.
- `resources/commands/carl/manager.md`: /carl:manager command spec.

## Naming Conventions

**Files:**
- CARL domains are lowercase filenames with no extension (template in `.carl-template/*`).
- Domain rule keys use `{DOMAIN}_RULE_{N}` prefixes in uppercase (`.carl-template/global`).

**Directories:**
- `resources/commands/carl/` for slash-command content.
- `resources/skills/` for skill guidance content.

## Where to Add New Code

**New Feature (CLI behavior):**
- Primary code: `bin/install.js`
- Tests: Not detected in this repo.

**New Hook Behavior:**
- Implementation: `hooks/carl-hook.py`

**New Domain Templates:**
- Template file: `.carl-template/{domain}`
- Manifest entry: `.carl-template/manifest`

**New Command/Skill Docs:**
- Command docs: `resources/commands/carl/`
- Skill docs: `resources/skills/`

## Special Directories

**.carl-template:**
- Purpose: Seed configuration copied into user `.carl/` directories.
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-02-25*
