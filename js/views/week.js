import { h, icon, nl, toast } from '../ui.js';
import * as fs from '../nutrition/food-store.js';
import { SLOTS, SLOT_LABELS, recipeById, dayTotals, prepSessions, entryMacros } from '../nutrition/planner.js';
import { mondayOf, addDays, dayName, shortDate, parse } from '../dates.js';
import { recipeLink } from './recipes.js';

export function renderWeek(rerender, mondayParam) {
  const monday = mondayParam || mondayOf(fs.todayIso());
  const plan = fs.ensurePlan(monday);
  const t = fs.currentTargets();
  const todayIso = fs.todayIso();
  const sunday = addDays(monday, 6);
  const thisMonday = mondayOf(todayIso);

  const page = h('div', { class: 'page' },
    h('div', { class: 'page-head' },
      h('div', {},
        h('div', { class: 'eyebrow' }, monday === thisMonday ? 'Deze week' : monday > thisMonday ? 'Volgende week' : 'Vorige week'),
        h('h1', {}, `${shortDate(monday)} – ${shortDate(sunday)}`)),
      h('div', { class: 'head-nav' },
        h('a', { class: 'icon-btn', href: `#/week/${addDays(monday, -7)}`, 'aria-label': 'Vorige week' }, icon('chevronL')),
        h('a', { class: 'icon-btn', href: `#/week/${addDays(monday, 7)}`, 'aria-label': 'Volgende week' }, icon('chevronR')))));

  // --- meal prep ---
  const sessions = prepSessions(plan);
  if (sessions.length) {
    page.append(h('div', { class: 'card prep-card' },
      h('div', { class: 'row-title' }, icon('box', 'accent'), h('b', {}, 'Meal prep')),
      sessions.map((s) => h('div', { class: 'prep-group' },
        h('div', { class: 'small muted' }, s.when === 'zondag'
          ? `Zondag ${shortDate(addDays(monday, -1))} koken (voor ma–wo)` : `Woensdag ${shortDate(addDays(monday, 2))} koken (voor wo–za)`),
        s.items.map((it) => h('a', { class: 'prep-line', href: recipeLink(it.recipe.id, it.batch.factor, it.portions) },
          h('span', {}, it.recipe.name), h('span', { class: 'pill' }, `${it.portions}×`), icon('chevronR', 'muted')))))));
  }

  page.append(h('div', { class: 'btn-row' },
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

  // --- dagen ---
  for (let i = 0; i < 7; i++) {
    const date = addDays(monday, i);
    const day = plan.days[date];
    const log = fs.dayLog(date);
    const tot = dayTotals(plan, date, log);
    const card = h('div', { class: `card day ${date === todayIso ? 'is-today' : ''}` },
      h('a', { class: 'day-head', href: `#/vandaag/${date}` },
        h('div', {}, h('b', {}, dayName(i)), h('span', { class: 'muted' }, ` ${parse(date).getDate()}`)),
        h('span', { class: 'muted small' }, `${nl(tot.planned.kcal)} kcal · ${tot.planned.p} g eiwit`)));
    for (const slot of SLOTS) {
      const e = day[slot];
      const eaten = !!log.eaten?.[slot];
      if (e.office) {
        card.append(h('div', { class: 'day-line' },
          h('span', { class: 'slot' }, 'Middag'),
          h('span', { class: 'name muted' }, icon('office', 'tiny'), ' Kantoor: buiten de deur'),
          h('span')));
        continue;
      }
      const r = recipeById(e.recipe);
      const m = entryMacros(plan, e, log);
      card.append(h('div', { class: `day-line ${eaten ? 'eaten' : ''}` },
        h('span', { class: 'slot' }, SLOT_LABELS[slot] === 'Tussendoortje' ? 'Snack' : SLOT_LABELS[slot]),
        h('a', { class: 'name', href: recipeLink(r.id, e.factor) },
          eaten ? icon('check', 'tiny accent') : null, r.name,
          e.batch ? h('span', { class: 'tag' }, 'prep') : null,
          h('span', { class: 'muted small' }, ` ${nl(m.kcal)}`)),
        h('button', {
          class: 'icon-btn small-btn', 'aria-label': 'Wissel',
          onclick: () => {
            fs.swap(monday, date, slot);
            toast(e.batch ? 'Meal prep gewisseld (alle porties)' : 'Gewisseld');
            rerender();
          },
        }, icon('swap'))));
    }
    page.append(card);
  }
  page.append(h('p', { class: 'hint' },
    `Doel: ${nl(t.kcal)} kcal en ${t.protein} g eiwit per dag. Met de pijltjes wissel je een maaltijd; bij meal prep wisselen alle porties mee.`));
  return page;
}
