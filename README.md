# Sport – webapp

Persoonlijke coach op je iPhone of iPad: trainingsschema van 13 weken voor thuis (elastiek, bokszak, bank)
met uitvoermodus, timers, uitleg per oefening en progressie, plus een eetschema met dagdoel, weekmenu,
meal prep, recepten en boodschappenlijst. Gewone HTML/CSS/JavaScript, zonder build-stap en zonder server: alle gegevens
blijven op het toestel (localStorage). Back-up via Profiel → Exporteren.

## Installeren op iPhone/iPad
1. Open de GitHub Pages-link in **Safari**.
2. Deel-icoon → **Zet op beginscherm** → Voeg toe.
3. Daarna werkt de app ook offline.

## Ontwikkelen (Windows)
- Op de pc: `start-web.bat` in de hoofdmap van het project (opent de app in een Edge-venster, F5 = vernieuwen)
- Of handmatig: `jwebserver -p 8123 -d <deze map>` (zit in de JDK) → http://localhost:8123
- Tests: `bash run-tests.sh` (headless Chrome); volledige training doorklikken: `BUDGET=60000 bash run-tests.sh flow`, rustsessie: `BUDGET=150000 bash run-tests.sh calm`
- Oefeningen komen uit de desktopversie: na een wijziging in `src/main/resources/data/exercises.json` → `bash sync-data.sh`
- Schermafbeeldingen op iPhone-breedte: `bash shots.sh <map> vandaag week "recept/kip-teriyaki?f=0.95"`
  (`DEMO=eaten` = dag met afgevinkte maaltijden)
- Na een wijziging: `VERSION` in `sw.js` ophogen, anders blijft de telefoon de oude versie gebruiken.

## Structuur
- `js/data/foods.js` – voedingsmiddelen (per 100 g) + winkelafdeling
- `js/data/recipes.js` – recepten (1 portie), kantoorlunch-opties
- `js/nutrition/calc.js` – BMR, onderhoud, dagdoelen
- `js/nutrition/planner.js` – weekmenu, schalen, wisselen, dagtotalen, boodschappenlijst (pure logica)
- `js/nutrition/food-store.js` – koppeling planner ↔ opslag
- `js/data/exercises.js`, `videos.js` – 84 oefeningen (gegenereerd, niet met de hand aanpassen)
- `js/training/catalog.js` – oefeningen, ketens, materiaalregels
- `js/training/library.js` – schema (13 weken), sjablonen, omzetten, progressie, andere sporten (pure logica)
- `js/training/training-store.js` – koppeling schema ↔ opslag
- `js/calm/calm.js` – rust: adem- en begeleide oefeningen, tijdlijn, statistiek (pure logica); `sound.js` – toon + muziek (Web Audio)
- `js/views/*` – schermen; `js/app.js` – router en tabbalk
