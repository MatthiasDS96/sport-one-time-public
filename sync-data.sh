#!/usr/bin/env bash
# Kopieert de oefeningen van de desktopversie naar de webapp (één bron: src/main/resources/data).
cd "$(dirname "$0")/.."  # verwacht de webapp als map web/ in het sport-project
{ echo "// Gegenereerd uit src/main/resources/data/exercises.json (zelfde bron als de desktopversie)."; echo "// Opnieuw maken: bash web/sync-data.sh"; printf "export default "; cat src/main/resources/data/exercises.json; echo ";"; } > web/js/data/exercises.js
{ echo "// Gegenereerd uit src/main/resources/data/exercise-videos.json: code → YouTube-zoekterm."; printf "export default "; cat src/main/resources/data/exercise-videos.json; echo ";"; } > web/js/data/videos.js
echo "Oefeningen gesynchroniseerd."
