// Eenvoudige tests zonder framework. Open tests/tests.html (via een lokale server) of headless Chrome.
import { FOODS } from '../js/data/foods.js';
import { RECIPES } from '../js/data/recipes.js';
import { targets, ageOn } from '../js/nutrition/calc.js';
import {
  generateWeek, recipeMacros, factorFor, roundAmount, scaledIngredients, shoppingList, dayTotals,
  swapMeal, displayAmount, SLOTS, recipeById, prepSessions,
} from '../js/nutrition/planner.js';
import { fromBelgian, mondayOf, dayIndex, addDays } from '../js/dates.js';

const results = [];
function test(name, fn) {
  try {
    fn();
    results.push(`OK   ${name}`);
  } catch (e) {
    results.push(`FAIL ${name}: ${e.message}`);
  }
}
function eq(a, b, msg = '') {
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg} verwacht ${JSON.stringify(b)}, kreeg ${JSON.stringify(a)}`);
}
function ok(cond, msg) {
  if (!cond) throw new Error(msg);
}

const profile = { sex: 'm', birth: '1995-06-15', height: 178, weight: 75, goal: 'recomp', trainingDays: 3 };
const t = targets(profile, '2026-11-08');
const settings = { officeDays: [1, 3], officeLunch: 'out', prep: 'zo-wo', excluded: [] };

test('leeftijd', () => {
  eq(ageOn('2000-02-01', '2026-11-08'), 26);
  eq(ageOn('2000-11-09', '2026-11-08'), 25);
});

test('doelen zoals desktopversie (BMR 1713, ± 2050 kcal, 150 g eiwit)', () => {
  eq(t.bmr, 1713);
  eq(t.maintenance, 2398);
  eq(t.kcal, 2050);
  eq(t.protein, 150);
  ok(t.carbs > 150 && t.carbs < 260, `koolhydraten ${t.carbs}`);
});

test('alle ingrediënten bestaan', () => {
  for (const r of RECIPES) for (const [id] of r.ingredients) ok(FOODS[id], `${r.id}: ${id}`);
});

test('niets dat de gebruiker niet lust', () => {
  const banned = [/aubergine/, /olijven/, /geitenkaas/, /platte kaas/, /witte pens/, /(^| )kaas/];
  for (const r of RECIPES) {
    for (const [id] of r.ingredients) {
      const n = FOODS[id].n.toLowerCase();
      for (const b of banned) ok(!b.test(n), `${r.id} bevat ${n}`);
    }
  }
});

test('recepten hebben realistische kcal', () => {
  for (const r of RECIPES) {
    const m = recipeMacros(r);
    if (r.type === 'hoofd') ok(m.kcal >= 450 && m.kcal <= 700, `${r.id}: ${m.kcal} kcal`);
    if (r.type === 'ontbijt') ok(m.kcal >= 350 && m.kcal <= 550, `${r.id}: ${m.kcal} kcal`);
    if (r.type === 'snack') ok(m.kcal >= 100 && m.kcal <= 260, `${r.id}: ${m.kcal} kcal`);
    ok(r.steps.length >= 1, `${r.id} heeft geen stappen`);
  }
});

test('afronden', () => {
  eq(roundAmount(FOODS.kipfilet, 163), 160);
  eq(roundAmount(FOODS.kipfilet, 167), 170);
  eq(roundAmount(FOODS.rijst, 77), 75);
  eq(roundAmount(FOODS.sojasaus, 16.4), 16);
  eq(roundAmount(FOODS.ei, 3.4), 3);
  eq(roundAmount(FOODS.banaan, 0.6), 0.5);
  eq(roundAmount(FOODS.peperzout, 5), 0);
});

test('weergave hoeveelheden', () => {
  eq(displayAmount('brood', 3), { qty: '3 sneden', name: 'volkorenbrood' });
  eq(displayAmount('ei', 7), { qty: '7', name: 'eieren' });
  eq(displayAmount('banaan', 0.5), { qty: '½', name: 'banaan' });
  eq(displayAmount('mosselen', 1000).qty, '1 kg');
  eq(displayAmount('kipfilet', 1450).qty, '1,5 kg');
});

test('schaalfactor binnen grenzen', () => {
  const r = recipeById('kip-teriyaki');
  const f = factorFor(r, 600);
  ok(f >= 0.7 && f <= 1.6, `factor ${f}`);
  ok(Math.abs(recipeMacros(r, f).kcal - 600) < 60, `kcal ${recipeMacros(r, f).kcal}`);
});

const plan = generateWeek('2026-11-09', settings, t, { seed: 1 });

test('weekplan heeft alle maaltijden', () => {
  const dates = Object.keys(plan.days);
  eq(dates.length, 7);
  for (const d of dates) for (const s of SLOTS) ok(plan.days[d][s], `${d} ${s} ontbreekt`);
});

test('kantoordagen: middag buiten de deur', () => {
  ok(plan.days['2026-11-10'].middag.office, 'dinsdag');
  ok(plan.days['2026-11-12'].middag.office, 'donderdag');
  ok(!plan.days['2026-11-11'].middag.office, 'woensdag');
});

test('meal prep zondag + woensdag, weekend vers', () => {
  const whens = [...new Set(plan.batches.map((b) => b.when))];
  eq(whens, ['zondag', 'woensdag']);
  const portions = plan.batches.reduce((s, b) => s + b.slots.length, 0);
  eq(portions, 9); // ma m+a, di a, wo m | wo a, do a, vr m+a, za m
  for (const b of plan.batches) ok(recipeById(b.recipe).mealprep, `${b.recipe} is geen meal prep`);
  ok(recipeById(plan.days['2026-11-14'].avond.recipe).fresh, 'zaterdagavond vers');
  ok(recipeById(plan.days['2026-11-15'].avond.recipe).fresh, 'zondagavond vers');
  const sessions = prepSessions(plan);
  eq(sessions.length, 2);
});

test('geen hoofdgerecht dubbel buiten zijn batch', () => {
  const seen = new Map();
  for (const [d, day] of Object.entries(plan.days)) {
    for (const s of ['middag', 'avond']) {
      const e = day[s];
      if (!e.recipe) continue;
      const key = e.batch || `${d}${s}`;
      if (seen.has(e.recipe)) eq(seen.get(e.recipe), key, `${e.recipe} komt twee keer voor`);
      seen.set(e.recipe, key);
    }
  }
});

test('dagtotaal dicht bij het doel', () => {
  const d = dayTotals(plan, '2026-11-09', {}).planned;
  ok(Math.abs(d.kcal - t.kcal) <= 200, `maandag ${d.kcal} kcal vs ${t.kcal}`);
  ok(d.p >= t.proteinMin, `eiwit ${d.p} < ${t.proteinMin}`);
});

test('gegeten telt enkel afgevinkte maaltijden + extra', () => {
  const log = { eaten: { ontbijt: true }, extras: [{ name: 'koekje', kcal: 100, p: 1 }] };
  const d = dayTotals(plan, '2026-11-09', log);
  const bf = plan.days['2026-11-09'].ontbijt;
  eq(d.eaten.kcal, recipeMacros(recipeById(bf.recipe), bf.factor).kcal + 100);
});

test('kantoorlunch gebruikt gekozen optie', () => {
  const d1 = dayTotals(plan, '2026-11-10', { eaten: { middag: true }, office: 'kfc' });
  eq(d1.eaten.kcal, 1000);
});

test('boodschappenlijst bevat meal-prepporties', () => {
  const list = shoppingList(plan);
  const all = list.groups.flatMap((g) => g.items);
  ok(all.length > 10, 'te weinig items');
  ok(list.pantry.length > 0, 'geen voorraad');
  const b = plan.batches[0];
  const r = recipeById(b.recipe);
  const main = r.ingredients[0][0];
  const perPortion = scaledIngredients(r, b.factor, 1)[0].perPortion;
  const item = all.find((i) => i.id === main);
  ok(item.amount >= perPortion * b.slots.length, `${main}: ${item.amount} < ${perPortion * b.slots.length}`);
  ok(!all.some((i) => FOODS[i.id].pantry), 'voorraad hoort apart');
});

test('wissel meal prep wisselt de hele batch', () => {
  const b = plan.batches[0];
  const first = b.slots[0];
  const p2 = swapMeal(plan, first.date, first.slot, settings, t);
  const nb = p2.batches.find((x) => x.id === b.id);
  ok(nb.recipe !== b.recipe, 'zelfde recept');
  for (const sl of nb.slots) eq(p2.days[sl.date][sl.slot].recipe, nb.recipe);
  eq(plan.batches[0].recipe, b.recipe, 'origineel gewijzigd');
});

test('seizoen: geen asperges in november', () => {
  for (let seed = 0; seed < 20; seed++) {
    const p = generateWeek('2026-11-09', settings, t, { seed });
    for (const day of Object.values(p.days)) ok(day.avond.recipe !== 'asperges-vlaamse-wijze', `seed ${seed}`);
  }
});

test('andere voorkeuren: geen meal prep, meal prep mee naar kantoor', () => {
  const p = generateWeek('2026-11-09', { ...settings, prep: 'geen', officeLunch: 'prep' }, t, { seed: 3 });
  eq(p.batches.length, 0);
  ok(!p.days['2026-11-10'].middag.office, 'geen kantoorlunch');
  const p2 = generateWeek('2026-11-09', { ...settings, prep: 'zo' }, t, { seed: 3 });
  eq(new Set(p2.batches.map((b) => b.when)).size, 1);
});

test('datums', () => {
  eq(fromBelgian('01/02/2000'), '2000-02-01');
  eq(fromBelgian('31/02/2020'), null);
  eq(mondayOf('2026-11-08'), '2026-11-02');
  eq(dayIndex('2026-11-09'), 0);
  eq(addDays('2026-12-31', 1), '2027-01-01');
});

const failed = results.filter((r) => r.startsWith('FAIL')).length;
document.getElementById('out').textContent =
  `${results.join('\n')}\n\n${failed ? `${failed} MISLUKT` : `ALLE ${results.length} TESTS OK`}`;
