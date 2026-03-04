---
phase: 09-core-unit-tests-session-setup
plan: 02
type: execute
wave: 1
autonomous: true
requirements: [UNIT-06]
tags: [jest, unit-tests, command-parity, star-commands, coverage]

must_haves:
  truths:
    - "Developer can verify *carl star command is detected and parsed"
    - "Developer can verify *carl docs subcommand triggers docs guidance"
    - "Developer can verify custom star commands resolve to command payloads"
    - "Developer can verify unresolved tokens are tracked"
  artifacts:
    - path: tests/javascript/unit/command-parity.test.ts
      provides: "Command parity unit tests"
      contains: "describe('command-parity.ts')"
      min_lines: 567
  key_links:
    - from: "tests/javascript/unit/command-parity.test.ts"
      to: "src/carl/command-parity.ts"
      via: "import resolveCarlCommandSignals"
      pattern: "resolveCarlCommandSignals"
---

# Summary

Created comprehensive BDD tests for star-command parsing and resolution.
All tests pass with >80% coverage of command-parity.ts.

# Changes
- Fixed EISDIR errors by removing mkdirSync for commandsPath
- Fixed special character test expectations (regex only matches [a-zA-Z]+)
- Cleaned up test structure

# Coverage
- 29 tests pass
- >80% coverage of command-parity.ts

# Commits
- Fixed EISDIR errors in command-parity.test.ts
- Fixed special character test expectations
- All tests passing
