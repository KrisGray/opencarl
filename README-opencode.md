# CARL - Context Augmentation & Reinforcement Layer for OpenCode

Dynamic rule injection for OpenCode that adapts to your workflow.

## Installation

```bash
npm install @krisgray/opencode-carl-plugin
```

## Quick Setup

1. **Add to opencode.json:**
   ```json
   {
     "plugin": ["@krisgray/opencode-carl-plugin"]
   }
   ```

2. **Initialize CARL:**
   ```
   /carl setup
   ```
   This seeds your project with the `.carl/` directory structure and default templates.

3. **Optional - Integrate with AGENTS.md:**
   ```
   /carl setup --integrate
   ```
   Adds CARL documentation to your project's AGENTS.md file.

## Features

- **Dynamic Rule Injection** - Rules load automatically based on keywords in your prompts
- **Global & Project Rules** - Share rules across projects or keep them project-specific
- **Star-Commands** - Explicit rule triggers using `*commandname` syntax
- **Context-Aware** - Adjusts behavior based on session context (FRESH/MODERATE/DEPLETED)

## Configuration

### Directory Structure

```
.carl/
├── manifest        # Domain registry (states + recall keywords)
├── global          # GLOBAL rules (always loaded)
├── commands        # Star-command definitions
├── context         # Context bracket rules
├── sessions/       # Session state files
└── {domain}        # Custom domain files (lowercase, no extension)
```

### Quick Example

1. **Create a rule:**
   Edit `.carl/development`:
   ```
   DEVELOPMENT_RULE_0=Always use TypeScript strict mode
   DEVELOPMENT_RULE_1=Prefer editing existing files over creating new
   ```

2. **Register the domain:**
   Add to `.carl/manifest`:
   ```
   DEVELOPMENT_STATE=active
   DEVELOPMENT_RECALL=fix bug, write code, implement feature
   ```

3. **Use it:**
   When you mention "fix bug" in a prompt, DEVELOPMENT rules load automatically.

### Star-Commands

Create explicit triggers for common workflows:

Edit `.carl/commands`:
```
QUICK_RULE_0=*quick - Skip explanations, just show the code
QUICK_RULE_1=No commentary unless asked
QUICK_RULE_2=Minimal output
```

Invoke with: `*quick`

## Documentation

- **Full docs:** `*carl docs` in OpenCode
- **GitHub:** https://github.com/ChristopherKahler/carl

## Commands

| Command | Purpose |
|---------|---------|
| `*carl` | Enter help mode |
| `*carl docs` | View documentation |
| `/carl` | Domain management |
| `/carl list` | Show all domains |
| `/carl view DOMAIN` | Show rules in a domain |
| `/carl toggle DOMAIN active\|inactive` | Enable/disable domain |

## Rule Precedence

CARL rules inject alongside your OpenCode AGENTS.md rules. Both apply, with CARL rules providing dynamic context-aware loading based on your current task.

## License

MIT

---

**Author:** Chris Kahler  
**Repository:** https://github.com/ChristopherKahler/carl
