import { h, icon, pageHead, progress, segmented, tile } from '../ui.js';
import * as store from '../store.js';
import * as fs from '../nutrition/food-store.js';
import { shoppingList } from '../nutrition/planner.js';
import { STORES, storeCost, compareStores, euro } from '../nutrition/prices.js';
import { mondayOf, addDays, shortDate, dayIndex, today } from '../dates.js';

export function renderShopping(rerender, mondayParam) {
  // in het weekend shop je voor volgende week (meal prep op zondag)
  const monday = mondayParam || addDays(mondayOf(today()), dayIndex(today()) >= 5 ? 7 : 0);
  const list = shoppingList(fs.ensurePlan(monday));
  const s = store.get();
  const checked = s.shopping[monday] || {};
  const overrides = s.prices || {};
  const shop = s.food?.store || 'delhaize';
  const buy = list.groups.flatMap((g) => g.items);
  const cost = storeCost([...buy, ...list.pantry], shop, overrides).lines;
  const ranking = compareStores(buy, overrides);
  const mine = ranking.find((r) => r.store === shop);
  const all = [...buy, ...list.pantry];
  const done = all.filter((i) => checked[i.id]).length;

  const editPrice = (item) => {
    const line = cost[item.id];
    const text = prompt(`Prijs per verpakking voor ${item.name} bij ${STORES[shop].label} (leeg = richtprijs)`, line ? String(line.price).replace('.', ',') : '');
    if (text == null) return;
    const value = Number(text.replace(',', '.'));
    if (text.trim() && !(value >= 0 && value < 1000)) { alert('Geef een geldige prijs in, bv. 3,49.'); return; }
    store.update((st) => {
      st.prices = st.prices || {};
      st.prices[item.id] = { ...st.prices[item.id], [shop]: text.trim() ? value : undefined };
    });
    rerender();
  };
  const row = (item) => {
    const line = cost[item.id];
    return h('div', { class: `shop-item ${checked[item.id] ? 'on' : ''}` },
      h('button', { class: 'shop-main', onclick: () => { fs.toggleShopping(monday, item.id); rerender(); } },
        h('span', { class: 'check' }, icon('check')),
        h('span', { class: 'shop-name' }, item.name, h('span', { class: 'shop-qty' }, item.qty, line?.packs > 1 && line.pack > 1 ? ` · ${line.packs} verpakkingen` : ''))),
      h('button', { class: `shop-price ${overrides[item.id]?.[shop] != null ? 'own' : ''}`, onclick: () => editPrice(item) },
        line ? euro(line.cost) : `niet bij ${STORES[shop].label}`));
  };
  const group = (title, items, sub) => h('div', { class: 'card shop-group' }, h('h2', {}, title), sub ? h('div', { class: 'small muted' }, sub) : null, items.map(row));

  return h('div', { class: 'page' },
    pageHead(`Week ${shortDate(monday)} – ${shortDate(addDays(monday, 6))}`, 'Boodschappen',
      `#/boodschappen/${addDays(monday, -7)}`, `#/boodschappen/${addDays(monday, 7)}`),
    h('div', { class: 'card' },
      h('div', { class: 'card-head' }, h('h2', {}, 'Kostprijs'), h('span', { class: 'muted small' }, `verbruik ± ${euro(mine.used)} / week · ${euro(mine.used / 7)} / dag`)),
      segmented(Object.entries(STORES).map(([k, v]) => [k, v.label]), (k) => k === shop,
        (k) => { store.update((st) => { st.food = { ...st.food, store: k }; }); rerender(); }),
      h('div', { class: 'stats-row shop-totals' }, ranking.map((r, i) => tile(euro(r.total),
        `${STORES[r.store].label}${i === 0 ? ' · goedkoopst' : ''}${r.missing.length ? ` · ${r.missing.length} niet` : ''}`))),
      h('p', { class: 'small muted' }, 'Aan de kassa (volle verpakkingen, richtprijzen). Wat overblijft (rijst, havermout, ...) gebruik je volgende week verder. Tik op een prijs om je eigen prijs in te geven. Voorraadkast telt niet mee.')),
    h('div', { class: 'card progress-card' },
      h('div', {}, h('b', {}, `${done} / ${all.length}`), h('span', { class: 'muted' }, ' in je kar')),
      progress(all.length ? done / all.length : 0)),
    list.groups.map((g) => group(g.label, g.items)),
    list.pantry.length ? group('Check je voorraad', list.pantry, 'Meestal heb je dit al in huis.') : null,
    done ? h('button', {
      class: 'btn ghost wide',
      onclick: () => { store.update((st) => { delete st.shopping[monday]; }); rerender(); },
    }, 'Alles terug afvinken') : null);
}
