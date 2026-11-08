#!/usr/bin/env bash
# Schermafbeeldingen op iPhone-formaat: bash shots.sh <uitvoermap> "vandaag" "week" "recept/kip-teriyaki?f=0.95" ...
# Gebruikt ?demo=1 (voorbeeldprofiel, niets bewaard). Zet DEMO=eaten voor een dag met afgevinkte maaltijden.
cd /c/Users/matth/Documents/coding/projects/sport/web
OUT=$1; shift
mkdir -p "$OUT"
PORT=${PORT:-8124}
H=${H:-1500}
JW="/c/Program Files/Java/jdk-21.0.12/bin/jwebserver.exe"
BROWSER="/c/Program Files/Google/Chrome/Application/chrome.exe"
"$JW" -p "$PORT" -d "$(cygpath -w "$PWD")" >/dev/null 2>&1 &
SRV=$!
sleep 1.5
for route in "$@"; do
  name=$(echo "$route" | tr '/?=&.' '_____')
  "$BROWSER" --headless=new --disable-gpu --hide-scrollbars --window-size=600,$H --virtual-time-budget=3000 \
    --screenshot="$(cygpath -m "$OUT")/$name.png" "http://localhost:$PORT/tests/phone.html?demo=${DEMO:-1}#/$route" >/dev/null 2>&1
  echo "$OUT/$name.png"
done
kill $SRV
