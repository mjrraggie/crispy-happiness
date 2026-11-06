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

## Phone assistant

The user drives Claude from their phone. Work out where you're running first:

- **On the Mac** (Remote Control or Desktop app): everything works, the same
  as at the desk: Messages, Outlook, OneDrive folder, every connector and
  agent. Helper scripts are in `scripts/mac-tools/` if nothing better is set up.
- **In a cloud session** (`CLAUDE_CODE_REMOTE=true`): Microsoft 365 is
  **read only** (email, calendar, Teams, OneDrive/SharePoint). Planning Center
  and RingCentral chat work. iMessage only through the `texting-inbox` repo
  export, and sending a text means giving a tap-to-send `sms:` link. Emails
  are drafted in chat. For sending email, Outlook drafts with attachments, or
  saving to OneDrive, say plainly it needs the Mac and offer to finish it in
  the Mac session.

Rules for messages, on any device:

- Draft first and show the exact text, recipients and attachments.
- Send only after the user says send (or equivalent) for that message.
- "Run my daily brief" or "catch me up" follows `briefs/daily-brief.md`.
- Keep replies short and phone-readable: lists, no wide tables.
