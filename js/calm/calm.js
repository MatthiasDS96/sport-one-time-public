// Rust: ademhalingsoefeningen en begeleide oefeningen (pure logica, geen DOM/opslag).
import { addDays, mondayOf } from '../dates.js';

// fase: [tekst, seconden, soort] — soort bepaalt de cirkel: in = groot, out = klein, hold = blijft.
export const BREATHS = [
  { id: 'doos', name: 'Doosademhaling', sub: '4 in · 4 vast · 4 uit · 4 vast', minutes: [2, 5, 10],
    why: 'Rustig en gelijkmatig. Goed om je hoofd leeg te maken voor je iets moeilijks doet.',
    pattern: [['Adem in', 4, 'in'], ['Vasthouden', 4, 'hold'], ['Adem uit', 4, 'out'], ['Vasthouden', 4, 'hold']] },
  { id: 'kalm', name: 'Lange uitademing', sub: '4 in · 6 uit', minutes: [2, 5, 10],
    why: 'Een langere uitademing remt je hartslag af. De snelste manier om tot rust te komen bij stress.',
    pattern: [['Adem in door je neus', 4, 'in'], ['Adem langzaam uit', 6, 'out']] },
  { id: 'coherent', name: 'Rustige ademhaling', sub: '5,5 in · 5,5 uit', minutes: [5, 10, 15],
    why: 'Ongeveer 5,5 ademhalingen per minuut: brengt hart en ademhaling in een rustig ritme.',
    pattern: [['Adem in', 5.5, 'in'], ['Adem uit', 5.5, 'out']] },
  { id: 'zucht', name: 'Dubbele zucht', sub: '2× in · lang uit', minutes: [1, 2, 5],
    why: 'Twee keer kort inademen, dan lang uitademen. Werkt al na één of twee keer bij acute stress.',
    pattern: [['Adem in door je neus', 3, 'in'], ['Nog een beetje erbij', 1, 'top'], ['Lang uit door je mond', 7, 'out'], ['Even niets', 2, 'rest']] },
  { id: 'slaap', name: '4-7-8 om te slapen', sub: '4 in · 7 vast · 8 uit', minutes: [2, 4, 6],
    why: 'In bed, lichten uit. Begin met een paar rondes; voel je je licht in het hoofd, adem dan gewoon verder.',
    pattern: [['Adem in door je neus', 4, 'in'], ['Vasthouden', 7, 'hold'], ['Uit door je mond', 8, 'out']] },
];

const scan = (part, extra = '') => [`Breng je aandacht naar ${part}. ${extra}Merk op wat je voelt, zonder iets te veranderen.`, 40];

// stappen: [tekst, seconden]
export const GUIDED = [
  { id: 'adem', name: 'Aandacht bij je adem', sub: 'Stille meditatie met af en toe een herinnering', minutes: [5, 10, 15],
    intro: [
      ['Ga rechtop zitten, voeten op de grond. Sluit je ogen of kijk zacht naar de grond.', 15],
      ['Adem drie keer diep in en langzaam uit.', 20],
      ['Laat je ademhaling nu gewoon gaan, zoals ze vanzelf gaat.', 15],
      ['Voel waar je de adem het duidelijkst voelt: je neus, je borst of je buik. Blijf daar met je aandacht.', 30],
    ],
    reminders: [
      'Dwaal je af? Dat is normaal. Merk het op en ga vriendelijk terug naar je adem.',
      'Voel de adem binnenkomen en weer naar buiten gaan.',
      'Gedachten mogen er zijn. Laat ze voorbijdrijven als wolken.',
      'Tel eventueel je ademhalingen, van één tot tien, en begin dan opnieuw.',
    ],
    outro: [['Verdiep je ademhaling. Beweeg je vingers en tenen.', 15], ['Open langzaam je ogen. Neem deze rust mee.', 10]] },
  { id: 'bodyscan', name: 'Bodyscan', sub: 'Lichaam van voeten tot hoofd ontspannen',
    steps: [
      ['Ga liggen of zit gemakkelijk. Sluit je ogen en adem een paar keer rustig uit.', 20],
      ['Voel het gewicht van je lichaam op de ondergrond. Je hoeft niets te doen.', 20],
      scan('je voeten', 'Tenen, voetzolen, hielen. '),
      scan('je onderbenen en knieën'),
      scan('je bovenbenen en heupen'),
      scan('je buik', 'Voel hoe hij op en neer gaat met je adem. '),
      scan('je rug', 'Laat je rug zwaar worden. '),
      scan('je borst'),
      scan('je handen en armen'),
      scan('je schouders en nek', 'Laat je schouders zakken bij elke uitademing. '),
      scan('je gezicht', 'Ontspan je kaak, je ogen en je voorhoofd. '),
      ['Voel nu je hele lichaam tegelijk, als één geheel. Adem in en uit.', 45],
      ['Verdiep je ademhaling, beweeg rustig en open je ogen wanneer je klaar bent.', 15],
    ] },
  { id: 'spieren', name: 'Spierontspanning', sub: 'Aanspannen en loslaten, spiergroep per spiergroep',
    steps: [
      ['Ga gemakkelijk zitten of liggen. Je spant telkens een spiergroep 5 seconden aan en laat dan los.', 15],
      ...[['je handen: maak vuisten', 'je handen'], ['je armen: buig ze en span je biceps', 'je armen'],
        ['je schouders: trek ze op naar je oren', 'je schouders'], ['je gezicht: knijp je ogen dicht en klem je kaak', 'je gezicht'],
        ['je buik: trek hem stevig in', 'je buik'], ['je benen: strek ze en span je dijen', 'je benen'],
        ['je voeten: krul je tenen', 'je voeten']]
        .flatMap(([tense, part]) => [[`Span ${tense}. Houd vast...`, 6], [`En los. Voel het verschil in ${part}. Laat ze zwaar en warm worden.`, 24]]),
      ['Voel je hele lichaam. Alles is los en zwaar. Adem rustig verder.', 40],
      ['Beweeg je vingers en tenen en kom rustig terug.', 15],
    ] },
  { id: 'zintuigen', name: '5-4-3-2-1', sub: 'Terug naar het hier en nu bij piekeren of onrust',
    steps: [
      ['Adem rustig in en uit. Je gaat je zintuigen een voor een gebruiken.', 15],
      ['Kijk rond en benoem vijf dingen die je ziet.', 40],
      ['Merk vier dingen op die je voelt: je kleren, de stoel, de lucht op je huid.', 40],
      ['Luister naar drie geluiden, dichtbij en veraf.', 35],
      ['Zoek twee dingen die je ruikt.', 30],
      ['Merk één ding op dat je proeft.', 20],
      ['Adem nog drie keer diep in en uit. Je bent hier, nu.', 25],
    ] },
  { id: 'pauze', name: 'Even resetten', sub: 'Korte pauze aan je bureau',
    steps: [
      ['Leg je gsm even neer en zet je voeten plat op de grond.', 10],
      ['Rol je schouders vijf keer naar achteren.', 20],
      ['Draai je hoofd langzaam naar links en naar rechts.', 20],
      ['Adem vier tellen in en zes tellen uit. Doe dat een paar keer.', 50],
      ['Kijk uit het raam of naar iets ver weg. Laat je ogen rusten.', 30],
      ['Wat heb je nu nodig? Water, beweging, een pauze? Neem het.', 20],
      ['Adem nog één keer diep uit. Klaar.', 10],
    ] },
];

export const exerciseById = (id) => [...BREATHS, ...GUIDED].find((e) => e.id === id);

/** Volledige reeks fasen of stappen ({ text, sec, kind }) voor een oefening en gekozen aantal minuten. */
export function timeline(ex, minutes) {
  if (ex.pattern) {
    const cycle = ex.pattern.reduce((s, p) => s + p[1], 0);
    const rounds = Math.max(1, Math.round((minutes * 60) / cycle));
    return [...Array(rounds)].flatMap(() => ex.pattern.map(([text, sec, kind]) => ({ text, sec, kind })));
  }
  if (ex.steps) return ex.steps.map(([text, sec]) => ({ text, sec }));
  // stille meditatie: intro, dan stilte met om de ± 90 s een herinnering, dan afsluiten
  const step = ([text, sec]) => ({ text, sec });
  const fixed = [...ex.intro, ...ex.outro].reduce((s, p) => s + p[1], 0);
  const quiet = Math.max(60, minutes * 60 - fixed);
  const n = Math.max(1, Math.round(quiet / 90));
  const middle = [...Array(n)].map((_, i) => ({ text: ex.reminders[i % ex.reminders.length], sec: Math.round(quiet / n) }));
  return [...ex.intro.map(step), ...middle, ...ex.outro.map(step)];
}

export const totalSeconds = (tl) => tl.reduce((s, p) => s + p.sec, 0);

/** Waar zit je na `elapsed` seconden? → { i, left } (i = tl.length als het gedaan is). */
export function positionAt(tl, elapsed) {
  let t = elapsed;
  for (let i = 0; i < tl.length; i++) {
    if (t < tl[i].sec) return { i, left: tl[i].sec - t };
    t -= tl[i].sec;
  }
  return { i: tl.length, left: 0 };
}

/** Statistiek uit de log [{ date, id, min }]: minuten deze week, dagen op rij (tot vandaag of gisteren), totaal. */
export function calmStats(log, todayIso) {
  const days = new Set(log.map((l) => l.date));
  const monday = mondayOf(todayIso);
  let d = days.has(todayIso) ? todayIso : addDays(todayIso, -1);
  let streak = 0;
  while (days.has(d)) { streak++; d = addDays(d, -1); }
  return {
    week: log.filter((l) => l.date >= monday && l.date <= todayIso).reduce((s, l) => s + l.min, 0),
    streak,
    total: log.reduce((s, l) => s + l.min, 0),
  };
}
