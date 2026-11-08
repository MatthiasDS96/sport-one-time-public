import { h, icon, chip, toast, back, pageHead, listRow, segmented } from '../ui.js';
import * as ts from '../training/training-store.js';
import {
  CHAINS, CATEGORIES, EQUIPMENT, EXERCISES, byCode, ladder, hasEquipment, videoUrl, steps, targetText, BAND_LABELS, BANDS,
} from '../training/catalog.js';
import { trainingTabs } from './training.js';

export function renderExercises() {
  const t = ts.training();
  const row = (e) => {
    const ok = hasEquipment(e, t.equipment);
    const missing = e.equipment.filter((q) => !t.equipment.includes(q)).map((q) => EQUIPMENT[q].toLowerCase()).join(', ');
    const lead = e.chain ? h('span', { class: `lvl ${t.levels[e.chain]?.code === e.code ? 'on' : ''}` }, e.level) : null;
    return listRow(`#/oefening/${e.code}`, e.name, ok ? targetText(e) : `Niet mogelijk: ${missing}`, lead, ok ? '' : 'off');
  };
  const section = (label, list) => (list.length ? [h('h2', { class: 'section' }, label), h('div', { class: 'card list-card' }, list.map(row))] : null);
  return h('div', { class: 'page' }, trainingTabs('#/oefeningen'),
    pageHead(`${EXERCISES.length} oefeningen`, 'Oefeningen'),
    h('p', { class: 'small muted' }, 'Elke keten gaat van makkelijk naar moeilijk. Het groene bolletje is jouw huidige niveau.'),
    Object.entries(CHAINS).map(([chain, c]) => section(c.label, ladder(chain))),
    Object.entries(CATEGORIES).filter(([cat]) => cat !== 'STRENGTH').map(([cat, label]) => section(label,
      EXERCISES.filter((e) => !e.chain && e.category === cat).sort((a, b) => a.name.localeCompare(b.name, 'nl')))));
}

export function renderExercise(rerender, code) {
  const t = ts.training();
  const e = byCode(code);
  if (!e) return h('div', { class: 'page' }, back(), h('p', {}, 'Oefening niet gevonden.'));
  const level = e.chain ? t.levels[e.chain] : null;
  const isCurrent = level?.code === e.code;
  const list = (title, items, cls) => (items.length ? h('div', { class: `card ${cls}` }, h('h2', {}, title), h('ul', { class: 'bullets' }, items.map((s) => h('li', {}, s)))) : null);

  const page = h('div', { class: 'page recipe' }, back(),
    h('div', { class: 'recipe-hero t-snack' },
      h('div', { class: 'eyebrow' }, e.chain ? `${CHAINS[e.chain].label} · niveau ${e.level}` : CATEGORIES[e.category]),
      h('h1', {}, e.name),
      h('div', { class: 'chips' }, chip(targetText(e)),
        chip(e.equipment.length ? e.equipment.map((q) => EQUIPMENT[q]).join(', ') : 'Geen materiaal nodig'),
        isCurrent ? chip('Jouw niveau', 'accent') : null),
      e.muscles ? h('p', { class: 'small' }, h('b', {}, 'Spieren: '), e.muscles) : null),
    h('a', { class: 'btn primary wide', href: videoUrl(e), target: '_blank', rel: 'noopener' }, icon('play'), 'Bekijk voorbeeldvideo'),
    h('div', { class: 'card' }, h('h2', {}, 'Zo doe je het'), h('ol', { class: 'steps' }, steps(e).map((s) => h('li', {}, s)))),
    list('Tips', e.tips, 'tip'),
    list('Veelgemaakte fouten', e.mistakes, 'warn-card'));

  if (isCurrent && e.band) {
    const n = level.steps ?? 0;
    const setSteps = (x) => { if (x >= 0 && x <= 10) { ts.setBand(e.chain, level.band, x); rerender(); } };
    page.append(h('div', { class: 'card' }, h('h2', {}, 'Jouw elastiek'),
      segmented(BANDS.map((b) => [b, BAND_LABELS[b]]), (b) => level.band === b, (b) => { ts.setBand(e.chain, b, n); rerender(); }),
      h('div', { class: 'stepper', style: { marginTop: '12px' } },
        h('button', { class: 'icon-btn', onclick: () => setSteps(n - 1) }, '−'),
        h('b', {}, `${n} ${n === 1 ? 'stap' : 'stappen'} van de deur`),
        h('button', { class: 'icon-btn', onclick: () => setSteps(n + 1) }, '+'))));
  }
  if (e.chain && !isCurrent && hasEquipment(e, t.equipment)) {
    page.append(h('button', {
      class: 'btn ghost wide',
      onclick: () => { ts.setLevel(e.code); toast('Dit is nu je niveau'); rerender(); },
    }, 'Dit wordt mijn niveau'));
  }
  return page;
}
