#!/bin/bash
# Cloud sessions: remind Claude that memory edits must be pushed before the container goes away.
if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ]; then
  echo "This is the shared memory repo. If you edit memory/ in this session, commit and push before finishing."
fi
exit 0
