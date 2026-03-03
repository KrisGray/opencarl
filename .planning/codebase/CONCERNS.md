# Codebase Concerns

**Analysis Date:** 2026-02-25

## Tech Debt

**Installer settings merge is lossy:**
- Issue: `settings.json` is parsed and then fully overwritten with `JSON.stringify`, losing comments, formatting, and potentially unknown fields when parse fails.
- Files: `bin/install.js`
- Impact: User hook settings can be partially or fully lost if `settings.json` contains non-JSON content or unexpected structure.
- Fix approach: Use a schema-aware merge, preserve unknown fields, and write backups before mutation.

## Known Bugs

**Keyword matching can trigger on substrings:**
- Symptoms: Domains can load unexpectedly when keywords appear inside other words (e.g., keyword `ai` matching `said`).
- Files: `hooks/carl-hook.py`
- Trigger: `match_domains_to_prompt()` uses `re.search(re.escape(keyword), prompt_lower)` without word boundaries.
- Workaround: Use explicit multi-word recall phrases; long-term fix is to use word boundaries or tokenization.

## Security Considerations

**Not detected.**

## Performance Bottlenecks

**Not detected.**

## Fragile Areas

**Context bracket relies on external `tail` binary:**
- Files: `hooks/carl-hook.py`
- Why fragile: `get_context_percentage()` shells out to `tail` which may not exist on Windows environments.
- Safe modification: Replace `subprocess.run(['tail', '-20', ...])` with pure Python file tailing.
- Test coverage: No automated tests cover cross-platform context detection.

**Session cleanup can delete invalid JSON sessions:**
- Files: `hooks/carl-hook.py`
- Why fragile: `cleanup_stale_sessions()` unlinks any JSON file that fails to parse, even if corruption is transient.
- Safe modification: Move invalid files to a quarantine folder before deletion.
- Test coverage: No tests around session file recovery.

## Scaling Limits

**Session cleanup only runs on new session creation:**
- Current capacity: Sessions can accumulate for long-running usage.
- Limit: `cleanup_stale_sessions()` runs only when a new session is created, so stale sessions persist indefinitely if a single session is reused.
- Files: `hooks/carl-hook.py`
- Scaling path: Trigger periodic cleanup based on time or prompt count.

## Dependencies at Risk

**Not detected.**

## Missing Critical Features

**Uninstall/rollback flow for installer:**
- Problem: There is no CLI path to remove the hook and restore prior `settings.json` state.
- Blocks: Users must manually remove files/entries.
- Files: `bin/install.js`

## Test Coverage Gaps

**No automated tests configured:**
- What's not tested: Hook behavior, installer mutations, and cross-platform path logic.
- Files: `hooks/carl-hook.py`, `bin/install.js`, `package.json`
- Risk: Regressions in hook parsing and settings merge go unnoticed.
- Priority: High

---

*Concerns audit: 2026-02-25*
