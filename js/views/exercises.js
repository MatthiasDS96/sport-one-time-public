import { h, icon, chip, toast } from '../ui.js';
import * as ts from '../training/training-store.js';
import {
  CHAINS, CATEGORIES, EQUIPMENT, EXERCISES, byCode, ladder, hasEquipment, videoUrl, steps, targetText, BAND_LABELS, BANDS,
} from '../training/catalog.js';
import { trainingTabs } from './training.js';

export function renderExercises() {
  const t = ts.ensureTraining();
  const page = h('div', { class: 'page' }, trainingTabs('oefeningen'),
    h('div', { class: 'page-head' }, h('div', {}, h('div', { class: 'eyebrow' }, `${EXERCISES.length} oefeningen`), h('h1', {}, 'Oefeningen'))),
    h('p', { class: 'small muted' }, 'Elke keten gaat van makkelijk naar moeilijk. Het groene bolletje is jouw huidige niveau.'));

  for (const [chain, c] of Object.entries(CHAINS)) {
    const current = t.levels[chain]?.code;
    page.append(h('h2', { class: 'section' }, c.label),
      h('div', { class: 'card list-card' }, ladder(chain).map((e) => exRow(e, t, e.code === current))));
  }
  for (const [cat, label] of Object.entries(CATEGORIES)) {
    if (cat === 'STRENGTH') continue;
    const list = EXERCISES.filter((e) => !e.chain && e.category === cat).sort((a, b) => a.name.localeCompare(b.name, 'nl'));
    if (!list.length) continue;
    page.append(h('h2', { class: 'section' }, label), h('div', { class: 'card list-card' }, list.map((e) => exRow(e, t, false))));
  }
  return page;
}

function exRow(e, t, current) {
  const ok = hasEquipment(e, t.equipment);
  return h('a', { class: `ex-row ${ok ? '' : 'off'}`, href: `#/oefening/${e.code}` },
    e.chain ? h('span', { class: `lvl ${current ? 'on' : ''}` }, e.level) : null,
    h('div', { class: 'ex-main' },
      h('div', { class: 'ex-name' }, e.name),
      h('div', { class: 'meal-meta' }, ok ? targetText(e) : `Niet mogelijk: ${e.equipment.filter((q) => !t.equipment.includes(q)).map((q) => EQUIPMENT[q].toLowerCase()).join(', ')}`)),
    icon('chevronR', 'muted'));
}

export function renderExercise(rerender, code) {
  const t = ts.ensureTraining();
  const e = byCode(code);
  if (!e) return h('div', { class: 'page' }, h('p', {}, 'Oefening niet gevonden.'));
  const level = e.chain ? t.levels[e.chain] : null;
  const isCurrent = level?.code === e.code;
  const ok = hasEquipment(e, t.equipment);

  const page = h('div', { class: 'page recipe' },
    h('button', { class: 'back', onclick: () => history.back() }, icon('back'), 'Terug'),
    h('div', { class: 'recipe-hero t-snack' },
      h('div', { class: 'eyebrow' }, e.chain ? `${CHAINS[e.chain].label} · niveau ${e.level}` : CATEGORIES[e.category]),
      h('h1', {}, e.name),
      h('div', { class: 'chips' },
        chip(targetText(e)),
        e.equipment.length ? chip(e.equipment.map((q) => EQUIPMENT[q]).join(', ')) : chip('Geen materiaal nodig'),
        isCurrent ? chip('Jouw niveau', 'accent') : null),
      e.muscles ? h('p', { class: 'small' }, h('b', {}, 'Spieren: '), e.muscles) : null),
    h('a', { class: 'btn primary wide', href: videoUrl(e), target: '_blank', rel: 'noopener' }, icon('play'), 'Bekijk voorbeeldvideo'),
    h('div', { class: 'card' }, h('h2', {}, 'Zo doe je het'), h('ol', { class: 'steps' }, steps(e).map((s) => h('li', {}, s)))),
    e.tips.length ? h('div', { class: 'card tip' }, h('h2', {}, 'Tips'), h('ul', { class: 'bullets' }, e.tips.map((s) => h('li', {}, s)))) : null,
    e.mistakes.length ? h('div', { class: 'card warn-card' }, h('h2', {}, 'Veelgemaakte fouten'), h('ul', { class: 'bullets' }, e.mistakes.map((s) => h('li', {}, s)))) : null);

  if (e.chain && isCurrent && e.band) {
    const band = h('div', { class: 'segmented' }, BANDS.map((b) => h('button', {
      class: level.band === b ? 'on' : '', onclick: () => { ts.setBand(e.chain, b, level.steps ?? 1); rerender(); },
    }, BAND_LABELS[b])));
    const stepsRow = h('div', { class: 'stepper' },
      h('button', { class: 'icon-btn', onclick: () => { if ((level.steps ?? 0) > 0) { ts.setBand(e.chain, level.band, (level.steps ?? 0) - 1); rerender(); } } }, '−'),
      h('b', {}, `${level.steps ?? 0} ${level.steps === 1 ? 'stap' : 'stappen'} van de deur`),
      h('button', { class: 'icon-btn', onclick: () => { if ((level.steps ?? 0) < 10) { ts.setBand(e.chain, level.band, (level.steps ?? 0) + 1); rerender(); } } }, '+'));
    page.append(h('div', { class: 'card' }, h('h2', {}, 'Jouw elastiek'), band, h('div', { style: { marginTop: '12px' } }, stepsRow)));
  }
  if (e.chain && !isCurrent && ok) {
    page.append(h('button', {
      class: 'btn ghost wide',
      onclick: () => { try { ts.setLevel(e.code); toast('Dit is nu je niveau'); rerender(); } catch (err) { alert(err.message); } },
    }, 'Dit wordt mijn niveau'));
  }
  return page;
}
