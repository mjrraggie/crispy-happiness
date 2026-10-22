#!/bin/bash
# Pull the latest shared memory, then commit and push any local changes.
# Usage: sync.sh [pull|push|both]   (default: both)
set -u
REPO="${CLAUDE_MEMORY_DIR:-$HOME/claude-memory}"
MODE="${1:-both}"
cd "$REPO" 2>/dev/null || exit 0
BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if [ "$MODE" != "push" ]; then
  git pull --rebase --autostash --quiet origin "$BRANCH" >/dev/null 2>&1
fi

if [ "$MODE" != "pull" ] && [ -n "$(git status --porcelain -- CLAUDE.md memory)" ]; then
  git add -A -- memory
  [ -f CLAUDE.md ] && git add -- CLAUDE.md
  git commit --quiet -m "Update memory from $(scutil --get ComputerName 2>/dev/null || hostname)"
  git push --quiet origin "$BRANCH" >/dev/null 2>&1
fi
exit 0
