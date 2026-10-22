# Shared memory

This file is loaded by every Claude Code session that uses this memory repo:
on the Mac (through `~/.claude/CLAUDE.md`), in the Desktop app, and in cloud
sessions started from the phone with this repo attached.

@memory/profile.md
@memory/preferences.md
@memory/projects.md

## Keeping memory in sync

- When the user asks you to remember something, add it to the right file in
  `memory/` (not to a per-project or per-machine file), so every device sees it.
- Keep entries short and dated when they might go stale.
- On the Mac, changes are committed and pushed automatically by
  `scripts/sync.sh`. In a cloud session, commit and push memory edits before
  the session ends, or they are lost with the container.
