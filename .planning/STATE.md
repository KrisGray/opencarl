# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-03)

**Core value:** Keep CARL's dynamic rule injection working seamlessly inside OpenCode with full parity and minimal user friction.
**Current focus:** Phase 6 - Integration & Developer Experience

## Current Position

Phase: 6 of 6 (Integration & Developer Experience)
Plan: 1 of 4 in current phase
Status: In progress
Last activity: 2026-03-03 — Completed 06-01: OpenCode config integration

Progress: [████████████████░░░░] 84% (16/19 plans complete)

## Performance Metrics

**Velocity:**
- Total plans completed: 16
- Average duration: 6 min
- Total execution time: ~1.6 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Plugin Foundation | 2 | 25 min | 12.5 min |
| 2. Matching & Injection | 4 | 16 min | 4 min |
| 3. Session Stability | 2 | 20 min | 10 min |
| 4. Setup Flow | 4 | 16 min | 4 min |
| 5. Rules Integration | 3 | 4 min | 1.3 min |
| 6. Integration & DX | 1 | 4 min | 4 min |

**Recent Trend:**
- Last 5 plans: 5, 3, 3, 5, 4 min
- Trend: Stable

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v1.1]: Scope limited to INTE-02 completion and DX improvements
- [v1.1]: Phase numbering continues from 6 (v1.0 ended at 5)

**v1.0 Decisions (archived):**
- [Phase 01]: Global plugin entrypoint imports the loader via absolute path derived at install time
- [Phase 03]: Rule cache checks dirty flag before returning; session overrides in .carl/sessions/
- [Phase 03]: CRITICAL context bracket uses DEPLETED rules with explicit warning
- [Phase 04]: Setup detection uses process-level guard; idempotent seeding skips existing files
- [Phase 04]: Duplicate plugin detection uses session-scoped warning guard
- [Phase 05]: HTML comment markers for reversible AGENTS.md sections
- [Phase 05]: Dual-package strategy (carl-core + @krisgray/opencode-carl-plugin)
- [Phase 06-integration-developer-experience]: Quick Diagnosis Checklist provides rapid problem identification before detailed sections — Most issues can be identified with 5 common checks, saving time
- [Phase 06-integration-developer-experience]: Organized troubleshooting by issue category (Installation, Loading, Matching, Integration) — Logical grouping helps users find relevant solutions quickly
- [Phase 06-integration-developer-experience]: Debug Mode section documents CARL_DEBUG environment variable usage — Debug mode is critical for troubleshooting but wasn't previously documented
- [Phase 06-01]: Use relative path ./resources/docs/CARL-DOCS.md for opencode.json instructions — Works across project setups and environments

### Pending Todos

None yet.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-03
Stopped at: Completed 06-01-PLAN.md (OpenCode config integration)
Resume file: None

---
*State initialized: 2026-02-25*
*Last updated: 2026-03-03 for v1.1 milestone*
