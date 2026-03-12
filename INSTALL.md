# OpenCARL Installation Guide

## Quick Install

```bash
npm install @krisgray/opencarl
```

### Configure opencode.json

Add OpenCARL to your `opencode.json` plugin list:

```json
{
  "plugin": ["@krisgray/opencarl"]
}
```

### Run Setup

In OpenCode, run:

```
/carl setup
```

This will:
1. Seed `.carl/` templates in your project (if missing)
2. Copy commands and skills to your `.opencode/` directory
3. Prepare OpenCARL for use

### Optional: AGENTS.md Integration

To add OpenCARL documentation to your project's `AGENTS.md`:

```
/carl setup --integrate
```

This adds an OpenCARL section with rule precedence documentation. Remove it anytime with:

```
/carl setup --remove
```

### Optional: opencode.json Instructions Integration

To add OpenCARL docs to your `opencode.json` instructions field:

```
/carl setup --integrate-opencode
```

This merges CARL documentation into the `instructions` array in opencode.json, making it available globally to OpenCode. Run again to update if CARL docs change.

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
cp -r dist ~/.opencode/plugins/carl
cp -r resources ~/.opencode/plugins/carl/
cp -r .carl-template ~/.opencode/plugins/carl/
```

### Step 3: Configure opencode.json

Edit `~/.opencode/opencode.json` or your project's `opencode.json`:

```json
{
  "plugin": ["./plugins/carl/dist/plugin.js"]
}
```

### Step 4: Copy OpenCARL Config

**Global (all projects):**
```bash
cp -r .carl-template ~/.carl
```

**Project-specific:**
```bash
cp -r .carl-template ./.carl
```

---

## Verify Installation

After installation, verify:

1. `.carl/manifest` exists in your project or home directory
2. `/carl` command is available in OpenCode
3. `*carl` triggers help mode

Test with:
```
/carl list
```

---

## Usage

- `*carl` — Enter OpenCARL help mode
- `*carl docs` — View full documentation
- `/carl` — Domain management commands
- `/carl list` — Show all domains
- `/carl view DOMAIN` — Show rules in a domain

---

## Troubleshooting

### Quick Fixes

| Problem | Fix |
|---------|-----|
| Rules not loading | Check `.carl/manifest` has `STATE=active` |
| Plugin not found | Verify opencode.json plugin path |
| Commands not available | Run `/carl setup` |

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
├── commands/carl/      # OpenCARL slash commands
├── skills/carl-*/      # OpenCARL skills
└── plugins/            # Plugin files (if manual install)

.carl/
├── manifest            # Domain registry
├── global              # Always-loaded rules
├── commands            # Star-command definitions
├── context             # Context bracket rules
└── {domain}            # Your custom domains
```

---

## Next Steps

1. Edit `.carl/manifest` to configure domain recall keywords
2. Add rules to domain files (e.g., `.carl/development`)
3. Test with prompts containing your recall keywords
4. Run `*carl` for interactive help

For full documentation, see [README-opencode.md](README-opencode.md).
