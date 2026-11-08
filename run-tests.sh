#!/usr/bin/env bash
# Start een lokale server (jwebserver uit de JDK) en draait de tests in headless Chrome/Edge.
cd "$(dirname "$0")"
PORT=${PORT:-8123}
JW="/c/Program Files/Java/jdk-21.0.12/bin/jwebserver.exe"
BROWSER="/c/Program Files/Google/Chrome/Application/chrome.exe"
[ -x "$BROWSER" ] || BROWSER="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
"$JW" -p "$PORT" -d "$(cygpath -w "$PWD")" >/dev/null 2>&1 &
SRV=$!
sleep 1.5
"$BROWSER" --headless=new --disable-gpu --virtual-time-budget=5000 --dump-dom "http://localhost:$PORT/tests/tests.html" 2>/dev/null \
  | sed -n '/<pre id="out">/,/<\/pre>/p' | sed 's/<[^>]*>//g'
kill $SRV
