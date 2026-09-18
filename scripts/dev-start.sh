#!/bin/bash
# Starts two things:
#   1. netlify dev on :8888  — runs the subscribe.js function against beehiiv (uses .env)
#   2. live-server on :8080  — serves index.html with auto-reload on save,
#      proxying /.netlify/functions/* through to netlify dev so the quiz's
#      "subscribe" call still works.
# Use http://localhost:8080 while editing. Stop with: npm run dev:stop
set -e
cd "$(dirname "$0")/.."

PID_FILE=".dev-pids"
NETLIFY_LOG=".netlify-dev.log"
LIVE_LOG=".live-server.log"
NETLIFY_BIN="./node_modules/.bin/netlify"
LIVE_SERVER_BIN="./node_modules/.bin/live-server"

if [ -f "$PID_FILE" ]; then
  RUNNING=0
  while read -r PID; do
    [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null && RUNNING=1
  done < "$PID_FILE"
  if [ "$RUNNING" = "1" ]; then
    echo "Already running. Visit http://localhost:8080"
    exit 0
  fi
fi
rm -f "$PID_FILE"

"$NETLIFY_BIN" dev > "$NETLIFY_LOG" 2>&1 &
NETLIFY_PID=$!
echo "$NETLIFY_PID" >> "$PID_FILE"

echo "Waiting for netlify dev on :8888..."
for i in $(seq 1 20); do
  curl -s -o /dev/null http://localhost:8888/ && break
  sleep 0.5
done

"$LIVE_SERVER_BIN" --port=8080 --no-browser \
  --proxy=/.netlify/functions:http://localhost:8888/.netlify/functions \
  --ignore=node_modules,.git,scripts \
  . > "$LIVE_LOG" 2>&1 &
LIVE_PID=$!
echo "$LIVE_PID" >> "$PID_FILE"

echo ""
echo "→ http://localhost:8080   (edit index.html — the page auto-reloads on save)"
echo "→ Function calls proxy through to netlify dev on :8888"
echo "→ Logs: tail -f $NETLIFY_LOG  /  tail -f $LIVE_LOG"
echo "→ Stop with: npm run dev:stop"
