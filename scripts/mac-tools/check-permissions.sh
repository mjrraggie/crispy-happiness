#!/bin/bash
# Run once while sitting at the Mac: makes macOS ask for the automation
# permissions Claude needs, so nothing hangs on a prompt while you're away.
osascript -e 'tell application "Messages" to get name of 1st account' >/dev/null && echo "Messages: OK" || echo "Messages: not allowed (System Settings > Privacy & Security > Automation)"
osascript -e 'tell application "Microsoft Outlook" to get name' >/dev/null 2>&1 && echo "Outlook: OK" || echo "Outlook: no AppleScript (New Outlook?) - use Microsoft 365 tools for email instead"
sqlite3 "$HOME/Library/Messages/chat.db" 'select count(*) from message' >/dev/null 2>&1 && echo "Reading texts: OK" || echo "Reading texts: give your terminal app Full Disk Access (Privacy & Security > Full Disk Access)"
"$(dirname "$0")/onedrive-path.sh" >/dev/null && echo "OneDrive folder: OK"
