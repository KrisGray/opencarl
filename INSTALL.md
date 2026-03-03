# CARL Installation Guide for OpenCode

## Quick Install

```bash
npm install @krisgray/opencode-carl-plugin
```

### Configure opencode.json

Add CARL to your `opencode.json` plugin list:

```json
{
  "plugin": ["@krisgray/opencode-carl-plugin"]
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
3. Prepare CARL for use

### Optional: AGENTS.md Integration

To add CARL documentation to your project's `AGENTS.md`:

```
/carl setup --integrate
```

This adds a CARL section with rule precedence documentation. Remove it anytime with:

```
/carl setup --remove
```

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
git clone https://github.com/ChristopherKahler/carl.git
cd carl
npm run build:opencode
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

### Step 4: Copy CARL Config

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

- `*carl` — Enter CARL help mode
- `*carl docs` — View full documentation
- `/carl` — Domain management commands
- `/carl list` — Show all domains
- `/carl view DOMAIN` — Show rules in a domain

---

## Troubleshooting

**Rules not loading?**
- Check `.carl/manifest` exists and has `STATE=active` for domains
- Verify recall keywords match your prompts
- Run `/carl list` to see active domains

**Plugin not found?**
- Verify `@krisgray/opencode-carl-plugin` is in your node_modules
- Check opencode.json plugin path is correct

**Commands not available?**
- Run `/carl setup` to seed commands
- Check `.opencode/commands/carl/` directory exists

---

## File Structure After Install

```
.opencode/
├── commands/carl/      # CARL slash commands
├── skills/carl-*/      # CARL skills
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
