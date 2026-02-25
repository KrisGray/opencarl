# Coding Conventions

**Analysis Date:** 2026-02-25

## Naming Patterns

**Files:**
- JavaScript CLI scripts use lowercase names with hyphens: `bin/install.js`
- Python hook scripts use lowercase names with hyphens: `hooks/carl-hook.py`
- TypeScript setup helpers use lowercase names with hyphens: `scripts/setup-plugin.ts`

**Functions:**
- JavaScript uses `camelCase` for functions: `parseConfigDirArg`, `copyDir` in `bin/install.js`
- Python uses `snake_case` for functions: `load_session_config`, `match_domains_to_prompt` in `hooks/carl-hook.py`

**Variables:**
- JavaScript uses `camelCase` for local variables: `explicitConfigDir`, `hookCommand` in `bin/install.js`
- Python uses `snake_case` for locals: `session_config`, `global_excluded` in `hooks/carl-hook.py`

**Types:**
- Python uses inline type hints with `list[str]` and unions like `dict | None` in `hooks/carl-hook.py`

## Code Style

**Formatting:**
- Not detected (no `.prettierrc*`, `biome.json`, or similar in repo root)

**Linting:**
- Not detected (no `.eslintrc*`, `eslint.config.*`, or similar in repo root)

## Import Organization

**Order:**
1. Node core modules via `require(...)`: `fs`, `path`, `os`, `readline` in `bin/install.js`
2. Local files via relative require: `../package.json` in `bin/install.js`
3. Python standard library imports grouped at top: `json`, `sys`, `re`, `subprocess`, `pathlib`, `datetime` in `hooks/carl-hook.py`

**Path Aliases:**
- Not detected (no alias configuration found in `package.json` or config files)

## Error Handling

**Patterns:**
- JavaScript uses `try/catch` around JSON parsing and logs warnings to console before continuing: `wireHook` in `bin/install.js`
- JavaScript uses `process.exit(1)` for CLI argument errors in `bin/install.js`
- Python uses `try/except` with early returns for parsing failures and `sys.exit(0/1)` for termination: `main` and parsing helpers in `hooks/carl-hook.py`

## Logging

**Framework:** console/print

**Patterns:**
- CLI progress and warnings are printed with `console.log`/`console.error`: `bin/install.js`
- Python debug logging is gated by a `DEBUG` flag and writes to `stderr`: `debug_log` in `hooks/carl-hook.py`

## Comments

**When to Comment:**
- Use section headers and inline explanations for major blocks: `hooks/carl-hook.py` (e.g., `# =============================================================================`)
- Use brief inline comments for behavior details and edge cases: `bin/install.js`

**JSDoc/TSDoc:**
- JSDoc-style block comments used for function descriptions: `bin/install.js`
- Python docstrings used for functions and module description: `hooks/carl-hook.py`

## Function Design

**Size:**
- Functions range from small helpers to large orchestration functions; keep helpers focused, keep orchestration in `main`/`install`-style functions: `bin/install.js`, `hooks/carl-hook.py`

**Parameters:**
- Prefer explicit parameters with descriptive names (no positional tuples): `format_output(..., context_remaining, bracket_rules, ...)` in `hooks/carl-hook.py`

**Return Values:**
- Python functions return structured data (`dict`, `list`, `tuple`) for downstream processing: `parse_manifest`, `match_domains_to_prompt` in `hooks/carl-hook.py`

## Module Design

**Exports:**
- CLI script relies on top-level execution, no explicit exports: `bin/install.js`

**Barrel Files:**
- Not detected

---

*Convention analysis: 2026-02-25*
