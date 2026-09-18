#!/bin/bash
# Stops everything started by dev-start.sh.
cd "$(dirname "$0")/.."

PID_FILE=".dev-pids"

if [ -f "$PID_FILE" ]; then
  while read -r PID; do
    if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
      kill "$PID"
      echo "Stopped PID $PID."
    fi
  done < "$PID_FILE"
  rm -f "$PID_FILE"
else
  echo "No PID file found."
fi

# Belt-and-suspenders: make sure nothing is still bound to the dev ports.
for PORT in 8888 3999 8080; do
  LEFTOVER=$(lsof -tnP -iTCP:"$PORT" -sTCP:LISTEN 2>/dev/null)
  if [ -n "$LEFTOVER" ]; then
    kill $LEFTOVER 2>/dev/null
    echo "Cleaned up leftover process on port $PORT (PID $LEFTOVER)."
  fi
done
