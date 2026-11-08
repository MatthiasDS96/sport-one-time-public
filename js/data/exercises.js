// Gegenereerd uit src/main/resources/data/exercises.json (zelfde bron als de desktopversie).
// Opnieuw maken: bash web/sync-data.sh
export default {
  "version": 2,
  "startLevels": {
    "BEGINNER": {
      "PUSH_H": "INCLINE_PUSHUP_BENCH",
      "PUSH_V": "PIKE_PUSHUP_KNEES",
      "PULL_H": "BAND_ROW_SEATED",
      "PULL_V": "BAND_PULLDOWN_KNEELING",
      "SQUAT": "SQUAT",
      "HINGE": "GLUTE_BRIDGE",
      "TRICEPS": "BENCH_DIP_BENT",
      "CORE": "PLANK",
      "CALF": "CALF_RAISE"
    },
    "INTERMEDIATE": {
      "PUSH_H": "PUSHUP",
      "PUSH_V": "PIKE_PUSHUP",
      "PULL_H": "BAND_ROW_PAUSE",
      "PULL_V": "BAND_PULLDOWN_SINGLE",
      "SQUAT": "SPLIT_SQUAT",
      "HINGE": "SINGLE_LEG_GLUTE_BRIDGE",
      "TRICEPS": "BENCH_DIP_STRAIGHT",
      "CORE": "HOLLOW_TUCK",
      "CALF": "CALF_RAISE_STEP"
    }
  },
  "exercises": [
    {
      "code": "WALL_PUSHUP", "name": "Muur-opdrukken", "chain": "PUSH_H", "level": 1, "min": 10, "max": 15,
      "muscles": "Borst, schouders, triceps",
      "description": "Sta een grote stap van de muur, handen op schouderhoogte en iets breder dan je schouders. Buig je ellebogen tot je neus bijna de muur raakt en duw terug.",
      "tips": ["Hou je lichaam recht als een plank, van hoofd tot hielen.", "Ellebogen op ±45° van je romp, niet wijd open."],
      "mistakes": ["Heupen naar achteren duwen in plaats van het lichaam recht te houden."]
    },
    {
      "code": "INCLINE_PUSHUP_HIGH", "name": "Schuin opdrukken (hoog)", "chain": "PUSH_H", "level": 2, "min": 8, "max": 12,
      "muscles": "Borst, schouders, triceps",
      "description": "Handen op een aanrecht of vensterbank. Laat je borst zakken tot tegen de rand en duw krachtig terug.",
      "tips": ["Hoe lager het steunpunt, hoe zwaarder.", "Span je billen en buik aan."],
      "mistakes": ["Doorhangen in de onderrug.", "Maar half zakken."]
    },
    {
      "code": "INCLINE_PUSHUP_BENCH", "name": "Schuin opdrukken op de bank", "chain": "PUSH_H", "level": 3, "min": 8, "max": 12,
      "equipment": ["BENCH"],
      "muscles": "Borst, schouders, triceps",
      "description": "Handen op de rand van de bank, lichaam gestrekt. Zak tot je borst de bank bijna raakt, duw terug tot gestrekte armen.",
      "tips": ["Kijk een halve meter voor je handen, niet omhoog.", "Adem in bij het zakken, uit bij het duwen."],
      "mistakes": ["Ellebogen 90° naar buiten.", "Hoofd eerst naar beneden laten vallen."]
    },
    {
      "code": "KNEE_PUSHUP", "name": "Knie-opdrukken", "chain": "PUSH_H", "level": 4, "min": 8, "max": 12,
      "muscles": "Borst, schouders, triceps",
      "description": "Opdrukken op je knieën met een rechte lijn van knieën tot hoofd. Borst tot vlak boven de grond.",
      "tips": ["Leg een handdoek onder je knieën.", "Volledige bewegingsuitslag is belangrijker dan aantal."],
      "mistakes": ["Heupen omhoog (ingeknikt) in plaats van een rechte lijn."]
    },
    {
      "code": "PUSHUP", "name": "Opdrukken", "chain": "PUSH_H", "level": 5, "min": 8, "max": 12,
      "muscles": "Borst, schouders, triceps, core",
      "description": "Klassieke push-up: handen iets breder dan je schouders, lichaam gestrekt op tenen. Borst tot een vuist boven de grond, terug tot gestrekte armen.",
      "tips": ["Draai je ellebogen licht naar je voeten (pijl-vorm, geen T).", "Duw de grond weg aan het einde zodat je schouderbladen spreiden."],
      "mistakes": ["Doorzakkende heupen.", "Halve herhalingen."]
    },
    {
      "code": "DIAMOND_PUSHUP", "name": "Diamant-opdrukken", "chain": "PUSH_H", "level": 6, "min": 6, "max": 12,
      "muscles": "Triceps, borst, schouders",
      "description": "Handen dicht bij elkaar onder je borst, duimen en wijsvingers vormen een ruit. Zak tot je borst je handen raakt.",
      "tips": ["Ellebogen dicht langs je lichaam.", "Lukt het niet: handen iets verder uit elkaar (close-grip)."],
      "mistakes": ["Ellebogen wijd naar buiten (pijn aan polsen/schouders)."]
    },
    {
      "code": "DECLINE_PUSHUP", "name": "Opdrukken met voeten op de bank", "chain": "PUSH_H", "level": 7, "min": 6, "max": 12,
      "equipment": ["BENCH"],
      "muscles": "Bovenborst, schouders, triceps",
      "description": "Voeten op de bank, handen op de grond. Meer gewicht op je armen dan bij gewone push-ups.",
      "tips": ["Hou je buik extra aangespannen.", "Begin met de bank laag of de voeten op een traptrede."],
      "mistakes": ["Holle rug."]
    },
    {
      "code": "ARCHER_PUSHUP", "name": "Archer push-up", "chain": "PUSH_H", "level": 8, "min": 5, "max": 8, "perSide": true,
      "muscles": "Borst, schouders, triceps (één arm per keer)",
      "description": "Handen heel breed. Zak naar één hand terwijl de andere arm bijna gestrekt blijft. Afwisselend links en rechts.",
      "tips": ["Opstap naar opdrukken met één arm.", "Gestrekte arm duwt licht mee."],
      "mistakes": ["Romp draait weg."]
    },
    {
      "code": "PSEUDO_PLANCHE_PUSHUP", "name": "Pseudo-planche push-up", "chain": "PUSH_H", "level": 9, "min": 5, "max": 8,
      "muscles": "Voorste schouders, borst, core",
      "description": "Handen ter hoogte van je heupen, vingers naar buiten of achter gedraaid, schouders ver voor je handen. Opdrukken in die voorovergeleunde houding.",
      "tips": ["Hoe verder je voorover leunt, hoe zwaarder.", "Bouw de polsen langzaam op."],
      "mistakes": ["Ellebogen naar buiten laten wijken."]
    },

    {
      "code": "PIKE_PUSHUP_KNEES", "name": "Pike push-up op de knieën", "chain": "PUSH_V", "level": 1, "min": 6, "max": 10,
      "muscles": "Schouders, triceps",
      "description": "Op handen en knieën, heupen hoog zodat je bovenlichaam schuin naar beneden wijst. Buig je armen en breng je kruin naar de grond voor je handen.",
      "tips": ["Hoofd gaat naar voren, ellebogen naar achteren (driehoek).", "Rustig zakken, krachtig duwen."],
      "mistakes": ["Opdrukken naar je borst in plaats van naar je kruin."]
    },
    {
      "code": "PIKE_PUSHUP", "name": "Pike push-up", "chain": "PUSH_V", "level": 2, "min": 6, "max": 10,
      "muscles": "Schouders, triceps, bovenrug",
      "description": "Omgekeerde V: handen en voeten op de grond, heupen hoog, benen zo gestrekt mogelijk. Zak met je kruin tot vlak voor je handen en duw terug.",
      "tips": ["Wandel je voeten dichter naar je handen voor meer gewicht op je schouders."],
      "mistakes": ["Rug bol en heupen te laag."]
    },
    {
      "code": "ELEVATED_PIKE_PUSHUP", "name": "Pike push-up met voeten op de bank", "chain": "PUSH_V", "level": 3, "min": 5, "max": 8,
      "equipment": ["BENCH"],
      "muscles": "Schouders, triceps",
      "description": "Voeten op de bank, heupen boven je schouders, bovenlichaam zo verticaal mogelijk. Zak met je hoofd tot net voor je handen.",
      "tips": ["Leg een kussen waar je hoofd komt.", "Hoe verticaler je romp, hoe dichter bij een handstand push-up."],
      "mistakes": ["Te ver van de bank staan waardoor het een gewone push-up wordt."]
    },
    {
      "code": "WALL_WALK", "name": "Wall walk", "chain": "PUSH_V", "level": 4, "min": 3, "max": 5,
      "muscles": "Schouders, triceps, core",
      "description": "Begin in push-uppositie met je voeten tegen de muur. Loop met je voeten de muur op en je handen richting muur tot je bijna in handstand staat, en terug.",
      "tips": ["Ga maar zo ver als je controle hebt.", "Zorg voor vrije ruimte rondom."],
      "mistakes": ["Holle rug in de bovenste positie."]
    },
    {
      "code": "WALL_HANDSTAND_HOLD", "name": "Handstand tegen de muur", "chain": "PUSH_V", "level": 5, "measure": "TIME", "min": 15, "max": 45,
      "muscles": "Schouders, triceps, core",
      "description": "Handstand met je buik naar de muur (via een wall walk). Duw de grond weg, lichaam lang en gestrekt.",
      "tips": ["Schouders tot aan je oren duwen.", "Kom er altijd gecontroleerd uit (terugwandelen)."],
      "mistakes": ["Bananenrug."]
    },

    {
      "code": "BAND_ROW_SEATED", "name": "Elastiek-roeien zittend", "chain": "PULL_H", "level": 1, "min": 10, "max": 15, "band": true,
      "equipment": ["BAND", "DOOR_ANCHOR"],
      "muscles": "Rug, achterste schouders, biceps",
      "description": "Elastiek op borsthoogte (zittend: laag) in de deur. Zit rechtop met lichte buiging in de knieën en trek de handgrepen naar je navel.",
      "tips": ["Begin elke herhaling met je schouderbladen samen te knijpen.", "Trage terugweg (2–3 s)."],
      "mistakes": ["Achteroverleunen om te helpen.", "Schouders optrekken naar je oren."]
    },
    {
      "code": "BAND_ROW_STANDING", "name": "Elastiek-roeien staand", "chain": "PULL_H", "level": 2, "min": 10, "max": 15, "band": true,
      "equipment": ["BAND", "DOOR_ANCHOR"],
      "muscles": "Rug, achterste schouders, biceps",
      "description": "Elastiek op borsthoogte in de deur. Sta in een lichte spreidstand, trek de grepen naar je onderste ribben.",
      "tips": ["Een stap verder van de deur = meer spanning.", "Ellebogen dicht langs je lichaam."],
      "mistakes": ["Met je onderrug meetrekken."]
    },
    {
      "code": "TABLE_ROW_BENT", "name": "Tafel-roeien (knieën gebogen)", "chain": "PULL_H", "level": 3, "min": 6, "max": 12,
      "equipment": ["TABLE"],
      "muscles": "Rug, biceps",
      "description": "Lig onder een zeer stevige tafel, pak de rand vast en trek je borst naar de tafel met je knieën gebogen.",
      "tips": ["Test eerst of de tafel je gewicht draagt."],
      "mistakes": ["Heupen laten zakken."]
    },
    {
      "code": "BAND_ROW_PAUSE", "name": "Elastiek-roeien met pauze", "chain": "PULL_H", "level": 4, "min": 10, "max": 15, "band": true,
      "equipment": ["BAND", "DOOR_ANCHOR"],
      "muscles": "Rug, achterste schouders, biceps",
      "description": "Zoals staand roeien, maar hou de grepen 2 seconden tegen je lichaam met je schouderbladen samengeknepen.",
      "tips": ["De pauze maakt het elastiek veel zwaarder zonder zwaarder elastiek."],
      "mistakes": ["De pauze inkorten."]
    },
    {
      "code": "TABLE_ROW", "name": "Tafel-roeien (benen gestrekt)", "chain": "PULL_H", "level": 5, "min": 6, "max": 12,
      "equipment": ["TABLE"],
      "muscles": "Rug, biceps",
      "description": "Onder een stevige tafel met gestrekte benen: lichaam recht als een plank, trek je borst naar de rand.",
      "tips": ["Hielen op de grond, billen aangespannen."],
      "mistakes": ["Kin vooruit steken."]
    },
    {
      "code": "BAND_ROW_SINGLE", "name": "Elastiek-roeien met één arm", "chain": "PULL_H", "level": 6, "min": 10, "max": 15, "perSide": true, "band": true,
      "equipment": ["BAND", "DOOR_ANCHOR"],
      "muscles": "Rug, achterste schouders, biceps, core",
      "description": "Beide uiteinden of één greep in één hand, staand in spreidstand. Trek naar je heup zonder je romp te draaien.",
      "tips": ["Vrije hand op je heup om rotatie te voelen."],
      "mistakes": ["Romp draaien om mee te trekken."]
    },
    {
      "code": "TABLE_ROW_ELEVATED", "name": "Tafel-roeien met voeten verhoogd", "chain": "PULL_H", "level": 7, "min": 6, "max": 10,
      "equipment": ["TABLE", "BENCH"],
      "muscles": "Rug, biceps",
      "description": "Tafel-roeien met je voeten op de bank: je lichaam ligt horizontaal, dus je trekt meer van je gewicht.",
      "tips": ["Enkel met een tafel die gegarandeerd niet kantelt."],
      "mistakes": ["Halve herhalingen."]
    },
    {
      "code": "BAND_ROW_SINGLE_SLOW", "name": "Eenarmig roeien, pauze + trage terugweg", "chain": "PULL_H", "level": 8, "min": 8, "max": 12, "perSide": true, "band": true,
      "equipment": ["BAND", "DOOR_ANCHOR"],
      "muscles": "Rug, achterste schouders, biceps",
      "description": "Eenarmig elastiek-roeien met 2 s pauze tegen je lichaam en 4 s terugweg.",
      "tips": ["Tel hardop: trek – 1-2 – 1-2-3-4."],
      "mistakes": ["Te veel spanning waardoor de terugweg toch snel gaat."]
    },

    {
      "code": "BAND_PULLDOWN_KNEELING", "name": "Elastiek lat pulldown (knielend)", "chain": "PULL_V", "level": 1, "min": 10, "max": 15, "band": true,
      "equipment": ["BAND", "DOOR_ANCHOR"],
      "muscles": "Brede rugspier, biceps",
      "description": "Anker bovenaan de deur. Kniel een stap van de deur, armen schuin omhoog. Trek de grepen naar je bovenborst, ellebogen naar je zij.",
      "tips": ["Denk: ellebogen in je achterzakken steken.", "Borst trots vooruit."],
      "mistakes": ["Met je armen trekken in plaats van met je rug.", "Achterover vallen."]
    },
    {
      "code": "BAND_PULLDOWN_SINGLE", "name": "Eenarmige lat pulldown", "chain": "PULL_V", "level": 2, "min": 10, "max": 15, "perSide": true, "band": true,
      "equipment": ["BAND", "DOOR_ANCHOR"],
      "muscles": "Brede rugspier, biceps",
      "description": "Knielend of staand, één arm: trek de greep van boven je hoofd naar je schouder.",
      "tips": ["Laat je arm bovenaan echt lang worden voor een volle rek."],
      "mistakes": ["Zijwaarts wegbuigen."]
    },
    {
      "code": "BAND_PULLDOWN_HOLD", "name": "Lat pulldown met 3 s hold", "chain": "PULL_V", "level": 3, "min": 8, "max": 12, "band": true,
      "equipment": ["BAND", "DOOR_ANCHOR"],
      "muscles": "Brede rugspier, biceps",
      "description": "Lat pulldown met beide armen; hou de onderste positie 3 seconden vast.",
      "tips": ["Gebruik een zwaarder elastiek of ga verder van de deur als het te makkelijk wordt."],
      "mistakes": ["Hold inkorten."]
    },
    {
      "code": "DEAD_HANG", "name": "Hangen aan de rekstok", "chain": "PULL_V", "level": 4, "measure": "TIME", "min": 20, "max": 40,
      "equipment": ["PULLUP_BAR"],
      "muscles": "Grip, rug, schouders",
      "description": "Hang met gestrekte armen aan de rekstok, schouders licht actief.",
      "tips": ["Enkel aan een rekstok die stevig vast zit."],
      "mistakes": ["Volledig passief in de schouders hangen."]
    },
    {
      "code": "NEGATIVE_PULLUP", "name": "Negatieve optrekking", "chain": "PULL_V", "level": 5, "min": 3, "max": 5,
      "equipment": ["PULLUP_BAR"],
      "muscles": "Rug, biceps",
      "description": "Spring of stap naar de bovenste positie (kin boven de stok) en laat je in 3–5 s zakken.",
      "tips": ["Hoe trager, hoe beter."],
      "mistakes": ["Laatste stuk laten vallen."]
    },
    {
      "code": "PULLUP", "name": "Optrekken", "chain": "PULL_V", "level": 6, "min": 3, "max": 8,
      "equipment": ["PULLUP_BAR"],
      "muscles": "Rug, biceps",
      "description": "Vanuit hangen jezelf optrekken tot je kin boven de stok is.",
      "tips": ["Volledige rek onderaan."],
      "mistakes": ["Zwaaien met de benen."]
    },

    {
      "code": "BOX_SQUAT", "name": "Box squat op de bank", "chain": "SQUAT", "level": 1, "min": 10, "max": 15,
      "equipment": ["BENCH"],
      "muscles": "Dijen, billen",
      "description": "Sta voor de bank, voeten op heupbreedte. Zak met je billen naar achter tot je de bank licht raakt en sta op zonder te ploffen.",
      "tips": ["Armen naar voren voor evenwicht.", "Gewicht op je hielen en middenvoet."],
      "mistakes": ["Knieën naar binnen laten vallen."]
    },
    {
      "code": "SQUAT", "name": "Squat", "chain": "SQUAT", "level": 2, "min": 10, "max": 15,
      "muscles": "Dijen, billen, core",
      "description": "Voeten iets breder dan heupbreedte, tenen licht naar buiten. Zak tot je dijen minstens horizontaal zijn, borst omhoog, en duw je weer op.",
      "tips": ["Knieën in de richting van je tenen duwen.", "Hielen blijven aan de grond."],
      "mistakes": ["Rug bol maken.", "Op je tenen komen."]
    },
    {
      "code": "PAUSE_SQUAT", "name": "Squat met pauze", "chain": "SQUAT", "level": 3, "min": 10, "max": 15,
      "muscles": "Dijen, billen",
      "description": "Squat met 3 seconden stilstand in de onderste positie.",
      "tips": ["Blijf onderaan gespannen, niet 'hangen' in je knieën."],
      "mistakes": ["Pauze te kort."]
    },
    {
      "code": "SPLIT_SQUAT", "name": "Split squat", "chain": "SQUAT", "level": 4, "min": 8, "max": 12, "perSide": true,
      "muscles": "Dijen, billen",
      "description": "Grote stap: één voet voor, één achter. Zak recht naar beneden tot je achterste knie bijna de grond raakt.",
      "tips": ["Voorste knie boven de middenvoet.", "Romp rechtop."],
      "mistakes": ["Te kleine stap waardoor de knie ver voorbij de tenen gaat."]
    },
    {
      "code": "BULGARIAN_SPLIT_SQUAT", "name": "Bulgarian split squat", "chain": "SQUAT", "level": 5, "min": 8, "max": 12, "perSide": true,
      "equipment": ["BENCH"],
      "muscles": "Dijen, billen",
      "description": "Achterste voet met de wreef op de bank. Zak met je voorste been tot je dij horizontaal is.",
      "tips": ["Zoek eerst de juiste afstand tot de bank.", "Licht voorover leunen = meer billen."],
      "mistakes": ["Afduwen met het achterste been."]
    },
    {
      "code": "ASSISTED_SHRIMP_SQUAT", "name": "Shrimp squat met steun", "chain": "SQUAT", "level": 6, "min": 5, "max": 8, "perSide": true,
      "muscles": "Dijen, billen, evenwicht",
      "description": "Op één been, pak je andere voet achter je vast. Zak tot je knie de grond (kussen) raakt, met een hand tegen de muur voor steun.",
      "tips": ["Leg een kussen onder je knie."],
      "mistakes": ["Vallen in plaats van gecontroleerd zakken."]
    },
    {
      "code": "SHRIMP_SQUAT", "name": "Shrimp squat", "chain": "SQUAT", "level": 7, "min": 5, "max": 8, "perSide": true,
      "muscles": "Dijen, billen",
      "description": "Shrimp squat zonder steun.",
      "tips": ["Armen naar voren als tegengewicht."],
      "mistakes": ["Hiel van het steunbeen komt los."]
    },
    {
      "code": "ASSISTED_PISTOL", "name": "Pistol squat met steun", "chain": "SQUAT", "level": 8, "min": 5, "max": 8, "perSide": true,
      "muscles": "Dijen, billen, evenwicht",
      "description": "Op één been, ander been gestrekt voor je. Zak zo diep mogelijk terwijl je een deurkruk, tafelrand of muur vasthoudt voor evenwicht (niet aan hangen).",
      "tips": ["Begin met zakken tot op de bank (pistol box squat)."],
      "mistakes": ["Knie naar binnen."]
    },
    {
      "code": "PISTOL_SQUAT", "name": "Pistol squat", "chain": "SQUAT", "level": 9, "min": 3, "max": 6, "perSide": true,
      "muscles": "Dijen, billen, evenwicht",
      "description": "Volledige squat op één been zonder steun.",
      "tips": ["Hielen op een klein boek helpt bij stijve enkels."],
      "mistakes": ["Rug volledig bol."]
    },

    {
      "code": "GLUTE_BRIDGE", "name": "Glute bridge", "chain": "HINGE", "level": 1, "min": 12, "max": 15,
      "muscles": "Billen, hamstrings",
      "description": "Lig op je rug, knieën gebogen, voeten plat. Duw je heupen omhoog tot een rechte lijn van knieën tot schouders, knijp 1 s je billen samen.",
      "tips": ["Duw door je hielen.", "Kin licht naar je borst."],
      "mistakes": ["Holle rug in plaats van billen aanspannen."]
    },
    {
      "code": "SINGLE_LEG_GLUTE_BRIDGE", "name": "Glute bridge op één been", "chain": "HINGE", "level": 2, "min": 10, "max": 15, "perSide": true,
      "muscles": "Billen, hamstrings",
      "description": "Glute bridge met één been gestrekt in de lucht.",
      "tips": ["Hou je bekken horizontaal."],
      "mistakes": ["Heup aan de vrije kant zakt."]
    },
    {
      "code": "HIP_THRUST", "name": "Hip thrust op de bank", "chain": "HINGE", "level": 3, "min": 12, "max": 15,
      "equipment": ["BENCH"],
      "muscles": "Billen, hamstrings",
      "description": "Schouderbladen tegen de rand van de bank, voeten plat. Duw je heupen omhoog tot je romp horizontaal is.",
      "tips": ["Onderaan: billen bijna aan de grond.", "Bovenaan 1–2 s vasthouden."],
      "mistakes": ["Hyperextensie van de onderrug."]
    },
    {
      "code": "SINGLE_LEG_HIP_THRUST", "name": "Hip thrust op één been", "chain": "HINGE", "level": 4, "min": 8, "max": 12, "perSide": true,
      "equipment": ["BENCH"],
      "muscles": "Billen, hamstrings",
      "description": "Hip thrust met één been in de lucht.",
      "tips": ["Langzaam zakken (2 s)."],
      "mistakes": ["Bekken kantelt."]
    },
    {
      "code": "NORDIC_NEGATIVE", "name": "Nordic curl negatief", "chain": "HINGE", "level": 5, "min": 3, "max": 5,
      "muscles": "Hamstrings",
      "description": "Kniel met je hielen vastgezet (onder een zware zetel, of iemand houdt ze vast). Laat je romp zo traag mogelijk naar voren vallen, vang jezelf op met je handen.",
      "tips": ["Kussen onder je knieën.", "Heupen gestrekt houden."],
      "mistakes": ["Door de heupen knikken."]
    },
    {
      "code": "NORDIC_CURL", "name": "Nordic curl", "chain": "HINGE", "level": 6, "min": 3, "max": 6,
      "muscles": "Hamstrings",
      "description": "Nordic curl met ook de weg terug omhoog op eigen kracht.",
      "tips": ["Duw licht af met je handen als hulp."],
      "mistakes": ["Heupen buigen."]
    },

    {
      "code": "BENCH_DIP_BENT", "name": "Bench dips (knieën gebogen)", "chain": "TRICEPS", "level": 1, "min": 8, "max": 12,
      "equipment": ["BENCH"],
      "muscles": "Triceps, borst, voorste schouders",
      "description": "Handen op de rand van de bank naast je heupen, voeten plat op de grond. Zak tot je ellebogen 90° gebogen zijn en duw terug.",
      "tips": ["Billen dicht bij de bank.", "Schouders laag, weg van je oren."],
      "mistakes": ["Te diep zakken (schouderpijn)."]
    },
    {
      "code": "BENCH_DIP_STRAIGHT", "name": "Bench dips (benen gestrekt)", "chain": "TRICEPS", "level": 2, "min": 8, "max": 12,
      "equipment": ["BENCH"],
      "muscles": "Triceps, borst, voorste schouders",
      "description": "Bench dips met gestrekte benen, hielen op de grond.",
      "tips": ["Ellebogen wijzen naar achteren."],
      "mistakes": ["Ellebogen naar buiten."]
    },
    {
      "code": "BENCH_DIP_ELEVATED", "name": "Bench dips met voeten verhoogd", "chain": "TRICEPS", "level": 3, "min": 8, "max": 12,
      "equipment": ["BENCH"],
      "muscles": "Triceps, borst",
      "description": "Bench dips met je voeten op een verhoging (traptrede, kist of tweede zitmeubel).",
      "tips": ["Hoe hoger je voeten, hoe zwaarder."],
      "mistakes": ["Schouders naar voren laten rollen."]
    },
    {
      "code": "CHAIR_DIP", "name": "Dips tussen twee stoelen", "chain": "TRICEPS", "level": 4, "min": 6, "max": 10,
      "equipment": ["CHAIR"],
      "muscles": "Triceps, borst",
      "description": "Twee stevige stoelen met de ruggen naar elkaar. Steun op de leuningen, benen gebogen achter je, en zak tot je ellebogen 90° zijn.",
      "tips": ["Test eerst of de stoelen niet kantelen."],
      "mistakes": ["Te diep zakken."]
    },

    {
      "code": "DEAD_BUG", "name": "Dead bug", "chain": "CORE", "level": 1, "min": 8, "max": 12, "perSide": true,
      "muscles": "Diepe buikspieren",
      "description": "Lig op je rug, armen naar het plafond, knieën 90° boven je heupen. Strek langzaam je tegenovergestelde arm en been uit zonder dat je onderrug loskomt.",
      "tips": ["Duw je onderrug actief in de grond.", "Uitademen bij het strekken."],
      "mistakes": ["Holle rug.", "Te snel."]
    },
    {
      "code": "PLANK", "name": "Plank", "chain": "CORE", "level": 2, "measure": "TIME", "min": 20, "max": 45,
      "muscles": "Buikspieren, schouders",
      "description": "Steun op je onderarmen en tenen, lichaam recht als een plank. Span je buik en billen aan.",
      "tips": ["Ellebogen onder je schouders.", "Kort en goed is beter dan lang en doorgezakt."],
      "mistakes": ["Heupen te hoog of te laag."]
    },
    {
      "code": "HOLLOW_TUCK", "name": "Hollow body (knieën gebogen)", "chain": "CORE", "level": 3, "measure": "TIME", "min": 15, "max": 30,
      "muscles": "Buikspieren",
      "description": "Lig op je rug, onderrug in de grond, schouders en voeten los van de grond met gebogen knieën. Armen langs je zij of naar je voeten.",
      "tips": ["Navel naar je ruggengraat."],
      "mistakes": ["Onderrug komt los."]
    },
    {
      "code": "HOLLOW_HOLD", "name": "Hollow body hold", "chain": "CORE", "level": 4, "measure": "TIME", "min": 20, "max": 40,
      "muscles": "Buikspieren",
      "description": "Zoals de tuck-versie maar met gestrekte benen en armen boven je hoofd: een licht gebogen 'banaan'.",
      "tips": ["Benen hoger = makkelijker."],
      "mistakes": ["Onderrug loskomen."]
    },
    {
      "code": "LYING_LEG_RAISE", "name": "Liggend benen heffen", "chain": "CORE", "level": 5, "min": 8, "max": 15,
      "muscles": "Onderste buikspieren, heupbuigers",
      "description": "Lig op je rug, handen naast je. Hef je gestrekte benen tot verticaal en laat ze langzaam zakken tot net boven de grond.",
      "tips": ["Onderrug blijft plat."],
      "mistakes": ["Benen laten vallen."]
    },
    {
      "code": "HOLLOW_ROCK", "name": "Hollow rocks", "chain": "CORE", "level": 6, "min": 10, "max": 20,
      "muscles": "Buikspieren",
      "description": "Vanuit de hollow body hold heen en weer schommelen zonder de vorm te verliezen.",
      "tips": ["De vorm blijft identiek, enkel schommelen."],
      "mistakes": ["Knakken in de heupen."]
    },
    {
      "code": "SEATED_LEG_LIFT", "name": "Zittend benen heffen (L-sit opbouw)", "chain": "CORE", "level": 7, "min": 10, "max": 15,
      "muscles": "Heupbuigers, buikspieren, triceps",
      "description": "Zit met gestrekte benen, handen naast je heupen. Hef je benen een paar cm van de grond, hou 1 s en laat zakken.",
      "tips": ["Leun licht naar achter, duw je schouders laag."],
      "mistakes": ["Knieën buigen."]
    },

    {
      "code": "CALF_RAISE", "name": "Kuitheffen", "chain": "CALF", "level": 1, "min": 15, "max": 20,
      "muscles": "Kuiten",
      "description": "Sta rechtop, kom op je tenen zo hoog mogelijk, 1 s vasthouden, langzaam zakken.",
      "tips": ["Lichte steun aan de muur voor evenwicht."],
      "mistakes": ["Veren zonder pauze."]
    },
    {
      "code": "CALF_RAISE_STEP", "name": "Kuitheffen op een traptrede", "chain": "CALF", "level": 2, "min": 12, "max": 20,
      "muscles": "Kuiten",
      "description": "Voorvoeten op een trede, hielen zakken onder de trede voor volle rek, dan zo hoog mogelijk.",
      "tips": ["Hou de leuning vast."],
      "mistakes": ["Halve beweging."]
    },
    {
      "code": "SINGLE_CALF_RAISE", "name": "Kuitheffen op één been", "chain": "CALF", "level": 3, "min": 10, "max": 15, "perSide": true,
      "muscles": "Kuiten",
      "description": "Kuitheffen op een trede op één been.",
      "tips": ["Traag zakken (3 s)."],
      "mistakes": ["Knie buigen om te helpen."]
    },

    {
      "code": "BAND_PULL_APART", "name": "Band pull-apart", "category": "ACCESSORY", "min": 15, "max": 20, "band": true,
      "equipment": ["BAND"],
      "muscles": "Achterste schouders, bovenrug",
      "description": "Hou het elastiek met gestrekte armen voor je op schouderhoogte. Trek het uit elkaar tot het je borst raakt.",
      "tips": ["Ideaal als opwarming en houdingsoefening."],
      "mistakes": ["Schouders optrekken."]
    },
    {
      "code": "BAND_FACE_PULL", "name": "Elastiek face pull", "category": "ACCESSORY", "min": 12, "max": 15, "band": true,
      "equipment": ["BAND", "DOOR_ANCHOR"],
      "muscles": "Achterste schouders, rotatorenmanchet, bovenrug",
      "description": "Anker op ooghoogte. Trek het elastiek naar je gezicht met je ellebogen hoog en draai je handen naar buiten (dubbele biceps-pose).",
      "tips": ["Uitstekend voor gezonde schouders bij veel opdrukken."],
      "mistakes": ["Ellebogen te laag."]
    },
    {
      "code": "REVERSE_SNOW_ANGEL", "name": "Reverse snow angels", "category": "ACCESSORY", "min": 10, "max": 12,
      "muscles": "Bovenrug, achterste schouders",
      "description": "Lig op je buik, armen langs je zij, voorhoofd net boven de grond. Beweeg je armen boven de grond in een boog naar boven je hoofd en terug.",
      "tips": ["Duimen naar het plafond."],
      "mistakes": ["Armen raken de grond."]
    },
    {
      "code": "YTW_RAISE", "name": "Y-T-W-heffingen", "category": "ACCESSORY", "min": 8, "max": 10,
      "equipment": ["BENCH"],
      "muscles": "Onderste trapezius, achterste schouders",
      "description": "Lig met je buik op de bank (of op de vloer). Hef je armen in de vorm van een Y, dan een T, dan een W: telkens 1 s vasthouden.",
      "tips": ["Schouderbladen naar beneden en samen."],
      "mistakes": ["Hoofd optillen."]
    },
    {
      "code": "SUPERMAN_HOLD", "name": "Superman hold", "category": "ACCESSORY", "measure": "TIME", "min": 20, "max": 30,
      "muscles": "Onderrug, billen, bovenrug",
      "description": "Lig op je buik en hef armen en benen tegelijk een paar cm van de grond.",
      "tips": ["Kijk naar de grond."],
      "mistakes": ["Nek overstrekken."]
    },
    {
      "code": "BAND_CURL", "name": "Elastiek biceps curl", "category": "ACCESSORY", "min": 12, "max": 15, "band": true,
      "equipment": ["BAND"],
      "muscles": "Biceps",
      "description": "Sta op het elastiek, grepen in je handen, handpalmen naar voren. Buig je ellebogen en breng je handen naar je schouders.",
      "tips": ["Ellebogen blijven tegen je zij."],
      "mistakes": ["Zwaaien met je romp."]
    },
    {
      "code": "BAND_TRICEPS_EXTENSION", "name": "Elastiek triceps pushdown", "category": "ACCESSORY", "min": 12, "max": 15, "band": true,
      "equipment": ["BAND", "DOOR_ANCHOR"],
      "muscles": "Triceps",
      "description": "Anker bovenaan de deur. Ellebogen tegen je zij, duw de grepen naar beneden tot gestrekte armen.",
      "tips": ["Enkel je onderarmen bewegen."],
      "mistakes": ["Ellebogen naar voren."]
    },
    {
      "code": "BAND_GOOD_MORNING", "name": "Elastiek good morning", "category": "ACCESSORY", "min": 12, "max": 15, "band": true,
      "equipment": ["BAND"],
      "muscles": "Hamstrings, billen, onderrug",
      "description": "Sta op het elastiek, lus achter je nek/schouders. Buig voorover vanuit je heupen met een rechte rug en kom terug omhoog.",
      "tips": ["Billen naar achteren, knieën licht gebogen."],
      "mistakes": ["Rug bol."]
    },
    {
      "code": "SIDE_PLANK", "name": "Zijplank", "category": "ACCESSORY", "measure": "TIME", "min": 20, "max": 40, "perSide": true,
      "muscles": "Schuine buikspieren",
      "description": "Lig op je zij, steun op je onderarm en de zijkant van je voet. Hef je heupen tot een rechte lijn.",
      "tips": ["Te zwaar: steun op je knie."],
      "mistakes": ["Heup zakt."]
    },
    {
      "code": "SIDE_PLANK_HIP_DIP", "name": "Zijplank met heupheffing", "category": "ACCESSORY", "min": 8, "max": 12, "perSide": true,
      "muscles": "Schuine buikspieren",
      "description": "In zijplank je heup laten zakken tot net boven de grond en terug omhoog duwen.",
      "tips": ["Gecontroleerd, geen schokken."],
      "mistakes": ["Draaien van de romp."]
    },

    {
      "code": "EXPLOSIVE_PUSHUP", "name": "Explosieve push-up", "category": "POWER", "min": 5, "max": 8,
      "muscles": "Borst, triceps, schouders",
      "description": "Push-up waarbij je zo krachtig duwt dat je handen loskomen van de grond. Zacht landen.",
      "tips": ["Begin schuin op de bank als het nog niet lukt."],
      "mistakes": ["Hard landen met gestrekte armen."]
    },
    {
      "code": "SQUAT_JUMP", "name": "Squat jump", "category": "POWER", "min": 6, "max": 10,
      "muscles": "Dijen, billen, kuiten",
      "description": "Squat tot halve diepte en spring explosief omhoog. Land zacht en ga meteen in de volgende squat.",
      "tips": ["Land op je voorvoeten, knieën licht gebogen."],
      "mistakes": ["Knieën naar binnen bij de landing."]
    },
    {
      "code": "SPLIT_SQUAT_JUMP", "name": "Split squat jump", "category": "POWER", "min": 5, "max": 8, "perSide": true,
      "muscles": "Dijen, billen",
      "description": "Vanuit een split squat omhoog springen en in de lucht van been wisselen.",
      "tips": ["Kwaliteit boven snelheid."],
      "mistakes": ["Achterste knie klapt op de grond."]
    },
    {
      "code": "BURPEE", "name": "Burpee", "category": "CONDITIONING", "min": 8, "max": 12,
      "muscles": "Volledig lichaam",
      "description": "Squat, handen op de grond, spring naar plank, (optioneel push-up), spring terug naar je handen en spring omhoog.",
      "tips": ["Tempo constant houden."],
      "mistakes": ["Doorzakkende rug in de plank."]
    },
    {
      "code": "BAG_ROUNDS", "name": "Bokszak rondes", "category": "CONDITIONING", "measure": "ROUNDS", "min": 4, "max": 6,
      "equipment": ["PUNCHING_BAG"],
      "muscles": "Schouders, core, conditie",
      "description": "Rondes van 2–3 minuten op de bokszak met 1 minuut rust. Werk met combinaties (1-2, 1-2-3, 1-2-3-2) en blijf bewegen.",
      "tips": ["Draai je heup en achterste voet mee bij de cross.", "Handen altijd terug naar je gezicht.", "Uitademen bij elke slag."],
      "mistakes": ["Alleen met je armen slaan.", "Adem inhouden."]
    },
    {
      "code": "BAG_HIIT", "name": "Bokszak HIIT 30/30", "category": "CONDITIONING", "measure": "ROUNDS", "min": 8, "max": 10,
      "equipment": ["PUNCHING_BAG"],
      "muscles": "Conditie, schouders",
      "description": "30 seconden alles geven met snelle rechte slagen, 30 seconden rust.",
      "tips": ["Kwaliteit blijft belangrijk: vuist recht, pols gestrekt."],
      "mistakes": ["Eerste rondes te hard waardoor de laatste niets meer zijn."]
    },

    {
      "code": "JUMPING_JACKS", "name": "Jumping jacks", "category": "WARMUP", "measure": "TIME", "min": 60, "max": 60,
      "muscles": "Volledig lichaam",
      "description": "Spring met je benen uit elkaar terwijl je armen boven je hoofd klappen, en terug.",
      "tips": ["Rustig opbouwen."],
      "mistakes": []
    },
    {
      "code": "ARM_CIRCLES", "name": "Armcirkels", "category": "WARMUP", "measure": "TIME", "min": 30, "max": 30,
      "muscles": "Schouders",
      "description": "Gestrekte armen opzij, kleine cirkels die groter worden. Halverwege van richting wisselen.",
      "tips": [], "mistakes": []
    },
    {
      "code": "HIP_CIRCLES", "name": "Heupcirkels", "category": "WARMUP", "measure": "TIME", "min": 30, "max": 30,
      "muscles": "Heupen",
      "description": "Handen op je heupen, grote cirkels met je bekken in beide richtingen.",
      "tips": [], "mistakes": []
    },
    {
      "code": "CAT_COW", "name": "Kat-koe", "category": "WARMUP", "min": 8, "max": 8,
      "muscles": "Rug, wervelkolom",
      "description": "Op handen en knieën: rug bol (kat) en dan hol met je borst vooruit (koe), op het ritme van je ademhaling.",
      "tips": [], "mistakes": []
    },
    {
      "code": "BAND_DISLOCATE", "name": "Schouder-dislocates met elastiek", "category": "WARMUP", "min": 10, "max": 10, "band": true,
      "equipment": ["BAND"],
      "muscles": "Schouders, borst",
      "description": "Hou het elastiek breed vast met gestrekte armen en breng het in een boog van voor je heupen over je hoofd tot achter je rug, en terug.",
      "tips": ["Breder vastnemen als het niet lukt zonder je armen te buigen."],
      "mistakes": ["Armen buigen."]
    },
    {
      "code": "SHADOW_BOXING", "name": "Schaduwboksen", "category": "WARMUP", "measure": "TIME", "min": 120, "max": 180,
      "muscles": "Volledig lichaam",
      "description": "Lichte stoten in de lucht terwijl je op je voorvoeten beweegt. Ideaal voor de bokszaktraining.",
      "tips": ["Ontspannen schouders."], "mistakes": []
    },

    {
      "code": "HIP_FLEXOR_STRETCH", "name": "Heupbuiger-stretch", "category": "MOBILITY", "measure": "TIME", "min": 30, "max": 45, "perSide": true,
      "muscles": "Heupbuigers",
      "description": "Halve kniezit (één knie op de grond). Span de bil van je achterste been aan en schuif je heup licht naar voren.",
      "tips": ["Niet in de onderrug hangen."], "mistakes": []
    },
    {
      "code": "HAMSTRING_STRETCH", "name": "Hamstring-stretch", "category": "MOBILITY", "measure": "TIME", "min": 30, "max": 45, "perSide": true,
      "muscles": "Hamstrings",
      "description": "Hiel op de bank of grond, been gestrekt, buig voorover vanuit je heup met een rechte rug.",
      "tips": [], "mistakes": ["Rug bol trekken om verder te reiken."]
    },
    {
      "code": "THORACIC_ROTATION", "name": "Thoracale rotatie", "category": "MOBILITY", "min": 8, "max": 8, "perSide": true,
      "muscles": "Bovenrug",
      "description": "Lig op je zij met je knieën 90° gebogen, armen voor je. Draai je bovenste arm in een boog naar de andere kant en volg met je blik.",
      "tips": ["Knieën blijven op elkaar."], "mistakes": []
    },
    {
      "code": "CHEST_STRETCH", "name": "Borststretch in de deuropening", "category": "MOBILITY", "measure": "TIME", "min": 30, "max": 30, "perSide": true,
      "muscles": "Borst, voorste schouders",
      "description": "Onderarm verticaal tegen de deurstijl (niet aan hangen), stap licht naar voren tot je rek voelt in je borst.",
      "tips": [], "mistakes": []
    },
    {
      "code": "CHILD_POSE", "name": "Child's pose", "category": "MOBILITY", "measure": "TIME", "min": 45, "max": 60,
      "muscles": "Rug, schouders, heupen",
      "description": "Zit op je hielen, armen ver voor je op de grond, voorhoofd naar de grond. Rustig ademen.",
      "tips": [], "mistakes": []
    }
  ]
}
;
