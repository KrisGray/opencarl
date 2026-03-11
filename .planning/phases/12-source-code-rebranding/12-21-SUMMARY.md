---
phase: 12-source-code-rebranding
plan: 21
wave: 1
depends_on: []
autonomous: true
gap_closure: true
requirements: [SOURCE-04]
---

## Summary

**Objective:** Fix critical test assertion failures where tests expect old `<carl-rules>` format but code produces `<opencarl-rules>`.

### Tasks Completed

| Task | Status | Files Modified |
|------|--------|----------------|
| 1: Update injector.test.ts assertions | ✓ Complete | tests/javascript/unit/injector.test.ts |
| 2: Update plugin-lifecycle.test.ts mock and assertions | ✓ Complete | tests/javascript/integration/plugin-lifecycle.test.ts |
| 3: Update rule-injection-pipeline.test.ts assertions | ✓ Complete | tests/javascript/integration/rule-injection-pipeline.test.ts |

### Changes Made

- **injector.test.ts (lines 34, 37):** Changed `expect(result).toContain('<carl-rules>')` to `<opencarl-rules>`
- **plugin-lifecycle.test.ts (line 128, 314, 416):** Updated mock return value and assertions to use `<opencarl-rules>`
- **rule-injection-pipeline.test.ts (lines 213, 216):** Changed assertions to expect `<opencarl-rules>`

### Verification

```
Test Suites: 3 passed, 3 total
Tests:       54 passed, 54 total
```

### Commit

`e51f485` - fix(12-21): update test assertions to expect opencarl-rules format
