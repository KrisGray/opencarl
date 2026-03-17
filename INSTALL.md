# OpenCARL Installation Guide

## Quick Install

```bash
npm install opencarl
```

### Configure opencode.json

Add OpenCARL to your `opencode.json` plugin list:

```json
{
  "plugin": ["opencarl"]
}
```

### Run Setup

In OpenCode, run:

```
/opencarl setup
```

This will:
1. Seed `.opencarl/` templates in your project (if missing)
2. Copy commands and skills to your `.opencode/` directory
3. Prepare OpenCARL for use

### Optional: AGENTS.md Integration

To add OpenCARL documentation to your project's `AGENTS.md`:

```
/opencarl setup --integrate
```

This adds an OpenCARL section with rule precedence documentation. Remove it anytime with:

```
/opencarl setup --remove
```

### Optional: opencode.json Instructions Integration

To add OpenCARL docs to your `opencode.json` instructions field:

```
/opencarl setup --integrate-opencode
```

This merges OpenCARL documentation into the `instructions` array in opencode.json, making it available globally to OpenCode. Run again to update if OpenCARL docs change.

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
| Commands not available | Run `/opencarl setup` |

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

1. Edit `.opencarl/manifest` to configure domain recall keywords
2. Add rules to domain files (e.g., `.opencarl/development`)
3. Test with prompts containing your recall keywords
4. Run `*opencarl` for interactive help

For full documentation, see [README-opencode.md](README-opencode.md).
