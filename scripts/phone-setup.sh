#!/bin/bash
# Make this Mac an always-on assistant you can drive from your phone.
#
# Installs a LaunchAgent that keeps `claude remote-control` running in the
# background (restarted if it exits, started at login), so a session from this
# Mac is always waiting in the Claude app on your phone under Code.
#
# Usage:  ./scripts/phone-setup.sh [work-folder]     (default: ~/claude-memory)
#         ./scripts/phone-setup.sh --uninstall
set -euo pipefail

LABEL="com.claude.remote-control"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG="$HOME/Library/Logs/claude-remote-control.log"

if [ "${1:-}" = "--uninstall" ]; then
  launchctl unload "$PLIST" 2>/dev/null || true
  rm -f "$PLIST"
  echo "Removed. Remote Control no longer starts on its own."
  exit 0
fi

WORK_DIR="${1:-$HOME/claude-memory}"
WORK_DIR="$(cd "$WORK_DIR" && pwd)"
CLAUDE_BIN="$(command -v claude || true)"
if [ -z "$CLAUDE_BIN" ]; then
  echo "Can't find the claude command. Install Claude Code first, then run this again." >&2
  exit 1
fi
NAME="$(scutil --get ComputerName 2>/dev/null || hostname)"

mkdir -p "$HOME/Library/LaunchAgents" "$HOME/Library/Logs"

# caffeinate -i keeps the Mac from idle-sleeping while Remote Control runs.
# script gives remote-control a terminal, which it expects.
# Permission mode "default": anything that sends, deletes or changes things
# asks you first, and the question shows up on your phone.
cat > "$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>WorkingDirectory</key><string>$WORK_DIR</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/caffeinate</string><string>-i</string>
    <string>/usr/bin/script</string><string>-q</string><string>/dev/null</string>
    <string>$CLAUDE_BIN</string><string>remote-control</string>
    <string>--name</string><string>$NAME (phone)</string>
    <string>--permission-mode</string><string>default</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key><string>$(dirname "$CLAUDE_BIN"):/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    <key>HOME</key><string>$HOME</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>30</integer>
  <key>StandardOutPath</key><string>$LOG</string>
  <key>StandardErrorPath</key><string>$LOG</string>
</dict>
</plist>
PL

launchctl unload "$PLIST" 2>/dev/null || true
launchctl load "$PLIST"

cat <<MSG
Remote Control is running from: $WORK_DIR
Log: $LOG

On your phone: Claude app > Code. Look for "$NAME (phone)".

Two Mac settings finish the job (do them once):
  1. Don't sleep while plugged in:
       sudo pmset -c sleep 0
     (System Settings > Battery > Options > "Prevent automatic sleeping on
      power adapter when the display is off" does the same.)
  2. Messages, Outlook and Terminal automation: the first time Claude sends a
     text or makes an email draft, macOS asks for permission. Approve it while
     you're at the Mac, or it will hang when you're away. To trigger the
     prompts now, run:  ./scripts/mac-tools/check-permissions.sh

To stop it:  ./scripts/phone-setup.sh --uninstall
MSG
