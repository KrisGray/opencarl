<div align="center">

# CARL

**Context Augmentation & Reinforcement Layer** — Dynamic rules for OpenCode.

[![npm version](https://img.shields.io/npm/v/@krisgray/opencode-carl-plugin?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/@krisgray/opencode-carl-plugin)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/ChristopherKahler/carl?style=for-the-badge&logo=github&color=181717)](https://github.com/ChristopherKahler/carl)

<br>

*"Rules that load when relevant, disappear when not."*

<br>

[Why CARL](#why-carl) · [Getting Started](#getting-started) · [How It Works](#how-it-works) · [Core Concepts](#core-concepts)

</div>

---

## Why CARL

Every OpenCode session starts fresh. Your preferences, workflows, and hard-won lessons? Gone. You end up repeating the same instructions:

> "Use TypeScript strict mode."
> "Don't over-engineer."
> "Run tests after changes."

Static prompts in AGENTS.md work, but they bloat every session — even when irrelevant. Writing code? You don't need your content creation rules. Debugging? You don't need your planning workflow.

CARL fixes this with **just-in-time rule injection**:

1. **Rules load when relevant** — Mention "fix bug" and your development preferences appear
2. **Rules disappear when not** — Your context stays lean
3. **Explicit triggers available** — Star-commands (`*commandname`) for on-demand modes

The result: Your AI assistant remembers how you work without wasting context on rules you don't need right now.

---

## Who This Is For

**OpenCode users** who want persistent preferences without bloated prompts.

You've figured out what works for you — coding style, response format, workflow patterns. CARL makes those preferences stick:

- Define rules once, use them forever
- Rules activate automatically based on context
- Override or extend per-project as needed
- No manual prompt engineering each session

If you find yourself repeating instructions, CARL is for you.

---

## Getting Started

### Installation

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

### Initialize

In OpenCode, run:

```
/carl setup
```

This seeds your project with the `.carl/` directory structure and default templates.

### Optional: AGENTS.md Integration

To add CARL documentation to your project's `AGENTS.md`:

```
/carl setup --integrate
```

### Your First Interaction

Type `*carl` in any prompt:

```
*carl
```

This activates **CARL Help Mode** — an interactive guide that can:
- Explain how CARL works
- Help you create custom domains
- Show your current configuration
- Guide you through rule syntax

---

## How It Works

```
You type: "help me fix this bug"
                │
                ▼
    ┌───────────────────────┐
    │   CARL Scans Your     │
    │   Prompt              │
    └───────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │  Matches "fix bug"    │
    │  → DEVELOPMENT domain │
    └───────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │  Injects Your Rules   │
    │  Into Context         │
    └───────────────────────┘
                │
                ▼
    Response includes your
    coding preferences baked in
```

CARL reads your `.carl/manifest` and injects only the rules that match your current task.

### Project Structure

```
.carl/
├── manifest              # Domain registry (states + keywords)
├── global                # Universal rules (always loaded)
├── commands              # Star-command definitions
├── context               # Context-aware rules (fresh/moderate/depleted)
├── sessions/             # Session state files
└── {custom-domain}       # Your domain files
```

---

## Core Concepts

### Domains

A domain is a collection of related rules. Create domains for different contexts:

| Example Domain | Trigger Keywords | What It Does |
|----------------|------------------|--------------|
| DEVELOPMENT | "fix bug", "write code" | Your coding preferences |
| CONTENT | "write script", "youtube" | Your content creation style |
| CLIENTS | "client project", "deliverable" | Project-specific rules |

When your prompt matches a domain's keywords, its rules load automatically.

### Star-Commands

Explicit triggers using `*commandname` syntax:

```
*brief explain recursion
```

Unlike domains (automatic), star-commands are intentional. Use them for workflow modes:

- Response formatting (concise vs detailed)
- Task modes (planning vs execution)
- Review and analysis patterns

Create your own star-commands for frequently-used behaviors.

### The Manifest

Controls which domains exist and when they activate:

```
DEVELOPMENT_STATE=active
DEVELOPMENT_RECALL=fix bug, write code, implement
DEVELOPMENT_EXCLUDE=
DEVELOPMENT_ALWAYS_ON=false
```

| Field | Purpose |
|-------|---------|
| STATE | `active` or `inactive` |
| RECALL | Keywords that trigger loading |
| EXCLUDE | Keywords that prevent loading |
| ALWAYS_ON | Load every session if `true` |

### Rule Format

Simple `KEY=VALUE` in domain files:

```
DEVELOPMENT_RULE_0=Code over explanation - show, don't tell
DEVELOPMENT_RULE_1=Prefer editing existing files over creating new
DEVELOPMENT_RULE_2=Run tests after implementation changes
```

**Pattern:** `{DOMAIN}_RULE_{N}=instruction`

---

## Configuration

### Global vs Local

| Location | Scope | Use Case |
|----------|-------|----------|
| `~/.carl/` | All projects | Universal preferences |
| `./.carl/` | Current project | Project-specific rules |

Local rules override global when both exist.

### Creating Custom Domains

1. Create file `.carl/myworkflow` (lowercase)
2. Add rules with uppercase prefix:
   ```
   MYWORKFLOW_RULE_0=First instruction
   MYWORKFLOW_RULE_1=Second instruction
   ```
3. Register in manifest:
   ```
   MYWORKFLOW_STATE=active
   MYWORKFLOW_RECALL=keyword1, keyword2
   ```

Or use `*carl` and say "help me create a domain" for guided setup.

---

## Commands

| Command | Purpose |
|---------|---------|
| `*carl` | Enter help mode |
| `*carl docs` | View documentation |
| `/carl` | Domain management |
| `/carl list` | Show all domains |
| `/carl view DOMAIN` | Show rules in a domain |
| `/carl toggle DOMAIN active\|inactive` | Enable/disable domain |

---

## Rule Precedence

CARL rules inject alongside your OpenCode AGENTS.md rules. Both apply, with CARL rules providing dynamic context-aware loading based on your current task.

---

## Troubleshooting

**Rules not loading?**
1. Check manifest has `STATE=active`
2. Verify recall keywords match your prompt
3. Check `.carl/manifest` exists

**Too many rules loading?**
1. Make recall keywords more specific
2. Use EXCLUDE to block unwanted matches
3. Split broad domains into focused ones

**Need help?**
- Type `*carl` for interactive guidance
- Check `.carl/manifest` for current configuration

---

## Philosophy

### Lean Context

Static prompts waste tokens on irrelevant rules. CARL loads only what's needed:

| Approach | Context Cost |
|----------|--------------|
| Static AGENTS.md | All rules, every session |
| CARL | Only matched rules |

More room for actual work.

### Explicit Over Magic

CARL is transparent:
- See exactly which domains loaded
- Know why rules activated (keyword match)
- Override with star-commands when needed

No hidden behavior.

### Your Rules, Your Way

CARL provides structure, not opinions. The default domains are examples — customize or replace them entirely. Your workflow, your rules.

---

## What's Included

```
@krisgray/opencode-carl-plugin/
├── dist/plugin.js          # Plugin entrypoint
├── .carl-template/         # Default configuration
│   ├── manifest            # Domain registry
│   ├── global              # Universal rules
│   ├── commands            # Star-command definitions
│   └── context             # Context bracket rules
└── resources/              # Commands and skills
    ├── commands/carl/      # /carl commands
    └── skills/             # Domain management helpers
```

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Author

**Chris Kahler** — [Chris AI Systems](https://github.com/ChristopherKahler)

Building tools for AI-assisted development.

---

<div align="center">

**OpenCode is powerful. CARL makes it personal.**

</div>
