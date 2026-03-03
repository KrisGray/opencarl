# Phase 1: Plugin Foundation & Rule Discovery - Research

**Researched:** 2026-02-25
**Domain:** OpenCode plugin foundation, CARL rule discovery + validation
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### Rule source precedence
- `.carl/` wins over `.opencode/carl/` when both exist; `.opencode/carl/` is fallback only.
- Project scope overrides global when both define the same domain.
- If a project domain is inactive, global domain still applies.
- If project `.carl/` manifest is missing/invalid, fall back to global rules.

### Manifest strictness
- Unknown manifest keys: warn and ignore.
- Malformed manifest lines: skip line with warning.
- Active domain with missing file: warn and skip that domain.
- Invalid rule keys inside a domain: skip invalid rules with warning; keep valid ones.

### Domain file inclusion
- Domain files are no-extension filenames (e.g., `global`, `context`, `commands`).
- Only domains referenced in the manifest are loaded; extra files are ignored.
- Domain filenames must be lowercase; warn on other casing.
- Ignore comments and blank lines in domain files.

### Plugin placement guidance
- Recommend global plugin install by default; allow project installs as needed.
- If both global and project plugin files exist, allow but warn about duplicates.
- Setup flow should prompt for install scope, defaulting to global.
- Preferred plugin filename: `carl.ts`.

### Claude's Discretion
- Exact warning message wording and logging format.
- How warnings are throttled to avoid noise.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INST-01 | User can load CARL as a local OpenCode plugin from `.opencode/plugins/` and `~/.config/opencode/plugins/` | Confirm OpenCode plugin load paths and how local plugins are discovered; define plugin entrypoint location and minimal package setup. |
| RULE-01 | Load global rules from `~/.carl/` (manifest + domain files) | Define global path resolution and manifest/domain parsing behavior aligned to CARL formats. |
| RULE-02 | Load project rules from `./.carl/` and apply project-over-global precedence | Specify project discovery + override merge ordering and inactive-domain behavior. |
| RULE-03 | Support CARL manifest fields: `STATE`, `RECALL`, `EXCLUDE`, `ALWAYS_ON` | Define manifest parsing rules and validation/warnings for malformed or unknown keys. |
| RULE-06 | Fall back to `.opencode/carl/` when `.carl/` locations are absent | Document fallback path logic and when it should activate. |
| SAFE-02 | Validate manifest/domain format and skip invalid entries with warnings | Define warning and skip behavior for invalid lines, missing files, and invalid rule keys. |
</phase_requirements>

## Summary

Phase 1 is about establishing a correct OpenCode plugin footprint and deterministic rule discovery. The plugin must be discoverable from both local and global OpenCode plugin directories, and it must resolve CARL rules from project and global scopes with the exact precedence and validation behavior defined in the phase context. The aim is parity with CARL rule formats, not new matching or injection logic.

Implementation should focus on path resolution, manifest parsing, and domain loading with warnings instead of hard failures. Build a clear separation between OpenCode plugin wiring and the CARL rule loader so later phases can add matching and injection without reworking discovery. The critical risk in this phase is scope resolution drift; mitigate with deterministic precedence rules and fixtures.

**Primary recommendation:** Implement a minimal OpenCode plugin entrypoint that wires a CARL rule loader with explicit path precedence and strict-but-nonfatal validation, and verify discovery from both local and global plugin directories.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@opencode-ai/plugin` | 1.2.14 | OpenCode plugin hooks and lifecycle | Official plugin surface for discovery and hook wiring. |
| `@opencode-ai/sdk` | 1.2.14 | Typed plugin context helpers | First-party SDK for plugin context access. |
| TypeScript | 5.9.3 | Plugin authoring | Matches OpenCode docs and typed examples. |
| Bun | 1.3.9 | Dependency install/runtime for local plugins | OpenCode uses Bun to install `.opencode/` deps. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | 4.1.8 | Manifest and rule validation | Use for strict-but-nonfatal schema validation and warnings. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Local plugins in `.opencode/plugins/` | npm package via `opencode.json` | npm distribution is useful later, but local is simplest for Phase 1. |
| TypeScript plugin | JavaScript plugin | JS is faster to iterate but loses typed hook contracts. |

**Installation:**
```bash
bun add @opencode-ai/plugin@1.2.14 @opencode-ai/sdk@1.2.14 zod@4.1.8
```

## Architecture Patterns

### Recommended Project Structure
```
.opencode/
├── plugins/
│   └── carl.ts              # Plugin entrypoint (OpenCode discovery)
├── package.json             # Local deps for plugin
src/
├── carl/
│   ├── loader.ts            # Manifest + domain file discovery
│   ├── validate.ts          # Strict-but-nonfatal validation + warnings
│   └── types.ts             # Manifest/domain types
└── integration/
    └── paths.ts             # Global/project/fallback path resolution
```

### Pattern 1: Deterministic Scope Resolution
**What:** Always resolve rules in the same order: project `.carl/` overrides global `.carl/`, with `.opencode/carl/` as fallback only.
**When to use:** Any file discovery or merge logic.
**Example:**
```typescript
// Source: hooks/carl-hook.py (scope + manifest-driven domain loading)
const projectCarl = findProjectCarl(cwd) // ./.carl
const globalCarl = findGlobalCarl(home)  // ~/.carl
const fallbackCarl = findFallbackCarl(projectRoot) // ./.opencode/carl

const activeProject = projectCarl?.manifestValid ? projectCarl : null
const activeGlobal = globalCarl?.manifestValid ? globalCarl : null
const activeFallback = !activeProject && !activeGlobal ? fallbackCarl : null

const ruleSources = {
  project: activeProject,
  global: activeGlobal,
  fallback: activeFallback,
}
```

### Pattern 2: Strict-But-Nonfatal Validation
**What:** Parse manifest and domain files; warn and skip invalid entries without crashing the plugin.
**When to use:** Any file parsing under user control.
**Example:**
```typescript
// Source: .planning/phases/01-plugin-foundation-rule-discovery/01-CONTEXT.md
for (const line of manifestLines) {
  if (!isKeyValue(line)) warn("Malformed manifest line", line)
  else if (isUnknownKey(line)) warn("Unknown manifest key", line)
}
for (const domain of manifestDomains) {
  if (!domainFileExists(domain)) warn("Missing domain file", domain)
}
```

### Anti-Patterns to Avoid
- **Loading all files in `.carl/` regardless of manifest:** Breaks explicit domain registration and increases prompt bloat later.
- **Ignoring domain filename casing:** Violates CARL conventions; must warn and skip non-lowercase files.
- **Throwing on invalid manifest:** Required behavior is warn-and-skip, not crash.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Schema validation | Ad-hoc regex parsing | Zod schemas with warnings | Ensures consistent validation and clearer errors. |
| Path resolution | Manual string slicing | `path` + `fs` utilities | Avoids platform bugs and edge cases. |

**Key insight:** Validation and path logic are high-risk for subtle drift; use stable libraries to keep behavior deterministic.

## Common Pitfalls

### Pitfall 1: Scope resolution drift
**What goes wrong:** Global rules override project rules or fallback activates incorrectly.
**Why it happens:** Path discovery and merge order are implicit or inconsistent.
**How to avoid:** Encode precedence rules explicitly and test with fixtures.
**Warning signs:** Same repo yields different rule sets on different machines.

### Pitfall 2: Manifest parsing hard-fails
**What goes wrong:** Plugin crashes on a malformed line or unknown key.
**Why it happens:** Parsing treats invalid lines as fatal errors.
**How to avoid:** Warn and skip invalid entries, keep valid ones.
**Warning signs:** Plugin disables all rules after small manifest typo.

### Pitfall 3: Domain file inclusion leaks
**What goes wrong:** Extra files load despite not being in the manifest.
**Why it happens:** Loader scans the directory without filtering to registered domains.
**How to avoid:** Only load domains referenced by manifest and enforce lowercase filenames.
**Warning signs:** Unexpected domains appear in logs without being registered.

## Code Examples

Verified patterns from project sources:

### Manifest-driven domain discovery
```typescript
// Source: hooks/carl-hook.py (parse_manifest + parse_domain_rules)
const manifest = parseManifest(carlPath)
for (const domain of manifest.domains) {
  if (!isActive(domain)) continue
  if (!domainFileExists(domain)) warn("Missing domain file", domain)
  else loadDomainRules(domain)
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Claude Code hook reads `.carl/` directly | OpenCode plugin reads `.carl/` via plugin loader | Phase 1 planning | Establishes OpenCode-native discovery and scope precedence. |

**Deprecated/outdated:**
- Manual hook wiring for OpenCode (use plugin discovery instead).

## Open Questions

1. **OpenCode plugin load order and directory precedence**
   - What we know: OpenCode supports `.opencode/plugins/` and `~/.config/opencode/plugins/`.
   - What's unclear: Exact precedence and whether both load concurrently or in order.
   - Recommendation: Validate with OpenCode docs or a minimal plugin fixture before finalizing precedence warnings.

2. **Fallback `.opencode/carl/` location**
   - What we know: Phase requires `.opencode/carl/` fallback when `.carl/` locations are absent.
   - What's unclear: Whether fallback should be project-local only or also global (e.g., `~/.config/opencode/carl`).
   - Recommendation: Default to project `.opencode/carl/` unless docs specify a global fallback path.

## Sources

### Primary (HIGH confidence)
- https://opencode.ai/docs/plugins/ - plugin load paths and hooks
- https://opencode.ai/docs/config/ - config precedence and `.opencode` structure
- https://opencode.ai/docs/rules/ - OpenCode rules behavior

### Secondary (MEDIUM confidence)
- hooks/carl-hook.py - CARL manifest and domain parsing behavior
- .carl-template/manifest - canonical manifest fields and file formats

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - based on prior research docs, not re-validated in this run.
- Architecture: MEDIUM - aligned with CARL hook structure and OpenCode plugin docs.
- Pitfalls: MEDIUM - grounded in scope/validation constraints and prior research.

**Research date:** 2026-02-25
**Valid until:** 2026-03-27
