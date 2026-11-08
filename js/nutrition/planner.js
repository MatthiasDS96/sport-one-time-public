// Weekplanner voor maaltijden: kiest recepten, schaalt porties naar het kcal-doel, verdeelt meal prep
// over de week en maakt de boodschappenlijst. Pure logica (geen DOM, geen opslag) zodat ze testbaar is.

import { FOODS, CATEGORIES } from '../data/foods.js';
import { RECIPES, OFFICE_OPTIONS } from '../data/recipes.js';
import { addDays, dayIndex, month } from '../dates.js';

export const SLOTS = ['ontbijt', 'snack1', 'middag', 'snack2', 'avond'];
export const SLOT_LABELS = {
  ontbijt: 'Ontbijt', snack1: 'Tussendoortje', middag: 'Middag', snack2: 'Tussendoortje', avond: 'Avond',
};

export const PREP_PRESETS = {
  'zo-wo': { label: 'Zondag + woensdag', help: 'Zondag koken voor ma–wo, woensdagavond voor wo–za. Weekend vers.' },
  zo: { label: 'Enkel zondag', help: 'Zondag koken voor de hele week; porties voor do–za invriezen.' },
  geen: { label: 'Geen meal prep', help: 'Elke dag vers koken.' },
};

/** Standaardinstellingen voor het eetschema. */
export const DEFAULT_FOOD_SETTINGS = {
  officeDays: [1, 3],        // dinsdag en donderdag
  officeLunch: 'out',        // 'out' = buiten eten, 'prep' = meal prep meenemen
  prep: 'zo-wo',
  excluded: [],              // recept-id's die je niet wil
};

const PLURAL = {
  ei: 'eieren', banaan: 'bananen', appel: 'appels', wrap: 'wraps', rijstwafel: 'rijstwafels',
  citroen: 'citroenen', bouillon: 'bouillonblokjes', pudding: 'proteïnepuddings', eiwitreep: 'proteïnerepen',
};

export const recipeById = (id) => RECIPES.find((r) => r.id === id);
export const officeOption = (id) => OFFICE_OPTIONS.find((o) => o.id === id);

// ---------------------------------------------------------------------------
// Schalen en voedingswaarden
// ---------------------------------------------------------------------------

/** Rondt een hoeveelheid af tot iets dat je in de keuken kan afwegen of tellen. */
export function roundAmount(food, x) {
  if (food.free || x <= 0) return 0;
  if (food.unit === 'stuk') {
    const step = food.half ? 0.5 : (x < 1 ? 0.25 : 1);
    return Math.max(step, Math.round(x / step) * step);
  }
  if (x <= 20) return Math.max(1, Math.round(x));
  if (x <= 100) return Math.round(x / 5) * 5;
  return Math.round(x / 10) * 10;
}

function gramsOf(food, amount) {
  return food.unit === 'stuk' ? amount * food.pieceG : amount;
}

function addMacros(sum, food, amount) {
  const g = gramsOf(food, amount) / 100;
  sum.kcal += food.k * g;
  sum.p += food.p * g;
  sum.c += food.c * g;
  sum.f += food.f * g;
  return sum;
}

const emptyMacros = () => ({ kcal: 0, p: 0, c: 0, f: 0 });

export function roundMacros(m) {
  return { kcal: Math.round(m.kcal), p: Math.round(m.p), c: Math.round(m.c), f: Math.round(m.f) };
}

/**
 * Ingrediënten van een recept voor `portions` porties, elke portie geschaald met `factor`.
 * Elke portie wordt apart afgerond (zo klopt wat je afweegt met wat er geteld wordt).
 */
export function scaledIngredients(recipe, factor = 1, portions = 1) {
  return recipe.ingredients.map(([id, base]) => {
    const food = FOODS[id];
    if (!food) throw new Error(`Onbekend ingrediënt '${id}' in ${recipe.id}`);
    const perPortion = roundAmount(food, base * factor);
    return { id, food, amount: perPortion * portions, perPortion };
  });
}

/** Voedingswaarden van één portie. */
export function recipeMacros(recipe, factor = 1) {
  const sum = emptyMacros();
  for (const ing of scaledIngredients(recipe, factor, 1)) addMacros(sum, ing.food, ing.perPortion);
  return roundMacros(sum);
}

/** Schaalfactor zodat één portie ongeveer `targetKcal` heeft (afgerond op 0,05). */
export function factorFor(recipe, targetKcal) {
  const base = recipeMacros(recipe, 1).kcal;
  if (!base) return 1;
  const raw = targetKcal / base;
  return Math.min(1.6, Math.max(0.7, Math.round(raw * 20) / 20));
}

/** Leesbare hoeveelheid: { qty: '3 sneden', name: 'volkorenbrood' } of { qty: '150 g', name: 'kipfilet' }. */
export function displayAmount(id, amount) {
  const food = FOODS[id];
  if (food.free) return { qty: '', name: food.n, free: true };
  if (food.unit === 'stuk') {
    const q = fraction(amount);
    if (food.piece) return { qty: `${q} ${amount > 1 ? food.pieces : food.piece}`, name: food.n };
    return { qty: q, name: amount > 1 && PLURAL[id] ? PLURAL[id] : food.n };
  }
  const unit = food.unit === 'ml' ? 'ml' : 'g';
  if (amount >= 1000) {
    const big = (Math.round(amount / 100) / 10).toLocaleString('nl-BE');
    return { qty: `${big} ${unit === 'ml' ? 'l' : 'kg'}`, name: food.n };
  }
  return { qty: `${amount} ${unit}`, name: food.n };
}

function fraction(x) {
  const whole = Math.floor(x + 1e-9);
  const rest = Math.round((x - whole) * 4) / 4;
  const sym = { 0.25: '¼', 0.5: '½', 0.75: '¾' }[rest] || '';
  if (!whole) return sym || '0';
  return `${whole}${sym}`;
}

// ---------------------------------------------------------------------------
// Doelen per maaltijd
// ---------------------------------------------------------------------------

const BREAKFAST_SHARE = 0.22;

export function mealTargets(t, snackKcalPerDay) {
  const breakfast = t.kcal * BREAKFAST_SHARE;
  const main = (t.kcal - breakfast - snackKcalPerDay) / 2;
  return { breakfast: Math.round(breakfast), main: Math.round(main) };
}

// ---------------------------------------------------------------------------
// Weekplan maken
// ---------------------------------------------------------------------------

/** Kleine, voorspelbare random-generator (zelfde seed → zelfde plan). */
export function rng(seedText) {
  let h = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i++) {
    h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function inSeason(recipe, iso) {
  return !recipe.months || recipe.months.includes(month(iso));
}

function available(settings, iso) {
  const excluded = new Set(settings.excluded || []);
  return RECIPES.filter((r) => !excluded.has(r.id) && inSeason(r, iso));
}

/** Kiest het eerste recept dat aan `ok` voldoet, anders het eerste dat aan `fallback` voldoet. */
function pick(candidates, ok, fallback = () => true) {
  return candidates.find(ok) || candidates.find(fallback) || null;
}

/** Hoofdmaaltijd-slots als index: maandag middag = 0, maandag avond = 1, … zondag avond = 13. */
const slotIndex = (day, slot) => day * 2 + (slot === 'avond' ? 1 : 0);
const slotOf = (index) => ({ day: Math.floor(index / 2), slot: index % 2 ? 'avond' : 'middag' });

/** Bereiken (inclusief) van hoofdmaaltijden die uit één meal-prepbeurt komen. */
function prepRanges(prep) {
  if (prep === 'zo-wo') return [{ id: 'b1', when: 'zondag', from: 0, to: 4 }, { id: 'b2', when: 'woensdag', from: 5, to: 10 }];
  if (prep === 'zo') return [{ id: 'b1', when: 'zondag', from: 0, to: 10 }];
  return [];
}

/**
 * Maakt een weekplan.
 * @param monday   ISO-datum van de maandag
 * @param settings eetschema-instellingen (DEFAULT_FOOD_SETTINGS)
 * @param t        dagdoelen (calc.targets)
 * @param opts     { seed, avoid: [recept-id's van vorige week] }
 */
export function generateWeek(monday, settings, t, opts = {}) {
  const s = { ...DEFAULT_FOOD_SETTINGS, ...settings };
  const random = rng(`${monday}#${opts.seed ?? 0}`);
  const avoid = new Set(opts.avoid || []);
  const pool = shuffle(available(s, monday), random);
  const dates = [...Array(7)].map((_, i) => addDays(monday, i));
  const isOffice = (day) => s.officeDays.includes(day);
  const officeOut = (day) => isOffice(day) && s.officeLunch === 'out';

  const days = Object.fromEntries(dates.map((d) => [d, {}]));

  // --- tussendoortjes: één eiwitrijk + één ander; op kantoordagen meeneembaar ---
  const snacks = pool.filter((r) => r.type === 'snack' && !r.postWorkout);
  const post = pool.find((r) => r.postWorkout);
  const trainingDates = new Set(opts.trainingDates || []);
  let prev1 = null; let prev2 = null;
  dates.forEach((date, day) => {
    const office = isOffice(day);
    const s1 = pick(snacks, (r) => r.protein && (!office || r.office) && r.id !== prev1,
      (r) => r.protein && (!office || r.office));
    const s2 = pick(snacks, (r) => !r.protein && (!office || r.office) && r.id !== prev2, (r) => !r.protein);
    snacks.push(snacks.splice(snacks.indexOf(s1), 1)[0]); // achteraan zetten → afwisseling
    snacks.push(snacks.splice(snacks.indexOf(s2), 1)[0]);
    days[date].snack1 = { recipe: s1.id, factor: 1 };
    days[date].snack2 = post && trainingDates.has(date) ? { recipe: post.id, factor: 1, post: true } : { recipe: s2.id, factor: 1 };
    prev1 = s1.id; prev2 = s2.id;
  });
  const snackKcal = dates.reduce((sum, d) =>
    sum + recipeMacros(recipeById(days[d].snack1.recipe)).kcal + recipeMacros(recipeById(days[d].snack2.recipe)).kcal, 0) / 7;
  const mt = mealTargets(t, snackKcal);

  // --- ontbijt: snel op kantoordagen, afwisselen ---
  const breakfasts = pool.filter((r) => r.type === 'ontbijt');
  let prevB = null;
  dates.forEach((date, day) => {
    const office = isOffice(day);
    const weekend = day >= 5;
    const b = pick(breakfasts, (r) => r.id !== prevB && (!office || r.quick) && (weekend || r.minutes <= 10),
      (r) => r.id !== prevB);
    breakfasts.push(breakfasts.splice(breakfasts.indexOf(b), 1)[0]);
    days[date].ontbijt = { recipe: b.id, factor: factorFor(b, mt.breakfast) };
    prevB = b.id;
  });

  // --- hoofdmaaltijden ---
  const mains = pool.filter((r) => r.type === 'hoofd');
  const used = new Set();
  const nextMain = (ok) => {
    const r = pick(mains, (x) => !used.has(x.id) && !avoid.has(x.id) && ok(x), (x) => !used.has(x.id) && ok(x))
      || pick(mains, ok);
    used.add(r.id);
    return r;
  };

  dates.forEach((date, day) => {
    if (officeOut(day)) days[date].middag = { office: true };
  });

  const covered = new Set();
  const batches = [];
  for (const range of prepRanges(s.prep)) {
    const slots = [];
    for (let i = range.from; i <= range.to; i++) {
      const { day, slot } = slotOf(i);
      covered.add(i);
      if (slot === 'middag' && officeOut(day)) continue;
      slots.push({ date: dates[day], slot });
    }
    if (!slots.length) continue;
    const k = Math.min(3, Math.ceil(slots.length / 3));
    const recipes = [...Array(k)].map(() => nextMain((r) => r.mealprep && (s.prep !== 'zo' || r.freezes || r.keeps >= 4)));
    recipes.forEach((r, ri) => {
      const mine = slots.filter((_, si) => si % k === ri);
      const batch = {
        id: `${range.id}-${ri}`, when: range.when, recipe: r.id, factor: factorFor(r, mt.main),
        slots: mine,
      };
      batches.push(batch);
      for (const sl of mine) days[sl.date][sl.slot] = { recipe: r.id, factor: batch.factor, batch: batch.id };
    });
  }

  // vers: alles wat niet uit meal prep komt (en geen kantoorlunch is)
  for (let i = 0; i < 14; i++) {
    const { day, slot } = slotOf(i);
    const date = dates[day];
    if (covered.has(i) || days[date][slot]) continue;
    const weekend = day >= 5;
    const r = nextMain((x) => (weekend ? x.fresh : (x.totalMinutes ?? x.minutes ?? 30) <= 35));
    days[date][slot] = { recipe: r.id, factor: factorFor(r, mt.main) };
  }

  return { monday, prep: s.prep, created: new Date().toISOString(), seed: opts.seed ?? 0, batches, days };
}

/** Alle hoofdgerecht-id's uit een plan (om volgende week te vermijden). */
export function mainRecipeIds(plan) {
  const ids = new Set();
  for (const day of Object.values(plan.days)) {
    for (const slot of ['middag', 'avond']) if (day[slot]?.recipe) ids.add(day[slot].recipe);
  }
  return [...ids];
}

/**
 * Wisselt een maaltijd voor een ander recept van hetzelfde soort. Bij meal prep wisselt de hele batch.
 * Geeft een nieuw plan terug (het origineel blijft ongewijzigd).
 */
export function swapMeal(plan, date, slot, settings, t) {
  const p = structuredClone(plan);
  const entry = p.days[date]?.[slot];
  if (!entry || entry.office) return p;
  const current = recipeById(entry.recipe);
  const s = { ...DEFAULT_FOOD_SETTINGS, ...settings };
  const inPlan = new Set(mainRecipeIds(p));
  const random = rng(`${date}${slot}${Date.now()}`);
  const pool = shuffle(available(s, date), random).filter((r) => r.type === current.type && r.id !== current.id && !r.postWorkout);
  const office = s.officeDays.includes(dayIndex(date));
  let next;
  if (entry.batch) {
    next = pick(pool, (r) => r.mealprep && !inPlan.has(r.id), (r) => r.mealprep);
  } else if (current.type === 'hoofd') {
    next = pick(pool, (r) => !inPlan.has(r.id) && (!!r.fresh === !!current.fresh), (r) => !inPlan.has(r.id));
  } else if (current.type === 'snack') {
    next = pick(pool, (r) => !!r.protein === !!current.protein && (!office || r.office), () => true);
  } else {
    next = pick(pool, (r) => !office || r.quick, () => true);
  }
  if (!next) return p;
  const factor = current.type === 'snack' ? 1
    : factorFor(next, recipeMacros(current, entry.factor).kcal);
  if (entry.batch) {
    const batch = p.batches.find((b) => b.id === entry.batch);
    batch.recipe = next.id;
    batch.factor = factor;
    for (const sl of batch.slots) p.days[sl.date][sl.slot] = { recipe: next.id, factor, batch: batch.id };
  } else {
    p.days[date][slot] = { recipe: next.id, factor };
  }
  return p;
}

// ---------------------------------------------------------------------------
// Dagtotalen
// ---------------------------------------------------------------------------

/** Schatting van een kantoorlunch (gekozen optie of een gemiddelde). */
export function officeMacros(plan, optionId) {
  const opt = officeOption(optionId);
  if (opt && opt.k != null) return { kcal: opt.k, p: opt.p, c: 0, f: 0, estimate: true };
  const b = plan.batches[0];
  if (b) return { ...recipeMacros(recipeById(b.recipe), b.factor), estimate: true };
  return { kcal: 600, p: 30, c: 0, f: 0, estimate: true };
}

export function entryMacros(plan, entry, dayLog) {
  if (!entry) return emptyMacros();
  if (entry.office) return officeMacros(plan, dayLog?.office);
  return recipeMacros(recipeById(entry.recipe), entry.factor);
}

/** { planned, eaten } voor één dag; extra's uit het logboek tellen mee bij gegeten. */
export function dayTotals(plan, date, dayLog = {}) {
  const planned = emptyMacros();
  const eaten = emptyMacros();
  const day = plan.days[date] || {};
  for (const slot of SLOTS) {
    const m = entryMacros(plan, day[slot], dayLog);
    for (const k of ['kcal', 'p', 'c', 'f']) planned[k] += m[k];
    if (dayLog.eaten?.[slot]) for (const k of ['kcal', 'p', 'c', 'f']) eaten[k] += m[k];
  }
  for (const x of dayLog.extras || []) {
    eaten.kcal += Number(x.kcal) || 0;
    eaten.p += Number(x.p) || 0;
  }
  return { planned: roundMacros(planned), eaten: roundMacros(eaten) };
}

// ---------------------------------------------------------------------------
// Boodschappenlijst
// ---------------------------------------------------------------------------

/**
 * Boodschappen voor de dagen `fromDate` t.e.m. `toDate` (standaard de hele week).
 * @returns { groups: [{ cat, label, items: [{ id, qty, name, amount }] }], pantry: [...] }
 */
export function shoppingList(plan, fromDate = plan.monday, toDate = addDays(plan.monday, 6)) {
  const totals = new Map();
  for (const [date, day] of Object.entries(plan.days)) {
    if (date < fromDate || date > toDate) continue;
    for (const slot of SLOTS) {
      const e = day[slot];
      if (!e || e.office) continue;
      for (const ing of scaledIngredients(recipeById(e.recipe), e.factor, 1)) {
        totals.set(ing.id, (totals.get(ing.id) || 0) + ing.amount);
      }
    }
  }
  const groups = [];
  const pantry = [];
  for (const [cat, label] of CATEGORIES) {
    const items = [];
    for (const [id, amount] of totals) {
      const food = FOODS[id];
      if (food.cat !== cat) continue;
      const rounded = food.unit === 'stuk' ? Math.ceil(amount - 1e-9)
        : amount >= 100 ? Math.ceil(amount / 50) * 50 : Math.ceil(amount / 10) * 10;
      const item = { id, amount: rounded, ...displayAmount(id, rounded) };
      if (food.free && food.buy) item.qty = food.buy;
      (food.pantry ? pantry : items).push(item);
    }
    items.sort((a, b) => a.name.localeCompare(b.name, 'nl'));
    if (items.length) groups.push({ cat, label, items });
  }
  pantry.sort((a, b) => a.name.localeCompare(b.name, 'nl'));
  return { groups, pantry };
}

/** Wat moet je bij een meal-prepbeurt koken: [{ batch, recipe, portions, ingredients }] */
export function prepSessions(plan) {
  const byWhen = new Map();
  for (const b of plan.batches) {
    const recipe = recipeById(b.recipe);
    const list = byWhen.get(b.when) || [];
    list.push({ batch: b, recipe, portions: b.slots.length, macros: recipeMacros(recipe, b.factor) });
    byWhen.set(b.when, list);
  }
  return [...byWhen.entries()].map(([when, items]) => ({ when, items }));
}
