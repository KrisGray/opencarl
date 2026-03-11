# Phase 14: Command Rebranding - Research

**Researched:** 2026-03-11
**Domain:** Command trigger renaming (*carl → *opencarl, /carl → /opencarl)
**Confidence:** HIGH

## Summary

Phase 14 renames command triggers from CARL to OpenCARL. The implementation is straightforward string replacement with two source code changes and widespread test/documentation updates.

**Architecture:**
- Star commands (`*carl`) are detected via regex `/\*([a-zA-Z]+)/g` and normalized to uppercase for token matching
- Slash commands (`/carl`) are extracted via string replace and lowercase comparison
- The command token "CARL" triggers help/docs guidance injection

**Primary recommendation:** Change two token comparison points in source code, then update all test fixtures and help documentation that reference the old commands.

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CMND-01 | `*carl` command trigger is renamed to `*opencarl` | Change `token === "CARL"` check at command-parity.ts:172 to `token === "OPENCARL"` |
| CMND-02 | `/carl` fallback command is renamed to `/opencarl` | Change `commandName === "carl"` check at plugin-hooks.ts:215 to `commandName === "opencarl"` |
| CMND-03 | All test fixtures with `*carl` or `/carl` strings are updated | Update 3 test files: command-parity.test.ts, plugin-lifecycle.test.ts, star-command.test.ts |
| CMND-04 | Help text and command descriptions reference `*opencarl` and `/opencarl` | Update resource markdown files in resources/skills/ and resources/commands/ |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | ^5.0 | Language | Existing codebase standard |
| Jest | ^29.0 | Testing | Existing test framework |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ripgrep (rg) | - | Search/verification | Finding all command references |

**Verification Commands:**
```bash
# Find all *carl references (should be empty after phase)
rg '\*carl' --type ts --type md

# Find all /carl references (should be empty after phase)  
rg '/carl' --type ts --type md

# Verify *opencarl and /opencarl are used
rg '\*opencarl' --type ts --type md
rg '/opencarl' --type ts --type md
```

## Architecture Patterns

### Command Detection Flow

```
User types: "*opencarl help me"
    │
    ▼
STAR_COMMAND_PATTERN: /\*([a-zA-Z]+)/g
    │
    ▼
Extracts: ["opencarl"]
    │
    ▼
normalizeToken(): "OPENCARL"
    │
    ▼
Token check: if (token === "OPENCARL") { ... }
    │
    ▼
Inject help/docs guidance
```

### Source Code Changes Required

**File 1: `src/opencarl/command-parity.ts`**
```typescript
// Line 172: Current
if (token === "CARL") {

// Line 172: After
if (token === "OPENCARL") {
```

**File 2: `src/integration/plugin-hooks.ts`**
```typescript
// Line 215: Current
if (commandName === "carl") {

// Line 215: After
if (commandName === "opencarl") {
```

### Test File Pattern

All test files follow the same pattern:
1. Prompt text contains `*carl` → change to `*opencarl`
2. Assertions expect `CARL` token → change to `OPENCARL`
3. Command strings use `/carl` → change to `/opencarl`

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Command detection | Custom parser | Existing STAR_COMMAND_PATTERN regex | Already handles edge cases |
| Token normalization | New function | Existing normalizeToken() | Handles uppercase, deduplication |

**Key insight:** The regex pattern already supports any alphanumeric command name. Only the token comparison needs updating.

## Common Pitfalls

### Pitfall 1: Incomplete Test Updates
**What goes wrong:** Tests pass with old command strings but fail with new ones
**Why it happens:** Tests use hardcoded `*carl` prompts but expect `OPENCARL` token
**How to avoid:** Update BOTH prompt strings AND assertions in same commit
**Warning signs:** `toContain('CARL')` assertions with `*opencarl` prompts

### Pitfall 2: Missed Documentation References
**What goes wrong:** Help text still says `*carl` after source code uses `*opencarl`
**Why it happens:** Documentation files in resources/ are separate from source code
**How to avoid:** Use ripgrep to find ALL occurrences: `rg '\*carl|/carl' resources/`
**Warning signs:** User-facing docs inconsistent with actual commands

### Pitfall 3: Breaking E2E Tests
**What goes wrong:** Docker E2E tests fail after command rename
**Why it happens:** E2E test fixtures use `*carl` in shell commands
**How to avoid:** Update E2E test prompts alongside unit tests
**Warning signs:** E2E tests timing out or returning unexpected results

## Code Examples

### Source Code Change (command-parity.ts:172)
```typescript
// Current implementation
for (const token of commandTokens) {
  const rules = commandRuleMap[token];
  if (!rules || rules.length === 0) {
    unresolvedTokens.push(token);
    continue;
  }

  const payloadRules = [...rules];
  if (token === "OPENCARL") {  // CHANGED FROM "CARL"
    // Check for docs subcommand in prompt text
    const isDocsRequest = promptText.toLowerCase().includes('docs');
    // ... rest of logic
  }
}
```

### Source Code Change (plugin-hooks.ts:215)
```typescript
// Current implementation
"command.execute.before": async (input) => {
  const commandName = (input.command ?? "")
    .replace(/^\//, "")
    .toLowerCase();
  if (commandName === "opencarl") {  // CHANGED FROM "carl"
    // /opencarl fallback should mirror *opencarl command-mode guidance
    recordCommandSignals(input.sessionID, ["opencarl"]);  // CHANGED FROM ["carl"]
  }
  // ... rest of handler
}
```

### Test Pattern (command-parity.test.ts)
```typescript
// Current test
it('should detect *opencarl in prompt text', () => {  // CHANGED FROM *carl
  const result = resolveOpencarlCommandSignals({
    promptText: 'Please help *opencarl with my code',  // CHANGED FROM *carl
  });

  expect(result.commandTokens).toContain('OPENCARL');  // CHANGED FROM CARL
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `*carl` trigger | `*opencarl` trigger | Phase 14 | Users type new command |
| `/carl` fallback | `/opencarl` fallback | Phase 14 | Users use new slash command |
| Token "CARL" | Token "OPENCARL" | Phase 14 | Internal matching |

**Deprecated/outdated:**
- `*carl`: Will not be recognized after Phase 14
- `/carl`: Will not trigger fallback after Phase 14

## Files to Modify

### Source Code (2 files)
| File | Line | Change | Requirement |
|------|------|--------|-------------|
| `src/opencarl/command-parity.ts` | 172 | `token === "CARL"` → `token === "OPENCARL"` | CMND-01 |
| `src/integration/plugin-hooks.ts` | 215 | `commandName === "carl"` → `commandName === "opencarl"` | CMND-02 |
| `src/integration/plugin-hooks.ts` | 217 | `["carl"]` → `["opencarl"]` | CMND-02 |

### Test Files (3 files)
| File | Occurrences | Change | Requirement |
|------|-------------|--------|-------------|
| `tests/javascript/unit/command-parity.test.ts` | ~40+ | `*carl` → `*opencarl`, `CARL` → `OPENCARL` | CMND-03 |
| `tests/javascript/integration/plugin-lifecycle.test.ts` | ~6 | `/carl` → `/opencarl` | CMND-03 |
| `tests/javascript/e2e/star-command.test.ts` | ~2 | `*carl` → `*opencarl` | CMND-03 |

### Script Files (1 file)
| File | Occurrences | Change | Requirement |
|------|-------------|--------|-------------|
| `scripts/carl-command-parity-smoke.ts` | ~4 | `*carl` → `*opencarl`, `CARL` → `OPENCARL` | CMND-03 |

### Resource Files (multiple)
| File | Change | Requirement |
|------|--------|-------------|
| `resources/skills/carl-help/CARL-OVERVIEW.md` | `*carl` → `*opencarl`, `/carl` → `/opencarl` | CMND-04 |
| `resources/commands/carl/manager.md` | `/carl` → `/opencarl` in descriptions | CMND-04 |

## Open Questions

1. **Should `*carl` remain as a deprecated alias?**
   - What we know: v2 requirements list BACKCOMP-02 for deprecated aliases
   - What's unclear: Whether v1.3 should support dual commands
   - Recommendation: No aliases in v1.3 - clean break, aliases deferred to v2

2. **Should command fixture file names change?**
   - What we know: `resources/commands/carl/` directory exists
   - What's unclear: Whether directory name should change to `opencarl/`
   - Recommendation: Likely Phase 16 scope (documentation), not Phase 14

## Sources

### Primary (HIGH confidence)
- Source code analysis: `src/opencarl/command-parity.ts` - command detection logic
- Source code analysis: `src/integration/plugin-hooks.ts` - slash command handling
- REQUIREMENTS.md - CMND-01 through CMND-04 specifications

### Secondary (MEDIUM confidence)
- Phase 12/13 verification reports - established rebranding patterns
- Test file analysis - test fixture patterns

## Metadata

**Confidence breakdown:**
- Source code changes: HIGH - Simple string replacements at known locations
- Test file scope: HIGH - ripgrep found all occurrences
- Documentation scope: HIGH - Clear resource file locations
- Pitfalls: HIGH - Based on patterns from Phases 12-13

**Research date:** 2026-03-11
**Valid until:** 30 days (stable codebase)
