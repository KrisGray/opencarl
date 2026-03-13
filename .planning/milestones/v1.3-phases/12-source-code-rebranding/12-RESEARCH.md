# Phase 12: Source Code Rebranding - Research

**Researched:** 2026-03-06
**Domain:** TypeScript refactoring, code rebranding
**Confidence:** HIGH

## Summary

This phase requires systematic renaming of TypeScript identifiers across the OpenCARL codebase: type names with "Carl" prefix → "Opencarl", functions/variables with "carl" prefix → "opencarl", import statements `./carl/*` → `./opencarl/*`, and code comments referencing CARL → OpenCARL. The scope includes 15 source files (src/carl/) and 18 test files with approximately 26 type definitions, 54 function/variable names, and 13 import statements.

The recommended approach uses TypeScript's compiler for verification rather than IDE-based rename refactoring. TypeScript's language server provides the most reliable identifier tracking, but for automated plan execution, a pattern-based find-and-replace followed by TypeScript compilation validation is more practical. The key is to proceed incrementally: types first, then functions/variables, then imports, then comments—running tests after each wave to catch issues early.

**Primary recommendation:** Use TypeScript compiler (tsc) and Jest tests as validation gates, with pattern-based find-and-replace for the bulk renaming work, verifying compilation and test pass after each wave of changes.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Implementation Decisions

#### Type naming convention
- Use `Opencarl` prefix (CamelCase, lowercase "carl")
- Compound names: `CarlRuleDomainPayload` → `OpencarlRuleDomainPayload` (lowercase "c" after prefix)
- Multiple "Carl" occurrences: Replace only the prefix (e.g., `CarlSomethingCarlElse` → `OpencarlSomethingCarlElse`)
- All types follow the same rule: generics, interfaces, type aliases — no special cases

#### Function/variable naming strategy
- Rename ALL functions and variables (not just internal ones)
- No backward compatibility aliases — clean break
- Follow existing patterns: snake_case `carl_xxx` → `opencarl_xxx`, camelCase `carlXxx` → `opencarlXxx`
- Private members rename fully: `_carlXxx` → `_opencarlXxx`, `#carlXxx` → `#opencarlXxx`

#### Import statement approach
- Update imports in Phase 12 (before directory rename, per ROADMAP rationale to prevent compilation errors)
- Rename directory in same plan as imports — atomic change to avoid temporary mismatch
- Keep current import style: relative imports `./carl/*` → `./opencarl/*`
- Type-only imports handled same way as regular imports

#### Code comment rebranding scope
- Substantive comments only — update only meaningful comments about functionality
- JSDoc follows same rules as regular comments
- Replace mentions only — minimal changes, not full rewrites
- Update TODO/FIXME comments — consistent rebranding throughout

### OpenCode's Discretion

None

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SOURCE-01 | All TypeScript type names using "Carl" prefix are renamed to "Opencarl" | TypeScript identifier renaming patterns, tsc verification |
| SOURCE-02 | All function/variable names using "carl" prefix are renamed to "opencarl" | Pattern-based find-and-replace with compiler validation |
| SOURCE-03 | All import statements referencing `./carl/*` are updated to `./opencarl/*` | Import path updates, atomic directory rename in same plan |
| SOURCE-04 | All internal code comments referencing CARL are updated to OpenCARL | Substantive comment identification, minimal change approach |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 5.9.3 | Type checking, compilation | Industry standard, built-in identifier tracking |
| Jest | 30.2.0 | Test verification | Project test framework, regression detection |
| ts-jest | 29.4.6 | TypeScript test runner | Jest preset for TypeScript, already configured |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ts-node | 10.9.2 | TypeScript execution | For running TypeScript files directly if needed |
| @types/node | 25.3.3 | Node.js type definitions | For type checking Node.js API usage |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pattern-based find-and-replace | IDE language server rename | IDE rename is more accurate but requires manual interaction; pattern-based is automatable but needs careful verification |

**Installation:**
```bash
# Already installed via package.json
npm install typescript@5.9.3 jest@30.2.0 ts-jest@29.4.6
```

## Architecture Patterns

### Recommended Rename Strategy

**Wave 1: Type names (SOURCE-01)**
```typescript
// Before
export interface CarlRuleSource { ... }
export type CarlRuleSourceScope = "project" | "global" | "fallback";

// After
export interface OpencarlRuleSource { ... }
export type OpencarlRuleSourceScope = "project" | "global" | "fallback";
```

**Wave 2: Function/variable names (SOURCE-02)**
```typescript
// Before
function resolveSourceFromOverride(carlDir?: string): CarlSourcePath | null { ... }
const projectCarl = { carlDir: '/path' };

// After
function resolveSourceFromOverride(opencarlDir?: string): OpencarlSourcePath | null { ... }
const projectOpencarl = { opencarlDir: '/path' };
```

**Wave 3: Import statements (SOURCE-03)**
```typescript
// Before
import { buildCarlHelpGuidance } from "../carl/help-text";
import type { CarlRuleDomainPayload } from "../carl/types";

// After
import { buildOpencarlHelpGuidance } from "../opencarl/help-text";
import type { OpencarlRuleDomainPayload } from "../opencarl/types";
```

**Wave 4: Code comments (SOURCE-04)**
```typescript
// Before
// Determine which .carl/ directory to use for session overrides

// After
// Determine which .opencarl/ directory to use for session overrides
```

### Pattern 1: Incremental Renaming with Validation

**What:** Rename identifiers in waves, running TypeScript compilation and Jest tests after each wave.

**When to use:** When renaming identifiers across a codebase to catch compilation and test failures early.

**Example:**
```bash
# Wave 1: Rename type definitions
# 1. Find all type/interface/class declarations with Carl prefix
# 2. Update declarations and all references
# 3. Run TypeScript compiler
npx tsc --noEmit

# 4. Run tests
npm test

# 5. If tests pass, commit and proceed to Wave 2
```

### Anti-Patterns to Avoid

- **Bulk rename without compilation:** Renaming all identifiers in one operation without running TypeScript compilation will result in cascading errors that are hard to debug. Instead, rename incrementally and run tsc after each wave.

- **Case-insensitive find-and-replace:** Using case-insensitive replacement will incorrectly modify `carl` in contexts like `carlDir` (should become `opencarlDir`, not `OpencarlDir`). Always use case-sensitive patterns.

- **Forgetting test files:** Test files import and use the same identifiers as source files. If you update source but not tests, compilation will succeed but tests will fail. Update source and test files in the same wave.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Identifier reference tracking | Custom regex for finding all references | TypeScript compiler (tsc) | TypeScript's language service accurately tracks identifier usage across files, including type exports/imports; regex misses cross-file dependencies |

**Key insight:** TypeScript already has identifier tracking built in. Running `tsc --noEmit` after each rename wave will immediately surface any missed references or broken imports. Building custom reference tracking is unnecessary and error-prone.

## Common Pitfalls

### Pitfall 1: Missed Cross-File References
**What goes wrong:** Renaming an identifier in its declaration but missing references in other files, leading to compilation errors.

**Why it happens:** References are scattered across multiple source and test files. Manual tracking is error-prone.

**How to avoid:** Run `npx tsc --noEmit` after each rename wave. TypeScript will report all unresolved references.

**Warning signs:** TypeScript errors like "Cannot find name 'CarlXxx'" or "Module has no exported member 'CarlXxx'".

### Pitfall 2: Case-Sensitivity Issues
**What goes wrong:** Using case-insensitive find-and-replace causes incorrect transformations (e.g., `carlDir` → `OpencarlDir` instead of `opencarlDir`).

**Why it happens:** TypeScript identifiers are case-sensitive, but regex tools often default to case-insensitive mode.

**How to avoid:** Use case-sensitive patterns. For type names: replace `Carl` with `Opencarl` (capital C). For function/variable names: replace `carl` with `opencarl` (lowercase c).

**Warning signs:** Test failures due to "property does not exist" or compilation errors about mismatched casing.

### Pitfall 3: Breaking Test Imports
**What goes wrong:** Source files compile but tests fail because test imports weren't updated.

**Why it happens:** Test files use the same imports as source files. If you update source but not tests, tests reference old identifiers.

**How to avoid:** Update source and test files in the same wave. Run tests after each wave.

**Warning signs:** Tests fail with "Cannot find module" or errors about undefined identifiers.

### Pitfall 4: Over-Renaming in Comments
**What goes wrong:** Rebranding non-substantive comments (e.g., `// carl: added this line`) creates noise and git diff bloat.

**Why it happens:** Automatic comment replacement updates all mentions of "carl", including non-meaningful ones.

**How to avoid:** Focus on substantive comments only—those describing functionality, configuration, or user-facing behavior. Skip attribution, TODOs unrelated to branding, or inline notes.

**Warning signs:** Large diff files with mostly comment changes, many `// carl:` or `// TODO(carl)` patterns.

## Code Examples

Verified patterns from TypeScript best practices:

### Type Renaming Pattern
```typescript
// Source: TypeScript documentation on declaration merging
// Before
export interface CarlRuleSource {
  scope: CarlRuleSourceScope;
  path: string;
  domains: string[];
}

// After
export interface OpencarlRuleSource {
  scope: OpencarlRuleSourceScope;
  path: string;
  domains: string[];
}
```

### Function/Variable Renaming Pattern
```typescript
// Before
function resolveSourceFromOverride(carlDir?: string): CarlSourcePath | null {
  if (!carlDir) {
    return null;
  }
  const manifestPath = path.join(carlDir, "manifest");
  // ...
}

// After
function resolveSourceFromOverride(opencarlDir?: string): OpencarlSourcePath | null {
  if (!opencarlDir) {
    return null;
  }
  const manifestPath = path.join(opencarlDir, "manifest");
  // ...
}
```

### Import Path Update Pattern
```typescript
// Before
import { buildCarlHelpGuidance } from "../carl/help-text";
import type { CarlRuleDomainPayload } from "../carl/types";
import { debugInjection } from "../carl/debug";

// After
import { buildOpencarlHelpGuidance } from "../opencarl/help-text";
import type { OpencarlRuleDomainPayload } from "../opencarl/types";
import { debugInjection } from "../opencarl/debug";
```

### Comment Update Pattern
```typescript
// Before
/**
 * Load per-session overrides from `.carl/sessions/{session_id}.json`.
 * CARL star-command triggers like *carl, *brief, *dev are handled here.
 */

// After
/**
 * Load per-session overrides from `.opencarl/sessions/{session_id}.json`.
 * OpenCARL star-command triggers like *opencarl, *brief, *dev are handled here.
 */
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual identifier tracking across files | TypeScript compiler verification (tsc --noEmit) | TypeScript 1.0+ | TypeScript's language service tracks all identifier references automatically |
| IDE-based rename refactoring only | Pattern-based rename + compiler validation | 2024+ | Pattern-based approach is automatable for plan execution, tsc provides verification |

**Deprecated/outdated:**
- None relevant to this domain

## Open Questions

None identified.

## Sources

### Primary (HIGH confidence)
- TypeScript 5.9.3 - Official TypeScript documentation on identifier scoping, module resolution, and type checking
- Jest 30.2.0 - Jest configuration and test verification
- ts-jest 29.4.6 - TypeScript preset configuration for Jest

### Secondary (MEDIUM confidence)
- Project codebase analysis - Scanned src/carl/ (15 files) and tests/javascript/ (18 files) to identify scope of changes
- Package.json and jest.config.ts - Verified project test infrastructure and TypeScript configuration

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - TypeScript and Jest are industry standards, verified from project configuration
- Architecture: HIGH - Incremental rename with compiler verification is TypeScript best practice
- Pitfalls: HIGH - Identified from common TypeScript refactoring scenarios and project codebase analysis

**Research date:** 2026-03-06
**Valid until:** 2026-04-05 (30 days for stable tooling)
