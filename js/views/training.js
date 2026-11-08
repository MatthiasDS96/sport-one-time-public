import {
  h, icon, chip, nl, sheet, toast, back, pageHead, tile, tabs, listRow, segmented, choices,
} from '../ui.js';
import * as ts from '../training/training-store.js';
import {
  BLOCKS, DAY_TYPES, phaseName, itemTarget, bandText, estimatedMinutes, finisherText, ACTIVITIES, INTENSITIES, WEEKS,
} from '../training/library.js';
import { mondayOf, addDays, dayName, dayShort, shortDate, longDate, today, dayIndex, parse } from '../dates.js';

const STATUS = {
  done: ['Gedaan', 'ok'], partial: ['Deels gedaan', 'ok'], skipped: ['Overgeslagen', 'warn'],
  substituted: ['Vervangen door andere sport', 'ok'], missed: ['Gemist', 'bad'], planned: ['Gepland', ''],
};
const statusChip = (st) => h('span', { class: `status ${STATUS[st][1]}` }, STATUS[st][0]);
const startButton = (date) => h('a', { class: 'btn primary wide', href: `#/training/doe/${date}` }, icon('dumbbell'), 'START TRAINING');

export const trainingTabs = (active) => tabs([['#/training', 'Schema'], ['#/oefeningen', 'Oefeningen']], active);

export function renderTrainingWeek(rerender, mondayParam) {
  const t = ts.training();
  const todayIso = today();
  const monday = mondayParam || mondayOf(todayIso);
  const days = ts.weekDays(monday);
  const first = t.plan.days.find((d) => d.date >= monday);

  return h('div', { class: 'page' },
    trainingTabs('#/training'),
    pageHead(days.length ? `Week ${days[0].week} van ${WEEKS} · ${phaseName(days[0].phase)}` : 'Geen trainingen',
      `${shortDate(monday)} – ${shortDate(addDays(monday, 6))}`, `#/training/${addDays(monday, -7)}`, `#/training/${addDays(monday, 7)}`),
    h('div', { class: 'card week-strip' }, [...Array(7)].map((_, i) => {
      const date = addDays(monday, i);
      const st = ts.statusOn(date);
      return h('a', { class: `ws-day ${date === todayIso ? 'today' : ''} ${st ? `st-${st}` : ''}`, href: st ? `#/training/dag/${date}` : null },
        h('span', { class: 'ws-name' }, dayShort(i)),
        h('span', { class: 'ws-dot' }, ts.isDone(st) ? icon('check') : parse(date).getDate()));
    })),
    h('div', { class: 'stats-row' },
      tile(`${days.filter((d) => ts.isDone(ts.statusOn(d.date))).length}/${days.length}`, 'deze week'),
      tile(ts.streak(), 'trainingen op rij'),
      tile(Object.values(t.sessions).filter((s) => s.status !== 'SKIPPED').length, 'in totaal')),
    days.length ? days.map((d) => dayCard(d))
      : h('div', { class: 'card' }, h('p', { class: 'muted' }, first ? `Je schema start op ${longDate(first.date)}.` : 'Deze week valt buiten je schema.')),
    h('p', { class: 'hint' }, 'Tik op een training voor de oefeningen. Een andere sport (zwemmen, padel, ...) op een trainingsdag vervangt die training.'));
}

/** Kaart van één trainingsdag; big = met startknop (op Vandaag). */
export function dayCard(day, big = false) {
  const w = ts.resolveDay(day);
  const st = ts.statusOn(day.date);
  const isToday = day.date === today();
  return h('div', { class: `card training-card ${isToday ? 'is-today' : ''}` },
    h('a', { class: 'tc-head', href: `#/training/dag/${day.date}` },
      h('div', {},
        h('div', { class: 'meal-slot' }, `${dayName(dayIndex(day.date))} ${parse(day.date).getDate()} · ${DAY_TYPES[day.type]}`),
        h('div', { class: 'tc-title' }, w.title),
        h('div', { class: 'meal-meta' }, `± ${estimatedMinutes(w)} min · ${w.items.filter((i) => i.block === 'MAIN').length} krachtoefeningen`)),
      statusChip(st)),
    ts.isOpen(st) && (isToday || big) ? startButton(day.date) : null);
}

export function renderTrainingDay(rerender, date) {
  const day = ts.dayOn(date);
  if (!day) return h('div', { class: 'page' }, back(), h('h1', {}, 'Rustdag'), h('p', { class: 'muted' }, `Op ${longDate(date)} staat geen training gepland.`));
  const w = ts.resolveDay(day);
  const st = ts.statusOn(date);
  const session = ts.sessionOn(date);
  const sub = ts.activityReplacing(date);
  const act = (fn, msg) => () => { fn(); toast(msg); rerender(); };

  const page = h('div', { class: 'page' }, back(),
    h('div', { class: 'recipe-hero t-hoofd' },
      h('div', { class: 'eyebrow' }, longDate(date)),
      h('h1', {}, w.title),
      h('div', { class: 'chips' }, chip(DAY_TYPES[day.type]), chip([icon('clock', 'tiny'), ` ± ${estimatedMinutes(w)} min`]),
        chip(`Week ${day.week} · ${phaseName(day.phase)}`), statusChip(st)),
      h('p', { class: 'small' }, w.description)));

  if (ts.isOpen(st)) {
    page.append(startButton(date),
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn ghost', onclick: act(() => ts.markDone(date), 'Afgevinkt') }, icon('check'), 'Gedaan'),
        h('button', { class: 'btn ghost', onclick: () => activitySheet(date, rerender) }, icon('heart'), 'Andere sport')),
      h('div', { class: 'btn-row' },
        st !== 'skipped' ? h('button', { class: 'btn ghost', onclick: () => skipSheet(date, rerender) }, 'Overslaan') : null,
        date >= today() && ts.freeDaysToMove(date).length ? h('button', { class: 'btn ghost', onclick: () => moveSheet(date) }, 'Verplaatsen') : null),
      h('p', { class: 'hint' }, '"Gedaan" vinkt de training af zonder sets in te geven.'));
  } else {
    const info = sub ? `Vervangen door ${ACTIVITIES[sub.type].label.toLowerCase()} (${sub.minutes} min, ± ${nl(sub.kcal)} kcal).`
      : session.sets.length ? `${session.sets.filter((s) => s.block === 'MAIN').length} krachtsets gelogd${session.durationMin ? ` in ${session.durationMin} min` : ''}${session.rpe ? `, zwaarte ${session.rpe}/10` : ''}.`
        : session.notes || '';
    page.append(h('div', { class: 'card done-card' }, icon('check', 'accent'), h('div', {}, h('b', {}, STATUS[st][0]), h('div', { class: 'small muted' }, info))),
      h('button', { class: 'btn ghost wide', onclick: act(() => { if (sub) ts.removeActivity(sub.id); ts.undo(date); }, 'Teruggezet naar gepland') }, 'Ongedaan maken'));
  }

  for (const [block, label] of Object.entries(BLOCKS)) {
    const items = w.items.filter((i) => i.block === block);
    if (items.length) {
      page.append(h('h2', { class: 'section' }, label), h('div', { class: 'card list-card' }, items.map((i) => listRow(`#/oefening/${i.exercise.code}`,
        i.exercise.name, [itemTarget(i), i.note, i.band && bandText(i)].filter(Boolean).join(' · ')))));
    }
  }
  if (day.finisher?.rounds) page.append(h('p', { class: 'hint' }, `Afsluiter: ${finisherText(day.finisher)}`));
  page.append(h('p', { class: 'hint' }, 'Tik op een oefening voor de uitleg en een voorbeeldvideo.'));
  return page;
}

function skipSheet(date, rerender) {
  const close = sheet('Training overslaan', choices(['Ziek', 'Geen tijd', 'Spierpijn / blessure', 'Op reis', 'Andere reden']
    .map((r) => ({ title: r, onClick: () => { ts.skip(date, r); close(); rerender(); } }))));
}

function moveSheet(date) {
  const close = sheet('Verplaatsen naar', choices(ts.freeDaysToMove(date).map((d) => ({
    title: longDate(d), onClick: () => { ts.moveDay(date, d); close(); location.hash = `#/training/dag/${d}`; toast('Verplaatst'); },
  }))));
}

/** Andere sport registreren (ook bereikbaar vanuit Vandaag). */
export function activitySheet(date, rerender) {
  const v = { type: 'PADEL', intensity: 1 };
  const minutes = h('input', { type: 'text', inputmode: 'numeric', value: '60' });
  const err = h('div', { class: 'error' });
  const close = sheet('Andere sport', h('div', { class: 'form' },
    h('div', { class: 'label' }, 'Sport', segmented(Object.entries(ACTIVITIES).map(([k, a]) => [k, a.label]), (k) => v.type === k, (k) => { v.type = k; }, true)),
    h('div', { class: 'label' }, 'Intensiteit', segmented(INTENSITIES.map((l, i) => [i, l]), (i) => v.intensity === i, (i) => { v.intensity = i; })),
    h('label', {}, 'Duur (minuten)', minutes),
    h('p', { class: 'small muted' }, ts.isOpen(ts.statusOn(date))
      ? `Dit vervangt de training van ${longDate(date)}: de dag telt als voltooid.` : 'Telt mee als extra activiteit (minuten en kcal).'),
    err,
    h('button', {
      class: 'btn primary wide',
      onclick: () => {
        try {
          const r = ts.addActivity({ date, ...v, minutes: minutes.value });
          close();
          toast(`± ${nl(r.kcal)} kcal verbrand${r.replaced ? ' · training vervangen' : ''}`);
          rerender();
        } catch (e) { err.textContent = e.message; }
      },
    }, 'Opslaan')));
}
