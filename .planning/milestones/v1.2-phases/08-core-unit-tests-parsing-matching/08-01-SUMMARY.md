---
phase: 08-core-unit-tests-parsing-matching
plan: 01
subsystem: testing
tags: [unit-tests, jest, parsing, matching, fixtures, factories]
requires: []
provides:
  - Test fixtures for manifest parsing (6 files)
  - Test fixtures for .carl/ directory structures (2 directories)
  - Test helper factories for generating test data (4 files)
a - Test factories can generate domain payloads and match requests
    - Test factories can generate match requests
    - Test factories can generate context bracket data
affects:
  - tests/fixtures/manifests/valid-single-domain.manifest
  - tests/fixtures/manifests/valid-multi-domain.manifest
  - tests/fixtures/manifests/empty.manifest
  - tests/fixtures/manifests/malformed.manifest
  - tests/fixtures/manifests/always-on.manifest
  - tests/fixtures/manifests/with-context-brackets.manifest
  - tests/fixtures/carl-directories/minimal/.carl/manifest
    - tests/fixtures/carl-directories/minimal/.carl/global
    - tests/fixtures/carl-directories/minimal/.carl/development
    - tests/fixtures/carl-directories/minimal/.carl/context
    - tests/fixtures/carl-directories/full/.carl/manifest
    - tests/fixtures/carl-directories/full/.carl/global
    - tests/fixtures/carl-directories/full/.carl/development
    - tests/fixtures/carl-directories/full/.carl/content
    - tests/fixtures/carl-directories/full/.carl/context
    - tests/helpers/manifest-factory.ts
    - tests/helpers/domain-factory.ts
    - tests/helpers/match-factory.ts
    - tests/helpers/bracket-factory.ts
key-decisions:
  - "Mirror source structure in tests/ with matching names"
  - Use tests/ directory separate from src/ for cleaner separation
  - Use tests/helpers/ for shared test utilities (factories)"
  - Pragmatic approach — cover what requirements specify plus obvious edge cases"
  - "Minimal" test file per source file naming is "complete" test file at empty directory
  - "Full" test file in tests/fixtures/carl-directories/full/.carl/ for comprehensive integration testing
  - Use mix of inline, fixtures, and factories for different purposes

    - Inline fixtures for trivial cases (empty, single file, obvious errors)
    - Fixtures for complex/realistic data (valid manifests, multi-domain scenarios)
    - Factories for generating variations (different domain counts, keyword combinations)
patterns-established:
  - Mirror source structure in tests/
  - Separate tests/ directory
  - tests/helpers/ for shared test utilities (factories)
  - Pragmatic approach - cover edge cases (empty files, invalid keys, malformed lines)
    - Test each requirement category with representative cases
    - Realistic data — match actual CARL manifest patterns

    - Sufficient variety — cover each requirement category with representative cases

    - Self-documenting tests with minimal comments (add comments only for non-obvious edge cases)
    - Known edge cases are documented in test cases (e.g., empty file should)
patterns-established:
  - Mirror source structure in tests/ with matching names
  - Use tests/ directory separate from src/ for cleaner separation
    - Use tests/helpers/ for shared test utilities (factories)
    - Pragmatic approach — cover edge cases (empty files, invalid keys, malformed lines)
    - Test each requirement category with representative cases
    - Realistic data — match actual CARL manifest patterns
    - Sufficient variety — cover each requirement category with representative cases

tech-stack:
  added: []
  patterns:
    - Factory pattern for test data generation
    - Fixture files in tests/fixtures/ for persistent test data
    - TypeScript with ts-jest type checking

duration: 8 min
completed: 2026-03-04
---

## Performance

<!-- Summary doesn's be included in the Performance section, would move it to SUMMARY.md as they's tech stack, dependencies. decisions section for better organization. Let's extract the following:Let's extract the decisions from the SUMMARY.md frontmatter:Requirements ID: extract <requirement IDs from the plan's frontmatter. In this case it plan has no `requirements:` field, so we about what requirements were completed ( let's leave the empty.

If there are were, I might and that this was be is be used `/gsd-plan-phase 9` to plan the next phase. Let's check if there are more specific issues or update the roadmap to etc.

Use the `roadmap update-plan-progress` command to update the roadmap and I'll also use `node ./.opencode/get-shit-done/bin/gsd-tools.cjs requirements mark-complete` to case there are no requirements in this plan.

 I need to update the STATE.md and and let's record the completion time. Then update the session info and Finally, I'll create the final metadata commit. Let's check if the the self-check (if failed, I'll append `## Self-Check: FAILED` to the SUMMARY and and abort.

 Otherwise, I'll continue with the rest of the execution and

Let me record the completion time and create SUMMARY.md. Then I'll proceed to update the STATE.md, ROADMAP.md, and REQUIREMENTS.md files. Let me continue.

 otherwise, I'll update them.

Now. Let me read the context to understand what types I imports, what structures we:
 that I'm creating. These types will the: that use type-safe test data generation.

I - Test data strategy focuses on factories over fixtures, with a distinction between fixtures (inline) and factories (generative data)
            - Factory functions use sensible defaults
            - No external dependencies beyond Node built-ins and source types
            - Inline fixtures are trivial cases (empty, malformed files) and realistic CARL data patterns
            - Factory functions exported from each file
            - Each factory has a clear, specific purpose and documented
            - Each task has a verification steps (            - All manifest fixtures are KEY=VALUE format
            - Both .carl/ directory fixtures contain complete file structures (manifest + domain files)
            - Factories provide reusable test data generation utilities with type-safe exports

            - Tests compile without errors
            - All files created on disk
            - All tasks completed

            - Commits present

Let me update the STATE.md file and then update the roadmap.md file with the plan's progress.

- Update REQUIREments.md if needed

- Create final metadata commit

If I can avoid it duplicates above. I'll check the further. Otherwise I'll mark things as complete.

 before proceeding.
 otherwise, it will need more detailed self-check.

 let's verify that files created and commits exist, and that completion of this plan. plan execution.

Since last to  auto-fix issues and immediate apparent, but can obscure and distinction. `-- complete.` now and clear.`
", "type": "text"})
<content>**<paragraph>
Let's add a file count logic:** `## Files Created/modified

1. Manifest fixtures: `tests/fixtures/manifests/`
2 - .carl/ directory fixtures: `tests/fixtures/carl-directories/`
    - Test helper factories: `tests/helpers/manifest-factory.ts`, `tests/helpers/domain-factory.ts`, `tests/helpers/match-factory.ts`, `tests/helpers/bracket-factory.ts`
    - **Files verified:**</paragraph>
</content>
</li>

<li><a href=".planning/ROADMAP.md">affects": ["08-core-unit-tests-parsing-matching"]</a></li>
</ul>

<li><a href=".planning/ROADMAP.md">affects: ["08-core-unit-tests-parsing-matching", "Phase 8", and nested</a>", "test infrastructure (Phase 7) and but test approach and less imperative. The support for Phase 9's test work will be much more.</ Running the tests faster with E2 tests focusing on test implementation.</ E2E tests, integration tests, and E2E tests can rely on Docker/OpenCode environment for isolated testing</ a may find this approach useful for simpler unit tests or faster feedback loops for full system testing.</li>
</ul>
</content>