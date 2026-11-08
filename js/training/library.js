// Trainingsschema: 13 weken (3 fases van 4 weken + testweek), sjablonen, omzetten naar concrete oefeningen
// en dubbele progressie. Rechtstreeks overgezet van de desktopversie (PlanGenerator, WorkoutLibrary,
// PlanService.resolve, ProgressionService). Pure logica: geen DOM, geen opslag.
import { byCode, hasEquipment, availableLadder, BANDS, BAND_LABELS } from './catalog.js';
import { addDays, dayIndex, mondayOf } from '../dates.js';

export const WEEKS = 13;
export const DELOAD_PHASE = 4;

export const BLOCKS = {
  WARMUP: 'Opwarming', MAIN: 'Kracht', CONDITIONING: 'Conditie', FINISHER: 'Bokszak-afsluiter', COOLDOWN: 'Cooldown',
};
export const DAY_TYPES = {
  STRENGTH: 'Kracht', CONDITIONING: 'Conditie', ACTIVE_RECOVERY: 'Actief herstel', TEST: 'Testdag',
};

const NAMES = {
  FULL_A: 'Full body A', FULL_B: 'Full body B', FULL_C: 'Full body C – explosief', UPPER: 'Bovenlichaam',
  LOWER: 'Onderlichaam', BAG: 'Bokszak rondes', BAG_HIIT: 'Bokszak HIIT', RECOVERY: 'Actief herstel', TEST: 'Maxtest',
};
export const workoutName = (code) => NAMES[code] || code;

export function phaseName(phase) {
  return { 1: 'Basis', 2: 'Opbouw', 3: 'Kracht & power' }[phase] || 'Testweek';
}

export function phaseOfWeek(week) {
  if (week <= 4) return 1;
  if (week <= 8) return 2;
  if (week <= 12) return 3;
  return DELOAD_PHASE;
}

// ---------------------------------------------------------------- afsluiter
const NONE = { rounds: 0, workSec: 0, restSec: 0 };
const rounds = (r, min) => ({ rounds: r, workSec: min * 60, restSec: 60 });
const hiit = (r) => ({ rounds: r, workSec: 30, restSec: 30 });
export const isHiit = (f) => f.rounds > 0 && f.workSec <= 30;

export function finisherText(f) {
  if (!f || !f.rounds) return '';
  if (isHiit(f)) return `${f.rounds} × 30 s alles geven / 30 s rust`;
  return `${f.rounds} rondes × ${f.workSec / 60} min / ${f.restSec} s rust`;
}

// ---------------------------------------------------------------- generator
function typeOf(workout) {
  if (workout === 'BAG' || workout === 'BAG_HIIT') return 'CONDITIONING';
  if (workout === 'RECOVERY') return 'ACTIVE_RECOVERY';
  if (workout === 'TEST') return 'TEST';
  return 'STRENGTH';
}

function pattern(n, phase) {
  const p3 = phase === 3;
  switch (n) {
    case 1: return ['AB'];
    case 2: return ['AB', 'AB'];
    case 3: return p3 ? ['AB', 'AB', 'FULL_C'] : ['AB', 'AB', 'AB'];
    case 4: return p3 ? ['UPPER', 'LOWER', 'UPPER', 'LOWER'] : ['AB', 'BAG', 'AB', 'AB'];
    case 5: return { 1: ['AB', 'BAG', 'AB', 'RECOVERY', 'AB'], 2: ['AB', 'BAG', 'AB', 'BAG_HIIT', 'AB'],
      3: ['UPPER', 'LOWER', 'BAG', 'UPPER', 'LOWER'] }[phase] || ['AB', 'BAG', 'AB', 'RECOVERY', 'AB'];
    default: return { 1: ['AB', 'BAG', 'AB', 'RECOVERY', 'AB', 'BAG'], 2: ['AB', 'BAG', 'AB', 'BAG_HIIT', 'AB', 'RECOVERY'],
      3: ['UPPER', 'LOWER', 'BAG', 'UPPER', 'LOWER', 'RECOVERY'] }[phase] || ['AB', 'BAG', 'AB', 'RECOVERY', 'AB', 'RECOVERY'];
  }
}

function finisherFor(workout, phase, n, lastDay) {
  if (typeOf(workout) !== 'STRENGTH' || phase === DELOAD_PHASE) return NONE;
  if (n >= 4) return phase === 3 ? hiit(6) : NONE;
  if (phase === 1) return rounds(4, 2);
  if (phase === 2) return lastDay ? hiit(8) : rounds(5, 3);
  return workout === 'FULL_A' ? hiit(8) : rounds(6, 3);
}

/**
 * @param start maandag van week 1 (ISO)
 * @param days  trainingsdagen als index (0 = maandag … 6 = zondag)
 */
export function generatePlan(start, days) {
  if (dayIndex(start) !== 0) throw new Error('Een schema start op maandag.');
  if (!days.length || days.length > 6) throw new Error('Kies 1 tot 6 trainingsdagen.');
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  const n = sorted.length;
  const out = [];
  let ab = 0;
  for (let week = 1; week <= WEEKS; week++) {
    const phase = phaseOfWeek(week);
    const monday = addDays(start, (week - 1) * 7);
    const pat = pattern(n, phase);
    sorted.forEach((d, i) => {
      let workout = pat[i] === 'AB' ? (ab++ % 2 === 0 ? 'FULL_A' : 'FULL_B') : pat[i];
      if (phase === DELOAD_PHASE) {
        if (i === 0) workout = 'TEST';
        else if (workout.startsWith('BAG')) workout = 'RECOVERY';
      }
      out.push({
        date: addDays(monday, d), week, phase, type: typeOf(workout), workout,
        finisher: finisherFor(workout, phase, n, i === n - 1),
      });
    });
  }
  return out;
}

/** Deze maandag als er vandaag of later deze week nog een trainingsdag is, anders volgende maandag. */
export function startMonday(today, days) {
  const left = days.some((d) => d >= dayIndex(today));
  const monday = mondayOf(today);
  return left ? monday : addDays(monday, 7);
}

/** Nieuw plan vanaf vandaag (geen dagen in het verleden). */
export function createPlan(today, days) {
  const start = startMonday(today, days);
  return { start, created: today, days: generatePlan(start, days).filter((d) => d.date >= today) };
}

/** Trainingsdagen gewijzigd: voorbije dagen blijven, vanaf vandaag opnieuw (zelfde weeknummers). */
export function replanFrom(plan, today, days) {
  const past = plan.days.filter((d) => d.date < today);
  const future = generatePlan(plan.start, days).filter((d) => d.date >= today);
  return { ...plan, days: [...past, ...future] };
}

export function planEnd(plan) {
  return addDays(plan.start, WEEKS * 7 - 1);
}

// ---------------------------------------------------------------- sjablonen
const S = {
  chain: (chain, sets, rest) => ({ block: 'MAIN', chain, sets, rest }),
  ex: (block, code, sets, rest, fallback = null) => ({ block, code, fallback, sets, rest }),
  intervals: (block, code, fallback, r, work, rest) => ({ block, code, fallback, sets: r, rest, work }),
};

function warmup(list) {
  list.push(S.ex('WARMUP', 'JUMPING_JACKS', 1, 0), S.ex('WARMUP', 'ARM_CIRCLES', 1, 0), S.ex('WARMUP', 'HIP_CIRCLES', 1, 0),
    S.ex('WARMUP', 'BAND_PULL_APART', 1, 0, 'REVERSE_SNOW_ANGEL'), S.ex('WARMUP', 'CAT_COW', 1, 0),
    S.ex('WARMUP', 'BAND_DISLOCATE', 1, 0, 'ARM_CIRCLES'));
}
function cooldown(list) {
  list.push(S.ex('COOLDOWN', 'HIP_FLEXOR_STRETCH', 1, 0), S.ex('COOLDOWN', 'HAMSTRING_STRETCH', 1, 0),
    S.ex('COOLDOWN', 'CHEST_STRETCH', 1, 0), S.ex('COOLDOWN', 'CHILD_POSE', 1, 0));
}
function addFinisher(list, f) {
  if (!f || !f.rounds) return;
  list.push(S.intervals('FINISHER', isHiit(f) ? 'BAG_HIIT' : 'BAG_ROUNDS', 'BURPEE', f.rounds, f.workSec, f.restSec));
}
function heavierInPhase3(list, phase) {
  if (phase !== 3) return;
  list.forEach((s) => { if (s.chain && s.chain !== 'CORE') s.sets += 1; });
}

export function buildWorkout(code, phase, finisher) {
  const s = [];
  let description;
  switch (code) {
    case 'FULL_A':
      description = 'Volledig lichaam: duwen, roeien, squat, heup, schouders en core.';
      warmup(s);
      s.push(S.chain('PUSH_H', 3, 90), S.chain('PULL_H', 3, 90), S.chain('SQUAT', 3, 90), S.chain('HINGE', 3, 60),
        S.chain('PUSH_V', 3, 90), S.chain('CORE', 3, 45));
      heavierInPhase3(s, phase); addFinisher(s, finisher); cooldown(s);
      break;
    case 'FULL_B':
      description = 'Volledig lichaam: duwen, verticaal trekken, eenbenig, hamstrings, dips en core.';
      warmup(s);
      s.push(S.chain('PUSH_H', 3, 90), S.chain('PULL_V', 3, 90), S.ex('MAIN', 'BAND_FACE_PULL', 2, 60),
        S.ex('MAIN', phase >= 2 ? 'BULGARIAN_SPLIT_SQUAT' : 'SPLIT_SQUAT', 3, 90, 'SPLIT_SQUAT'),
        S.ex('MAIN', 'BAND_GOOD_MORNING', 3, 60, 'SINGLE_LEG_GLUTE_BRIDGE'), S.chain('TRICEPS', 3, 60),
        S.ex('MAIN', 'SIDE_PLANK', 2, 45), S.ex('MAIN', 'BAND_CURL', 2, 45));
      heavierInPhase3(s, phase); addFinisher(s, finisher); cooldown(s);
      break;
    case 'FULL_C':
      description = 'Explosieve varianten voor kracht en power, 2 min rust.';
      warmup(s);
      s.push(S.ex('MAIN', 'EXPLOSIVE_PUSHUP', 4, 120), { ...S.chain('PULL_H', 4, 90), note: '2 s pauze bovenaan' },
        S.ex('MAIN', 'SQUAT_JUMP', 4, 120), S.ex('MAIN', 'SINGLE_LEG_HIP_THRUST', 3, 90, 'SINGLE_LEG_GLUTE_BRIDGE'),
        S.chain('PUSH_V', 3, 90), S.ex('MAIN', 'HOLLOW_ROCK', 3, 45));
      addFinisher(s, finisher); cooldown(s);
      break;
    case 'UPPER':
      description = 'Bovenlichaam: duwen, trekken, schouders en armen.';
      warmup(s);
      s.push(S.chain('PUSH_H', 4, 90), S.chain('PULL_H', 4, 90), S.chain('PUSH_V', 3, 90), S.ex('MAIN', 'BAND_FACE_PULL', 3, 60),
        S.chain('TRICEPS', 3, 60), S.ex('MAIN', 'BAND_CURL', 2, 45), S.ex('MAIN', 'BAND_TRICEPS_EXTENSION', 2, 45));
      addFinisher(s, finisher); cooldown(s);
      break;
    case 'LOWER':
      description = 'Onderlichaam en core.';
      warmup(s);
      s.push(S.chain('SQUAT', 4, 90), S.ex('MAIN', 'BULGARIAN_SPLIT_SQUAT', 3, 90, 'SPLIT_SQUAT'), S.chain('HINGE', 3, 90),
        S.ex('MAIN', 'NORDIC_NEGATIVE', 3, 120), S.chain('CALF', 3, 45), S.chain('CORE', 3, 45));
      addFinisher(s, finisher); cooldown(s);
      break;
    case 'BAG':
    case 'BAG_HIIT': {
      description = code === 'BAG' ? 'Rondes op de bokszak zoals bij boksen: combinaties en blijven bewegen.'
        : 'Korte, harde intervallen op de bokszak.';
      s.push(S.ex('WARMUP', 'JUMPING_JACKS', 1, 0), S.ex('WARMUP', 'SHADOW_BOXING', 1, 30));
      const f = code === 'BAG_HIIT' ? hiit(10) : ({ 1: rounds(6, 2), 2: rounds(8, 3) }[phase] || rounds(10, 3));
      s.push(S.intervals('CONDITIONING', isHiit(f) ? 'BAG_HIIT' : 'BAG_ROUNDS', 'BURPEE', f.rounds, f.workSec, f.restSec));
      if (phase >= 3 && code === 'BAG') {
        s.push({ ...S.ex('CONDITIONING', 'BURPEE', 3, 60), min: 10, max: 10, note: 'tussen de laatste rondes' });
      }
      s.push(S.chain('CORE', 2, 45));
      cooldown(s);
      break;
    }
    case 'RECOVERY':
      description = '30–45 min stevig wandelen of fietsen + 10 min mobiliteit. Telt mee voor je reeks.';
      s.push(S.ex('WARMUP', 'CAT_COW', 1, 0), S.ex('COOLDOWN', 'THORACIC_ROTATION', 1, 0),
        S.ex('COOLDOWN', 'HIP_FLEXOR_STRETCH', 1, 0), S.ex('COOLDOWN', 'HAMSTRING_STRETCH', 1, 0), S.ex('COOLDOWN', 'CHILD_POSE', 1, 0));
      break;
    case 'TEST':
      description = 'Meet je vooruitgang: telkens 1 set zo veel mogelijk met goede techniek. Vul daarna ook je metingen in.';
      warmup(s);
      s.push({ ...S.chain('PUSH_H', 1, 180), note: 'zo veel mogelijk herhalingen' },
        { ...S.chain('PULL_H', 1, 180), note: 'zo veel mogelijk herhalingen' },
        { ...S.ex('MAIN', 'SQUAT', 1, 180), note: 'zo veel mogelijk in 60 s' },
        { ...S.ex('MAIN', 'PLANK', 1, 0), note: 'zo lang mogelijk' });
      cooldown(s);
      break;
    default:
      throw new Error(`Onbekende training: ${code}`);
  }
  if (phase === DELOAD_PHASE && code !== 'TEST') {
    s.forEach((x) => { if (x.block === 'MAIN' || x.block === 'CONDITIONING') x.sets = Math.max(1, Math.floor((x.sets + 1) / 2)); });
  }
  return { code, name: workoutName(code), description, slots: s };
}

// ---------------------------------------------------------------- omzetten
/**
 * Zet een geplande dag om naar concrete oefeningen.
 * @param levels { CHAIN: { code, band, steps } }
 */
export function resolve(day, levels, equipment) {
  const t = buildWorkout(day.workout, day.phase, day.finisher);
  const items = [];
  for (const s of t.slots) {
    let exercise = null;
    let level = null;
    if (s.chain) {
      level = levels[s.chain];
      exercise = level && byCode(level.code);
    } else {
      const main = byCode(s.code);
      const fb = s.fallback && byCode(s.fallback);
      exercise = (main && hasEquipment(main, equipment) && main) || (fb && hasEquipment(fb, equipment) && fb) || null;
    }
    if (!exercise) continue;
    const band = exercise.band && level ? { band: level.band, steps: level.steps } : null;
    items.push({
      block: s.block, exercise, sets: s.sets, min: s.min ?? exercise.min, max: s.max ?? exercise.max,
      rest: s.rest, work: s.work ?? null, note: s.note ?? null, chain: s.chain ?? null, ...band,
    });
  }
  return { date: day.date, code: t.code, title: t.name, description: t.description, type: day.type,
    week: day.week, phase: day.phase, items };
}

export function itemTarget(i) {
  if (i.work != null) {
    return `${i.sets} × ${i.work >= 60 ? `${i.work / 60} min` : `${i.work} s`} / ${i.rest} s rust`;
  }
  const range = i.min === i.max ? `${i.min}` : `${i.min}–${i.max}`;
  const unit = i.exercise.measure === 'TIME' ? ' s' : '';
  return `${i.sets > 1 ? `${i.sets} × ` : ''}${range}${unit}${i.exercise.perSide ? ' per kant' : ''}`;
}

export function bandText(i) {
  if (!i.band) return '';
  return `Elastiek ${BAND_LABELS[i.band].toLowerCase()} · ${i.steps ?? 0} ${i.steps === 1 ? 'stap' : 'stappen'} van de deur`;
}

/** Ruwe schatting in minuten (afgerond op 5). */
export function estimatedMinutes(w) {
  let sec = 0;
  for (const i of w.items) {
    const timed = i.exercise.measure === 'TIME';
    if (i.work != null) sec += i.sets * (i.work + i.rest);
    else if (i.block === 'WARMUP' || i.block === 'COOLDOWN') sec += timed ? i.max * (i.exercise.perSide ? 2 : 1) : 40;
    else {
      let work = timed ? i.max : i.max * 3;
      if (i.exercise.perSide) work *= 2;
      sec += i.sets * (work + i.rest);
    }
  }
  if (w.type === 'ACTIVE_RECOVERY') sec += 35 * 60;
  return Math.round(sec / 300) * 5;
}

/** Aantal hoofdsets (kracht + conditie) om te bepalen of een training volledig is. */
export function plannedMainSets(w) {
  return w.items.filter((i) => i.block === 'MAIN' || i.block === 'CONDITIONING').reduce((s, i) => s + i.sets, 0);
}

// ---------------------------------------------------------------- progressie
export const MAX_BAND_STEPS = 3;

/** Alle MAIN-sets van een oefening uit vorige sessies, nieuwste sessie eerst: [{ date, sets }] */
export function historyOf(code, sessions, exceptDate = null) {
  return Object.entries(sessions)
    .filter(([d, s]) => d !== exceptDate && s.sets?.some((x) => x.code === code && x.block === 'MAIN'))
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([date, s]) => ({ date, sets: s.sets.filter((x) => x.code === code && x.block === 'MAIN') }));
}

/** Sets van de laatste keer dat je deze oefening deed (voor "vorige keer"). */
export function previousSets(code, sessions, exceptDate = null) {
  return historyOf(code, sessions, exceptDate)[0]?.sets || [];
}

/**
 * Evalueert een opgeslagen sessie: voorstellen per keten + nieuwe records.
 * @returns { suggestions: [{ chain, kind, from, to, band, steps, message }], records: [{ code, value }] }
 */
export function evaluate(date, sessions, levels, equipment) {
  const session = sessions[date];
  const byCodeMap = new Map();
  for (const s of session.sets || []) {
    if (s.block !== 'MAIN') continue;
    if (!byCodeMap.has(s.code)) byCodeMap.set(s.code, []);
    byCodeMap.get(s.code).push(s);
  }
  const suggestions = [];
  const records = [];
  for (const [code, sets] of byCodeMap) {
    const ex = byCode(code);
    const best = Math.max(...sets.map((s) => s.value));
    const prevBest = Math.max(-1, ...historyOf(code, sessions, date).flatMap((h) => h.sets.map((s) => s.value)));
    if (prevBest >= 0 && best > prevBest) records.push({ code, name: ex.name, value: best, measure: ex.measure });
    if (!ex.chain) continue;
    const level = levels[ex.chain];
    if (!level || level.code !== code) continue;
    const s = suggest(ex, level, sets, sessions, date, equipment);
    if (s) suggestions.push(s);
  }
  return { suggestions, records };
}

function suggest(ex, level, sets, sessions, date, equipment) {
  const allTop = sets.length >= 2 && sets.every((s) => s.value >= Math.max(s.targetMax, 1));
  if (allTop) return up(ex, level, equipment);
  const allLow = sets.every((s) => s.value < ex.min);
  if (allLow) {
    const prev = historyOf(ex.code, sessions, date)[0];
    if (prev && prev.sets.every((s) => s.value < ex.min)) {
      const l = availableLadder(ex.chain, equipment);
      const i = l.findIndex((e) => e.code === ex.code);
      if (i > 0) {
        return { chain: ex.chain, kind: 'PREVIOUS_EXERCISE', from: ex.code, to: l[i - 1].code,
          message: `Twee keer op rij onder ${ex.min} bij ${ex.name}. Even een stap terug naar ${l[i - 1].name} om sterker te worden?` };
      }
    }
  }
  return null;
}

function up(ex, level, equipment) {
  if (ex.band) {
    const steps = level.steps ?? 0;
    if (steps < MAX_BAND_STEPS) {
      return { chain: ex.chain, kind: 'BAND_STEP', from: ex.code, to: ex.code, band: level.band, steps: steps + 1,
        message: `Alle sets van ${ex.name} op de bovengrens! Volgende keer één stap verder van de deur (${steps + 1} stappen) voor meer spanning.` };
    }
    const bi = BANDS.indexOf(level.band || 'LIGHT');
    if (bi < BANDS.length - 1) {
      const heavier = BANDS[bi + 1];
      return { chain: ex.chain, kind: 'HEAVIER_BAND', from: ex.code, to: ex.code, band: heavier, steps: 1,
        message: `Sterk! Tijd voor een zwaarder elastiek (${BAND_LABELS[heavier].toLowerCase()}), terug op 1 stap van de deur.` };
    }
  }
  const l = availableLadder(ex.chain, equipment);
  const i = l.findIndex((e) => e.code === ex.code);
  if (i >= 0 && i < l.length - 1) {
    const next = l[i + 1];
    return { chain: ex.chain, kind: 'NEXT_EXERCISE', from: ex.code, to: next.code,
      band: next.band ? 'LIGHT' : null, steps: next.band ? 1 : null,
      message: `Alle sets van ${ex.name} op de bovengrens – klaar voor ${next.name}!` };
  }
  return null;
}

/** Past een voorstel toe op de niveaus (geeft nieuwe niveaus terug). */
export function applySuggestion(levels, s) {
  const out = { ...levels };
  const cur = out[s.chain] || {};
  if (s.kind === 'BAND_STEP' || s.kind === 'HEAVIER_BAND') out[s.chain] = { ...cur, band: s.band, steps: s.steps };
  else {
    const to = byCode(s.to);
    out[s.chain] = to.band ? { code: to.code, band: s.band || cur.band || 'LIGHT', steps: s.steps ?? 1 } : { code: to.code };
  }
  return out;
}

// ---------------------------------------------------------------- andere sporten
export const ACTIVITIES = {
  SWIM: { label: 'Zwemmen', met: [6.0, 8.0, 10.0] },
  PADEL: { label: 'Padel', met: [5.0, 6.0, 8.0] },
  RUN: { label: 'Lopen', met: [7.0, 9.8, 11.5] },
  BIKE: { label: 'Fietsen', met: [4.0, 6.8, 10.0] },
  WALK: { label: 'Wandelen', met: [3.0, 3.5, 4.3] },
  FOOTBALL: { label: 'Voetbal', met: [5.0, 7.0, 10.0] },
  TENNIS: { label: 'Tennis', met: [5.0, 7.3, 8.0] },
  BOXING: { label: 'Boksen (club)', met: [5.5, 7.8, 12.0] },
  OTHER: { label: 'Andere sport', met: [4.0, 6.0, 8.0] },
};
export const INTENSITIES = ['Rustig', 'Matig', 'Zwaar'];

/** kcal = MET × gewicht × uren */
export function activityKcal(type, intensity, minutes, weight) {
  return Math.round(ACTIVITIES[type].met[intensity] * weight * (minutes / 60));
}
