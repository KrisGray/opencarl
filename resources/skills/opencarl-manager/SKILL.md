---
name: opencarl-manager
description: Manage OpenCARL domains and rules. Auto-activates when user says "make this a rule", "add this to OpenCARL", "create a domain for X", or asks which domain something belongs in. Does NOT handle setup - use CLI instead: say `npx opencarl --local`.
# {DOMAIN} Domain Rules
{DOMAIN}_RULE_0=First rule
{DOMAIN}_RULE_1=Second rule
```

### Manifest Entry
```
{DOMAIN}_STATE=active
{DOMAIN}_RECALL=keyword1, keyword2
{DOMAIN}_EXCLUDE=
{DOMAIN}_ALWAYS_ON=false
```

## Operations

### Add Rule to Existing Domain
1. Read domain file
2. Find highest RULE_N index
3. Append new rule at index+1
4. Write file

### Create New Domain
1. Create `.opencarl/{domain}` (lowercase filename)
2. Add rules with UPPERCASE prefix
3. Add manifest entries
4. Optionally add to DOMAIN_ORDER

### Suggest Domain
See SUGGEST-DOMAIN.md for domain categorization logic.

### Toggle Domain
1. Read manifest
2. Update {DOMAIN}_STATE to active/inactive
3. Write manifest

### Create Star-Command
1. Read `.opencarl/commands`
2. Add {COMMAND}_RULE_N entries
3. User invokes with *commandname

## Response Style

Be direct. Show exact changes:

```
Adding to DEVELOPMENT domain:

.opencarl/development:
+ DEVELOPMENT_RULE_5=Always use TypeScript strict mode

Done. Rule added at index 5.
```

## Supporting Files

| File | Purpose |
|------|---------|
| DOMAIN-GUIDE.md | Domain structure, naming conventions |
| MANIFEST-REFERENCE.md | All manifest fields explained |
| CONTEXT-RULES.md | CONTEXT bracket system (FRESH/MODERATE/DEPLETED) |
| COMMANDS-GUIDE.md | Star-command format and examples |
| SUGGEST-DOMAIN.md | Logic for suggesting domain placement |

## When to Activate

- User says "make this a rule" or "add this as a rule"
- User asks "what domain should this be in?"
- User wants to "create a domain for X"
- User wants to add a star-command (*brief, *discuss, etc.)
- User asks about OpenCARL structure or configuration (but NOT setup)

## Important Notes

- Filenames lowercase, rule prefixes UPPERCASE
- Sequential indices starting at 0
- Manifest uses `=` with no spaces
- GLOBAL is always-on by default
- Read existing file first to get current max index
