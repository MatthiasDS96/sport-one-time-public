import { h, icon } from '../ui.js';
import * as store from '../store.js';
import * as fs from '../nutrition/food-store.js';
import { shoppingList } from '../nutrition/planner.js';
import { mondayOf, addDays, shortDate, dayIndex } from '../dates.js';

export function renderShopping(rerender, mondayParam) {
  const todayIso = fs.todayIso();
  // in het weekend shop je voor volgende week (meal prep op zondag)
  const monday = mondayParam || (dayIndex(todayIso) >= 5 ? addDays(mondayOf(todayIso), 7) : mondayOf(todayIso));
  const plan = fs.ensurePlan(monday);
  const list = shoppingList(plan);
  const checked = store.get().shopping[monday] || {};
  const all = [...list.groups.flatMap((g) => g.items), ...list.pantry];
  const done = all.filter((i) => checked[i.id]).length;

  const row = (item) => h('button', {
    class: `shop-item ${checked[item.id] ? 'on' : ''}`,
    onclick: () => { fs.toggleShopping(monday, item.id); rerender(); },
  }, h('span', { class: 'check' }, icon('check')), h('span', { class: 'shop-name' }, item.name), h('span', { class: 'shop-qty' }, item.qty));

  return h('div', { class: 'page' },
    h('div', { class: 'page-head' },
      h('div', {},
        h('div', { class: 'eyebrow' }, `Week ${shortDate(monday)} – ${shortDate(addDays(monday, 6))}`),
        h('h1', {}, 'Boodschappen')),
      h('div', { class: 'head-nav' },
        h('a', { class: 'icon-btn', href: `#/boodschappen/${addDays(monday, -7)}`, 'aria-label': 'Vorige week' }, icon('chevronL')),
        h('a', { class: 'icon-btn', href: `#/boodschappen/${addDays(monday, 7)}`, 'aria-label': 'Volgende week' }, icon('chevronR')))),
    h('div', { class: 'card progress-card' },
      h('div', {}, h('b', {}, `${done} / ${all.length}`), h('span', { class: 'muted' }, ' in je kar')),
      h('div', { class: 'bar-track' }, h('div', { class: 'bar-fill', style: { width: `${all.length ? (done / all.length) * 100 : 0}%`, background: 'var(--accent)' } }))),
    h('p', { class: 'hint' }, 'Alles voor de hele week (ook de meal prep van zondag), naar boven afgerond. De volgorde volgt de afdelingen van de Delhaize; Colruyt of Aldi kan ook.'),
    list.groups.map((g) => h('div', { class: 'card shop-group' }, h('h2', {}, g.label), g.items.map(row))),
    list.pantry.length ? h('div', { class: 'card shop-group' }, h('h2', {}, 'Check je voorraad'),
      h('div', { class: 'small muted' }, 'Meestal heb je dit al in huis.'), list.pantry.map(row)) : null,
    done ? h('button', {
      class: 'btn ghost wide',
      onclick: () => { store.update((s) => { delete s.shopping[monday]; }); rerender(); },
    }, 'Alles terug afvinken') : null);
}
