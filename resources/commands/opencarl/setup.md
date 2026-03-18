---
name: setup
description: Initialize OpenCARL in your project. Seeds .opencarl/ templates and prepares OpenCARL for use.
argument-hint: "[--integrate|--remove|--integrate-opencode]"
---

# /opencarl setup - OpenCARL Setup

Initialize OpenCARL configuration in your project.

## Usage

| Command | Description |
|---------|-------------|
| `/opencarl setup` | Seed `.opencarl/` templates to your project |
| `/opencarl setup --integrate` | Add OpenCARL docs to AGENTS.md |
| `/opencarl setup --remove` | Remove OpenCARL docs from AGENTS.md |
| `/opencarl setup --integrate-opencode` | Add OpenCARL docs to opencode.json instructions |

## What Setup Does

1. Checks for existing `.opencarl/` (project) or `~/.opencarl/` (global)
2. Seeds starter templates if missing:
   - `manifest` - Domain registry
   - `global` - Always-loaded rules
   - `commands` - Star-command definitions
   - `context` - Context bracket rules
3. Never overwrites existing files (idempotent)

## Integration Options

### --integrate
Adds OpenCARL documentation section to your project's `AGENTS.md`. This makes OpenCARL docs available to all AI sessions.

### --remove
Removes the OpenCARL documentation section from `AGENTS.md`.

### --integrate-opencode
Merges OpenCARL documentation paths into your `opencode.json` instructions field.

## File Locations

- **Project:** `./.opencarl/`
- **Global:** `~/.opencarl/`

Project rules override global when both exist.
