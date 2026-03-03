# Phase 6: Integration & Developer Experience - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete opencode.json integration and add troubleshooting/diagnostic tools for CARL users. This phase delivers: a command to integrate CARL docs into opencode.json, clear error messages, debug logging, and a troubleshooting guide. All focused on helping users understand and fix CARL issues independently.

</domain>

<decisions>
## Implementation Decisions

### Integration Command Behavior
- Extend existing `setup` command with `--integrate-opencode` flag (not a separate command)
- Intelligently merge CARL instructions with existing opencode.json instructions (preserve user customizations)
- Create opencode.json with minimal CARL-focused config if file doesn't exist
- Reference doc files (README.md, USAGE.md) in instructions field rather than embedding full content
- Integration is opt-in via flag, never automatic

### Error Message Design
- Show context + what went wrong + where + how to fix (actionable, not just descriptive)
- Structure errors with categories: type (config/manifest/runtime), message, fix suggestion, docs link
- Present fix suggestions as code snippets or commands (copy-pasteable, not just descriptive)
- Output to console stderr (simple, works everywhere, no log file complexity)

### Debug Logging System
- Enable via environment variable: `CARL_DEBUG=true` (standard approach, works everywhere)
- Log rule lifecycle events: rule matching decisions, injection events, file loads (core CARL behavior)
- Output to console stdout with timestamps (immediate visibility, doesn't clutter stderr)
- Off by default with zero overhead unless enabled (performance-first)

### Troubleshooting Guide Scope
- Focus on common problems: install failures, rule not loading, wrong rules applied (actionable, not exhaustive)
- Use Q&A style format: Problem → diagnosis → solution (scannable and practical)
- Create separate TROUBLESHOOTING.md in repo root (visible, easy to find, standard location)
- Include real examples with actual commands, configs, errors + how to fix them (concrete and copy-pasteable)

### OpenCode's Discretion
- Exact merge algorithm for opencode.json instructions
- Specific error message templates and wording
- Timestamp format in debug logs
- Which specific common problems to prioritize in troubleshooting guide
- Detailed logging format for rule lifecycle events

</decisions>

<specifics>
## Specific Ideas

- Integration should feel like a natural extension of existing setup workflow
- Errors should be so clear that users rarely need the troubleshooting guide
- Debug logs should help answer "why did this rule get injected?" without overwhelming detail
- Troubleshooting guide should be the 80/20 solution—cover the cases users actually hit

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-integration-developer-experience*
*Context gathered: 2026-03-03*
