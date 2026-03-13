---
status: diagnosed
phase: 12-source-code-rebranding
source: 12-01-SUMMARY.md, 12-02-SUMMARY.md, 12-03-SUMMARY.md, 12-04-SUMMARY.md
started: 2026-03-06T13:51:55Z
updated: 2026-03-06T14:32:14Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

[testing complete]

## Tests

### 1. Type Names Rebranded
expected: In `src/opencarl/types.ts` and `src/opencarl/errors.ts`, all public Carl* types are now Opencarl* (e.g., OpencarlRuleDomainPayload, OpencarlError). No Carl* type names remain in those files.
result: issue
reported: "In src/opencarl/errors.ts this 'const DOCS_BASE_URL = \"https://github.com/krisjg/carl/blob/main/docs\";' is wrong. krisjg is not my username in github and the project is opencarl see https://github.com/KrisGray/opencarl"
severity: major

### 2. Function and Variable Names Rebranded
expected: In `src/opencarl/loader.ts` and `src/opencarl/setup.ts`, core functions and variables use the opencarl prefix (e.g., loadOpencarlRules, seedOpencarlTemplates, projectOpencarlDir). No carl-prefixed function/variable names remain in those files.
result: pass

### 3. Directory and Imports Updated
expected: The codebase uses `src/opencarl/` as the directory (no `src/carl/` folder), and imports in tests and integration files reference `src/opencarl/` paths.
result: pass

### 4. Comments and JSDoc Rebranded
expected: Comments in `src/opencarl/` and related tests reference OpenCARL branding (e.g., .opencarl, OPENCARL_DEBUG) rather than CARL/.carl in comments.
result: pass

## Summary

total: 4
passed: 3
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "In `src/opencarl/types.ts` and `src/opencarl/errors.ts`, all public Carl* types are now Opencarl* (e.g., OpencarlRuleDomainPayload, OpencarlError). No Carl* type names remain in those files."
  status: failed
  reason: "User reported: In src/opencarl/errors.ts this 'const DOCS_BASE_URL = \"https://github.com/krisjg/carl/blob/main/docs\";' is wrong. krisjg is not my username in github and the project is opencarl see https://github.com/KrisGray/opencarl"
  severity: major
  test: 1
  root_cause: "DOCS_BASE_URL in src/opencarl/errors.ts was not updated during rebranding and still points to the legacy krisjg/carl repo."
  artifacts:
    - path: "src/opencarl/errors.ts"
      issue: "DOCS_BASE_URL constant still uses https://github.com/krisjg/carl/blob/main/docs"
  missing:
    - "Update DOCS_BASE_URL to https://github.com/KrisGray/opencarl/blob/main/docs"
  debug_session: ".planning/debug/docs-base-url-opencarl.md"
