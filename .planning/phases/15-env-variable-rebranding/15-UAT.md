---
status: complete
phase: 15-env-variable-rebranding
source: 15-05-SUMMARY.md, 15-06-SUMMARY.md, 15-07-SUMMARY.md, 15-08-SUMMARY.md
started: 2026-03-13T09:26:18Z
updated: 2026-03-13T09:31:28Z
---

## Current Test

[testing complete]

## Tests

### 1. CARL_DEBUG deprecation warning
expected: With CARL_DEBUG set, a one-time stderr warning appears: "CARL_DEBUG is deprecated, please use OPENCARL_DEBUG".
result: pass

### 2. Version bumped for breaking change
expected: package.json shows version 2.0.0.
result: pass

### 3. Legacy dist/carl artifacts removed
expected: dist/carl is absent and dist/ outputs contain no CARL_DEBUG tokens (excluding the warning string).
result: pass

### 4. CI workflows + E2E image references updated
expected: .github/workflows/*.yml reference OPENCARL_DEBUG and use opencode-opencarl:e2e; no opencode-carl:e2e remains.
result: pass

### 5. Full test suite passes with OPENCARL_DEBUG
expected: `npm run test:coverage && OPENCARL_DEBUG=true npm test` completes successfully.
result: pass

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
