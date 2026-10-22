#!/bin/bash
# One-time Mac setup: link this repo into Claude Code's user memory and keep it synced.
# Run from the cloned repo:  ./scripts/mac-setup.sh
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
LINK="$HOME/claude-memory"
CLAUDE_DIR="$HOME/.claude"
USER_MEMORY="$CLAUDE_DIR/CLAUDE.md"
SETTINGS="$CLAUDE_DIR/settings.json"
PLIST="$HOME/Library/LaunchAgents/com.claude.memory-sync.plist"
IMPORT_LINE="@~/claude-memory/CLAUDE.md"

mkdir -p "$CLAUDE_DIR" "$HOME/Library/LaunchAgents"

# 1. Stable path to the repo, whatever folder it was cloned into.
if [ "$REPO" != "$LINK" ]; then
  ln -sfn "$REPO" "$LINK"
fi
chmod +x "$REPO/scripts/sync.sh"

# 2. Import the shared memory into every local session (keeps any existing notes).
touch "$USER_MEMORY"
if ! grep -qxF "$IMPORT_LINE" "$USER_MEMORY"; then
  printf '\n%s\n' "$IMPORT_LINE" >> "$USER_MEMORY"
  echo "Added shared memory import to $USER_MEMORY"
fi

# 3. Hooks: pull when a session starts, push when Claude finishes a reply.
if command -v python3 >/dev/null 2>&1; then
  python3 - "$SETTINGS" <<'PY'
import json, os, sys
path = sys.argv[1]
settings = {}
if os.path.exists(path):
    with open(path) as f:
        settings = json.load(f)
hooks = settings.setdefault("hooks", {})
def add(event, cmd):
    entries = hooks.setdefault(event, [])
    if any(h.get("command") == cmd for e in entries for h in e.get("hooks", [])):
        return
    entries.append({"hooks": [{"type": "command", "command": cmd}]})
add("SessionStart", "~/claude-memory/scripts/sync.sh pull")
add("Stop", "~/claude-memory/scripts/sync.sh push")
with open(path, "w") as f:
    json.dump(settings, f, indent=2)
    f.write("\n")
PY
  echo "Added sync hooks to $SETTINGS"
else
  echo "python3 not found; skipped hooks. The background sync below still runs."
fi

# 4. Background sync every 5 minutes, for edits made outside Claude.
cat > "$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.claude.memory-sync</string>
  <key>ProgramArguments</key>
  <array><string>$REPO/scripts/sync.sh</string></array>
  <key>StartInterval</key><integer>300</integer>
  <key>RunAtLoad</key><true/>
</dict>
</plist>
PL
launchctl unload "$PLIST" 2>/dev/null || true
launchctl load "$PLIST"
echo "Background sync installed (every 5 minutes)."

echo
echo "Done. To control this Mac from your phone, run in the folder you want to work in:"
echo "  claude remote-control"
