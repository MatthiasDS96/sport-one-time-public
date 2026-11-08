// Koppeling tussen de planner (pure logica) en de opslag.
import * as store from '../store.js';
import { targets } from './calc.js';
import { generateWeek, mainRecipeIds, swapMeal, DEFAULT_FOOD_SETTINGS } from './planner.js';
import { addDays, today } from '../dates.js';
import { trainingDatesBetween } from '../training/training-store.js';

function trainingDates(monday) {
  return trainingDatesBetween(monday, addDays(monday, 6));
}

export function foodSettings() {
  return { ...DEFAULT_FOOD_SETTINGS, ...store.get().food };
}

export function currentTargets() {
  const p = store.get().profile;
  return p ? targets(p, today()) : null;
}

export function planFor(monday) {
  return store.get().plans[monday] || null;
}

/** Geeft het plan van die week; maakt het aan als het nog niet bestaat. */
export function ensurePlan(monday) {
  const existing = planFor(monday);
  if (existing) return existing;
  const t = currentTargets();
  if (!t) return null;
  const prev = planFor(addDays(monday, -7));
  const plan = generateWeek(monday, foodSettings(), t, { avoid: prev ? mainRecipeIds(prev) : [], trainingDates: trainingDates(monday) });
  store.update((s) => { s.plans[monday] = plan; });
  return plan;
}

/** Maakt een nieuw plan voor die week (andere recepten). Afgevinkte maaltijden blijven gelogd. */
export function regeneratePlan(monday) {
  const t = currentTargets();
  const old = planFor(monday);
  const prev = planFor(addDays(monday, -7));
  const avoid = [...(prev ? mainRecipeIds(prev) : []), ...(old ? mainRecipeIds(old) : [])];
  const plan = generateWeek(monday, foodSettings(), t, { seed: (old?.seed ?? 0) + 1, avoid, trainingDates: trainingDates(monday) });
  store.update((s) => {
    s.plans[monday] = plan;
    delete s.shopping[monday];
  });
  return plan;
}

export function swap(monday, date, slot) {
  const plan = planFor(monday);
  const next = swapMeal(plan, date, slot, foodSettings(), currentTargets());
  store.update((s) => { s.plans[monday] = next; });
  return next;
}

export function dayLog(date) {
  return store.get().log[date] || {};
}

function withLog(date, fn) {
  store.update((s) => {
    const l = s.log[date] || {};
    fn(l);
    s.log[date] = l;
  });
}

export function toggleEaten(date, slot) {
  withLog(date, (l) => {
    l.eaten = l.eaten || {};
    if (l.eaten[slot]) delete l.eaten[slot]; else l.eaten[slot] = true;
  });
}

export function setOffice(date, optionId) {
  withLog(date, (l) => {
    l.office = optionId;
    l.eaten = { ...(l.eaten || {}), middag: true };
  });
}

export function addExtra(date, extra) {
  const kcal = Number(String(extra.kcal).replace(',', '.'));
  if (!extra.name?.trim()) throw new Error('Geef een naam in.');
  if (!(kcal > 0 && kcal < 5000)) throw new Error('Geef een geldig aantal kcal in.');
  const p = Number(String(extra.p || 0).replace(',', '.')) || 0;
  withLog(date, (l) => { l.extras = [...(l.extras || []), { name: extra.name.trim(), kcal: Math.round(kcal), p: Math.round(p) }]; });
}

export function removeExtra(date, index) {
  withLog(date, (l) => { l.extras = (l.extras || []).filter((_, i) => i !== index); });
}

export function toggleShopping(monday, key) {
  store.update((s) => {
    const m = s.shopping[monday] || {};
    if (m[key]) delete m[key]; else m[key] = true;
    s.shopping[monday] = m;
  });
}

/** Plannen vanaf deze week opnieuw maken (na het wijzigen van profiel of voorkeuren). */
export function replanFromThisWeek(monday) {
  store.update((s) => {
    for (const key of Object.keys(s.plans)) if (key >= monday) delete s.plans[key];
  });
  ensurePlan(monday);
}
