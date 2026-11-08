// Koppeling tussen de trainingslogica en de opslag.
//
// state.training = {
//   level: 'BEGINNER' | 'INTERMEDIATE', equipment: [...], days: [0, 2, 4],
//   plan: { start, created, days: [{ date, week, phase, type, workout, finisher }] },
//   levels: { CHAIN: { code, band?, steps? } },
//   sessions: { datum: { workout, title, status, started, ended, durationMin, rpe, notes, sets: [...] } },
//   activities: [{ id, date, type, intensity, minutes, kcal, replaces }]
// }
import * as store from '../store.js';
import { initialLevels, byCode, hasEquipment } from './catalog.js';
import {
  createPlan, replanFrom, planEnd, resolve, plannedMainSets, evaluate, applySuggestion, workoutName, activityKcal,
} from './library.js';
import { today, addDays, mondayOf } from '../dates.js';

export const DEFAULT_TRAINING = {
  level: 'BEGINNER',
  equipment: ['BAND', 'DOOR_ANCHOR', 'PUNCHING_BAG', 'BENCH'],
  days: [0, 2, 4],
};

const DAYS_FOR_COUNT = { 1: [2], 2: [1, 4], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 3, 4], 6: [0, 1, 2, 3, 4, 5] };

export function training() {
  return store.get().training || null;
}

/** Zorgt dat er een trainingsplan is (ook voor wie al een profiel had van vóór het trainingsgedeelte). */
export function ensureTraining() {
  const s = store.get();
  if (!s.profile) return null;
  const t = s.training;
  const todayIso = today();
  if (t?.plan && planEnd(t.plan) >= todayIso) return t;
  store.update((st) => {
    const base = st.training || {
      ...DEFAULT_TRAINING,
      days: DAYS_FOR_COUNT[st.profile.trainingDays] || DEFAULT_TRAINING.days,
      sessions: {}, activities: [],
    };
    base.levels = initialLevels(base.level, base.equipment, base.levels || {});
    base.plan = createPlan(todayIso, base.days);
    st.training = base;
  });
  return store.get().training;
}

/** Instellingen wijzigen (dagen, niveau, materiaal). Dagen gewijzigd → vanaf vandaag opnieuw plannen. */
export function updateTrainingSettings({ days, level, equipment }) {
  store.update((st) => {
    const t = st.training;
    const daysChanged = days && JSON.stringify([...days].sort()) !== JSON.stringify([...t.days].sort());
    if (days) {
      if (!days.length || days.length > 6) throw new Error('Kies 1 tot 6 trainingsdagen.');
      t.days = [...days].sort((a, b) => a - b);
      st.profile.trainingDays = t.days.length;
    }
    if (level) t.level = level;
    if (equipment) t.equipment = equipment;
    t.levels = initialLevels(t.level, t.equipment, level ? {} : t.levels);
    if (daysChanged) t.plan = replanFrom(t.plan, today(), t.days);
  });
}

/** Nieuw schema van 13 weken vanaf nu (geschiedenis blijft bewaard). */
export function restartPlan() {
  store.update((st) => { st.training.plan = createPlan(today(), st.training.days); });
}

export function dayOn(date) {
  return training()?.plan.days.find((d) => d.date === date) || null;
}

export function weekDays(monday) {
  const end = addDays(monday, 6);
  return (training()?.plan.days || []).filter((d) => d.date >= monday && d.date <= end);
}

export function isTrainingDay(date) {
  return !!dayOn(date);
}

export function trainingDatesBetween(from, to) {
  return (training()?.plan.days || []).filter((d) => d.date >= from && d.date <= to).map((d) => d.date);
}

export function resolveDay(day) {
  const t = training();
  return resolve(day, t.levels, t.equipment);
}

export function sessionOn(date) {
  return training()?.sessions?.[date] || null;
}

export function activityReplacing(date) {
  return (training()?.activities || []).find((a) => a.replaces === date) || null;
}

/** 'done' | 'partial' | 'skipped' | 'substituted' | 'missed' | 'planned' | null (geen training) */
export function statusOn(date) {
  const day = dayOn(date);
  if (!day) return null;
  if (activityReplacing(date)) return 'substituted';
  const s = sessionOn(date);
  if (s) return { COMPLETED: 'done', PARTIAL: 'partial', SKIPPED: 'skipped' }[s.status] || 'done';
  return date < today() ? 'missed' : 'planned';
}

/** Training nog te doen (gepland, gemist of overgeslagen)? */
export const isOpen = (status) => status === 'planned' || status === 'missed' || status === 'skipped';
/** Telt als gedaan (ook deels of vervangen door een andere sport)? */
export const isDone = (status) => status === 'done' || status === 'partial' || status === 'substituted';

/**
 * Bewaart een uitgevoerde training.
 * @param r { date, workout, started, ended, rpe, notes, sets: [{ code, block, set, value, targetMax, band, steps }] }
 */
export function saveSession(r) {
  if (r.rpe != null && (r.rpe < 1 || r.rpe > 10)) throw new Error('Zwaarte moet tussen 1 en 10 liggen.');
  const day = dayOn(r.date);
  const w = day ? resolveDay(day) : null;
  const main = r.sets.filter((s) => s.block === 'MAIN' || s.block === 'CONDITIONING').length;
  const planned = w ? plannedMainSets(w) : 0;
  const durationMin = r.started && r.ended ? Math.max(1, Math.round((new Date(r.ended) - new Date(r.started)) / 60000)) : 0;
  store.update((st) => {
    st.training.sessions[r.date] = {
      workout: r.workout, title: workoutName(r.workout), status: main >= planned ? 'COMPLETED' : 'PARTIAL',
      started: r.started, ended: r.ended, durationMin, rpe: r.rpe ?? null, notes: r.notes?.trim() || null, sets: r.sets,
    };
  });
  const t = training();
  return evaluate(r.date, t.sessions, t.levels, t.equipment);
}

/** Training afsluiten zonder sets: afgevinkt of overgeslagen. */
function closeDay(date, status, notes) {
  const { workout } = dayOn(date);
  store.update((st) => { st.training.sessions[date] = { workout, title: workoutName(workout), status, notes, sets: [] }; });
}
export const markDone = (date) => closeDay(date, 'COMPLETED', 'Afgevinkt zonder details');
export const skip = (date, reason) => closeDay(date, 'SKIPPED', reason || null);

export function undo(date) {
  store.update((st) => {
    delete st.training.sessions[date];
    st.training.activities = st.training.activities.map((a) => (a.replaces === date ? { ...a, replaces: null } : a));
  });
}

/** Verplaatst een training naar een vrije dag in dezelfde week (vandaag of later). */
export function freeDaysToMove(date) {
  const monday = mondayOf(date);
  const taken = new Set(weekDays(monday).map((d) => d.date));
  const out = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(monday, i);
    if (d >= today() && !taken.has(d)) out.push(d);
  }
  return out;
}

export function moveDay(date, target) {
  if (!freeDaysToMove(date).includes(target)) {
    throw new Error('Je kan een training enkel verplaatsen naar een vrije dag van dezelfde week, vandaag of later.');
  }
  store.update((st) => {
    const d = st.training.plan.days.find((x) => x.date === date);
    d.date = target;
    st.training.plan.days.sort((a, b) => (a.date < b.date ? -1 : 1));
  });
}

export function applyProgress(suggestion) {
  store.update((st) => { st.training.levels = applySuggestion(st.training.levels, suggestion); });
}

export function setLevel(code) {
  const ex = byCode(code);
  const t = training();
  if (!ex.chain) throw new Error(`${ex.name} hoort niet bij een progressieketen.`);
  if (!hasEquipment(ex, t.equipment)) throw new Error(`Je hebt niet het nodige materiaal voor ${ex.name}.`);
  store.update((st) => {
    const cur = st.training.levels[ex.chain] || {};
    st.training.levels[ex.chain] = ex.band ? { code, band: cur.band || 'LIGHT', steps: cur.steps ?? 1 } : { code };
  });
}

export function setBand(chain, band, steps) {
  if (steps < 0 || steps > 10) throw new Error('Aantal stappen van de deur moet tussen 0 en 10 liggen.');
  store.update((st) => { st.training.levels[chain] = { ...st.training.levels[chain], band, steps }; });
}

/** Andere sport. Op een geplande trainingsdag (nog niet gedaan) vervangt ze de training. */
export function addActivity({ date, type, intensity, minutes, replace = true }) {
  const min = Number(minutes);
  if (!(min > 0 && min <= 600)) throw new Error('Geef een duur tussen 1 en 600 minuten in.');
  const weight = store.get().profile.weight;
  const kcal = activityKcal(type, intensity, min, weight);
  const replaces = replace && isOpen(statusOn(date)) ? date : null;
  store.update((st) => {
    if (replaces) delete st.training.sessions[date];
    st.training.activities.push({ id: Date.now(), date, type, intensity, minutes: min, kcal, replaces });
  });
  return { kcal, replaced: !!replaces };
}

export function activitiesOn(date) {
  return (training()?.activities || []).filter((a) => a.date === date);
}

export function removeActivity(id) {
  store.update((st) => { st.training.activities = st.training.activities.filter((a) => a.id !== id); });
}

/** Reeks: aantal opeenvolgende geplande trainingen (tot vandaag) die gedaan of vervangen zijn. */
export function streak() {
  const t = training();
  if (!t) return 0;
  const past = t.plan.days.filter((d) => d.date <= today()).reverse();
  let n = 0;
  for (const d of past) {
    const s = statusOn(d.date);
    if (isDone(s)) n++;
    else if (s === 'planned') continue; // vandaag nog niet gedaan
    else break;
  }
  return n;
}
