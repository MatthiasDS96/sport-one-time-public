import { h, icon, ring, bar, nl, sheet, toast } from '../ui.js';
import * as fs from '../nutrition/food-store.js';
import {
  SLOTS, SLOT_LABELS, recipeById, entryMacros, dayTotals, prepSessions, officeOption,
} from '../nutrition/planner.js';
import { OFFICE_OPTIONS } from '../data/recipes.js';
import { mondayOf, dayIndex, longDate, addDays } from '../dates.js';
import { recipeLink } from './recipes.js';

export function renderToday(rerender, dateParam) {
  const date = dateParam || fs.todayIso();
  const monday = mondayOf(date);
  const plan = fs.ensurePlan(monday);
  const t = fs.currentTargets();
  const log = fs.dayLog(date);
  const tot = dayTotals(plan, date, log);
  const isToday = date === fs.todayIso();
  const left = t.kcal - tot.eaten.kcal;

  const page = h('div', { class: 'page' });
  page.append(
    h('div', { class: 'page-head' },
      h('div', {},
        h('div', { class: 'eyebrow' }, isToday ? 'Vandaag' : 'Eetdag'),
        h('h1', {}, longDate(date))),
      h('div', { class: 'head-nav' },
        h('a', { class: 'icon-btn', href: `#/vandaag/${addDays(date, -1)}`, 'aria-label': 'Vorige dag' }, icon('chevronL')),
        h('a', { class: 'icon-btn', href: `#/vandaag/${addDays(date, 1)}`, 'aria-label': 'Volgende dag' }, icon('chevronR')))),
  );

  // --- samenvatting ---
  page.append(h('div', { class: 'card summary' },
    ring(tot.eaten.kcal, t.kcal, {
      label: nl(tot.eaten.kcal), sub: `van ${nl(t.kcal)} kcal`,
    }),
    h('div', { class: 'summary-side' },
      h('div', { class: 'big-note' },
        left >= 0 ? h('span', {}, h('b', {}, nl(left)), ' kcal te gaan') : h('span', { class: 'warn' }, h('b', {}, nl(-left)), ' kcal boven je doel')),
      bar('Eiwit', tot.eaten.p, t.protein, 'var(--accent)'),
      bar('Koolhydraten', tot.eaten.c, t.carbs, 'var(--blue)'),
      bar('Vet', tot.eaten.f, t.fat, 'var(--orange)'))));

  // --- meal prep vandaag? ---
  const prep = prepToday(date);
  if (prep) {
    page.append(h('div', { class: 'card prep-card' },
      h('div', { class: 'row-title' }, icon('box', 'accent'), h('b', {}, 'Vandaag meal prep')),
      h('div', { class: 'muted small' }, prep.note),
      prep.items.map((it) => h('a', { class: 'prep-line', href: recipeLink(it.recipe.id, it.batch.factor, it.portions) },
        h('span', {}, it.recipe.name), h('span', { class: 'pill' }, `${it.portions} porties`), icon('chevronR', 'muted')))));
  }

  // --- maaltijden ---
  page.append(h('h2', { class: 'section' }, 'Maaltijden'));
  const day = plan.days[date] || {};
  for (const slot of SLOTS) {
    const entry = day[slot];
    if (!entry) continue;
    const eaten = !!log.eaten?.[slot];
    const m = entryMacros(plan, entry, log);
    const check = h('button', {
      class: `check ${eaten ? 'on' : ''}`, 'aria-label': eaten ? 'Niet gegeten' : 'Gegeten',
      onclick: (e) => {
        e.preventDefault();
        if (entry.office && !log.office && !eaten) { chooseOffice(date, rerender); return; }
        fs.toggleEaten(date, slot);
        rerender();
      },
    }, icon('check'));

    if (entry.office) {
      const opt = officeOption(log.office);
      page.append(h('div', { class: `meal ${eaten ? 'done' : ''}` }, check,
        h('button', { class: 'meal-body plain', onclick: () => chooseOffice(date, rerender) },
          h('div', { class: 'meal-slot' }, icon('office', 'tiny'), ' Middag · kantoor'),
          h('div', { class: 'meal-name' }, opt ? opt.name : 'Lunch buiten de deur'),
          h('div', { class: 'meal-meta' }, opt ? `± ${nl(m.kcal)} kcal · ${m.p} g eiwit` : 'Tik om te kiezen wat je at')),
        icon('chevronR', 'muted')));
      continue;
    }
    const r = recipeById(entry.recipe);
    page.append(h('div', { class: `meal ${eaten ? 'done' : ''}` }, check,
      h('a', { class: 'meal-body', href: recipeLink(r.id, entry.factor) },
        h('div', { class: 'meal-slot' }, SLOT_LABELS[slot], entry.batch ? h('span', { class: 'tag' }, 'meal prep') : null),
        h('div', { class: 'meal-name' }, r.name),
        h('div', { class: 'meal-meta' }, `${nl(m.kcal)} kcal · ${m.p} g eiwit`)),
      icon('chevronR', 'muted')));
  }

  // --- extra ---
  const extras = log.extras || [];
  if (extras.length) {
    page.append(h('h2', { class: 'section' }, 'Extra gegeten'));
    extras.forEach((x, i) => page.append(h('div', { class: 'meal done' },
      h('div', { class: 'meal-body' }, h('div', { class: 'meal-name' }, x.name),
        h('div', { class: 'meal-meta' }, `${nl(x.kcal)} kcal${x.p ? ` · ${x.p} g eiwit` : ''}`)),
      h('button', { class: 'icon-btn', 'aria-label': 'Verwijderen', onclick: () => { fs.removeExtra(date, i); rerender(); } }, icon('x')))));
  }
  page.append(h('button', { class: 'btn ghost wide', onclick: () => addExtraSheet(date, rerender) }, icon('plus'), 'Iets anders gegeten'));

  page.append(h('p', { class: 'hint' }, 'Vink een maaltijd af als je ze gegeten hebt. Tik op de naam voor het recept.'));
  return page;
}

/** Meal prep die vandaag gekookt moet worden: zondag voor ma–wo van volgende week, woensdag voor wo–za. */
function prepToday(date) {
  const di = dayIndex(date);
  if (di !== 6 && di !== 2) return null;
  const monday = di === 6 ? addDays(date, 1) : mondayOf(date);
  const plan = fs.ensurePlan(monday);
  const when = di === 6 ? 'zondag' : 'woensdag';
  const session = prepSessions(plan).find((s) => s.when === when);
  if (!session) return null;
  return {
    note: di === 6 ? 'Voor maandag tot woensdag. Laat afkoelen en zet in de koelkast.' : 'Voor woensdagavond tot zaterdagmiddag.',
    items: session.items,
  };
}

function chooseOffice(date, rerender) {
  const log = fs.dayLog(date);
  const close = sheet('Wat at je op kantoor?', h('div', { class: 'options' },
    OFFICE_OPTIONS.map((o) => h('button', {
      class: `option ${log.office === o.id ? 'on' : ''}`,
      onclick: () => { fs.setOffice(date, o.id); close(); rerender(); toast('Kantoorlunch genoteerd'); },
    },
    h('div', { class: 'option-main' }, h('b', {}, o.name), o.k ? h('span', { class: 'muted' }, `± ${nl(o.k)} kcal · ${o.p} g eiwit`) : null),
    h('div', { class: 'small muted' }, o.tip)))));
}

function addExtraSheet(date, rerender) {
  const name = h('input', { type: 'text', placeholder: 'bv. stuk taart, pintje' });
  const kcal = h('input', { type: 'text', inputmode: 'decimal', placeholder: 'kcal' });
  const p = h('input', { type: 'text', inputmode: 'decimal', placeholder: 'eiwit (g), mag leeg' });
  const err = h('div', { class: 'error' });
  const quick = [['Pintje (25 cl)', 105, 1], ['Glas wijn', 120, 0], ['Stuk taart', 350, 5], ['Koffiekoek', 300, 6], ['Frietjes (klein)', 450, 6]];
  const close = sheet('Iets anders gegeten', h('div', { class: 'form' },
    h('div', { class: 'quick' }, quick.map(([n, k, pp]) => h('button', {
      class: 'pill-btn', onclick: () => { name.value = n; kcal.value = k; p.value = pp; },
    }, n))),
    h('label', {}, 'Wat', name), h('label', {}, 'Kcal', kcal), h('label', {}, 'Eiwit', p), err,
    h('button', {
      class: 'btn primary wide',
      onclick: () => {
        try {
          fs.addExtra(date, { name: name.value, kcal: kcal.value, p: p.value });
          close(); rerender();
        } catch (e) { err.textContent = e.message; }
      },
    }, 'Toevoegen')));
}
