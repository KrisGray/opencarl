<div align="center">

# OpenCARL

[![Coverage](https://codecov.io/gh/KrisGray/opencarl/branch/main/graph/badge.svg)](https://codecov.io/gh/KrisGray/opencarl)

**Context Augmentation & Reinforcement Layer** — Dynamic rules for OpenCode.

[![npm version](https://img.shields.io/npm/v/opencarl?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/opencarl)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/KrisGray/opencarl?style=for-the-badge&logo=github&color=181717)](https://github.com/KrisGray/opencarl)

<br>

*"Rules that load when relevant, disappear when not."*

<br>

[Why OpenCARL](#why-opencarl) · [Getting Started](#getting-started) · [Quick Start](#quick-start) · [How It Works](#how-it-works) · [Core Concepts](#core-concepts)

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

## Quick Start

### Workflow Example: Setting Up a New Project

Here's a typical OpenCARL workflow when starting a new project:

```
You: I need to set up a new React project with TypeScript

OpenCARL: [Injects DEVELOPMENT rules]
  - "Prefer functional components"
  - "Use TypeScript strict mode"
  - "Keep components under 200 lines"

You: Great, now add a login form with validation

OpenCARL: [Injects DEVELOPMENT + FORMS rules]
  - Previous rules still active
  - "Validate on blur, not on every keystroke"
  - "Show inline error messages"
```

### Workflow Example: Debugging Session

```
You: Help me fix this bug in the authentication flow

OpenCARL: [Injects DEBUGGING rules]
  - "Start with logs, then hypotheses"
  - "Check the simplest explanation first"
  - "Document the fix for future reference"

You: The issue is a race condition in the token refresh

OpenCARL: [Previous rules + context-aware injection]
  - Rules stay loaded while you work the problem
  - Context depletes? Fresh session rules load automatically
```

### Workflow Example: Code Review Mode

Create a star-command for consistent code reviews:

```
*review the PR for security issues
```

This triggers your custom `*review` command that injects:
- Security checklist rules
- Code quality preferences
- Documentation requirements

### Creating Your First Custom Domain

1. **Define what you want** — e.g., "I want rules for API development"

2. **Create the domain file** `.opencarl/api`:
   ```
   API_RULE_0=Always version your endpoints (v1, v2)
   API_RULE_1=Include rate limiting headers in responses
   API_RULE_2=Return consistent error structures
   API_RULE_3=Document with OpenAPI specs
   ```

3. **Register in manifest** `.opencarl/manifest`:
   ```
   API_STATE=active
   API_RECALL=api, endpoint, rest, graphql, backend
   ```

4. **Test it** — Mention "api" in your next prompt and watch the rules load

### From Zero to Productive in 5 Minutes

```bash
# 1. Install
npm install @krisgray/opencarl

# 2. Configure opencode.json
echo '{"plugin": ["@krisgray/opencarl"]}' > opencode.json

# 3. Initialize (in OpenCode)
/opencarl setup

# 4. Verify
*opencarl
```

You're now set up with:
- ✅ Global rules (always loaded)
- ✅ Development domain (loads on code-related prompts)
- ✅ Context brackets (adjusts based on session state)
- ✅ Star-commands (`*brief`, `*detailed`, `*review`)

---

## OpenPAUL Integration

**OpenPAUL** ([github.com/KrisGray/openpaul](https://github.com/KrisGray/openpaul)) is a structured development workflow system — the **Plan-Apply-Unify Loop**. Together, OpenCARL and OpenPAUL create a powerful AI-assisted development experience.

### How They Work Together

| OpenCARL | OpenPAUL |
|----------|----------|
| Dynamic rule injection | Structured workflow |
| Loads rules based on context | Guides planning & execution |
| Keeps context lean | Ensures loop closure (PLAN → APPLY → UNIFY) |

**The synergy:** OpenCARL loads OpenPAUL-specific rules when you're working in an OpenPAUL project, enforcing workflow discipline without bloating every session.

### Installation (Both Extensions)

```bash
# Install both packages
npm install @krisgray/opencarl @krisgray/openpaul
```

```json
// opencode.json
{
  "plugin": [
    "@krisgray/opencarl",
    "@krisgray/openpaul"
  ]
}
```

### Combined Workflow Example

Here's how the two extensions work together in a typical development session:

```
# 1. Initialize both systems
/openpaul:init
/opencarl setup

# 2. OpenCARL detects .openpaul/ directory
#    → Automatically loads OpenPAUL-specific rules:
#    - "Loop enforcement (PLAN → APPLY → UNIFY)"
#    - "Boundary protection for DO NOT CHANGE sections"
#    - "Verification required for every task"

# 3. Plan your work
/openpaul:plan

# OpenCARL injects planning rules:
# - "Define acceptance criteria before tasks"
# - "Every task needs files, action, verify, done"
# - "Set boundaries — what NOT to change"

# 4. Execute the plan
/openpaul:apply

# OpenCARL injects execution rules:
# - "Run tests after implementation changes"
# - "Verify each task before moving on"
# - "Log deviations from plan"

# 5. Close the loop (required!)
/openpaul:unify

# OpenCARL injects closure rules:
# - "Create SUMMARY.md documenting what was built"
# - "Compare plan vs actual"
# - "Record decisions for future sessions"
```

### Real-World Scenario: Feature Development

```
You: /openpaul:plan

OpenPAUL: Creates plan structure...
OpenCARL: [Injects OpenPAUL + Development rules]

You: [Describe the feature you want]

OpenPAUL: Generates PLAN.md with:
  - Objective
  - Acceptance Criteria (Given/When/Then)
  - Tasks with verification steps
  - Boundaries

You: /openpaul:apply

OpenPAUL: Executes tasks sequentially...
OpenCARL: [Injects execution rules + context tracking]

[... work happens ...]

OpenPAUL: Task complete. Checkpoint: Run tests?
You: yes

OpenPAUL: Tests pass. Next task...
OpenCARL: [Context depleting → Injects fresh session rules]

[... more work ...]

You: /openpaul:unify

OpenPAUL: Creates SUMMARY.md, updates STATE.md
OpenCARL: [Injects closure rules]

Done. Loop complete. State preserved for next session.
```

### Why Use Both?

| Challenge | OpenCARL Alone | OpenPAUL Alone | Together |
|-----------|----------------|----------------|----------|
| Context bloat | ✅ Solved | ❌ Still bloats | ✅ Lean + structured |
| Workflow discipline | ❌ No enforcement | ✅ Loop required | ✅ Rules enforce loop |
| Session continuity | ⚠️ Partial | ✅ STATE.md | ✅ Full continuity |
| Decision logging | ❌ Manual | ✅ Automatic | ✅ Rules guide logging |
| Quality consistency | ⚠️ Depends on rules | ✅ AC-driven | ✅ AC + quality rules |

### OpenPAUL-Specific Rules That OpenCARL Enforces

When OpenCARL detects you're working in an OpenPAUL project:

1. **Loop Enforcement** — No skipping UNIFY. Every plan needs closure.
2. **Boundary Protection** — `DO NOT CHANGE` sections in plans are sacred.
3. **AC-First Development** — Acceptance criteria defined before tasks.
4. **Verification Requirements** — Every task needs a verify step.
5. **State Consistency** — STATE.md must reflect reality after each phase.

These rules load automatically when you're in `.openpaul/` context and disappear when you're not.

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
