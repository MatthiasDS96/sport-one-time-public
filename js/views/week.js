import { h, icon, nl, toast, foodTabs, pageHead } from '../ui.js';
import * as fs from '../nutrition/food-store.js';
import { SLOTS, SLOT_LABELS, recipeById, dayTotals, prepSessions, entryMacros } from '../nutrition/planner.js';
import { mondayOf, addDays, dayName, shortDate, parse, today } from '../dates.js';
import { recipeLink, prepLines } from './recipes.js';

export function renderWeek(rerender, mondayParam) {
  const todayIso = today();
  const thisMonday = mondayOf(todayIso);
  const monday = mondayParam || thisMonday;
  const plan = fs.ensurePlan(monday);
  const t = fs.currentTargets();
  const sessions = prepSessions(plan);

  const page = h('div', { class: 'page' },
    foodTabs('#/week'),
    pageHead(monday === thisMonday ? 'Deze week' : monday > thisMonday ? 'Volgende week' : 'Vorige week',
      `${shortDate(monday)} – ${shortDate(addDays(monday, 6))}`, `#/week/${addDays(monday, -7)}`, `#/week/${addDays(monday, 7)}`),
    sessions.length ? h('div', { class: 'card prep-card' },
      h('div', { class: 'row-title' }, icon('box', 'accent'), h('b', {}, 'Meal prep')),
      sessions.map((s) => h('div', { class: 'prep-group' },
        h('div', { class: 'small muted' }, s.when === 'zondag'
          ? `Zondag ${shortDate(addDays(monday, -1))} koken (voor ma–wo)` : `Woensdag ${shortDate(addDays(monday, 2))} koken (voor wo–za)`),
        prepLines(s.items)))) : null,
    h('div', { class: 'btn-row' },
      h('a', { class: 'btn primary', href: `#/boodschappen/${monday}` }, icon('cart'), 'Boodschappen'),
      h('button', {
        class: 'btn ghost',
        onclick: () => {
          if (!confirm('Een nieuw weekmenu maken met andere recepten? Afgevinkte maaltijden blijven bewaard.')) return;
          fs.regeneratePlan(monday);
          toast('Nieuw weekmenu gemaakt');
          rerender();
        },
      }, icon('refresh'), 'Ander menu')));

  for (let i = 0; i < 7; i++) {
    const date = addDays(monday, i);
    const log = fs.dayLog(date);
    const tot = dayTotals(plan, date, log).planned;
    page.append(h('div', { class: `card day ${date === todayIso ? 'is-today' : ''}` },
      h('a', { class: 'day-head', href: `#/vandaag/${date}` },
        h('div', {}, h('b', {}, dayName(i)), h('span', { class: 'muted' }, ` ${parse(date).getDate()}`)),
        h('span', { class: 'muted small' }, `${nl(tot.kcal)} kcal · ${tot.p} g eiwit`)),
      SLOTS.map((slot) => line(plan, date, slot, log, rerender))));
  }
  page.append(h('p', { class: 'hint' },
    `Doel: ${nl(t.kcal)} kcal en ${t.protein} g eiwit per dag. Met de pijltjes wissel je een maaltijd; bij meal prep wisselen alle porties mee.`));
  return page;
}

function line(plan, date, slot, log, rerender) {
  const e = plan.days[date][slot];
  const label = h('span', { class: 'slot' }, slot.startsWith('snack') ? 'Snack' : SLOT_LABELS[slot]);
  if (e.office) return h('div', { class: 'day-line' }, label, h('span', { class: 'name muted' }, icon('office', 'tiny'), ' Kantoor: buiten de deur'), h('span'));
  const r = recipeById(e.recipe);
  const eaten = !!log.eaten?.[slot];
  return h('div', { class: `day-line ${eaten ? 'eaten' : ''}` }, label,
    h('a', { class: 'name', href: recipeLink(r.id, e.factor) },
      eaten ? icon('check', 'tiny accent') : null, r.name, e.batch ? h('span', { class: 'tag' }, 'prep') : null,
      h('span', { class: 'muted small' }, ` ${nl(entryMacros(plan, e, log).kcal)}`)),
    h('button', {
      class: 'icon-btn small-btn', 'aria-label': 'Wissel',
      onclick: () => { fs.swap(plan.monday, date, slot); toast(e.batch ? 'Meal prep gewisseld (alle porties)' : 'Gewisseld'); rerender(); },
    }, icon('swap')));
}
