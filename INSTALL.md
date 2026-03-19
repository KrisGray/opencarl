# OpenCARL Installation Guide

## Quick Install

```bash
npm install opencarl
```

### Configure opencode.json

Add OpenCARL as an npm plugin in your OpenCode config.

**Global (all projects):** `~/.config/opencode/opencode.json`

**Project-local:** `opencode.json` in your project root

```json
{
  "plugin": ["opencarl"]
}
```

Restart OpenCode. It will install npm plugins with Bun into `~/.cache/opencode/node_modules/` and load them.

### Run Setup

From your terminal:

```bash
npx opencarl --local
```

This will:
1. Seed `.opencarl/` templates in your project (if missing)
2. Copy skills to your `.opencode/` directory
3. Prepare OpenCARL for use

### Optional: AGENTS.md Integration

To add OpenCARL documentation to your project's `AGENTS.md`:

```bash
npx opencarl --integrate
```

### Optional: opencode.json Instructions Integration

To add OpenCARL docs to your `opencode.json` instructions field:

```bash
npx opencarl --integrate-opencode

---

## Prerequisites

- OpenCode installed
- Node.js 16.7+
- npm

---

## Manual Installation

If you prefer manual setup:

### Step 1: Clone and Build

```bash
git clone https://github.com/KrisGray/opencarl.git
cd opencarl
npm run build
```

### Step 2: Copy Plugin Files

Copy the built plugin to your OpenCode plugins directory:

```bash
mkdir -p ~/.opencode/plugins
cp -r dist ~/.opencode/plugins/opencarl
cp -r resources ~/.opencode/plugins/opencarl/
cp -r .opencarl-template ~/.opencode/plugins/opencarl/
```

### Step 3: Configure opencode.json

Edit `~/.opencode/opencode.json` or your project's `opencode.json`:

```json
{
  "plugin": ["./plugins/opencarl/dist/plugin.js"]
}
```

### Step 4: Copy OpenCARL Config

**Global (all projects):**
```bash
cp -r .opencarl-template ~/.opencarl
```

**Project-specific:**
```bash
cp -r .opencarl-template ./.opencarl
```

---

## Verify Installation

After installation, verify:

1. `.opencarl/manifest` exists in your project or home directory
2. `/opencarl` command is available in OpenCode
3. `*opencarl` triggers help mode

Test with:
```
/opencarl list
```

---

## Usage

- `*opencarl` — Enter OpenCARL help mode
- `*opencarl docs` — View full documentation
- `/opencarl` — Domain management commands
- `/opencarl list` — Show all domains
- `/opencarl view DOMAIN` — Show rules in a domain

---

## Troubleshooting

### Quick Fixes

| Problem | Fix |
|---------|-----|
| Rules not loading | Check `.opencarl/manifest` has `STATE=active` |
| Plugin not found | Verify opencode.json plugin path |
| Commands not available | Run `/opencarl-setup` |

### Debug Mode

Enable detailed logging:

```bash
OPENCARL_DEBUG=true
```

This shows rule matching decisions and injection events.

### Full Troubleshooting Guide

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for comprehensive troubleshooting covering installation, loading, matching, and integration issues.

---

## File Structure After Install

```
.opencode/
├── commands/opencarl/  # OpenCARL slash commands
├── skills/opencarl-*/  # OpenCARL skills
└── plugins/            # Plugin files (if manual install)

.opencarl/
├── manifest            # Domain registry
├── global              # Always-loaded rules
├── commands            # Star-command definitions
├── context             # Context bracket rules
└── {domain}            # Your custom domains
```

---

## Next Steps

Use `/opencarl` commands to configure your domains:

```
# Create a domain
/opencarl create DEVELOPMENT --recall 'write code, implement, test'

# Add rules
/opencarl add rule DEVELOPMENT 'Always write tests first'
/opencarl add rule DEVELOPMENT 'Use type hints for all functions'

# View your configuration
/opencarl list domains
/opencarl view DEVELOPMENT
```

For full documentation, see [krisgray.github.io/opencarl](https://krisgray.github.io/opencarl/).
