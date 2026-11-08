import { h, icon, chip, nl, toast, foodTabs } from '../ui.js';
import * as store from '../store.js';
import { RECIPES } from '../data/recipes.js';
import { recipeById, recipeMacros, scaledIngredients, displayAmount } from '../nutrition/planner.js';

export function recipeLink(id, factor = 1, portions = 1) {
  const q = [];
  if (factor !== 1) q.push(`f=${factor}`);
  if (portions !== 1) q.push(`n=${portions}`);
  return `#/recept/${id}${q.length ? `?${q.join('&')}` : ''}`;
}

const FILTERS = [
  ['alles', 'Alles', () => true],
  ['ontbijt', 'Ontbijt', (r) => r.type === 'ontbijt'],
  ['mealprep', 'Meal prep', (r) => r.type === 'hoofd' && r.mealprep],
  ['vers', 'Vers & weekend', (r) => r.type === 'hoofd' && r.fresh],
  ['snack', 'Tussendoor', (r) => r.type === 'snack'],
  ['kantoor', 'Meeneembaar', (r) => r.office],
];
let activeFilter = 'alles';

export function renderRecipes(rerender) {
  const excluded = new Set(store.get().food?.excluded || []);
  const [, , fn] = FILTERS.find((f) => f[0] === activeFilter);
  const list = RECIPES.filter(fn);
  return h('div', { class: 'page' },
    foodTabs('recepten'),
    h('div', { class: 'page-head' }, h('div', {}, h('div', { class: 'eyebrow' }, `${RECIPES.length} recepten`), h('h1', {}, 'Recepten'))),
    h('div', { class: 'chips scroll' }, FILTERS.map(([key, label]) => h('button', {
      class: `chip-btn ${key === activeFilter ? 'on' : ''}`, onclick: () => { activeFilter = key; rerender(); },
    }, label))),
    h('div', { class: 'grid' }, list.map((r) => {
      const m = recipeMacros(r);
      return h('a', { class: `recipe-card ${excluded.has(r.id) ? 'off' : ''}`, href: recipeLink(r.id) },
        h('div', { class: `recipe-art t-${r.type}` }, icon(r.type === 'snack' ? 'heart' : r.mealprep ? 'box' : r.type === 'ontbijt' ? 'today' : 'flame')),
        h('div', { class: 'recipe-info' },
          h('div', { class: 'recipe-name' }, r.name),
          h('div', { class: 'meal-meta' }, `${nl(m.kcal)} kcal · ${m.p} g eiwit`, r.minutes ? ` · ${r.totalMinutes || r.minutes} min` : ''),
          excluded.has(r.id) ? h('div', { class: 'small warn' }, 'Wordt niet voorgesteld') : null));
    })));
}

export function renderRecipe(rerender, id, query) {
  const r = recipeById(id);
  if (!r) return h('div', { class: 'page' }, h('p', {}, 'Recept niet gevonden.'));
  const factor = Number(query.get('f')) || 1;
  let portions = Number(query.get('n')) || 1;
  const excluded = new Set(store.get().food?.excluded || []);

  const ingWrap = h('div');
  const macroWrap = h('div', { class: 'macro-tiles' });
  const portionLabel = h('b', {});

  const draw = () => {
    const m = recipeMacros(r, factor);
    macroWrap.replaceChildren(
      tile(nl(m.kcal), 'kcal'), tile(`${m.p} g`, 'eiwit'), tile(`${m.c} g`, 'koolh.'), tile(`${m.f} g`, 'vet'));
    portionLabel.textContent = `${portions} ${portions === 1 ? 'portie' : 'porties'}`;
    ingWrap.replaceChildren(h('ul', { class: 'ingredients' }, scaledIngredients(r, factor, portions).map((ing) => {
      const d = displayAmount(ing.id, ing.amount);
      return h('li', {}, h('span', { class: 'qty' }, d.free ? 'naar smaak' : d.qty), h('span', {}, d.name));
    })));
  };
  draw();

  const page = h('div', { class: 'page recipe' },
    h('button', { class: 'back', onclick: () => history.back() }, icon('back'), 'Terug'),
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
    macroWrap,
    h('div', { class: 'card' },
      h('div', { class: 'card-head' }, h('h2', {}, 'Ingrediënten'),
        h('div', { class: 'stepper' },
          h('button', { class: 'icon-btn', 'aria-label': 'Minder', onclick: () => { if (portions > 1) { portions--; draw(); } } }, '−'),
          portionLabel,
          h('button', { class: 'icon-btn', 'aria-label': 'Meer', onclick: () => { if (portions < 8) { portions++; draw(); } } }, '+'))),
      ingWrap),
    h('div', { class: 'card' }, h('h2', {}, 'Bereiding'),
      h('ol', { class: 'steps' }, r.steps.map((s) => h('li', {}, s)))),
    r.tip ? h('div', { class: 'card tip' }, h('b', {}, 'Tip '), r.tip) : null,
    h('button', {
      class: 'btn ghost wide',
      onclick: () => {
        store.update((s) => {
          const ex = new Set(s.food?.excluded || []);
          if (ex.has(r.id)) ex.delete(r.id); else ex.add(r.id);
          s.food = { ...(s.food || {}), excluded: [...ex] };
        });
        toast(excluded.has(r.id) ? 'Wordt terug voorgesteld' : 'Wordt niet meer voorgesteld in nieuwe weekmenu\'s');
        rerender();
      },
    }, excluded.has(r.id) ? 'Terug voorstellen in weekmenu' : 'Niet meer voorstellen'));
  return page;
}

function tile(value, label) {
  return h('div', { class: 'tile' }, h('div', { class: 'tile-value' }, value), h('div', { class: 'tile-label' }, label));
}
