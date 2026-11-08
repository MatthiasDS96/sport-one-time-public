// Voedingsmiddelen met voedingswaarden per 100 g (of 100 ml). Gemiddelde waarden (NUBEL / etiketten),
// afgerond: goed genoeg om een dag te plannen, geen labo-precisie.
//
// k = kcal, p = eiwit, c = koolhydraten, f = vet (per 100 g/ml)
// unit: 'g' | 'ml' | 'stuk' (bij 'stuk' is pieceG het gewicht van één stuk; half = halve stuks toegestaan)
// cat: winkelafdeling voor de boodschappenlijst; pantry: staat meestal in de kast (aparte lijst)
// free: naar smaak, telt niet mee in kcal en wordt niet geschaald

export const CATEGORIES = [
  ['groenten', 'Groenten & fruit'],
  ['vlees', 'Vlees, vis & beleg'],
  ['zuivel', 'Zuivel & eieren'],
  ['brood', 'Brood & ontbijt'],
  ['droog', 'Pasta, rijst & wereldkeuken'],
  ['conserven', 'Conserven & sauzen'],
  ['diepvries', 'Diepvries'],
  ['snacks', 'Snacks & noten'],
  ['dranken', 'Dranken'],
  ['kruiden', 'Kruiden, olie & voorraad'],
];

export const FOODS = {
  // ---------- vlees & vis ----------
  kipfilet:        { n: 'kipfilet', k: 110, p: 23, c: 0, f: 1.5, unit: 'g', cat: 'vlees' },
  kippendij:       { n: 'kippendijfilet (zonder vel)', k: 125, p: 19, c: 0, f: 5.5, unit: 'g', cat: 'vlees' },
  kipgehakt:       { n: 'kipgehakt', k: 130, p: 20, c: 0, f: 5.5, unit: 'g', cat: 'vlees' },
  rundgehakt:      { n: 'mager rundsgehakt (5% vet)', k: 135, p: 21, c: 0, f: 5.5, unit: 'g', cat: 'vlees' },
  stoofvlees:      { n: 'stoofvlees van het rund', k: 140, p: 21, c: 0, f: 6, unit: 'g', cat: 'vlees' },
  biefstuk:        { n: 'biefstuk (mager)', k: 125, p: 22, c: 0, f: 4, unit: 'g', cat: 'vlees' },
  varkenshaas:     { n: 'varkenshaasje', k: 120, p: 22, c: 0, f: 3.5, unit: 'g', cat: 'vlees' },
  varkensreepjes:  { n: 'magere varkensreepjes (wok)', k: 130, p: 21, c: 0, f: 5, unit: 'g', cat: 'vlees' },
  kabeljauw:       { n: 'kabeljauwfilet', k: 80, p: 18, c: 0, f: 0.7, unit: 'g', cat: 'vlees' },
  mosselen:        { n: 'mosselen (gewicht met schelp)', k: 21.5, p: 3, c: 0.9, f: 0.55, unit: 'g', cat: 'vlees' },
  hambeleg:        { n: 'magere ham (beleg)', k: 110, p: 19, c: 1, f: 3.5, unit: 'g', cat: 'vlees' },
  kipbeleg:        { n: 'kipfilet (beleg)', k: 105, p: 20, c: 1.5, f: 2, unit: 'g', cat: 'vlees' },

  // ---------- zuivel & eieren ----------
  ei:              { n: 'ei', k: 143, p: 12.6, c: 0.7, f: 9.5, unit: 'stuk', pieceG: 60, cat: 'zuivel' },
  melk:            { n: 'halfvolle melk', k: 46, p: 3.4, c: 4.8, f: 1.6, unit: 'ml', cat: 'zuivel' },
  skyr:            { n: 'skyr / Griekse yoghurt 0%', k: 63, p: 11, c: 4, f: 0.2, unit: 'g', cat: 'zuivel' },
  yoghurt:         { n: 'magere yoghurt', k: 38, p: 4.3, c: 4.4, f: 0.1, unit: 'g', cat: 'zuivel' },
  kookroom:        { n: 'lichte kookroom', k: 150, p: 3, c: 4, f: 13, unit: 'ml', cat: 'zuivel' },
  boter:           { n: 'boter', k: 740, p: 0.7, c: 0.6, f: 82, unit: 'g', cat: 'zuivel' },
  pudding:         { n: 'proteïnepudding (pot 200 g)', k: 75, p: 10, c: 6.5, f: 1.3, unit: 'stuk', pieceG: 200, cat: 'zuivel' },

  // ---------- brood & ontbijt ----------
  brood:           { n: 'volkorenbrood', k: 240, p: 10, c: 40, f: 3.5, unit: 'stuk', pieceG: 35, piece: 'snede', pieces: 'sneden', cat: 'brood' },
  havermout:       { n: 'havermout', k: 370, p: 13, c: 59, f: 7, unit: 'g', cat: 'brood' },
  granola:         { n: 'granola (weinig suiker)', k: 450, p: 9, c: 60, f: 18, unit: 'g', cat: 'brood' },
  rijstwafel:      { n: 'rijstwafel', k: 385, p: 8, c: 80, f: 3, unit: 'stuk', pieceG: 8, cat: 'brood' },
  wrap:            { n: 'volkoren wrap', k: 300, p: 9, c: 48, f: 7, unit: 'stuk', pieceG: 60, cat: 'brood' },
  peperkoek:       { n: 'peperkoek', k: 330, p: 4, c: 75, f: 1.5, unit: 'g', cat: 'brood' },

  // ---------- pasta, rijst & wereldkeuken ----------
  rijst:           { n: 'basmatirijst (droog)', k: 355, p: 8, c: 78, f: 0.6, unit: 'g', cat: 'droog' },
  pasta:           { n: 'volkoren pasta (droog)', k: 350, p: 13, c: 65, f: 2.5, unit: 'g', cat: 'droog' },
  mie:             { n: 'mie-noedels (droog)', k: 360, p: 11, c: 72, f: 2, unit: 'g', cat: 'droog' },
  kokosmelk:       { n: 'lichte kokosmelk', k: 75, p: 0.8, c: 2, f: 7, unit: 'ml', cat: 'droog' },
  currypasta:      { n: 'gele currypasta', k: 120, p: 2, c: 10, f: 8, unit: 'g', cat: 'droog' },
  sojasaus:        { n: 'sojasaus (minder zout)', k: 60, p: 8, c: 5, f: 0, unit: 'ml', cat: 'droog', pantry: true },
  sesam:           { n: 'sesamzaad', k: 570, p: 18, c: 23, f: 50, unit: 'g', cat: 'droog', pantry: true },
  rijstazijn:      { n: 'rijstazijn', k: 20, p: 0, c: 5, f: 0, unit: 'ml', cat: 'droog', pantry: true },
  sriracha:        { n: 'sriracha', k: 100, p: 2, c: 20, f: 1, unit: 'g', cat: 'droog', pantry: true },

  // ---------- conserven & sauzen ----------
  passata:         { n: 'tomatenpassata', k: 30, p: 1.4, c: 5, f: 0.2, unit: 'g', cat: 'conserven' },
  mosterd:         { n: 'mosterd', k: 100, p: 6, c: 4, f: 6, unit: 'g', cat: 'conserven', pantry: true },
  bouillon:        { n: 'bouillonblokje', k: 250, p: 10, c: 20, f: 15, unit: 'stuk', pieceG: 10, cat: 'conserven', pantry: true },
  bier:            { n: 'bruin bier (bv. Leffe Bruin)', k: 40, p: 0.4, c: 3, f: 0, unit: 'ml', cat: 'dranken' },
  honing:          { n: 'honing', k: 304, p: 0.3, c: 82, f: 0, unit: 'g', cat: 'conserven', pantry: true },
  pindakaas:       { n: 'pindakaas (100% pinda)', k: 600, p: 25, c: 16, f: 50, unit: 'g', cat: 'conserven' },
  maizena:         { n: 'maizena', k: 380, p: 0.3, c: 91, f: 0.1, unit: 'g', cat: 'kruiden', pantry: true },

  // ---------- groenten & fruit ----------
  broccoli:        { n: 'broccoli', k: 34, p: 2.8, c: 4, f: 0.4, unit: 'g', cat: 'groenten' },
  bloemkool:       { n: 'bloemkool', k: 25, p: 1.9, c: 3, f: 0.3, unit: 'g', cat: 'groenten' },
  wortel:          { n: 'wortelen', k: 41, p: 0.9, c: 7.6, f: 0.2, unit: 'g', cat: 'groenten' },
  asperges:        { n: 'groene asperges', k: 20, p: 2.2, c: 2, f: 0.1, unit: 'g', cat: 'groenten' },
  witteasperges:   { n: 'witte asperges', k: 18, p: 1.9, c: 2, f: 0.1, unit: 'g', cat: 'groenten' },
  butternut:       { n: 'butternut', k: 45, p: 1, c: 10, f: 0.1, unit: 'g', cat: 'groenten' },
  courgette:       { n: 'courgette', k: 17, p: 1.2, c: 2.2, f: 0.3, unit: 'g', cat: 'groenten' },
  komkommer:       { n: 'komkommer', k: 15, p: 0.7, c: 2.6, f: 0.1, unit: 'g', cat: 'groenten' },
  champignons:     { n: 'champignons', k: 22, p: 3.1, c: 1.6, f: 0.3, unit: 'g', cat: 'groenten' },
  ui:              { n: 'ui', k: 40, p: 1.1, c: 8, f: 0.1, unit: 'g', cat: 'groenten' },
  look:            { n: 'look', k: 150, p: 6, c: 30, f: 0.5, unit: 'stuk', pieceG: 5, piece: 'teentje', pieces: 'teentjes', cat: 'groenten' },
  gember:          { n: 'verse gember', k: 80, p: 1.8, c: 18, f: 0.8, unit: 'g', cat: 'groenten' },
  aardappel:       { n: 'aardappelen (vastkokend)', k: 77, p: 2, c: 17, f: 0.1, unit: 'g', cat: 'groenten' },
  krieltjes:       { n: 'krieltjes', k: 77, p: 2, c: 17, f: 0.1, unit: 'g', cat: 'groenten' },
  citroen:         { n: 'citroen', k: 29, p: 1, c: 9, f: 0.3, unit: 'stuk', pieceG: 100, half: true, cat: 'groenten' },
  peterselie:      { n: 'verse peterselie', k: 0, p: 0, c: 0, f: 0, unit: 'g', cat: 'groenten', free: true, buy: '1 bosje' },
  lenteui:         { n: 'lente-ui', k: 32, p: 1.8, c: 7, f: 0.2, unit: 'g', cat: 'groenten' },
  banaan:          { n: 'banaan', k: 89, p: 1.1, c: 23, f: 0.3, unit: 'stuk', pieceG: 120, half: true, cat: 'groenten' },
  appel:           { n: 'appel', k: 52, p: 0.3, c: 14, f: 0.2, unit: 'stuk', pieceG: 150, cat: 'groenten' },
  aardbeien:       { n: 'aardbeien', k: 32, p: 0.7, c: 7.7, f: 0.3, unit: 'g', cat: 'groenten' },

  // ---------- diepvries ----------
  erwten:          { n: 'erwtjes (diepvries)', k: 81, p: 5.4, c: 10, f: 0.4, unit: 'g', cat: 'diepvries' },
  bessen:          { n: 'blauwe bessen (diepvries)', k: 57, p: 0.7, c: 14, f: 0.3, unit: 'g', cat: 'diepvries' },

  // ---------- snacks ----------
  noten:           { n: 'ongezouten gemengde noten', k: 620, p: 18, c: 12, f: 55, unit: 'g', cat: 'snacks' },
  eiwitreep:       { n: 'proteïnereep (60 g)', k: 340, p: 33, c: 33, f: 12, unit: 'stuk', pieceG: 60, cat: 'snacks' },

  // ---------- kruiden, olie & voorraad ----------
  olie:            { n: 'olijf- of zonnebloemolie', k: 884, p: 0, c: 0, f: 100, unit: 'ml', cat: 'kruiden', pantry: true },
  paprikapoeder:   { n: 'paprikapoeder', k: 0, p: 0, c: 0, f: 0, unit: 'g', cat: 'kruiden', pantry: true, free: true },
  kerrie:          { n: 'kerriepoeder', k: 0, p: 0, c: 0, f: 0, unit: 'g', cat: 'kruiden', pantry: true, free: true },
  oregano:         { n: 'Italiaanse kruiden', k: 0, p: 0, c: 0, f: 0, unit: 'g', cat: 'kruiden', pantry: true, free: true },
  kaneel:          { n: 'kaneel', k: 0, p: 0, c: 0, f: 0, unit: 'g', cat: 'kruiden', pantry: true, free: true },
  nootmuskaat:     { n: 'nootmuskaat', k: 0, p: 0, c: 0, f: 0, unit: 'g', cat: 'kruiden', pantry: true, free: true },
  tijm:            { n: 'tijm en laurier', k: 0, p: 0, c: 0, f: 0, unit: 'g', cat: 'kruiden', pantry: true, free: true },
  peperzout:       { n: 'peper en zout', k: 0, p: 0, c: 0, f: 0, unit: 'g', cat: 'kruiden', pantry: true, free: true },
};
