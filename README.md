# Claude memory across Mac, Desktop app, and phone

This repo is one shared memory for Claude Code on every device. There are two
parts:

1. **Remote Control.** Your phone drives a Claude Code session that runs on
   your Mac, with your Mac's files, tools, and memory.
2. **Shared memory.** `CLAUDE.md` and `memory/` live in this repo. The Mac
   keeps them synced through git, and cloud sessions you start from the phone
   load them when this repo is attached.

## 1. Control your Mac from your phone

On the Mac, in a terminal, open the folder you want to work in and run:

```bash
claude remote-control
```

The session appears in the Claude app on your phone under Code, and you can
send it messages from there. It runs on the Mac, so it uses the Mac's
files and the shared memory below. Sessions in the **Claude Desktop app** run
on the Mac too and read the same memory.

The Mac has to be awake, online, and keep that terminal open.

## 2. One-time Mac setup for shared memory

```bash
git clone https://github.com/mjrraggie/crispy-happiness.git ~/claude-memory
cd ~/claude-memory
./scripts/mac-setup.sh
```

The setup script:

- adds `@~/claude-memory/CLAUDE.md` to `~/.claude/CLAUDE.md`, so every local
  session (terminal, Desktop app, Remote Control) loads the shared memory
- adds hooks to `~/.claude/settings.json` that pull when a session starts and
  commit and push when Claude finishes a reply
- installs a background job that syncs every 5 minutes, for edits you make
  by hand

You can run it again safely; it won't add anything twice.

## 3. From the phone without the Mac

When you start a cloud session on claude.ai/code or in the phone app, attach
this repo. That session loads `CLAUDE.md` and `memory/` automatically. Ask it to
commit and push any memory changes before you finish, and the Mac pulls
them in on its next sync.

## Where to put things

| File | What goes in it |
| --- | --- |
| `memory/profile.md` | Who you are and your role |
| `memory/preferences.md` | How you want Claude to work |
| `memory/projects.md` | Active projects and their status |

Telling Claude "remember that…" in any session adds the note to these files.

## Note on the Claude app's own memory

Chat memory in the Claude app (claude.ai) is separate from Claude Code
memory and already syncs through your account. This repo covers Claude Code
sessions, which keep memory in files.

## 4. Phone assistant (Duet-style)

The goal: from your phone, do everything your Mac assistant does. Check
Outlook, texts, RingCentral and Planning Center; draft and send; attach files;
save to OneDrive; get a daily brief.

### How it works

Your phone is the screen; your Mac does the work. The Mac already has
Messages, Outlook, OneDrive and all your agents, so the phone drives a session
running there through Remote Control. A cloud session is the backup for when
the Mac is off.

| You want to… | Mac session (Remote Control) | Cloud session (Mac off) |
| --- | --- | --- |
| Check Outlook, calendar, Teams | Yes | Yes (read only) |
| Draft / send email, attachments | Yes | Draft in chat only |
| Check texts | Yes, live | From `texting-inbox` (up to 10 min old) |
| Send texts | Yes | Tap-to-send `sms:` link |
| RingCentral chat | Yes | Yes, read and post |
| Planning Center | Yes | Yes |
| OneDrive read / upload | Yes | Read only |
| Daily brief | Yes | Yes, can run on a schedule |

### One-time Mac setup

```bash
cd ~/claude-memory
git pull
./scripts/phone-setup.sh            # keeps Remote Control always running
./scripts/mac-tools/check-permissions.sh
sudo pmset -c sleep 0               # don't sleep while plugged in
```

Leave the Mac plugged in, logged in, and online. On your phone, open the
Claude app > Code and pick the session named after your Mac.

`phone-setup.sh` runs `claude remote-control` as a background job that starts
at login and restarts if it stops. It runs in "default" permission mode, so
sending a text or email asks you first, and you approve it on the phone.

### Things to say from the phone

- "Run my daily brief."
- "Anything urgent in my email since 2?"
- "Who's waiting on a text from me?"
- "Draft a reply to Sarah's text saying I'll be there at 6." → "send it"
- "Draft an email to the worship team with the Sunday run sheet from OneDrive
  attached." → "looks good, send"
- "Save this as a Word doc in OneDrive > Staff > Notes."
- "What's still unfilled for Sunday in Planning Center?"
- "Post in the Ops RingCentral team that the doors open at 5:30."

### Mac helper scripts (`scripts/mac-tools/`)

Your own agents may already do these; the scripts are a fallback.

- `imessage-send.sh <number> "<text>" [file]`: sends through Messages.
- `outlook-draft.sh --to … --subject … --body … [--attach file] [--send]`:
  saves an Outlook draft (or sends with `--send`). Needs Legacy Outlook;
  New Outlook has no AppleScript.
- `onedrive-path.sh`: prints your OneDrive folder; saving there uploads.
- `check-permissions.sh`: run once at the Mac so macOS permission prompts
  don't block Claude while you're away.

### Daily brief

`briefs/daily-brief.md` defines the brief. Say "run my daily brief" in any
session, or have one run as a scheduled cloud session each morning that sends
a push notification to your phone.
