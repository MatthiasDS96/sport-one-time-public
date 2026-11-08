import { h, icon, ring, bar, nl, sheet, toast, pageHead, choices, segmented } from '../ui.js';
import * as fs from '../nutrition/food-store.js';
import * as ts from '../training/training-store.js';
import { SLOTS, SLOT_LABELS, recipeById, entryMacros, dayTotals, prepSessions, officeOption } from '../nutrition/planner.js';
import { OFFICE_OPTIONS, EXTRA_FOODS } from '../data/recipes.js';
import { ACTIVITIES, workoutName } from '../training/library.js';
import { mondayOf, dayIndex, longDate, addDays, today } from '../dates.js';
import { recipeLink, prepLines } from './recipes.js';
import { dayCard, activitySheet } from './training.js';

/** Rij voor een maaltijd of activiteit: [vinkje] tekst [pijltje of verwijderknop]. target = href, functie of { remove } */
function row({ check, slot, name, meta, target, done }) {
  const body = [slot ? h('div', { class: 'meal-slot' }, slot) : null, h('div', { class: 'meal-name' }, name), h('div', { class: 'meal-meta' }, meta)];
  return h('div', { class: `meal ${done ? 'done' : ''}` }, check,
    typeof target === 'string' ? h('a', { class: 'meal-body', href: target }, body)
      : typeof target === 'function' ? h('button', { class: 'meal-body', onclick: target }, body)
        : h('div', { class: 'meal-body' }, body),
    target?.remove ? h('button', { class: 'icon-btn', 'aria-label': 'Verwijderen', onclick: target.remove }, icon('x')) : icon('chevronR', 'muted'));
}

export function renderToday(rerender, dateParam) {
  const date = dateParam || today();
  const plan = fs.ensurePlan(mondayOf(date));
  const t = fs.currentTargets();
  const log = fs.dayLog(date);
  const tot = dayTotals(plan, date, log);
  const left = t.kcal - tot.eaten.kcal;
  const redo = (fn) => () => { fn(); rerender(); };

  const page = h('div', { class: 'page' },
    pageHead(date === today() ? 'Vandaag' : 'Dag', longDate(date), `#/vandaag/${addDays(date, -1)}`, `#/vandaag/${addDays(date, 1)}`));

  // --- training ---
  const tday = ts.dayOn(date);
  const next = ts.training().plan.days.find((d) => d.date > date);
  page.append(h('h2', { class: 'section first' }, 'Training'),
    tday ? dayCard(tday, true) : h('div', { class: 'card' }, h('div', { class: 'tc-title' }, 'Rustdag'),
      h('div', { class: 'meal-meta' }, next ? `Volgende training: ${longDate(next.date)} · ${workoutName(next.workout)}` : 'Herstel is ook training.')),
    ts.activitiesOn(date).map((a) => row({ name: ACTIVITIES[a.type].label, done: true,
      meta: `${a.minutes} min · ± ${nl(a.kcal)} kcal verbrand${a.replaces ? ' · vervangt de training' : ''}`,
      target: { remove: redo(() => ts.removeActivity(a.id)) } })),
    h('button', { class: 'btn ghost wide', onclick: () => activitySheet(date, rerender) }, icon('heart'), 'Andere sport gedaan'));

  // --- voeding ---
  page.append(h('h2', { class: 'section' }, 'Voeding'),
    h('div', { class: 'card summary' },
      ring(tot.eaten.kcal, t.kcal, { label: nl(tot.eaten.kcal), sub: `van ${nl(t.kcal)} kcal` }),
      h('div', { class: 'summary-side' },
        h('div', { class: 'big-note' }, left >= 0 ? h('span', {}, h('b', {}, nl(left)), ' kcal te gaan')
          : h('span', { class: 'warn' }, h('b', {}, nl(-left)), ' kcal boven je doel')),
        bar('Eiwit', tot.eaten.p, t.protein, 'var(--accent)'),
        bar('Koolhydraten', tot.eaten.c, t.carbs, 'var(--blue)'),
        bar('Vet', tot.eaten.f, t.fat, 'var(--orange)'))));

  const prep = prepToday(date);
  if (prep) {
    page.append(h('div', { class: 'card prep-card' },
      h('div', { class: 'row-title' }, icon('box', 'accent'), h('b', {}, 'Vandaag meal prep')),
      h('div', { class: 'muted small' }, prep.note), prepLines(prep.items)));
  }

  page.append(h('h2', { class: 'section' }, 'Maaltijden'));
  const day = plan.days[date] || {};
  for (const slot of SLOTS) {
    const entry = day[slot];
    if (!entry) continue;
    const eaten = !!log.eaten?.[slot];
    const m = entryMacros(plan, entry, log);
    const check = h('button', {
      class: `check ${eaten ? 'on' : ''}`, 'aria-label': eaten ? 'Niet gegeten' : 'Gegeten',
      onclick: () => (entry.office && !log.office && !eaten ? chooseOffice(date, rerender) : redo(() => fs.toggleEaten(date, slot))()),
    }, icon('check'));
    if (entry.office) {
      const opt = officeOption(log.office);
      page.append(row({ check, done: eaten, slot: [icon('office', 'tiny'), ' Middag · kantoor'], name: opt ? opt.name : 'Lunch buiten de deur',
        meta: opt ? `± ${nl(m.kcal)} kcal · ${m.p} g eiwit` : 'Tik om te kiezen wat je at', target: () => chooseOffice(date, rerender) }));
    } else {
      const r = recipeById(entry.recipe);
      page.append(row({ check, done: eaten, name: r.name, meta: `${nl(m.kcal)} kcal · ${m.p} g eiwit`, target: recipeLink(r.id, entry.factor),
        slot: [entry.post ? 'Na de training' : SLOT_LABELS[slot], entry.batch ? h('span', { class: 'tag' }, 'meal prep') : null] }));
    }
  }

  const extras = log.extras || [];
  if (extras.length) {
    page.append(h('h2', { class: 'section' }, 'Extra gegeten'), extras.map((x, i) => row({ name: x.name, done: true,
      meta: `${nl(x.kcal)} kcal${x.p ? ` · ${x.p} g eiwit` : ''}`, target: { remove: redo(() => fs.removeExtra(date, i)) } })));
  }
  page.append(h('button', { class: 'btn ghost wide', onclick: () => addExtraSheet(date, rerender) }, icon('plus'), 'Iets anders gegeten'),
    h('p', { class: 'hint' }, 'Vink een maaltijd af als je ze gegeten hebt. Tik op de naam voor het recept.'));
  return page;
}

/** Meal prep die vandaag gekookt moet worden: zondag voor ma–wo van volgende week, woensdag voor wo–za. */
function prepToday(date) {
  const di = dayIndex(date);
  if (di !== 6 && di !== 2) return null;
  const plan = fs.ensurePlan(di === 6 ? addDays(date, 1) : mondayOf(date));
  const session = prepSessions(plan).find((s) => s.when === (di === 6 ? 'zondag' : 'woensdag'));
  return session && {
    note: di === 6 ? 'Voor maandag tot woensdag. Laat afkoelen en zet in de koelkast.' : 'Voor woensdagavond tot zaterdagmiddag.',
    items: session.items,
  };
}

function chooseOffice(date, rerender) {
  const current = fs.dayLog(date).office;
  const close = sheet('Wat at je op kantoor?', choices(OFFICE_OPTIONS.map((o) => ({
    title: o.k ? `${o.name} · ± ${nl(o.k)} kcal` : o.name, sub: o.tip, on: current === o.id,
    onClick: () => { fs.setOffice(date, o.id); close(); rerender(); toast('Kantoorlunch genoteerd'); },
  }))));
}

function addExtraSheet(date, rerender) {
  const field = (placeholder) => h('input', { type: 'text', inputmode: 'decimal', placeholder });
  const name = h('input', { type: 'text', placeholder: 'bv. pizza, pintje' });
  const f = { kcal: field('kcal'), p: field('g'), c: field('g'), f: field('g') };
  const err = h('div', { class: 'error' });
  const v = { food: null, portion: 1 };
  // gekozen gerecht × portie invullen (blijft daarna met de hand aan te passen)
  const fill = () => {
    if (!v.food) return;
    const x = v.portion;
    name.value = x === 1 ? v.food.name : `${v.food.name} × ${String(x).replace('.', ',')}`;
    f.kcal.value = Math.round(v.food.k * x);
    for (const k of ['p', 'c', 'f']) f[k].value = Math.round(v.food[k] * x);
  };
  const close = sheet('Iets anders gegeten', h('div', { class: 'form' },
    h('div', { class: 'label' }, 'Kies een gerecht (schatting)',
      segmented(EXTRA_FOODS.map((x) => [x, x.name]), (x) => v.food === x, (x) => { v.food = x; fill(); }, true)),
    h('div', { class: 'label' }, 'Portie', segmented([[0.5, '½'], [1, '1'], [1.5, '1½'], [2, '2']], (x) => v.portion === x, (x) => { v.portion = x; fill(); })),
    h('label', {}, 'Wat', name),
    h('div', { class: 'two' }, h('label', {}, 'Kcal', f.kcal), h('label', {}, 'Eiwit (g)', f.p)),
    h('div', { class: 'two' }, h('label', {}, 'Koolhydraten (g)', f.c), h('label', {}, 'Vet (g)', f.f)),
    h('p', { class: 'small muted' }, 'Staat het er niet tussen? Typ zelf een naam en de kcal (op de verpakking of via een zoekopdracht). Eiwit, koolhydraten en vet mogen leeg blijven.'),
    err,
    h('button', {
      class: 'btn primary wide',
      onclick: () => {
        try {
          fs.addExtra(date, { name: name.value, kcal: f.kcal.value, p: f.p.value, c: f.c.value, f: f.f.value });
          close(); rerender();
        } catch (e) { err.textContent = e.message; }
      },
    }, 'Toevoegen')));
}
