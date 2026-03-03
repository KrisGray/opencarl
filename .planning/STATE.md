# Project State

**Current Phase:** 05
**Current Phase Name:** OpenCode Rules Integration & Distribution
**Total Phases:** 5
**Current Plan:** 03
**Total Plans in Phase:** 3
**Status:** Phase complete — ready for verification
**Progress:** [█████████░] 87%
**Last Activity:** 2026-03-03
**Last Activity Description:** Plan 05-03 complete - npm package docs and publish scripts

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-25)

**Core value:** Keep CARL's dynamic rule injection working seamlessly inside OpenCode with full parity and minimal user friction.
**Current focus:** Phase 5 — OpenCode Rules Integration & Distribution

## Performance Metrics

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P01 | 13 min | 3 tasks | 6 files |
| Phase 01 P02 | 12 min | 3 tasks | 4 files |
| Phase 02 P01 | 0 min | 3 tasks | 4 files |
| Phase 02 P02 | 11 min | 3 tasks | 7 files |
| Phase 02 P03 | 0 min | 3 tasks | 5 files |
| Phase 02 P04 | 5 min | 3 tasks | 4 files |
| Phase 03 P01 | 10 min | 3 tasks | 5 files |
| Phase 03 P02 | 10 min | 1 tasks | 7 files |
| Phase 04 P01 | 5 min | 3 tasks | 2 files |
| Phase 04 P02 | 3 min | 2 tasks | 2 files |
| Phase 04 P03 | 3 min | 3 tasks | 3 files |
| Phase 04 P04 | 5 min | 1 task | 1 file |
| Phase 05 P03 | 4 min | 3 tasks | 3 files |

## Decisions Made


- [Phase 01]: Global plugin entrypoint imports the loader via absolute path derived at install time to ensure shared loader usage.
- [Phase 03]: Rule cache is global but checks dirty flag before returning cached result; session overrides stored in .carl/sessions/{session_id}.json; invalid project rules emit warning once per session.
- [Phase 03]: CRITICAL context bracket uses DEPLETED rules with explicit warning — Maintains rule consistency while alerting user to compact session
- [Phase 04 P01]: Setup detection uses process-level guard; idempotent seeding skips existing files; project-first with global fallback
- [Phase 04 P02]: Duplicate plugin detection uses session-scoped warning guard; first load wins; console.warn for visibility
- [Phase 04 P03]: Quick reference extracted from docs before --- separator; fallback to first 2000 chars if no separator; regular *carl unchanged (only *carl docs triggers docs)
- [Phase 05-01]: Use HTML comment markers for reversible AGENTS.md sections — Markers enable reliable identification and removal of CARL sections without parsing markdown
- [Phase 05-03]: Dual-package strategy allows maintaining both carl-core and @krisgray/opencode-carl-plugin from same repo — Enables supporting both Claude Code and OpenCode from single codebase

## Blockers/Concerns


- REQUIREMENTS.md missing Phase 2 requirement IDs (MATCH-01, MATCH-03, MATCH-04, CMD-01, CMD-04, SAFE-01); mark-complete failed.

## Session Continuity

**Last session:** 2026-03-03T12:53:36.000Z
**Stopped at:** Completed 05-03-PLAN.md
**Resume file:** None
