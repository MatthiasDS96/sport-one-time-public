import { h, icon, chip, nl, toast, foodTabs, back, pageHead, macroTiles, toggleIn } from '../ui.js';
import * as store from '../store.js';
import { RECIPES } from '../data/recipes.js';
import { recipeById, recipeMacros, scaledIngredients, displayAmount } from '../nutrition/planner.js';

export function recipeLink(id, factor = 1, portions = 1) {
  const q = [factor !== 1 && `f=${factor}`, portions !== 1 && `n=${portions}`].filter(Boolean);
  return `#/recept/${id}${q.length ? `?${q.join('&')}` : ''}`;
}

/** Lijnen "recept · aantal porties" voor een meal-prepbeurt (Vandaag en Week). */
export const prepLines = (items) => items.map((it) => h('a', { class: 'prep-line', href: recipeLink(it.recipe.id, it.batch.factor, it.portions) },
  h('span', {}, it.recipe.name), h('span', { class: 'pill' }, `${it.portions} porties`), icon('chevronR', 'muted')));

const FILTERS = [
  ['alles', 'Alles', () => true],
  ['ontbijt', 'Ontbijt', (r) => r.type === 'ontbijt'],
  ['mealprep', 'Meal prep', (r) => r.type === 'hoofd' && r.mealprep],
  ['vers', 'Vers & weekend', (r) => r.type === 'hoofd' && r.fresh],
  ['snack', 'Tussendoor', (r) => r.type === 'snack'],
  ['kantoor', 'Meeneembaar', (r) => r.office],
];
let activeFilter = 'alles';
const excludedIds = () => store.get().food?.excluded || [];

export function renderRecipes(rerender) {
  const excluded = excludedIds();
  const fn = FILTERS.find((f) => f[0] === activeFilter)[2];
  return h('div', { class: 'page' },
    foodTabs('#/recepten'),
    pageHead(`${RECIPES.length} recepten`, 'Recepten'),
    h('div', { class: 'chips scroll' }, FILTERS.map(([key, label]) => h('button', {
      class: `chip-btn ${key === activeFilter ? 'on' : ''}`, onclick: () => { activeFilter = key; rerender(); },
    }, label))),
    h('div', { class: 'grid' }, RECIPES.filter(fn).map((r) => {
      const m = recipeMacros(r);
      const off = excluded.includes(r.id);
      return h('a', { class: `recipe-card ${off ? 'off' : ''}`, href: recipeLink(r.id) },
        h('div', { class: `recipe-art t-${r.type}` }, icon(r.type === 'snack' ? 'heart' : r.mealprep ? 'box' : r.type === 'ontbijt' ? 'today' : 'flame')),
        h('div', {},
          h('div', { class: 'recipe-name' }, r.name),
          h('div', { class: 'meal-meta' }, `${nl(m.kcal)} kcal · ${m.p} g eiwit`, r.minutes ? ` · ${r.totalMinutes || r.minutes} min` : ''),
          off ? h('div', { class: 'small warn' }, 'Wordt niet voorgesteld') : null));
    })));
}

export function renderRecipe(rerender, id, query) {
  const r = recipeById(id);
  if (!r) return h('div', { class: 'page' }, back(), h('p', {}, 'Recept niet gevonden.'));
  const factor = Number(query.get('f')) || 1;
  let portions = Number(query.get('n')) || 1;
  const off = excludedIds().includes(r.id);

  const ingWrap = h('div');
  const portionLabel = h('b', {});
  const draw = () => {
    portionLabel.textContent = `${portions} ${portions === 1 ? 'portie' : 'porties'}`;
    ingWrap.replaceChildren(h('ul', { class: 'ingredients' }, scaledIngredients(r, factor, portions).map((ing) => {
      const d = displayAmount(ing.id, ing.amount);
      return h('li', {}, h('span', { class: 'qty' }, d.free ? 'naar smaak' : d.qty), h('span', {}, d.name));
    })));
  };
  const setPortions = (n) => { if (n >= 1 && n <= 8) { portions = n; draw(); } };
  draw();

  return h('div', { class: 'page recipe' }, back(),
    h('div', { class: `recipe-hero t-${r.type}` },
      h('div', { class: 'eyebrow' }, { ontbijt: 'Ontbijt', hoofd: 'Hoofdgerecht', snack: 'Tussendoortje' }[r.type]),
      h('h1', {}, r.name),
      h('div', { class: 'chips' },
        r.minutes ? chip([icon('clock', 'tiny'), ` ${r.minutes} min${r.totalMinutes ? ` (totaal ${r.totalMinutes})` : ''}`]) : null,
        r.mealprep ? chip([icon('box', 'tiny'), ` meal prep · ${r.keeps} dagen koelkast`], 'accent') : null,
        r.freezes ? chip([icon('snow', 'tiny'), ' kan in de vriezer']) : null,
        r.office ? chip([icon('office', 'tiny'), ' meeneembaar']) : null,
        r.fresh ? chip('vers koken') : null)),
    h('div', { class: 'small muted' }, factor !== 1 ? `Per portie, aangepast aan jouw doel (× ${nl(factor, 2)})` : 'Per portie'),
    macroTiles(recipeMacros(r, factor)),
    h('div', { class: 'card' },
      h('div', { class: 'card-head' }, h('h2', {}, 'Ingrediënten'),
        h('div', { class: 'stepper' },
          h('button', { class: 'icon-btn', 'aria-label': 'Minder', onclick: () => setPortions(portions - 1) }, '−'),
          portionLabel,
          h('button', { class: 'icon-btn', 'aria-label': 'Meer', onclick: () => setPortions(portions + 1) }, '+'))),
      ingWrap),
    h('div', { class: 'card' }, h('h2', {}, 'Bereiding'), h('ol', { class: 'steps' }, r.steps.map((s) => h('li', {}, s)))),
    r.tip ? h('div', { class: 'card tip' }, h('b', {}, 'Tip '), r.tip) : null,
    h('button', {
      class: 'btn ghost wide',
      onclick: () => {
        store.update((s) => { s.food = { ...s.food, excluded: toggleIn(s.food?.excluded || [], r.id) }; });
        toast(off ? 'Wordt terug voorgesteld' : 'Wordt niet meer voorgesteld in nieuwe weekmenu\'s');
        rerender();
      },
    }, off ? 'Terug voorstellen in weekmenu' : 'Niet meer voorstellen'));
}
