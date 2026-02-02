#!/usr/bin/env python3
"""
Cleanup Hook - Removes duplicate saved_hook_context entries from session files.

Runs on: Stop
Purpose: Prevent session file bloat from repeated hook context saves.

Strategy: Keep only the MOST RECENT saved_hook_context entry, remove all others.
This preserves the context for session resume while preventing bloat.
"""
import json
import sys
import os
from pathlib import Path

DEBUG = False


def debug_log(msg: str):
    if DEBUG:
        print(f"[CLEANUP] {msg}", file=sys.stderr)


def find_session_file(session_id: str, cwd: str) -> Path | None:
    """Find the session JSONL file."""
    if not session_id or not cwd:
        return None

    home = Path.home()
    search_path = Path(cwd)

    # Walk up directory tree to find session file
    for _ in range(10):
        project_dir = str(search_path).replace('/', '-').lstrip('-')
        candidate = home / '.claude' / 'projects' / f'-{project_dir}' / f'{session_id}.jsonl'
        if candidate.exists():
            return candidate
        if search_path.parent == search_path:
            break
        search_path = search_path.parent

    return None


def cleanup_session_file(session_file: Path) -> dict:
    """
    Remove duplicate saved_hook_context entries, keeping only the last one.
    Returns stats about what was cleaned.
    """
    stats = {
        'total_lines': 0,
        'hook_contexts_found': 0,
        'hook_contexts_removed': 0,
        'error': None
    }

    try:
        # Read all lines
        with open(session_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        stats['total_lines'] = len(lines)

        # Find all saved_hook_context entries and their indices
        hook_context_indices = []
        for i, line in enumerate(lines):
            try:
                data = json.loads(line.strip())
                if data.get('type') == 'saved_hook_context':
                    hook_context_indices.append(i)
            except json.JSONDecodeError:
                continue

        stats['hook_contexts_found'] = len(hook_context_indices)

        # If 2 or fewer, nothing to clean
        if len(hook_context_indices) <= 2:
            debug_log(f"Only {len(hook_context_indices)} hook contexts, skipping cleanup")
            return stats

        # Keep only the last hook context, remove all others
        indices_to_remove = set(hook_context_indices[:-1])
        stats['hook_contexts_removed'] = len(indices_to_remove)

        # Filter lines
        cleaned_lines = [
            line for i, line in enumerate(lines)
            if i not in indices_to_remove
        ]

        # Write back
        with open(session_file, 'w', encoding='utf-8') as f:
            f.writelines(cleaned_lines)

        debug_log(f"Cleaned {stats['hook_contexts_removed']} hook contexts")

    except Exception as e:
        stats['error'] = str(e)
        debug_log(f"Error during cleanup: {e}")

    return stats


def main():
    """Main hook execution."""
    import select

    # Read input with timeout (Stop hook receives JSON on stdin)
    try:
        if select.select([sys.stdin], [], [], 2)[0]:
            input_data = json.load(sys.stdin)
        else:
            input_data = {}
    except Exception:
        input_data = {}

    session_id = input_data.get('sessionId', '') or input_data.get('session_id', '')
    cwd = input_data.get('cwd', '')

    if not session_id or not cwd:
        debug_log("No session_id or cwd, exiting")
        sys.exit(0)

    session_file = find_session_file(session_id, cwd)
    if not session_file:
        debug_log(f"Session file not found for {session_id}")
        sys.exit(0)

    debug_log(f"Cleaning up {session_file}")
    stats = cleanup_session_file(session_file)

    if stats['hook_contexts_removed'] > 0:
        debug_log(f"Removed {stats['hook_contexts_removed']} duplicate hook contexts")

    # No output needed for Stop hook
    sys.exit(0)


if __name__ == "__main__":
    main()
