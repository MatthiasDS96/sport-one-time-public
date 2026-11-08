# Sport – webapp

Persoonlijk eetschema op je iPhone of iPad: dagdoel (kcal en eiwit), weekmenu met meal prep, recepten
en een boodschappenlijst. Gewone HTML/CSS/JavaScript, zonder build-stap en zonder server: alle gegevens
blijven op het toestel (localStorage). Back-up via Profiel → Exporteren.

## Installeren op iPhone/iPad
1. Open de GitHub Pages-link in **Safari**.
2. Deel-icoon → **Zet op beginscherm** → Voeg toe.
3. Daarna werkt de app ook offline.

## Ontwikkelen (Windows)
- Lokaal bekijken: `jwebserver -p 8123 -d <deze map>` (zit in de JDK) → http://localhost:8123
- Tests: `bash run-tests.sh` (headless Chrome)
- Schermafbeeldingen op iPhone-breedte: `bash shots.sh <map> vandaag week "recept/kip-teriyaki?f=0.95"`
  (`DEMO=eaten` = dag met afgevinkte maaltijden)
- Na een wijziging: `VERSION` in `sw.js` ophogen, anders blijft de telefoon de oude versie gebruiken.

## Structuur
- `js/data/foods.js` – voedingsmiddelen (per 100 g) + winkelafdeling
- `js/data/recipes.js` – recepten (1 portie), kantoorlunch-opties
- `js/nutrition/calc.js` – BMR, onderhoud, dagdoelen
- `js/nutrition/planner.js` – weekmenu, schalen, wisselen, dagtotalen, boodschappenlijst (pure logica)
- `js/nutrition/food-store.js` – koppeling planner ↔ opslag
- `js/views/*` – schermen; `js/app.js` – router en tabbalk
