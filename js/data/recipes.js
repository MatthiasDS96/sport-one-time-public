// Recepten op basis van wat de gebruiker graag eet (vragenlijst 8/11/2026).
// Niet gebruiken: platte kaas, witte pens, aubergine, rauwe tomaat, geitenkaas, plakjes kaas, olijven.
//
// Hoeveelheden zijn voor 1 portie; de planner schaalt ze naar het kcal-doel.
// ingredients: [foodId, hoeveelheid] (gram/ml, of aantal stuks bij 'stuk'-voeding)
// type: 'ontbijt' | 'hoofd' | 'snack'
// mealprep: geschikt om op voorhand te koken; keeps: dagen houdbaar in de koelkast
// fresh: liefst vers maken (weekend); office: makkelijk mee te nemen
// months: enkel voorstellen in deze maanden (seizoen)

export const RECIPES = [
  // =========================== ONTBIJT ===========================
  {
    id: 'proteine-havermout', name: 'Proteïne-havermout met banaan', type: 'ontbijt',
    minutes: 7, quick: true,
    ingredients: [['havermout', 60], ['melk', 250], ['skyr', 100], ['banaan', 0.5], ['kaneel', 0]],
    steps: [
      'Doe havermout en melk in een kom of pannetje.',
      'Verwarm 2 minuten in de microgolf (of 4 minuten in een pannetje), roer halverwege.',
      'Roer de skyr erdoor als het iets afgekoeld is (anders schift hij).',
      'Werk af met schijfjes banaan en kaneel.',
    ],
    tip: 'Skyr pas op het einde toevoegen: zo blijft het romig en krijg je extra eiwit.',
  },
  {
    id: 'overnight-oats', name: 'Overnight oats met blauwe bessen', type: 'ontbijt',
    minutes: 5, quick: true, mealprep: true, keeps: 3, office: true,
    ingredients: [['havermout', 50], ['melk', 150], ['skyr', 150], ['bessen', 80], ['noten', 10]],
    steps: [
      'Meng havermout, melk en skyr in een potje of doosje.',
      'Leg de (bevroren) blauwe bessen erop; ze ontdooien vanzelf.',
      'Sluit af en zet minstens 6 uur (of een nacht) in de koelkast.',
      'Strooi de noten erover net voor je eet.',
    ],
    tip: 'Maak er meteen 3 potjes van: ideaal voor je kantoordagen.',
  },
  {
    id: 'roerei-boterhammen', name: 'Roerei op volkoren boterhammen', type: 'ontbijt',
    minutes: 10,
    ingredients: [['ei', 3], ['brood', 2], ['komkommer', 80], ['olie', 3], ['peperzout', 0]],
    steps: [
      'Klop de eieren los met peper en zout.',
      'Verwarm de olie in een antikleefpan op middelhoog vuur.',
      'Giet de eieren in de pan en roer rustig met een spatel tot ze net gestold zijn.',
      'Serveer op de (geroosterde) boterhammen met schijfjes komkommer.',
    ],
    tip: 'Haal de pan van het vuur als het ei nog licht glanst: het garen gaat nog even door.',
  },
  {
    id: 'yoghurt-bowl', name: 'Skyr-bowl met granola en fruit', type: 'ontbijt',
    minutes: 3, quick: true,
    ingredients: [['skyr', 250], ['granola', 35], ['aardbeien', 100], ['noten', 10]],
    steps: [
      'Schep de skyr in een kom.',
      'Werk af met granola, fruit en noten.',
    ],
    tip: 'Geen aardbeien? Gebruik blauwe bessen of een halve banaan.',
  },
  {
    id: 'boterhammen-beleg', name: 'Boterhammen met kip, ham en een ei', type: 'ontbijt',
    minutes: 10, quick: true, office: true,
    ingredients: [['brood', 3], ['kipbeleg', 60], ['hambeleg', 40], ['ei', 1], ['komkommer', 50], ['mosterd', 5]],
    steps: [
      'Kook het ei 8 minuten, laat schrikken onder koud water en pel het.',
      'Beleg de boterhammen met kipfilet en ham, eventueel een dun laagje mosterd.',
      'Eet er het ei en schijfjes komkommer bij.',
    ],
    tip: 'Kook op zondag 6 eieren tegelijk: ze blijven 5 dagen goed in de koelkast.',
  },
  {
    id: 'omelet-champignons', name: 'Omelet met champignons en ham', type: 'ontbijt',
    minutes: 12,
    ingredients: [['ei', 3], ['champignons', 80], ['hambeleg', 50], ['brood', 1], ['olie', 5], ['peperzout', 0]],
    steps: [
      'Snijd de champignons in plakjes en de ham in reepjes.',
      'Bak de champignons 4 minuten in de olie tot ze goudbruin zijn.',
      'Klop de eieren los met peper en zout, giet over de champignons en leg de ham erop.',
      'Laat op laag vuur stollen met een deksel op de pan (± 4 minuten). Eet met een boterham.',
    ],
  },

  // =========================== HOOFDGERECHTEN (meal prep) ===========================
  {
    id: 'kip-teriyaki', name: 'Kip teriyaki met rijst en broccoli', type: 'hoofd',
    minutes: 30, mealprep: true, keeps: 4, office: true,
    ingredients: [['kipfilet', 160], ['rijst', 75], ['broccoli', 150], ['wortel', 60], ['sojasaus', 15],
      ['honing', 10], ['look', 1], ['gember', 5], ['maizena', 5], ['olie', 5], ['sesam', 3]],
    steps: [
      'Kook de rijst volgens de verpakking.',
      'Meng sojasaus, honing, geperste look, geraspte gember, maizena en 3 el water: dat is je teriyakisaus.',
      'Snijd de kip in blokjes en bak ze 6–7 minuten in de olie tot ze rondom bruin en gaar zijn.',
      'Kook of stoom intussen de broccoliroosjes en wortelschijfjes 5 minuten (beetgaar).',
      'Giet de saus over de kip en laat 1–2 minuten indikken tot hij glanst.',
      'Verdeel rijst, groenten en kip over de doosjes en strooi sesamzaad erover.',
    ],
    tip: 'Laat de doosjes eerst afkoelen voor je ze sluit en in de koelkast zet.',
  },
  {
    id: 'pasta-bolognese', name: 'Pasta bolognese vol groenten', type: 'hoofd',
    minutes: 35, mealprep: true, keeps: 4, freezes: true,
    ingredients: [['rundgehakt', 125], ['pasta', 80], ['passata', 150], ['wortel', 60], ['courgette', 80],
      ['champignons', 60], ['ui', 40], ['look', 1], ['olie', 5], ['oregano', 0], ['peperzout', 0]],
    steps: [
      'Snipper de ui en look; snijd wortel, courgette en champignons heel fijn (of rasp de wortel).',
      'Bak het gehakt rul in de olie en kruid met peper en zout.',
      'Voeg ui, look en de groenten toe en bak 5 minuten mee.',
      'Giet de passata erbij met de Italiaanse kruiden en laat minstens 15 minuten zachtjes pruttelen.',
      'Kook intussen de pasta beetgaar en meng of verdeel over de doosjes.',
    ],
    tip: 'De saus vriest perfect in: maak gerust een dubbele portie.',
  },
  {
    id: 'kip-curry', name: 'Kippencurry met bloemkool en erwtjes', type: 'hoofd',
    minutes: 30, mealprep: true, keeps: 4, freezes: true,
    ingredients: [['kipfilet', 150], ['rijst', 70], ['bloemkool', 150], ['erwten', 60], ['kokosmelk', 80],
      ['currypasta', 15], ['ui', 40], ['olie', 5]],
    steps: [
      'Kook de rijst volgens de verpakking.',
      'Fruit de gesnipperde ui 3 minuten in de olie, voeg de currypasta toe en bak 1 minuut mee.',
      'Voeg de kip in blokjes toe en bak 4 minuten.',
      'Voeg de bloemkoolroosjes, de kokosmelk en een scheutje water toe; laat 10 minuten sudderen met deksel.',
      'Doe de erwtjes erbij voor de laatste 3 minuten. Serveer met de rijst.',
    ],
  },
  {
    id: 'balletjes-tomatensaus', name: 'Kipballetjes in tomatensaus met pasta', type: 'hoofd',
    minutes: 35, mealprep: true, keeps: 4, freezes: true,
    ingredients: [['kipgehakt', 150], ['pasta', 80], ['passata', 200], ['courgette', 100], ['ui', 30],
      ['look', 1], ['olie', 5], ['oregano', 0], ['peperzout', 0]],
    steps: [
      'Kruid het gehakt met peper, zout en wat Italiaanse kruiden en draai er kleine balletjes van.',
      'Bak de balletjes rondom bruin in de olie (± 5 minuten) en haal ze uit de pan.',
      'Fruit ui en look in dezelfde pan, voeg de courgette in blokjes toe en bak 3 minuten.',
      'Giet de passata erbij, leg de balletjes terug en laat 12 minuten zachtjes garen.',
      'Kook intussen de pasta beetgaar.',
    ],
  },
  {
    id: 'hachis-parmentier', name: 'Hachis parmentier met bloemkoolpuree', type: 'hoofd',
    minutes: 45, mealprep: true, keeps: 4, freezes: true,
    ingredients: [['rundgehakt', 130], ['aardappel', 250], ['bloemkool', 150], ['wortel', 80], ['ui', 40],
      ['melk', 50], ['passata', 50], ['olie', 5], ['nootmuskaat', 0], ['peperzout', 0]],
    steps: [
      'Kook aardappelen en bloemkool samen gaar in gezouten water (± 20 minuten).',
      'Bak intussen het gehakt rul met ui en fijngesneden wortel; voeg de passata toe en laat 10 minuten stoven.',
      'Giet aardappelen en bloemkool af en stamp fijn met de warme melk, peper, zout en nootmuskaat.',
      'Doe het gehakt in een ovenschaal (of in de doosjes) en schep de puree erover.',
      'Bak 15 minuten in de oven op 200 °C tot de bovenkant goudbruin is.',
    ],
    tip: 'De bloemkool in de puree spaart kcal zonder dat je het proeft.',
  },
  {
    id: 'stoverij-light', name: 'Stoverij met aardappelen en wortelen', type: 'hoofd',
    minutes: 30, totalMinutes: 150, mealprep: true, keeps: 4, freezes: true,
    ingredients: [['stoofvlees', 160], ['ui', 80], ['bier', 100], ['peperkoek', 15], ['mosterd', 10],
      ['aardappel', 250], ['wortel', 100], ['olie', 5], ['bouillon', 0.25], ['tijm', 0]],
    steps: [
      'Snijd het vlees in blokken, dep droog en bak het in porties bruin in de olie.',
      'Fruit de ui in reepjes in dezelfde pot.',
      'Doe het vlees terug, blus met het bier en voeg een half glas water, bouillon, tijm en laurier toe.',
      'Besmeer de peperkoek met mosterd en leg hem bovenop. Laat 2 uur heel zacht sudderen met deksel.',
      'Kook of stoom de aardappelen en wortelen het laatste half uur.',
    ],
    tip: '30 minuten echt werk; de rest is sudderen terwijl je iets anders doet. Smaakt de dag erna nog beter.',
  },
  {
    id: 'wok-varken-noedels', name: 'Wok met varkensreepjes en noedels', type: 'hoofd',
    minutes: 25, mealprep: true, keeps: 3,
    ingredients: [['varkensreepjes', 150], ['mie', 70], ['courgette', 100], ['wortel', 80], ['champignons', 80],
      ['sojasaus', 20], ['olie', 7], ['look', 1], ['gember', 5]],
    steps: [
      'Kook de noedels volgens de verpakking, spoel af met koud water en laat uitlekken.',
      'Snijd courgette en wortel in dunne reepjes en de champignons in plakjes.',
      'Bak het vlees 3 minuten op hoog vuur in een wok met de helft van de olie; haal eruit.',
      'Wok de groenten met look en gember 4 minuten in de rest van de olie.',
      'Doe vlees en noedels terug, voeg de sojasaus toe en wok nog 1 minuut.',
    ],
  },
  {
    id: 'poke-bowl', name: 'Pokébowl met kip (zelfgemaakt)', type: 'hoofd',
    minutes: 25, mealprep: true, keeps: 3, office: true,
    ingredients: [['kipfilet', 150], ['rijst', 75], ['komkommer', 100], ['wortel', 60], ['erwten', 60],
      ['sojasaus', 15], ['honing', 5], ['rijstazijn', 10], ['sesam', 5], ['yoghurt', 40], ['sriracha', 5]],
    steps: [
      'Kook de rijst en meng hem nog warm met de rijstazijn; laat afkoelen.',
      'Snijd de kip in reepjes, marineer 10 minuten in sojasaus en honing en bak 6 minuten gaar.',
      'Kook de erwtjes 3 minuten en spoel ze koud.',
      'Snijd komkommer in blokjes en rasp de wortel.',
      'Meng yoghurt met sriracha als saus. Schik alles op de rijst en strooi sesamzaad erover.',
    ],
    tip: 'Hou de saus apart in een klein potje tot je eet: zo blijft alles fris.',
  },
  {
    id: 'kip-traybake', name: 'Kip uit de oven met aardappeltjes en groenten', type: 'hoofd',
    minutes: 15, totalMinutes: 50, mealprep: true, keeps: 4, office: true,
    ingredients: [['kippendij', 170], ['aardappel', 250], ['wortel', 100], ['courgette', 100], ['olie', 10],
      ['paprikapoeder', 0], ['look', 1], ['peperzout', 0]],
    steps: [
      'Verwarm de oven voor op 210 °C.',
      'Snijd de aardappelen in partjes, de wortel in staafjes en de courgette in halve maantjes.',
      'Meng alles op een bakplaat met de olie, paprikapoeder, geperste look, peper en zout.',
      'Leg de kippendijen ertussen en bak 35–40 minuten tot de aardappelen krokant zijn.',
    ],
    tip: 'Alles op één plaat: 15 minuten werk en nauwelijks afwas.',
  },
  {
    id: 'butternut-kip', name: 'Romige kip met butternut en champignons', type: 'hoofd',
    minutes: 30, mealprep: true, keeps: 4,
    ingredients: [['kipfilet', 150], ['butternut', 250], ['champignons', 60], ['kookroom', 40], ['broccoli', 100],
      ['rijst', 60], ['olie', 5], ['peperzout', 0], ['nootmuskaat', 0]],
    steps: [
      'Kook de rijst. Schil de butternut en snijd hem in blokjes van 2 cm.',
      'Bak de kip in blokjes 5 minuten in de olie en haal uit de pan.',
      'Bak de butternut en champignons 5 minuten, voeg een scheut water toe en laat 8 minuten garen met deksel.',
      'Voeg de broccoli, de kip en de kookroom toe; laat nog 4 minuten zachtjes koken.',
      'Kruid met peper, zout en nootmuskaat en serveer met de rijst.',
    ],
  },
  {
    id: 'kip-wraps', name: 'Wraps met kip, komkommer en yoghurtsaus', type: 'hoofd',
    minutes: 20, mealprep: true, keeps: 3, office: true,
    ingredients: [['wrap', 2], ['kipfilet', 130], ['komkommer', 60], ['wortel', 50], ['yoghurt', 50],
      ['look', 0.5], ['olie', 5], ['paprikapoeder', 0], ['peperzout', 0]],
    steps: [
      'Snijd de kip in reepjes, kruid met paprikapoeder, peper en zout en bak 6 minuten in de olie.',
      'Meng de yoghurt met de geperste look en wat zout: dat is je saus.',
      'Snijd de komkommer in reepjes en rasp de wortel.',
      'Besmeer de wraps met saus, beleg met kip en groenten en rol strak op.',
    ],
    tip: 'Voor meal prep: kip en groenten apart bewaren en de wrap pas vullen op de dag zelf.',
  },
  {
    id: 'pasta-kip-champignons', name: 'Pasta met kip in champignonroomsaus', type: 'hoofd',
    minutes: 25, mealprep: true, keeps: 3,
    ingredients: [['kipfilet', 140], ['pasta', 80], ['champignons', 120], ['kookroom', 60], ['broccoli', 100],
      ['ui', 30], ['look', 1], ['olie', 5], ['peperzout', 0]],
    steps: [
      'Kook de pasta beetgaar; kook de broccoli de laatste 4 minuten mee.',
      'Bak de kip in reepjes 5 minuten in de olie en haal uit de pan.',
      'Bak ui, look en champignons 5 minuten tot het vocht verdampt is.',
      'Voeg de kookroom en de kip toe, laat 2 minuten indikken en kruid met peper en zout.',
      'Meng met de pasta en de broccoli.',
    ],
  },

  // =========================== HOOFDGERECHTEN (vers, weekend) ===========================
  {
    id: 'kabeljauw-oven', name: 'Kabeljauw uit de oven met krieltjes en mosterdsaus', type: 'hoofd',
    minutes: 30, fresh: true,
    ingredients: [['kabeljauw', 180], ['krieltjes', 250], ['asperges', 150], ['olie', 10], ['citroen', 0.5],
      ['mosterd', 10], ['kookroom', 30], ['peterselie', 0], ['peperzout', 0]],
    steps: [
      'Verwarm de oven voor op 200 °C. Halveer de krieltjes, meng met de helft van de olie en rooster 25 minuten.',
      'Leg na 10 minuten de asperges (of broccoli) mee op de plaat.',
      'Leg de kabeljauw in een ovenschaaltje, besprenkel met citroensap en de rest van de olie, kruid en bak 12 minuten.',
      'Warm de kookroom op met de mosterd en wat peterselie.',
      'Serveer de vis met de saus, de krieltjes en de groenten.',
    ],
    tip: 'Buiten het aspergeseizoen: neem broccoli.',
  },
  {
    id: 'mosselen', name: 'Mosselen natuur met ovenfrietjes', type: 'hoofd',
    minutes: 35, fresh: true, months: [9, 10, 11, 12, 1, 2, 3, 4],
    ingredients: [['mosselen', 1000], ['ui', 80], ['wortel', 80], ['look', 1], ['boter', 5],
      ['aardappel', 250], ['olie', 8], ['peterselie', 0], ['peperzout', 0]],
    steps: [
      'Snijd de aardappelen in frietjes, meng met de olie en wat zout en bak 30 minuten op 220 °C (halverwege omscheppen).',
      'Spoel de mosselen; gooi open exemplaren die niet sluiten als je erop tikt weg.',
      'Stoof ui, wortel en look 4 minuten in de boter in een grote pot.',
      'Doe de mosselen erbij, deksel erop en kook 5–6 minuten op hoog vuur; schud de pot af en toe.',
      'Klaar als ze open zijn; gooi mosselen die dicht blijven weg. Strooi peterselie erover.',
    ],
    tip: 'Mosselen eet je vers, op de dag van aankoop (seizoen: september – april).',
  },
  {
    id: 'varkenshaas-champignons', name: 'Varkenshaasje met champignonsaus en wortelen', type: 'hoofd',
    minutes: 30, fresh: true,
    ingredients: [['varkenshaas', 160], ['champignons', 150], ['kookroom', 50], ['aardappel', 250], ['wortel', 120],
      ['olie', 5], ['peperzout', 0]],
    steps: [
      'Kook de aardappelen en wortelen gaar (± 20 minuten).',
      'Kruid het varkenshaasje en bak het rondom bruin in de olie; gaar verder 12–15 minuten op middelhoog vuur.',
      'Laat het vlees 5 minuten rusten onder aluminiumfolie.',
      'Bak de champignons in dezelfde pan, voeg de kookroom toe en laat 2 minuten indikken.',
      'Snijd het vlees in medaillons en serveer met de saus.',
    ],
    tip: 'Licht roze vanbinnen is perfect: zo blijft varkenshaas mals.',
  },
  {
    id: 'biefstuk-frietjes', name: 'Biefstuk met ovenfrietjes en erwtjes', type: 'hoofd',
    minutes: 35, fresh: true,
    ingredients: [['biefstuk', 160], ['aardappel', 250], ['olie', 10], ['erwten', 120], ['mosterd', 10], ['peperzout', 0]],
    steps: [
      'Snijd de aardappelen in frietjes, meng met 2/3 van de olie en bak 30 minuten op 220 °C.',
      'Kook de erwtjes 4 minuten.',
      'Haal de biefstuk 20 minuten op voorhand uit de koelkast. Bak 2–3 minuten per kant in de rest van de olie op hoog vuur.',
      'Laat 3 minuten rusten, kruid met peper en zout en eet met mosterd.',
    ],
    tip: 'Belgische klassieker, zonder friteuse.',
  },
  {
    id: 'asperges-vlaamse-wijze', name: 'Asperges op Vlaamse wijze met ham en krieltjes', type: 'hoofd',
    minutes: 30, fresh: true, months: [4, 5, 6],
    ingredients: [['witteasperges', 300], ['ei', 2], ['hambeleg', 60], ['krieltjes', 200], ['boter', 10],
      ['peterselie', 0], ['nootmuskaat', 0], ['peperzout', 0]],
    steps: [
      'Kook de krieltjes gaar (± 15 minuten). Kook de eieren hard (10 minuten).',
      'Schil de asperges van onder het kopje naar beneden en snijd het houtige uiteinde eraf.',
      'Kook de asperges 10–12 minuten in gezouten water.',
      'Smelt de boter, voeg de fijngeprakte eieren, peterselie, nootmuskaat, peper en zout toe.',
      'Schik asperges met ham en krieltjes en schep de eiersaus erover.',
    ],
    tip: 'Enkel in het aspergeseizoen (april – juni).',
  },

  // =========================== TUSSENDOORTJES ===========================
  {
    id: 'snack-na-training', name: 'Skyr met banaan en honing (na de training)', type: 'snack', protein: true,
    postWorkout: true, minutes: 2,
    ingredients: [['skyr', 200], ['banaan', 1], ['honing', 5]],
    steps: ['Snijd de banaan in schijfjes over de skyr en doe er een beetje honing op.'],
    tip: 'Eiwit + koolhydraten binnen een paar uur na je training helpt herstel en spieropbouw. Een proteïnepudding met een banaan kan ook.',
  },
  {
    id: 'snack-pudding', name: 'Proteïnepudding', type: 'snack', protein: true, office: true, minutes: 0,
    ingredients: [['pudding', 1]],
    steps: ['Pot open, lepel erin.'],
    tip: 'Delhaize heeft ze bij de yoghurts (bv. Ehrmann High Protein of het eigen merk).',
  },
  {
    id: 'snack-skyr-bessen', name: 'Skyr met blauwe bessen', type: 'snack', protein: true, minutes: 2,
    ingredients: [['skyr', 150], ['bessen', 80]],
    steps: ['Schep de skyr in een kom en doe de bessen erover.'],
  },
  {
    id: 'snack-eieren', name: 'Twee gekookte eieren met komkommer', type: 'snack', protein: true, office: true, minutes: 10,
    ingredients: [['ei', 2], ['komkommer', 100], ['peperzout', 0]],
    steps: ['Kook de eieren 8 minuten, laat schrikken en pel ze. Eet met komkommer, peper en zout.'],
    tip: 'Kook er meteen een paar extra voor de rest van de week.',
  },
  {
    id: 'snack-eiwitreep', name: 'Proteïnereep', type: 'snack', protein: true, office: true, minutes: 0,
    ingredients: [['eiwitreep', 1]],
    steps: ['Steek er eentje in je rugzak voor op kantoor.'],
  },
  {
    id: 'snack-appel-noten', name: 'Appel met een handje noten', type: 'snack', office: true, minutes: 0,
    ingredients: [['appel', 1], ['noten', 20]],
    steps: ['Een appel en een klein handje (20 g) ongezouten noten.'],
  },
  {
    id: 'snack-banaan-pindakaas', name: 'Banaan met pindakaas', type: 'snack', office: true, minutes: 1,
    ingredients: [['banaan', 1], ['pindakaas', 15]],
    steps: ['Snijd de banaan in schijfjes en doe er een lepel pindakaas op (of dip).'],
  },
  {
    id: 'snack-rijstwafels', name: 'Rijstwafels met pindakaas', type: 'snack', office: true, minutes: 1,
    ingredients: [['rijstwafel', 3], ['pindakaas', 15]],
    steps: ['Besmeer 3 rijstwafels dun met pindakaas.'],
  },
];

/** Opties voor de lunch op kantoor (buiten de deur), met een realistische schatting. */
export const OFFICE_OPTIONS = [
  { id: 'broodje-kip', name: 'Broodje kip (zonder mayo)', k: 450, p: 30, tip: 'Vraag volkoren en saus apart.' },
  { id: 'broodje-smos', name: 'Broodje smos / martino met saus', k: 650, p: 25, tip: 'Saus maakt het verschil: vraag weinig of light.' },
  { id: 'poke', name: 'Pokébowl met kip of zalm', k: 650, p: 35, tip: 'Neem extra eiwit en saus apart; laat tempura en extra mayo weg.' },
  { id: 'wrap', name: 'Wrap met kip', k: 550, p: 30, tip: 'Gegrilde kip i.p.v. krokant.' },
  { id: 'kfc', name: 'Korean Fried Chicken met rijst', k: 1000, p: 45, tip: 'Deel een portie of neem 4 stuks; eet die avond lichter.' },
  { id: 'mealprep', name: 'Eigen meal prep meegenomen', k: null, p: null, tip: 'Telt als één portie van je meal prep.' },
];
