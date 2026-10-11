#!/bin/bash
# Starts three things:
#   1. netlify dev on :8888   — runs the subscribe.js function against beehiiv (uses .env)
#   2. live-server on :8080   — serves index.html with auto-reload on save,
#      proxying /.netlify/functions/* through to netlify dev so the quiz's
#      "subscribe" call still works.
#   3. local-ssl-proxy on :8443 — plain HTTPS passthrough to :8080, using the
#      package's bundled self-signed localhost cert. Exists only because
#      SparkLoop's dashboard forces an https:// prefix on its "End of
#      journey" redirect URL — without this, that redirect 404s on local
#      dev with ERR_SSL_PROTOCOL_ERROR (local dev has no SSL cert of its
#      own). Point SparkLoop's redirect at https://localhost:8443/... to
#      test that flow locally. Not needed once deployed — Netlify serves
#      https on its own.
# Use http://localhost:8080 while editing. Stop with: npm run dev:stop
set -e
cd "$(dirname "$0")/.."

PID_FILE=".dev-pids"
NETLIFY_LOG=".netlify-dev.log"
LIVE_LOG=".live-server.log"
NETLIFY_BIN="./node_modules/.bin/netlify"
LIVE_SERVER_BIN="./node_modules/.bin/live-server"
SSL_PROXY_BIN="./node_modules/.bin/local-ssl-proxy"
SSL_PROXY_LOG=".ssl-proxy.log"

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

"$SSL_PROXY_BIN" --source 8443 --target 8080 > "$SSL_PROXY_LOG" 2>&1 &
SSL_PROXY_PID=$!
echo "$SSL_PROXY_PID" >> "$PID_FILE"

echo ""
echo "→ http://localhost:8080   (edit index.html — the page auto-reloads on save)"
echo "→ https://localhost:8443  (HTTPS passthrough — only needed to test SparkLoop's"
echo "   redirect-after-recommendations locally; first visit needs a one-time"
echo "   'Advanced > Proceed' click past the self-signed cert warning)"
echo "→ Function calls proxy through to netlify dev on :8888"
echo "→ Logs: tail -f $NETLIFY_LOG  /  tail -f $LIVE_LOG  /  tail -f $SSL_PROXY_LOG"
echo "→ Stop with: npm run dev:stop"
