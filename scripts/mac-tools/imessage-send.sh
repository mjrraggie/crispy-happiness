#!/bin/bash
# Send an iMessage (or SMS through your iPhone) from the Mac's Messages app.
# Usage: imessage-send.sh <phone-or-email> <message> [attachment-path]
# Only run this after the user has approved the exact text.
set -euo pipefail
TO="$1"; MSG="$2"; FILE="${3:-}"
osascript - "$TO" "$MSG" "$FILE" <<'AS'
on run argv
  set toHandle to item 1 of argv
  set msgText to item 2 of argv
  set filePath to item 3 of argv
  tell application "Messages"
    try
      set svc to 1st account whose service type = iMessage
      set target to participant toHandle of svc
    on error
      set svc to 1st account whose service type = SMS
      set target to participant toHandle of svc
    end try
    if msgText is not "" then send msgText to target
    if filePath is not "" then send (POSIX file filePath) to target
  end tell
end run
AS
echo "Sent to $TO"
