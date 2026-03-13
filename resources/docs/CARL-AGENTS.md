# OpenCARL - Context Augmentation & Reinforcement Layer

OpenCARL is a dynamic rule injection plugin for OpenCode that gives your AI assistant persistent memory about how you work. Instead of repeating instructions every session, define rules once and they load automatically when relevant to your current task.

**Key Features:**
- 🎯 **Keyword-based loading** - Rules activate when you mention specific terms
- ⭐ **Star-commands** - Explicit triggers like `*brief` for on-demand modes
- 🔄 **Context-aware** - Adjusts behavior based on session context
- 🌐 **Global & project rules** - Share across projects or keep them specific
- 📝 **AGENTS.md integration** - Optional documentation integration

OpenCARL is an OpenCode adaptation of the Context Augmentation & Reinforcement Layer, originally created by Chris Kahler for Claude Code.

## How OpenCARL Works with OpenCode

### Rule Precedence

OpenCARL rules are injected alongside OpenCode's built-in rules and instructions:

1. **OpenCode AGENTS.md rules** - Load first as project-scoped instructions
2. **OpenCARL's dynamic rules** - Load based on recall keyword matches
3. **Both sets of rules apply** to the current session

**Key insight:** OpenCARL doesn't replace OpenCode rules - it complements them with dynamic, context-aware rule injection based on what you're working on.

### Integration Points

| Integration | Purpose |
|-------------|---------|
| `*opencarl` | Enter OpenCARL help mode |
| `*opencarl docs` | View full OpenCARL documentation |
| `/opencarl` | Domain management commands |
| `.opencarl/` directory | Your rule definitions |

### Best Practices

1. **Keep OpenCARL rules in `.opencarl/` directory** - Separate from AGENTS.md
2. **Use recall keywords** - Let OpenCARL auto-load relevant rules
3. **Use star-commands** - `*commandname` for explicit rule triggers
4. **Review `.opencarl/manifest`** - See active domains and their settings

## Quick Reference

### File Structure
```
.opencarl/
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
| `*opencarl` | Enter help mode |
| `*opencarl docs` | View documentation |
| `/opencarl` | Domain management |
| `/opencarl list` | Show all domains |
| `/opencarl view DOMAIN` | Show rules in a domain |
| `/opencarl toggle DOMAIN active\|inactive` | Enable/disable domain |

### Quick Example: Add a Rule
Edit `.opencarl/development`:
```
DEVELOPMENT_RULE_5=Always use TypeScript strict mode
```

### Quick Example: Create a Star-Command
Edit `.opencarl/commands`:
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

## Migrating from AGENTS.md

If your AGENTS.md has grown large with behavioral rules, consider moving them to OpenCARL domains

| Content Type | Keep in AGENTS.md | Move to OpenCARL |
|--------------|-------------------|------------------|
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

→ `.opencarl/development`:
```
DEVELOPMENT_RULE_0=Always use TypeScript strict mode
DEVELOPMENT_RULE_1=Prefer functional components
DEVELOPMENT_RULE_2=Run tests after implementation changes
```

→ `.opencarl/manifest`:
```
DEVELOPMENT_STATE=active
DEVELOPMENT_RECALL=write code, fix bug, implement, refactor
```

This keeps AGENTS.md focused on project context while OpenCARL handles behavioral preferences.

---

For full documentation, run `*opencarl docs` or see `.opencarl/` directory.
