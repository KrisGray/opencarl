# CARL Documentation

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

## Full Guide

### What is CARL?

CARL gives your AI assistant persistent memory about how YOU work. Instead of repeating instructions every session, you define rules once and they load automatically when relevant.

**Core value:** Keep CARL's dynamic rule injection working seamlessly with minimal user friction.

### How It Works

```
You type: "help me fix this bug"
   |
   v
CARL scans your prompt for keywords
   |
   v
Matches "fix bug" -> DEVELOPMENT domain
   |
   v
Injects DEVELOPMENT rules into context
   |
   v
Response includes your coding preferences baked in
```

### Core Concepts

#### Domains
A domain is a collection of related rules. Examples:
- **GLOBAL** - Universal rules (always loaded)
- **DEVELOPMENT** - Coding preferences
- **CONTENT** - Writing/content creation rules

#### Recall Keywords
Each domain has keywords that trigger loading:
```
DEVELOPMENT_RECALL=fix bug, write code, implement feature
```
When you mention "fix bug", DEVELOPMENT rules load automatically.

#### Star-Commands
Explicit rule triggers using `*commandname`:
- `*brief` - Concise responses
- `*dev` - Development mode
- `*plan` - Planning mode

Unlike domains, star-commands only load when you explicitly type them.

#### Context Brackets
CARL adjusts rule behavior based on session context:
- **FRESH** - Full context available, thorough responses
- **MODERATE** - Balanced detail
- **DEPLETED** - Minimal injection, explicit warnings

### File Structure Details

```
.carl/
├── manifest        # Domain registry (states + recall keywords)
├── global          # GLOBAL rules (always loaded)
├── commands        # Star-command definitions
├── context         # Context bracket rules (FRESH/MODERATE/DEPLETED)
├── sessions/       # Session state files
└── {domain}        # Custom domain files (lowercase, no extension)
```

**Important:** Domain filenames must be lowercase with NO file extension.

### Rule Format Details

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

### Manifest Format Details

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

### Best Practices

1. **Keep rules focused** - One clear instruction per rule
2. **Use specific recall keywords** - Avoid overly broad matches
3. **Test your domains** - Say the recall keywords, verify rules load
4. **Start small** - Add rules as you discover patterns, not preemptively
5. **Use GLOBAL sparingly** - Only for truly universal behaviors

### Common Patterns

#### Project-Specific Rules
Put `.carl/` in your project root for repo-specific rules. They override global `~/.carl/` rules.

#### Temporary Disable
Set `DOMAIN_STATE=inactive` in manifest to disable without deleting.

#### Star-Command for Common Tasks
If you frequently want specific behavior, make it a star-command:
```
QUICK_RULE_0=*quick - Skip explanations, just show the code
QUICK_RULE_1=No commentary unless asked
QUICK_RULE_2=Minimal output
```

### Creating a New Domain

1. Create file `.carl/mydomain` (lowercase, no extension)
2. Add rules:
   ```
   MYDOMAIN_RULE_0=First rule
   MYDOMAIN_RULE_1=Second rule
   ```
3. Add to manifest:
   ```
   MYDOMAIN_STATE=active
   MYDOMAIN_RECALL=keyword1, keyword2
   MYDOMAIN_EXCLUDE=
   MYDOMAIN_ALWAYS_ON=false
   ```

### Getting Help

- `*carl` - Enter help mode
- `*carl docs` - View this documentation
- `/carl` - Domain management
- `/carl list` - Show all domains
- `/carl view DOMAIN` - Show rules in a domain

### Troubleshooting

**Rules not loading?**
1. Check manifest has correct `STATE=active`
2. Verify recall keywords match your prompt
3. Look for typos in domain filename (must be lowercase, no extension)

**Too many rules loading?**
1. Make recall keywords more specific
2. Use EXCLUDE to block unwanted matches
3. Consider splitting into separate domains

**Star-command not working?**
1. Ensure `COMMANDS_STATE=active` in manifest
2. Check command is in `.carl/commands` file
3. Verify `*commandname` syntax (asterisk + lowercase)

**Context bracket warnings?**
- DEPLETED context means session has been compacted
- Rules still load but with minimal injection overhead
- Warning is intentional to alert you to reduced context

---

*For the latest documentation, visit: [GitHub CARL Repository](https://github.com/ChristopherKahler/carl)*
*This documentation is bundled with your CARL plugin.*
