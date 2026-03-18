# OpenCARL Troubleshooting Guide

This guide helps you solve common OpenCARL problems without external support. Each problem includes diagnosis steps and copy-pasteable solutions.

---

## Quick Diagnosis Checklist

Run these 5 checks first to identify most issues:

**1. Check plugin is loaded**
```bash
# Look for OpenCARL in your OpenCode config
cat .opencode/opencode.json | grep -i opencarl
```
Expected: `"plugins"` array contains OpenCARL plugin path

**2. Check .opencarl/ directory exists**
```bash
# Global rules
ls -la ~/.opencarl/manifest

# Project rules (if using)
ls -la .opencarl/manifest
```
Expected: Manifest file exists and is readable

**3. Check domain state**
```bash
# View manifest
cat ~/.opencarl/manifest | grep STATE
```
Expected: At least one domain has `STATE=active`

**4. Test keyword matching**
```bash
# Enable debug mode
export OPENCARL_DEBUG=true
# Then trigger OpenCode with a recall keyword like "fix bug"
```
Expected: Debug output shows domain matching

**5. Verify domain file names**
```bash
# List domain files
ls ~/.opencarl/ | grep -v manifest | grep -v global | grep -v commands | grep -v context
```
Expected: All domain files are lowercase with NO extension (e.g., `development` not `Development.txt`)

---

## Common Problems

### Installation Issues

#### Problem: Plugin not loading after install

**Symptoms:**
- Rules don't appear in context
- `*opencarl` command doesn't work
- No OpenCARL-related output when starting OpenCode

**Diagnosis:**
1. Check if plugin path is correct in `opencode.json`:
   ```bash
   cat .opencode/opencode.json | grep -A 10 plugins
   ```

2. Verify plugin file exists:
   ```bash
   ls -la .opencode/plugins/opencarl-plugin/index.js
   ```

3. Check for JavaScript errors:
   ```bash
   export OPENCARL_DEBUG=true
   # Restart OpenCode and check for error messages
   ```

**Solution:**

If plugin path is missing, add it to `~/.config/opencode/opencode.json`:
```json
{
  "plugin": ["opencarl"]
}
```

If plugin file doesn't exist, reinstall:
```bash
# Reinstall from npm
npm install opencarl

# Or reinstall from local
npx opencarl-setup
```

**Still failing?** Check file permissions:
```bash
chmod +x .opencode/plugins/opencarl-plugin/index.js
chmod -R 755 .opencode/plugins/opencarl-plugin/
```

---

#### Problem: Setup command not found

**Symptoms:**
- `npx opencarl-setup` returns "command not found"
- Package appears installed but CLI isn't accessible

**Diagnosis:**
```bash
# Check if package is installed
npm list opencarl

# Check if binary exists
ls node_modules/.bin/opencarl-setup
```

**Solution:**

If package not installed:
```bash
npm install opencarl
```

If binary missing but package installed:
```bash
# Clear npm cache and reinstall
rm -rf node_modules
npm install
```

If using global install:
```bash
npm install -g opencarl
opencarl-setup
```

---

### Rule Loading Issues

#### Problem: Rules not appearing in context

**Symptoms:**
- OpenCARL is loaded but rules don't inject
- Specific domains not loading when expected
- Debug mode shows domain matching but no rules

**Diagnosis:**
1. Check manifest STATE:
   ```bash
   cat ~/.opencarl/manifest | grep STATE
   ```
   Expected: At least one domain shows `DOMAIN_STATE=active`

2. Verify recall keywords match your prompt:
   ```bash
   cat ~/.opencarl/manifest | grep RECALL
   ```
   Example: `DEVELOPMENT_RECALL=fix bug, write code, implement`

3. Test with debug mode:
   ```bash
   export OPENCARL_DEBUG=true
   # Trigger OpenCode with a recall keyword
   ```

**Solution:**

If STATE is inactive, enable the domain:
```bash
# Edit manifest
nano ~/.opencarl/manifest

# Change:
DEVELOPMENT_STATE=inactive
# To:
DEVELOPMENT_STATE=active
```

If recall keywords don't match, update them:
```bash
# Add more keywords
DEVELOPMENT_RECALL=fix bug, write code, implement, refactor, debug
```

If domain file is missing, create it:
```bash
# Create domain file (lowercase, no extension)
cat > ~/.opencarl/development << 'EOF'
DEVELOPMENT_RULE_0=Code over explanation - show, don't tell
DEVELOPMENT_RULE_1=Prefer editing existing files over creating new
EOF
```

**Still not loading?** Check for manifest syntax errors:
```bash
# Look for malformed lines
cat ~/.opencarl/manifest | grep -v "^#" | grep -v "="
# Should return nothing (all non-comment lines should have "=")
```

---

#### Problem: Project rules not loading

**Symptoms:**
- Global rules work but `.opencarl/` in project is ignored
- Debug shows "project" status as "none" or "invalid"

**Diagnosis:**
```bash
# Check if project .opencarl/ exists
ls -la .opencarl/manifest

# Enable debug to see project status
export OPENCARL_DEBUG=true
```

**Solution:**

Project rules require explicit opt-in. If using the loader directly, ensure `projectOptIn: true`:
```typescript
// In your plugin or loader call
loadOpencarlRules({ projectOptIn: true })
```

If manifest is invalid, check for syntax errors:
```bash
# Validate manifest
cat .opencarl/manifest | grep "=" | wc -l
# Should match number of non-comment lines

# Check for common issues:
# - Missing "=" in line
# - Invalid STATE values (must be "active" or "inactive")
# - Typos in domain names (must be UPPERCASE)
```

If manifest is valid but rules still don't load:
```bash
# Check domain file names
ls .opencarl/ | grep -v manifest

# Names must be lowercase with NO extension:
# ✓ development
# ✓ commands
# ✗ Development.txt
# ✗ development.rules
```

---

#### Problem: Domain file ignored

**Symptoms:**
- Domain appears in manifest but rules never load
- Debug output shows "Missing domain file" warning

**Diagnosis:**
```bash
# Check domain file location
ls -la ~/.opencarl/ | grep -i development

# Check manifest domain name
cat ~/.opencarl/manifest | grep DEVELOPMENT_STATE
```

**Solution:**

Domain filenames must be lowercase with NO file extension:
```bash
# Wrong:
~/.opencarl/Development.txt
~/.opencarl/development.rules

# Right:
~/.opencarl/development

# Rename if needed:
mv ~/.opencarl/Development.txt ~/.opencarl/development
```

The domain name in manifest must be UPPERCASE:
```bash
# Wrong:
development_STATE=active

# Right:
DEVELOPMENT_STATE=active
```

---

### Matching Issues

#### Problem: Wrong rules loading

**Symptoms:**
- Rules from wrong domain appear in context
- Too many rules loading at once
- Irrelevant rules injected for simple tasks

**Diagnosis:**
```bash
# Check recall keywords for all domains
cat ~/.opencarl/manifest | grep RECALL
```

**Solution:**

Make recall keywords more specific. Avoid overly broad terms:

**Before (too broad):**
```
DEVELOPMENT_RECALL=code, test, build
```

**After (specific):**
```
DEVELOPMENT_RECALL=fix bug, implement feature, refactor code
```

Use EXCLUDE to prevent unwanted matches:
```bash
# Prevent DEVELOPMENT from loading during docs work
DEVELOPMENT_EXCLUDE=documentation, readme, docs
```

**Example: Separating domains**
```bash
# In manifest:
DEVELOPMENT_RECALL=fix bug, implement feature, refactor
TESTING_RECALL=write test, unit test, integration test
DOCUMENTATION_RECALL=write docs, update readme

# Each domain has specific, non-overlapping keywords
```

---

#### Problem: Rules loading when they shouldn't

**Symptoms:**
- Domain loads even when you're doing unrelated work
- Can't prevent domain from loading with certain keywords

**Diagnosis:**
```bash
# Check for ALWAYS_ON setting
cat ~/.opencarl/manifest | grep ALWAYS_ON

# Check EXCLUDE patterns
cat ~/.opencarl/manifest | grep EXCLUDE
```

**Solution:**

If domain has `ALWAYS_ON=true`, it loads every session:
```bash
# Disable ALWAYS_ON
MYDOMAIN_ALWAYS_ON=false
```

Add EXCLUDE keywords to prevent loading in specific contexts:
```bash
# Don't load DEVELOPMENT during documentation
DEVELOPMENT_EXCLUDE=documentation, readme, docs

# Don't load TESTING during deployment
TESTING_EXCLUDE=deploy, production, release
```

---

### Integration Issues

#### Problem: AGENTS.md integration fails

**Symptoms:**
- OpenCARL guidance doesn't appear in AGENTS.md
- "OpenCARL markers not found" error
- Duplicate OpenCARL sections in AGENTS.md

**Diagnosis:**
```bash
# Check if AGENTS.md exists
ls -la AGENTS.md

# Check for OpenCARL markers
grep "<!-- OPENCARL:" AGENTS.md
```

**Solution:**

OpenCARL uses HTML comment markers for reversible integration:
```markdown
<!-- OPENCARL:START -->
OpenCARL usage guidance here
<!-- OPENCARL:END -->
```

If markers are missing, add them manually:
```bash
cat >> AGENTS.md << 'EOF'

<!-- OPENCARL:START -->
## OpenCARL Integration

This project uses OpenCARL for dynamic rule injection.

- `*opencarl` - Enter help mode
- `/opencarl list` - Show all domains
- `/opencarl view DOMAIN` - Show rules in a domain

See `~/.opencarl/manifest` for domain configuration.
<!-- OPENCARL:END -->
EOF
```

If duplicate sections exist, remove the duplicates:
```bash
# Find duplicates
grep -n "OPENCARL:START" AGENTS.md

# Manually edit to remove duplicates
nano AGENTS.md
```

Check file permissions:
```bash
# Ensure AGENTS.md is writable
chmod 644 AGENTS.md
```

---

#### Problem: opencode.json integration fails

**Symptoms:**
- OpenCARL docs not appearing in `instructions`
- JSON parsing errors
- Plugin not loading after config change

**Diagnosis:**
```bash
# Validate JSON syntax
node -e "console.log(JSON.parse(require('fs').readFileSync('.opencode/opencode.json', 'utf8')))"

# Check current instructions
cat .opencode/opencode.json | grep -A 10 instructions
```

**Solution:**

If JSON is invalid, fix syntax:
```bash
# Common issues:
# - Trailing comma in last array element
# - Missing closing brace
# - Unclosed string literal

# Validate with jq (if installed)
jq . .opencode/opencode.json
```

Add OpenCARL docs to instructions:
```json
{
  "instructions": [
    "Existing instruction",
    "Include OpenCARL documentation when user asks about rules or domains"
  ]
}
```

If permissions are wrong:
```bash
chmod 644 .opencode/opencode.json
```

---

## Debug Mode

Breaking change: the debug environment variable is now OPENCARL_DEBUG. See README.md for the breaking change notice and migration details.

OpenCARL includes a debug mode for troubleshooting rule loading and matching.

### Enable Debug Mode

**Option 1: Environment variable**
```bash
export OPENCARL_DEBUG=true
# Restart OpenCode
```

**Option 2: In manifest**
```bash
# Add to ~/.opencarl/manifest
DEVMODE=true
```

### What Debug Mode Shows

When enabled, OpenCARL logs:
- Which domains are active
- Keyword matching results
- Which rules are injected
- Manifest parsing warnings
- Domain file loading errors

### Example Debug Output

```
[OpenCARL Debug] Loading rules from: /Users/you/.opencarl/
[OpenCARL Debug] Active domains: DEVELOPMENT, TESTING, GLOBAL
[OpenCARL Debug] Prompt keywords: [fix, bug, in, auth]
[OpenCARL Debug] Matched domain: DEVELOPMENT (keyword: "fix bug")
[OpenCARL Debug] Injected 3 rules from DEVELOPMENT
[OpenCARL Debug] Warning: Missing domain file for TESTING at /Users/you/.opencarl/testing
```

### Disable Debug Mode

```bash
export OPENCARL_DEBUG=false
# Or remove from manifest
DEVMODE=false
```

---

## Getting Help

### When to File an Issue

File a GitHub issue if:
- Debug mode doesn't reveal the problem
- You've tried all solutions in this guide
- You suspect a bug in OpenCARL itself
- Documentation is unclear or missing

### Before Filing an Issue

1. **Enable debug mode and capture output:**
   ```bash
   export OPENCARL_DEBUG=true
   # Reproduce the issue
   # Copy debug output
   ```

2. **Check your configuration:**
   ```bash
   # Gather info
   echo "=== Manifest ===" && cat ~/.opencarl/manifest
   echo "=== Domain files ===" && ls -la ~/.opencarl/
   echo "=== OpenCode config ===" && cat .opencode/opencode.json
   ```

3. **Test with minimal config:**
   ```bash
   # Backup existing config
mv ~/.opencarl ~/.opencarl.backup
   
   # Create minimal test config
mkdir ~/.opencarl
cat > ~/.opencarl/manifest << 'EOF'
   GLOBAL_STATE=active
   GLOBAL_RECALL=test
   GLOBAL_EXCLUDE=
   GLOBAL_ALWAYS_ON=false
   EOF
   
cat > ~/.opencarl/global << 'EOF'
   GLOBAL_RULE_0=Test rule
   EOF
   
   # Test if issue persists
   ```

### What to Include in Your Issue

1. **Debug output** (with OPENCARL_DEBUG=true)
2. **Manifest contents** (`cat ~/.opencarl/manifest`)
3. **Domain file list** (`ls -la ~/.opencarl/`)
4. **OpenCode version** (if relevant)
5. **Steps to reproduce**
6. **Expected behavior**
7. **Actual behavior**

### Issue Template

```markdown
**Description:**
[Clear description of the problem]

**Steps to reproduce:**
1. Step 1
2. Step 2
3. ...

**Expected behavior:**
[What should happen]

**Actual behavior:**
[What actually happens]

**Debug output:**
```
[Paste debug output here]
```

**Configuration:**
- Manifest: [paste `cat ~/.opencarl/manifest`]
- Domain files: [paste `ls -la ~/.opencarl/`]
- OpenCode version: [version]

**Additional context:**
[Any other relevant information]
```

---

## Quick Reference

| Problem | Quick Fix |
|---------|-----------|
| Plugin not loading | Check `.opencode/opencode.json` plugins array |
| Rules not appearing | Check `STATE=active` in manifest |
| Wrong rules loading | Make recall keywords more specific |
| Domain file ignored | Filename must be lowercase, no extension |
| Star-command not working | Ensure `COMMANDS_STATE=active` in manifest |
| Debug mode | `export OPENCARL_DEBUG=true` |
| View all domains | `/opencarl list` |
| View domain rules | `/opencarl view DOMAIN` |
| Enable debug in manifest | `DEVMODE=true` |

---

*For more information, see the [OpenCARL Documentation](resources/docs/OPENCARL-DOCS.md) or visit [GitHub](https://github.com/KrisGray/opencarl)*
