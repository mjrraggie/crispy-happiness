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
