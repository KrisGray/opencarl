<div align="center">

# OpenCARL

[![Coverage](https://codecov.io/gh/KrisGray/opencarl/branch/main/graph/badge.svg)](https://codecov.io/gh/KrisGray/opencarl)

**Context Augmentation & Reinforcement Layer** — Dynamic rules for OpenCode.

[![npm version](https://img.shields.io/npm/v/@krisgray/opencarl?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/@krisgray/opencarl)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/KrisGray/opencarl?style=for-the-badge&logo=github&color=181717)](https://github.com/KrisGray/opencarl)

<br>

*"Rules that load when relevant, disappear when not."*

<br>

[Why OpenCARL](#why-opencarl) · [Getting Started](#getting-started) · [How It Works](#how-it-works) · [Core Concepts](#core-concepts)

</div>

---

# 🚨 Breaking Change Notice

Environment variable renamed to **OPENCARL_DEBUG** (immediate, no deprecation)

If you previously set the debug environment variable in your environment or CI configuration, you must update to OPENCARL_DEBUG immediately.

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for debugging options and migration instructions

## What is OpenCARL?

OpenCARL is a dynamic rule injection plugin for OpenCode that gives your AI assistant persistent memory about how you work. Instead of repeating instructions every session, define rules once and they load automatically when relevant to your current task.

**Key Features:**
- 🎯 **Keyword-based loading** - Rules activate when you mention specific terms
- ⭐ **Star-commands** - Explicit triggers like `*brief` for on-demand modes
- 🔄 **Context-aware** - Adjusts behavior based on session context
- 🌐 **Global & project rules** - Share across projects or keep them specific
- 📝 **AGENTS.md integration** - Optional documentation integration

OpenCARL is an OpenCode adaptation of the Context Augmentation & Reinforcement Layer project, originally created by Chris Kahler for Claude Code.

---

## Why OpenCARL

Every OpenCode session starts fresh. Your preferences, workflows, and hard-won lessons? Gone. You end up repeating the same instructions:

<details>
<summary>📖 Example instructions you might repeat</summary>

> "Use TypeScript strict mode."
> "Don't over-engineer."
> "Run tests after changes."
> "Prefer functional components."
> "Keep responses concise."

</details>

Static prompts in AGENTS.md work, but they bloat every session — even when irrelevant. Writing code? You don't need your content creation rules. Debugging? You don't need your planning workflow.

OpenCARL fixes this with **just-in-time rule injection**:

| Traditional Approach | OpenCARL Approach |
|---------------------|-------------------|
| All rules, every session | Only matched rules |
| Bloated context | Lean context |
| Manual repetition | Automatic loading |

### The Result

Your AI assistant remembers how you work without wasting context on rules you don't need right now.

---

## Who This Is For

**OpenCode users** who want persistent preferences without bloated prompts.

You've figured out what works for you — coding style, response format, workflow patterns. OpenCARL makes those preferences stick:

- ✅ Define rules once, use them forever
- ✅ Rules activate automatically based on context
- ✅ Override or extend per-project as needed
- ✅ No manual prompt engineering each session

If you find yourself repeating instructions, OpenCARL is for you.

---

## Getting Started

### Installation

```bash
npm install @krisgray/opencarl
```

### Configure opencode.json

Add OpenCARL to your `opencode.json` plugin list

```json
{
  "plugin": ["@krisgray/opencarl"]
}
```

### Initialize

In OpenCode, run

```
/opencarl setup
```

This seeds your project with the `.opencarl/` directory structure and default templates.

### Optional: AGENTS.md Integration

To add OpenCARL documentation to your project's `AGENTS.md`

```
/opencarl setup --integrate
```

### Optional: opencode.json Instructions Integration

To add OpenCARL docs to your `opencode.json` instructions field (for global OpenCode context)

```
/opencarl setup --integrate-opencode
```

This merges OpenCARL documentation into your opencode.json, making it available to OpenCode in every session.

For full documentation, see [OPENCARL-DOCS.md](resources/docs/OPENCARL-DOCS.md).

### Your First Interaction

Type `*opencarl` in any prompt

```
*opencarl
```

This activates **OpenCARL Help Mode** — an interactive guide that can
- Explain how OpenCARL works
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
    │   OpenCARL Scans Your  │
    │   Prompt               │
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

OpenCARL reads your `.opencarl/manifest` and injects only the rules that match your current task.

### Project Structure

```
.opencarl/
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

A domain is a collection of related rules. Create domains for different contexts

| Example Domain | Trigger Keywords | What It Does |
|----------------|------------------|--------------|
| DEVELOPMENT | "fix bug", "write code" | Your coding preferences |
| CONTENT | "write script", "youtube" | Your content creation style |
| CLIENTS | "client project", "deliverable" | Project-specific rules |

When your prompt matches a domain's keywords, its rules load automatically.

### Star-Commands

Explicit triggers using `*commandname` syntax

```
*brief explain recursion
```

Unlike domains (automatic), star-commands are intentional. Use them for workflow modes

- Response formatting (concise vs detailed)
- Task modes (planning vs execution)
- Review and analysis patterns

Create your own star-commands for frequently-used behaviors.

### The Manifest

Controls which domains exist and when they activate

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

Simple `KEY=VALUE` in domain files

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
| `~/.opencarl/` | All projects | Universal preferences |
| `./.opencarl/` | Current project | Project-specific rules |

Local rules override global when both exist.

### Creating Custom Domains

1. Create file `.opencarl/myworkflow` (lowercase)
2. Add rules with uppercase prefix
   ```
   MYWORKFLOW_RULE_0=First instruction
   MYWORKFLOW_RULE_1=Second instruction
   ```
3. Register in manifest
   ```
   MYWORKFLOW_STATE=active
   MYWORKFLOW_RECALL=keyword1, keyword2
   ```

Or use `*opencarl` and say "help me create a domain" for guided setup.

---

## Commands

| Command | Purpose |
|---------|---------|
| `*opencarl` | Enter help mode |
| `*opencarl docs` | View documentation |
| `/opencarl` | Domain management |
| `/opencarl list` | Show all domains |
| `/opencarl view DOMAIN` | Show rules in a domain |
| `/opencarl toggle DOMAIN active\|inactive` | Enable/disable domain |

---

## Rule Precedence

OpenCARL rules inject alongside your OpenCode AGENTS.md rules. Both apply, with OpenCARL rules providing dynamic context-aware loading based on your current task.

---

## Troubleshooting

### Quick Diagnosis

| Problem | Fix |
|---------|-----|
| Rules not loading | Check `STATE=active` in manifest |
| Wrong rules loading | Make recall keywords more specific |
| Plugin not found | Verify opencode.json plugin path |
| Commands not available | Run `/opencarl setup` |

### Debug Mode

Enable detailed logging to see rule matching decisions:

```bash
OPENCARL_DEBUG=true
```

This outputs rule loading, matching, and injection details to help diagnose issues.

### Full Troubleshooting Guide

For comprehensive troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md) which covers:

- Installation issues
- Rule loading problems
- Matching/injection debugging
- Integration configuration

**Need help?**
- Type `*opencarl` for interactive guidance
- Check `.opencarl/manifest` for current configuration
- Run with `OPENCARL_DEBUG=true` for detailed logs

---

## Philosophy

### Lean Context

Static prompts waste tokens on irrelevant rules. OpenCARL loads only what's needed

| Approach | Context Cost |
|----------|--------------|
| Static AGENTS.md | All rules, every session |
| OpenCARL | Only matched rules |

More room for actual work.

### Explicit Over Magic

OpenCARL is transparent
- See exactly which domains loaded
- Know why rules activated (keyword match)
- Override with star-commands when needed

No hidden behavior.

### Your Rules, Your Way

OpenCARL provides structure, not opinions. The default domains are examples — customize or replace them entirely. Your workflow, your rules.

---

## What's Included

```
@krisgray/opencarl/
├── dist/plugin.js          # Plugin entrypoint
├── .opencarl-template/     # Default configuration
│   ├── manifest            # Domain registry
│   ├── global              # Universal rules
│   ├── commands            # Star-command definitions
│   └── context             # Context bracket rules
└── resources/              # Commands and skills
    ├── commands/opencarl/  # /opencarl commands
    └── skills/             # Domain management helpers
```

---

## Attribution & License

Context Augmentation & Reinforcement Layer was originally 
created by [Chris Kahler](https://github.com/ChristopherKahler) 
for Claude Code.

**OpenCARL** is an OpenCode adaptation, maintained by 
[Kristian Gray](https://github.com/KrisGray).

The original project can be found on Chris Kahler's GitHub profile.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Author

**Kristian Gray** — OpenCARL Maintainer

**Original Author** — Chris Kahler (Context Augmentation & Reinforcement Layer creator)

---

<div align="center">

**OpenCode is powerful. OpenCARL makes it personal.**

</div>
