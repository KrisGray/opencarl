---
status: investigating
trigger: "Investigate issue: uat-12-01-docs-url"
created: 2026-03-06T14:28:16Z
updated: 2026-03-06T14:30:48Z
---

## Current Focus

hypothesis: DOCS_BASE_URL still uses old repository path in src/opencarl/errors.ts
test: inspect src/opencarl/errors.ts to confirm the base URL definition
expecting: find krisjg/carl in DOCS_BASE_URL
next_action: record evidence and confirm root cause

## Symptoms

expected: DOCS_BASE_URL in src/opencarl/errors.ts should reference the OpenCARL repo under the correct GitHub username (KrisGray/opencarl).
actual: src/opencarl/errors.ts sets DOCS_BASE_URL to https://github.com/krisjg/carl/blob/main/docs.
errors: None reported
reproduction: Test 1 in UAT
started: Discovered during UAT

## Eliminated

## Evidence

- timestamp: 2026-03-06T14:30:48Z
  checked: src/opencarl/errors.ts
  found: DOCS_BASE_URL is set to "https://github.com/krisjg/carl/blob/main/docs"
  implication: documentation links still point to old repository and username

## Resolution

root_cause: "DOCS_BASE_URL in src/opencarl/errors.ts was not updated during rebranding and still points to the legacy krisjg/carl repo."
fix: ""
verification: ""
files_changed: []
