import { h, icon, chip, nl, sheet, toast } from '../ui.js';
import * as ts from '../training/training-store.js';
import {
  BLOCKS, DAY_TYPES, phaseName, itemTarget, bandText, estimatedMinutes, finisherText, workoutName,
  ACTIVITIES, INTENSITIES, WEEKS,
} from '../training/library.js';
import { mondayOf, addDays, dayName, dayShort, shortDate, longDate, today, dayIndex, parse } from '../dates.js';

export const STATUS = {
  done: ['Gedaan', 'ok'], partial: ['Deels gedaan', 'ok'], skipped: ['Overgeslagen', 'warn'],
  substituted: ['Vervangen door andere sport', 'ok'], missed: ['Gemist', 'bad'], planned: ['Gepland', ''],
};

/** Tabjes bovenaan het trainingsgedeelte. */
export function trainingTabs(active) {
  return h('div', { class: 'segmented top-seg' },
    h('a', { href: '#/training', class: active === 'schema' ? 'on' : '' }, 'Schema'),
    h('a', { href: '#/oefeningen', class: active === 'oefeningen' ? 'on' : '' }, 'Oefeningen'));
}

export function renderTrainingWeek(rerender, mondayParam) {
  const t = ts.ensureTraining();
  const todayIso = today();
  const monday = mondayParam || mondayOf(todayIso);
  const days = ts.weekDays(monday);
  const first = days[0] || t.plan.days.find((d) => d.date >= monday);
  const weekNo = days[0]?.week;
  const doneCount = days.filter((d) => ['done', 'partial', 'substituted'].includes(ts.statusOn(d.date))).length;

  const page = h('div', { class: 'page' },
    trainingTabs('schema'),
    h('div', { class: 'page-head' },
      h('div', {},
        h('div', { class: 'eyebrow' }, weekNo ? `Week ${weekNo} van ${WEEKS} · ${phaseName(days[0].phase)}` : 'Geen trainingen'),
        h('h1', {}, `${shortDate(monday)} – ${shortDate(addDays(monday, 6))}`)),
      h('div', { class: 'head-nav' },
        h('a', { class: 'icon-btn', href: `#/training/${addDays(monday, -7)}`, 'aria-label': 'Vorige week' }, icon('chevronL')),
        h('a', { class: 'icon-btn', href: `#/training/${addDays(monday, 7)}`, 'aria-label': 'Volgende week' }, icon('chevronR')))));

  // weekstrook
  page.append(h('div', { class: 'card week-strip' },
    [...Array(7)].map((_, i) => {
      const date = addDays(monday, i);
      const st = ts.statusOn(date);
      return h('a', { class: `ws-day ${date === todayIso ? 'today' : ''} ${st ? `st-${st}` : ''}`, href: st ? `#/training/dag/${date}` : null },
        h('span', { class: 'ws-name' }, dayShort(i)),
        h('span', { class: 'ws-dot' }, st === 'done' || st === 'partial' || st === 'substituted' ? icon('check') : parse(date).getDate()));
    })),
  h('div', { class: 'stats-row' },
    stat(`${doneCount}/${days.length}`, 'deze week'),
    stat(ts.streak(), 'trainingen op rij'),
    stat(Object.values(t.sessions).filter((s) => s.status !== 'SKIPPED').length, 'in totaal')));

  if (!days.length) {
    page.append(h('div', { class: 'card' }, h('p', { class: 'muted' },
      first ? `Je schema start op ${longDate(first.date)}.` : 'Deze week valt buiten je schema.')));
  }
  for (const d of days) page.append(dayCard(d, rerender));

  page.append(h('p', { class: 'hint' },
    'Tik op een training voor de oefeningen. Een andere sport (zwemmen, padel, ...) op een trainingsdag vervangt die training.'));
  return page;
}

function stat(value, label) {
  return h('div', { class: 'tile' }, h('div', { class: 'tile-value' }, value), h('div', { class: 'tile-label' }, label));
}

/** Kaart van één trainingsdag (ook gebruikt op Vandaag). */
export function dayCard(day, rerender, { big = false } = {}) {
  const w = ts.resolveDay(day);
  const st = ts.statusOn(day.date);
  const [label, cls] = STATUS[st];
  const isToday = day.date === today();
  const open = st === 'planned' || st === 'missed' || st === 'skipped';
  return h('div', { class: `card training-card ${isToday ? 'is-today' : ''} ${big ? 'big' : ''}` },
    h('a', { class: 'tc-head', href: `#/training/dag/${day.date}` },
      h('div', {},
        h('div', { class: 'meal-slot' }, `${dayName(dayIndex(day.date))} ${parse(day.date).getDate()} · ${DAY_TYPES[day.type]}`),
        h('div', { class: 'tc-title' }, w.title),
        h('div', { class: 'meal-meta' }, `± ${estimatedMinutes(w)} min · ${w.items.filter((i) => i.block === 'MAIN').length} krachtoefeningen`)),
      h('span', { class: `status ${cls}` }, label)),
    open && (isToday || big) ? h('a', { class: 'btn primary wide', href: `#/training/doe/${day.date}` }, icon('dumbbell'), 'START TRAINING') : null);
}

export function renderTrainingDay(rerender, date) {
  ts.ensureTraining();
  const day = ts.dayOn(date);
  if (!day) {
    return h('div', { class: 'page' }, h('button', { class: 'back', onclick: () => history.back() }, icon('back'), 'Terug'),
      h('h1', {}, 'Rustdag'), h('p', { class: 'muted' }, `Op ${longDate(date)} staat geen training gepland.`));
  }
  const w = ts.resolveDay(day);
  const st = ts.statusOn(date);
  const session = ts.sessionOn(date);
  const sub = ts.activityReplacing(date);
  const open = st === 'planned' || st === 'missed' || st === 'skipped';
  const [label, cls] = STATUS[st];

  const page = h('div', { class: 'page' },
    h('button', { class: 'back', onclick: () => history.back() }, icon('back'), 'Terug'),
    h('div', { class: 'recipe-hero t-hoofd' },
      h('div', { class: 'eyebrow' }, `${longDate(date)}`),
      h('h1', {}, w.title),
      h('div', { class: 'chips' },
        chip(DAY_TYPES[day.type]),
        chip([icon('clock', 'tiny'), ` ± ${estimatedMinutes(w)} min`]),
        chip(`Week ${day.week} · ${phaseName(day.phase)}`),
        h('span', { class: `status ${cls}` }, label)),
      h('p', { class: 'small' }, w.description)));

  if (open) {
    page.append(h('a', { class: 'btn primary wide', href: `#/training/doe/${date}` }, icon('dumbbell'), 'START TRAINING'));
    page.append(h('div', { class: 'btn-row' },
      h('button', { class: 'btn ghost', onclick: () => { ts.markDone(date); toast('Afgevinkt'); rerender(); } }, icon('check'), 'Gedaan'),
      h('button', { class: 'btn ghost', onclick: () => activitySheet(date, rerender) }, icon('heart'), 'Andere sport')));
    const row = h('div', { class: 'btn-row' });
    if (st !== 'skipped') row.append(h('button', { class: 'btn ghost', onclick: () => skipSheet(date, rerender) }, 'Overslaan'));
    if (ts.freeDaysToMove(date).length && date >= today()) row.append(h('button', { class: 'btn ghost', onclick: () => moveSheet(date, rerender) }, 'Verplaatsen'));
    if (row.children.length) page.append(row);
    page.append(h('p', { class: 'hint' }, '"Gedaan" vinkt de training af zonder sets in te geven.'));
  } else {
    const info = sub
      ? `Vervangen door ${ACTIVITIES[sub.type].label.toLowerCase()} (${sub.minutes} min, ± ${nl(sub.kcal)} kcal).`
      : session?.sets?.length ? `${session.sets.filter((s) => s.block === 'MAIN').length} krachtsets gelogd${session.durationMin ? ` in ${session.durationMin} min` : ''}${session.rpe ? `, zwaarte ${session.rpe}/10` : ''}.`
        : session?.notes || '';
    page.append(h('div', { class: 'card done-card' }, icon('check', 'accent'), h('div', {}, h('b', {}, label), h('div', { class: 'small muted' }, info))),
      h('button', {
        class: 'btn ghost wide',
        onclick: () => {
          if (sub) ts.removeActivity(sub.id);
          ts.undo(date);
          toast('Teruggezet naar gepland');
          rerender();
        },
      }, 'Ongedaan maken'));
  }

  for (const [block, blockLabel] of Object.entries(BLOCKS)) {
    const items = w.items.filter((i) => i.block === block);
    if (!items.length) continue;
    page.append(h('h2', { class: 'section' }, blockLabel));
    page.append(h('div', { class: 'card list-card' }, items.map((i) => h('a', { class: 'ex-row', href: `#/oefening/${i.exercise.code}` },
      h('div', { class: 'ex-main' },
        h('div', { class: 'ex-name' }, i.exercise.name),
        h('div', { class: 'meal-meta' }, [itemTarget(i), i.note ? ` · ${i.note}` : '', i.band ? ` · ${bandText(i)}` : ''].join(''))),
      icon('chevronR', 'muted')))));
  }
  if (day.finisher?.rounds) page.append(h('p', { class: 'hint' }, `Afsluiter: ${finisherText(day.finisher)}`));
  page.append(h('p', { class: 'hint' }, 'Tik op een oefening voor de uitleg en een voorbeeldvideo.'));
  return page;
}

function skipSheet(date, rerender) {
  const reasons = ['Ziek', 'Geen tijd', 'Spierpijn / blessure', 'Op reis', 'Andere reden'];
  const close = sheet('Training overslaan', h('div', { class: 'options' },
    reasons.map((r) => h('button', { class: 'option', onclick: () => { ts.skip(date, r); close(); rerender(); } }, h('b', {}, r)))));
}

function moveSheet(date, rerender) {
  const close = sheet('Verplaatsen naar', h('div', { class: 'options' },
    ts.freeDaysToMove(date).map((d) => h('button', {
      class: 'option',
      onclick: () => { ts.moveDay(date, d); close(); location.hash = `#/training/dag/${d}`; toast('Verplaatst'); },
    }, h('b', {}, longDate(d))))));
}

/** Andere sport registreren (ook bereikbaar vanuit Vandaag). */
export function activitySheet(date, rerender) {
  let type = 'PADEL';
  let intensity = 1;
  const minutes = h('input', { type: 'text', inputmode: 'numeric', value: '60' });
  const err = h('div', { class: 'error' });
  const typeWrap = h('div', { class: 'quick' });
  const intWrap = h('div', { class: 'segmented' });
  const drawType = () => typeWrap.replaceChildren(...Object.entries(ACTIVITIES).map(([k, a]) => h('button', {
    class: `pill-btn ${type === k ? 'on' : ''}`, onclick: () => { type = k; drawType(); },
  }, a.label)));
  const drawInt = () => intWrap.replaceChildren(...INTENSITIES.map((l, i) => h('button', {
    class: intensity === i ? 'on' : '', onclick: () => { intensity = i; drawInt(); },
  }, l)));
  drawType(); drawInt();
  const st = ts.statusOn(date);
  const willReplace = st === 'planned' || st === 'missed' || st === 'skipped';
  const close = sheet('Andere sport', h('div', { class: 'form' },
    h('div', { class: 'label' }, 'Sport', typeWrap),
    h('div', { class: 'label' }, 'Intensiteit', intWrap),
    h('label', {}, 'Duur (minuten)', minutes),
    h('p', { class: 'small muted' }, willReplace
      ? `Dit vervangt de training van ${longDate(date)}: de dag telt als voltooid.`
      : 'Telt mee als extra activiteit (minuten en kcal).'),
    err,
    h('button', {
      class: 'btn primary wide',
      onclick: () => {
        try {
          const r = ts.addActivity({ date, type, intensity, minutes: minutes.value });
          close();
          toast(`± ${nl(r.kcal)} kcal verbrand${r.replaced ? ' · training vervangen' : ''}`);
          rerender();
        } catch (e) { err.textContent = e.message; }
      },
    }, 'Opslaan')));
}

export { workoutName };
