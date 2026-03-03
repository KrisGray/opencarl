# CARL - Context Augmentation & Reinforcement Layer

CARL provides dynamic rule injection for this project. Rules load automatically when relevant to your current task, giving your AI assistant persistent memory about how you work.

## How CARL Works with OpenCode

### Rule Precedence

CARL rules are injected alongside OpenCode's built-in rules and instructions:

1. **OpenCode AGENTS.md rules** - Load first as project-scoped instructions
2. **CARL's dynamic rules** - Load based on recall keyword matches
3. **Both sets of rules apply** to the current session

**Key insight:** CARL doesn't replace OpenCode rules - it complements them with dynamic, context-aware rule injection based on what you're working on.

### Integration Points

| Integration | Purpose |
|-------------|---------|
| `*carl` | Enter CARL help mode |
| `*carl docs` | View full CARL documentation |
| `/carl` | Domain management commands |
| `.carl/` directory | Your rule definitions |

### Best Practices

1. **Keep CARL rules in `.carl/` directory** - Separate from AGENTS.md
2. **Use recall keywords** - Let CARL auto-load relevant rules
3. **Use star-commands** - `*commandname` for explicit rule triggers
4. **Review `.carl/manifest`** - See active domains and their settings

### Migrating from AGENTS.md

If your AGENTS.md has grown large with behavioral rules, consider moving them to CARL domains:

| Content Type | Keep in AGENTS.md | Move to CARL |
|--------------|-------------------|--------------|
| Project identity & purpose | ✓ | |
| Directory structure | ✓ | |
| Team/business context | ✓ | |
| Git/commit conventions | ✓ | |
| **Coding preferences** | | ✓ |
| **Response formatting rules** | | ✓ |
| **Workflow-specific instructions** | | ✓ |
| **Tool usage preferences** | | ✓ |

**Migration example:**

AGENTS.md:
```
Always use TypeScript strict mode. Prefer functional components. Run tests after changes.
```

→ `.carl/development`:
```
DEVELOPMENT_RULE_0=Always use TypeScript strict mode
DEVELOPMENT_RULE_1=Prefer functional components
DEVELOPMENT_RULE_2=Run tests after implementation changes
```

→ `.carl/manifest`:
```
DEVELOPMENT_STATE=active
DEVELOPMENT_RECALL=write code, fix bug, implement, refactor
```

**Benefit:** Rules only load when you're coding, keeping context lean when doing other tasks.

## Quick Reference

### File Structure

```
.carl/
├── manifest        # Domain registry (states + recall keywords)
├── global          # GLOBAL rules (always loaded)
├── commands        # Star-command definitions
├── context         # Context bracket rules (FRESH/MODERATE/DEPLETED)
├── sessions/       # Session state files
└── {domain}        # Custom domain files (lowercase, no extension)
```

### Rule Format

```
{DOMAIN}_RULE_{N}=rule text
```

- Domain prefix is UPPERCASE
- Indices start at 0
- Sequential numbering

### Manifest Format

```
{DOMAIN}_STATE=active
{DOMAIN}_RECALL=keyword1, keyword2
{DOMAIN}_EXCLUDE=
{DOMAIN}_ALWAYS_ON=false
```

### Common Commands

| Command | Purpose |
|---------|---------|
| `*carl` | Enter help mode |
| `*carl docs` | View documentation |
| `/carl` | Domain management |
| `/carl list` | Show all domains |
| `/carl view DOMAIN` | Show rules in a domain |
| `/carl toggle DOMAIN active\|inactive` | Enable/disable domain |

### Quick Example: Add a Rule

Edit `.carl/development`:
```
DEVELOPMENT_RULE_5=Always use TypeScript strict mode
```

### Quick Example: Create a Star-Command

Edit `.carl/commands`:
```
QUICK_RULE_0=*quick - Skip explanations, just show the code
QUICK_RULE_1=No commentary unless asked
QUICK_RULE_2=Minimal output
```

Invoke with `*quick` in any prompt.

### Troubleshooting Quick Fixes

| Problem | Fix |
|---------|-----|
| Rules not loading | Check `STATE=active` in manifest |
| Wrong rules loading | Make recall keywords more specific |
| Star-command not working | Verify `COMMANDS_STATE=active` in manifest |
| Domain file ignored | Filename must be lowercase, no extension |

---

For full documentation, run `*carl docs` or see `.carl/` directory.
