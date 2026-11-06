#!/bin/bash
# Make an email in Outlook for Mac. By default it is saved to Drafts, not sent.
# Usage: outlook-draft.sh [--send] --to a@x.org[,b@y.org] [--cc ...] --subject "..." --body "..." [--attach /path ...]
# Works with "Legacy Outlook" (AppleScript). New Outlook has no AppleScript;
# if this fails, use your Microsoft 365 tools on the Mac instead.
set -euo pipefail
MODE=draft; TO=""; CC=""; SUBJECT=""; BODY=""; ATTACH=()
while [ $# -gt 0 ]; do
  case "$1" in
    --send) MODE=send ;;
    --to) TO="$2"; shift ;;
    --cc) CC="$2"; shift ;;
    --subject) SUBJECT="$2"; shift ;;
    --body) BODY="$2"; shift ;;
    --attach) ATTACH+=("$2"); shift ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
  shift
done
[ -n "$TO" ] || { echo "--to is required" >&2; exit 2; }

osascript - "$MODE" "$TO" "$CC" "$SUBJECT" "$BODY" "${ATTACH[@]+"${ATTACH[@]}"}" <<'AS'
on splitList(s)
  if s is "" then return {}
  set AppleScript's text item delimiters to ","
  set out to text items of s
  set AppleScript's text item delimiters to ""
  return out
end splitList
on run argv
  set mode to item 1 of argv
  tell application "Microsoft Outlook"
    set msg to make new outgoing message with properties {subject:(item 4 of argv), plain text content:(item 5 of argv)}
    repeat with a in my splitList(item 2 of argv)
      make new to recipient at msg with properties {email address:{address:a}}
    end repeat
    repeat with a in my splitList(item 3 of argv)
      make new cc recipient at msg with properties {email address:{address:a}}
    end repeat
    if (count of argv) > 5 then
      repeat with i from 6 to count of argv
        make new attachment at msg with properties {file:(POSIX file (item i of argv))}
      end repeat
    end if
    if mode is "send" then
      send msg
    else
      save msg
    end if
  end tell
end run
AS
echo "Outlook: $MODE done ($SUBJECT)"
