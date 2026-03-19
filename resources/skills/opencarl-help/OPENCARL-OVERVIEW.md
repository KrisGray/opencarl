# OpenCARL Overview

**Context Augmentation & Reinforcement Layer** - Dynamic rules that load just-in-time.

## What is OpenCARL?

OpenCARL gives your AI assistant persistent memory about how YOU work. Instead of repeating instructions every session, you define rules once and they load automatically when relevant.

## How It Works

```
You type: "help me fix this bug"
   │
   ▼
OpenCARL scans your prompt for keywords
   │
   ▼
Matches "fix bug" → DEVELOPMENT domain
   │
   ▼
Injects DEVELOPMENT rules into context
   │
   ▼
Response includes your coding preferences baked in
```

## Core Concepts

### Domains
A domain is a collection of related rules. Examples:
- **GLOBAL** - Universal rules (always loaded)
- **DEVELOPMENT** - Coding preferences
- **CONTENT** - Writing/content creation rules

### Recall Keywords
Each domain has keywords that trigger loading:
```
DEVELOPMENT_RECALL=fix bug, write code, implement feature
```
When you mention "fix bug", DEVELOPMENT rules load automatically.

### Star-Commands
Explicit rule triggers using `*commandname`:
- `*brief` - Concise responses
- `*dev` - Development mode
- `*plan` - Planning mode

Unlike domains, star-commands only load when you explicitly type them.

## File Structure

```
.opencarl/
├── manifest        # Domain registry (states + recall keywords)
├── global          # GLOBAL rules (always loaded)
├── commands        # Star-command definitions
├── context         # Context bracket rules (FRESH/MODERATE/DEPLETED)
└── {domain}        # Custom domain files
```

## Rule Format

Domain files use simple `KEY=VALUE` format:

```
# DEVELOPMENT Domain Rules
DEVELOPMENT_RULE_0=Code over explanation - show, don't tell
DEVELOPMENT_RULE_1=Prefer editing existing files over creating new
DEVELOPMENT_RULE_2=Run tests after implementation changes
```

**Pattern:** `{DOMAIN}_RULE_{N}=rule text`
- Domain prefix is UPPERCASE
- Indices start at 0
- Sequential numbering

## Manifest Format

The manifest controls which domains exist and when they load:

```
DEVELOPMENT_STATE=active
DEVELOPMENT_RECALL=fix bug, write code, implement
DEVELOPMENT_EXCLUDE=
DEVELOPMENT_ALWAYS_ON=false
```

| Field | Purpose |
|-------|---------|
| STATE | `active` or `inactive` |
| RECALL | Comma-separated trigger keywords |
| EXCLUDE | Keywords that prevent loading |
| ALWAYS_ON | Load every session if `true` |

## Quick Examples

### Add a Rule
```
/opencarl add rule DEVELOPMENT 'Always use TypeScript strict mode'
```

### Create a Domain
```
/opencarl create TESTING --recall 'test, testing, run tests'
/opencarl add rule TESTING 'Run full test suite before committing'
/opencarl add rule TESTING 'Include edge case tests'
```

### Create a Star-Command
```
/opencarl add command mycommand '*mycommand - Brief description'
/opencarl add command mycommand 'First instruction'
/opencarl add command mycommand 'Second instruction'
```

Invoke with `*mycommand` in any prompt.

## Best Practices

1. **Keep rules focused** - One clear instruction per rule
2. **Use specific recall keywords** - Avoid overly broad matches
3. **Test your domains** - Say the recall keywords, verify rules load
4. **Start small** - Add rules as you discover patterns, not preemptively
5. **Use GLOBAL sparingly** - Only for truly universal behaviors

## Common Patterns

### Project-Specific Rules
Put `.opencarl/` in your project root for repo-specific rules. They override global `~/.opencarl/` rules.

### Temporary Disable
```
/opencarl toggle TESTING inactive
```

### Star-Command for Common Tasks
If you frequently want specific behavior, make it a star-command:
```
QUICK_RULE_0=*quick - Skip explanations, just show the code
QUICK_RULE_1=No commentary unless asked
QUICK_RULE_2=Minimal output
```

## Getting Help

- `*opencarl` - Enter help mode (this guide)
- `/opencarl` - Domain management (create, edit, toggle)
- `/opencarl list` - Show all domains
- `/opencarl view DOMAIN` - Show rules in a domain

## Troubleshooting

**Rules not loading?**
1. Check manifest has correct `STATE=active`
2. Verify recall keywords match your prompt
3. Look for typos in domain filename (must be lowercase)

**Too many rules loading?**
1. Make recall keywords more specific
2. Use EXCLUDE to block unwanted matches
3. Consider splitting into separate domains

**Star-command not working?**
1. Ensure `COMMANDS_STATE=active` in manifest
2. Check command is in `.opencarl/commands` file
3. Verify `*commandname` syntax (asterisk + lowercase)
