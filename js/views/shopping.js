import { h, icon, pageHead, progress } from '../ui.js';
import * as store from '../store.js';
import * as fs from '../nutrition/food-store.js';
import { shoppingList } from '../nutrition/planner.js';
import { mondayOf, addDays, shortDate, dayIndex, today } from '../dates.js';

export function renderShopping(rerender, mondayParam) {
  // in het weekend shop je voor volgende week (meal prep op zondag)
  const monday = mondayParam || addDays(mondayOf(today()), dayIndex(today()) >= 5 ? 7 : 0);
  const list = shoppingList(fs.ensurePlan(monday));
  const checked = store.get().shopping[monday] || {};
  const all = [...list.groups.flatMap((g) => g.items), ...list.pantry];
  const done = all.filter((i) => checked[i.id]).length;

  const row = (item) => h('button', {
    class: `shop-item ${checked[item.id] ? 'on' : ''}`,
    onclick: () => { fs.toggleShopping(monday, item.id); rerender(); },
  }, h('span', { class: 'check' }, icon('check')), h('span', { class: 'shop-name' }, item.name), h('span', { class: 'shop-qty' }, item.qty));
  const group = (title, items, sub) => h('div', { class: 'card shop-group' }, h('h2', {}, title), sub ? h('div', { class: 'small muted' }, sub) : null, items.map(row));

  return h('div', { class: 'page' },
    pageHead(`Week ${shortDate(monday)} – ${shortDate(addDays(monday, 6))}`, 'Boodschappen',
      `#/boodschappen/${addDays(monday, -7)}`, `#/boodschappen/${addDays(monday, 7)}`),
    h('div', { class: 'card progress-card' },
      h('div', {}, h('b', {}, `${done} / ${all.length}`), h('span', { class: 'muted' }, ' in je kar')),
      progress(all.length ? done / all.length : 0)),
    h('p', { class: 'hint' }, 'Alles voor de hele week (ook de meal prep van zondag), naar boven afgerond. De volgorde volgt de afdelingen van de Delhaize; Colruyt of Aldi kan ook.'),
    list.groups.map((g) => group(g.label, g.items)),
    list.pantry.length ? group('Check je voorraad', list.pantry, 'Meestal heb je dit al in huis.') : null,
    done ? h('button', {
      class: 'btn ghost wide',
      onclick: () => { store.update((s) => { delete s.shopping[monday]; }); rerender(); },
    }, 'Alles terug afvinken') : null);
}
