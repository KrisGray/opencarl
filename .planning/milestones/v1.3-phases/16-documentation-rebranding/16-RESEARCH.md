# Phase 16: Documentation Rebranding - Research

**Researched:** 2026-03-13
**Domain:** Documentation rebranding (Markdown docs, naming conventions)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### Branding terms and casing
- Use "OpenCARL" in prose.
- Use `*opencarl` and `/opencarl` in all command examples.
- Use `.opencarl/` and `.opencarl-template/` in directory/path examples.
- Use `OPENCARL_DEBUG` in all env var examples.

### Legacy mention policy
- Remove or replace all CARL references; no "formerly CARL" notes anywhere.
- Do not include legacy pointers or migration notes in docs.

### Example conventions
- Always use updated commands, paths, and env vars in examples.
- Use the scoped package name `@krisgray/opencarl` wherever a package name appears.

### Change scope in docs
- Minimal rename pass only: update branding terms, paths, examples, headings, code blocks, and internal links that include old names.
- No broader copy edits beyond those replacements.

### OpenCode's Discretion
- None.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DOCS-01 | `CARL-DOCS.md` is renamed to `OPENCARL-DOCS.md` | Identify current location `resources/docs/CARL-DOCS.md` and update links pointing to it. |
| DOCS-02 | README.md references OpenCARL branding throughout | README.md still contains `/carl`, `*carl`, `.carl/`, CARL attribution, and CARL command tables that must be updated. |
| DOCS-03 | INSTALL.md uses `.opencarl/` and `*opencarl` throughout | INSTALL.md contains `.carl/`, `/carl`, `*carl`, and carl plugin paths to update to OpenCARL naming. |
| DOCS-04 | TROUBLESHOOTING.md references OpenCARL and `OPENCARL_DEBUG` | TROUBLESHOOTING.md still mentions CARL, `/carl`, `*carl`, `.carl/`, and CARL-branded debug output examples. |
| DOCS-05 | All documentation examples use updated naming conventions | Additional docs (`resources/docs/CARL-AGENTS.md`, `tests/fixtures/README.md`) contain CARL examples and should be updated per locked decisions. |
</phase_requirements>

## Summary

This phase is a documentation-only rebranding pass with a strict constraint: remove all CARL mentions and update every example to the new OpenCARL naming conventions without broader copy changes. The key affected files are `README.md`, `INSTALL.md`, `TROUBLESHOOTING.md`, and `resources/docs/CARL-DOCS.md` (rename required). Additional documentation files like `resources/docs/CARL-AGENTS.md` and `tests/fixtures/README.md` still include CARL examples and should be updated to satisfy DOCS-05.

The rebranding rules are explicit in context: use OpenCARL in prose, `*opencarl` and `/opencarl` in examples, `.opencarl/` and `.opencarl-template/` for paths, and `OPENCARL_DEBUG` for environment variables, with `@krisgray/opencarl` as the only package name. No "formerly CARL" statements or migration notes are allowed. That means existing attribution and debug output examples that reference CARL must be rewritten or removed to comply.

**Primary recommendation:** Treat this as a precise find/replace and rename sweep across docs, including internal links, headings, and code blocks, with special attention to file renames and link targets.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Markdown | N/A | Documentation format | All user-facing docs in this phase are Markdown files. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None | N/A | N/A | No additional libraries required for doc updates. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual per-file edits | Repo-wide search + targeted edits | Search-driven updates reduce missed CARL references. |

## Architecture Patterns

### Recommended Project Structure
```
resources/docs/
├── CARL-DOCS.md       # rename to OPENCARL-DOCS.md
├── CARL-AGENTS.md     # update content; consider rename if removing all CARL references
README.md
INSTALL.md
TROUBLESHOOTING.md
tests/fixtures/README.md
```

### Pattern 1: Rename + Link Update Sweep
**What:** Rename the doc file and update all Markdown links and references that point to it.
**When to use:** DOCS-01 and any internal links referencing CARL doc filenames.
**Example:**
```markdown
See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for debugging options
See [OPENCARL-DOCS.md](resources/docs/OPENCARL-DOCS.md) for full docs
```

### Pattern 2: Naming Convention Replacement Matrix
**What:** Apply a consistent replacement map across prose, headings, and code blocks.
**When to use:** README, INSTALL, TROUBLESHOOTING, and resources docs.
**Example:**
```text
OpenCARL  | *opencarl | /opencarl | .opencarl/ | .opencarl-template/ | OPENCARL_DEBUG | @krisgray/opencarl
```

### Anti-Patterns to Avoid
- **Partial replacements:** Updating prose but leaving code blocks, tables, or examples with `*carl`, `/carl`, or `.carl/`.
- **Breaking links:** Renaming `CARL-DOCS.md` without updating references in README or TROUBLESHOOTING.
- **Legacy mentions:** Keeping "CARL" in attribution, debug output samples, or migration wording (explicitly forbidden).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Locating remaining CARL references | Manual visual scan | Repo-wide search for `CARL`, `carl`, `*carl`, `/carl`, `.carl/` in docs | Reduces missed references across many files. |

**Key insight:** Consistency matters more than stylistic edits; a systematic replacement approach prevents policy violations.

## Common Pitfalls

### Pitfall 1: Missing CARL references in code blocks
**What goes wrong:** Prose is updated but commands in fenced blocks still show `*carl`, `/carl`, or `.carl/`.
**Why it happens:** Code blocks are easy to overlook during manual edits.
**How to avoid:** Validate using a repo-wide search limited to `*.md` after updates.
**Warning signs:** Any `carl` token found in Markdown after replacements.

### Pitfall 2: Stale internal links after renaming docs
**What goes wrong:** Links still point to `resources/docs/CARL-DOCS.md` after rename.
**Why it happens:** Link text updated but link URL remains unchanged.
**How to avoid:** Update all link targets and confirm path matches renamed file.
**Warning signs:** Broken link in README/TROUBLESHOOTING references.

### Pitfall 3: Package name drift in examples
**What goes wrong:** Examples still show `@krisgray/opencode-carl-plugin` or other CARL package names.
**Why it happens:** Multiple package references in TROUBLESHOOTING and INSTALL.
**How to avoid:** Replace all package name instances with `@krisgray/opencarl` per decision.
**Warning signs:** Any `opencode-carl` or `carl-setup` string in docs.

## Code Examples

Verified patterns from repository docs:

### Updated command and path example
```bash
/opencarl setup
```

### Updated file path example
```text
.opencarl/manifest
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CARL-branded docs and examples | OpenCARL-branded docs with `*opencarl` and `.opencarl/` | v1.3 rebranding milestone | Consistency across user-facing documentation. |

**Deprecated/outdated:**
- CARL mentions in docs and examples — replaced by OpenCARL naming per phase decisions.

## Open Questions

1. **Attribution language**
   - What we know: Context mandates removing all CARL references and no "formerly CARL" notes.
   - What's unclear: Whether attribution to the original CARL project must be preserved for licensing/credit.
   - Recommendation: If attribution is legally required, rephrase to avoid "CARL" naming or confirm an approved attribution alternative before editing.

## Sources

### Primary (HIGH confidence)
- `README.md` - current branding references and examples
- `INSTALL.md` - setup instructions and path/command examples
- `TROUBLESHOOTING.md` - debugging and command examples, references to docs
- `resources/docs/CARL-DOCS.md` - documentation file requiring rename
- `resources/docs/CARL-AGENTS.md` - documentation examples using CARL naming
- `tests/fixtures/README.md` - additional documentation examples
- `.planning/phases/16-documentation-rebranding/16-CONTEXT.md` - locked decisions and constraints
- `.planning/REQUIREMENTS.md` - DOCS-01..DOCS-05 requirement definitions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - docs are Markdown with no extra tooling
- Architecture: HIGH - file locations and naming constraints are explicit in repo
- Pitfalls: HIGH - CARL references observable across documentation files

**Research date:** 2026-03-13
**Valid until:** 2026-04-12
