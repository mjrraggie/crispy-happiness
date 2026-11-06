#!/bin/bash
# Print the local OneDrive folder(s). Saving a file there uploads it to OneDrive;
# files listed there are your OneDrive files.
ls -d "$HOME"/Library/CloudStorage/OneDrive* 2>/dev/null || {
  echo "No OneDrive folder found. Is the OneDrive app installed and signed in?" >&2; exit 1; }
