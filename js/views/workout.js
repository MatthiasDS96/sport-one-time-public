// Uitvoermodus: stap voor stap door de training, sets loggen, rusttimer en intervaltimer.
import { h, icon, ring, progress } from '../ui.js';
import * as ts from '../training/training-store.js';
import { BLOCKS, itemTarget, bandText, previousSets } from '../training/library.js';

const DRAFT_KEY = 'sport-web-draft';
let run = null;          // lopende training
let timer = null;        // setInterval-id
let wakeLock = null;

function saveDraft() {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...run, steps: undefined })); } catch { /* geen opslag */ }
}
function loadDraft(date) {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
    return d && d.date === date ? d : null;
  } catch { return null; }
}
function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* geen opslag */ }
}

/** Zet de training om naar stappen: één per set, per opwarmoefening of per intervalblok. */
function buildSteps(w) {
  const steps = [];
  w.items.forEach((item, idx) => {
    if (item.work != null) steps.push({ kind: 'interval', idx });
    else if (item.block === 'WARMUP' || item.block === 'COOLDOWN') steps.push({ kind: 'simple', idx });
    else for (let s = 1; s <= item.sets; s++) steps.push({ kind: 'set', idx, set: s });
  });
  return steps;
}

// ---------------------------------------------------------------- geluid
let audio = null;
function beep(freq = 880, ms = 180) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.frequency.value = freq;
    g.gain.value = 0.15;
    o.connect(g); g.connect(audio.destination);
    o.start(); o.stop(audio.currentTime + ms / 1000);
    navigator.vibrate?.(ms);
  } catch { /* geen geluid */ }
}

async function keepAwake() {
  try { wakeLock = await navigator.wakeLock?.request('screen'); } catch { /* niet ondersteund */ }
}

function stopTimer() {
  if (timer) clearInterval(timer);
  timer = null;
}

// ---------------------------------------------------------------- scherm
export function renderWorkout(rerender, date) {
  stopTimer();
  const day = ts.dayOn(date);
  if (!day) return h('div', { class: 'page' }, h('p', {}, 'Geen training op deze dag.'));
  const w = ts.resolveDay(day);

  if (!run || run.date !== date) {
    const draft = loadDraft(date);
    run = draft || { date, workout: day.workout, started: new Date().toISOString(), pos: 0, sets: [], values: {},
      phase: 'work', restUntil: null, finished: false };
  }
  run.steps = buildSteps(w);
  keepAwake();

  if (run.finished || run.pos >= run.steps.length) return finishScreen(w, rerender);
  const step = run.steps[run.pos];
  const item = w.items[step.idx];
  if (run.phase === 'rest') return restScreen(w, rerender);
  if (step.kind === 'interval') return intervalScreen(w, item, rerender);
  return workScreen(w, step, item, rerender);
}

function shell(w, content, rerender) {
  return h('div', { class: 'page workout' },
    h('div', { class: 'wo-top' },
      h('button', {
        class: 'icon-btn', 'aria-label': 'Stoppen',
        onclick: () => {
          if (run.sets.length && confirm('Training stoppen en opslaan wat je al deed?')) { run.finished = true; rerender(); return; }
          if (!run.sets.length && confirm('Training stoppen zonder op te slaan?')) {
            stopTimer(); clearDraft(); const d = run.date; run = null; location.hash = `#/training/dag/${d}`;
          }
        },
      }, icon('x')),
      h('div', { class: 'wo-title' }, h('b', {}, w.title), h('span', { class: 'muted small' }, `Stap ${Math.min(run.pos + 1, run.steps.length)} van ${run.steps.length}`)),
      h('span')),
    progress(run.pos / run.steps.length),
    content);
}

function next(rerender, restSec = 0) {
  run.pos++;
  if (restSec > 0 && run.pos < run.steps.length) {
    run.phase = 'rest';
    run.restUntil = Date.now() + restSec * 1000;
  } else {
    run.phase = 'work';
  }
  saveDraft();
  rerender();
}

function workScreen(w, step, item, rerender) {
  const ex = item.exercise;
  const isSet = step.kind === 'set';
  const key = `${step.idx}`;
  const timed = ex.measure === 'TIME';
  const prev = isSet ? previousSets(ex.code, ts.training().sessions, run.date) : [];
  // start op je vorige resultaat voor deze set, anders op wat je net deed, anders de ondergrens
  const setKey = `${key}-${step.set}`;
  let value = run.values[setKey] ?? prev[step.set - 1]?.value ?? run.values[key] ?? (isSet ? item.min : 0);
  const valueEl = h('div', { class: 'wo-value' }, value);
  const setValue = (v) => { value = Math.max(0, v); valueEl.textContent = value; run.values[key] = value; run.values[setKey] = value; };

  const content = [
    h('div', { class: 'eyebrow wo-block' }, BLOCKS[item.block]),
    h('a', { class: 'wo-name', href: `#/oefening/${ex.code}` }, ex.name, icon('chevronR', 'muted')),
    h('div', { class: 'wo-target' }, isSet ? `Set ${step.set} van ${item.sets} · doel ${item.min === item.max ? item.min : `${item.min}–${item.max}`}${timed ? ' s' : ''}${ex.perSide ? ' per kant' : ''}` : itemTarget(item)),
    item.note ? h('div', { class: 'small muted center' }, item.note) : null,
    item.band ? h('div', { class: 'chip accent wo-band' }, bandText(item)) : null,
  ];

  if (isSet) {
    content.push(
      h('div', { class: 'wo-stepper' },
        h('button', { class: 'round-btn', onclick: () => setValue(value - (timed ? 5 : 1)) }, '−'),
        valueEl,
        h('button', { class: 'round-btn', onclick: () => setValue(value + (timed ? 5 : 1)) }, '+')),
      h('div', { class: 'center muted small' }, timed ? 'seconden volgehouden' : 'herhalingen gedaan'),
      prev.length ? h('div', { class: 'center small prev' }, `Vorige keer: ${prev.map((s) => s.value).join(' · ')}`) : null,
      timed ? timedHelper(item.max, setValue) : null,
      h('button', {
        class: 'btn primary wide big-btn',
        onclick: () => {
          run.sets.push({ code: ex.code, block: item.block, set: step.set, value, targetMax: item.max,
            band: item.band || null, steps: item.steps ?? null });
          beep(660, 120);
          const lastOfItem = step.set === item.sets;
          next(rerender, lastOfItem ? Math.min(item.rest, 90) : item.rest);
        },
      }, icon('check'), 'SET KLAAR'));
  } else {
    content.push(
      timed ? timedHelper(item.max * (ex.perSide ? 2 : 1), null, true) : h('div', { class: 'center muted wo-simple' }, ex.perSide ? 'Beide kanten' : 'Rustig en gecontroleerd'),
      h('button', { class: 'btn primary wide big-btn', onclick: () => next(rerender, item.rest) }, icon('check'), 'KLAAR'));
  }
  content.push(h('a', { class: 'btn ghost wide', href: `#/oefening/${ex.code}` }, 'Uitleg en video'));
  return shell(w, content, rerender);
}

/** Aftelklok voor tijdsoefeningen (plank, opwarming, stretches). */
function timedHelper(seconds, onDone, autoStart = false) {
  let left = seconds;
  let running = false;
  const label = h('div', { class: 'ring-value' }, `${left}`);
  const btn = h('button', { class: 'btn ghost wide' }, 'Start klok');
  const wrap = h('div', { class: 'timed' }, h('div', { class: 'timed-clock' }, label, h('span', { class: 'muted small' }, 'seconden')), btn);
  const tick = () => {
    left--;
    label.textContent = `${Math.max(0, left)}`;
    if (left === 3 || left === 2 || left === 1) beep(520, 80);
    if (left <= 0) {
      stopTimer(); running = false; beep(990, 400);
      btn.textContent = 'Opnieuw';
      onDone?.(seconds);
      left = seconds;
    }
  };
  btn.addEventListener('click', () => {
    if (running) { stopTimer(); running = false; btn.textContent = 'Verder'; return; }
    stopTimer();
    running = true;
    btn.textContent = 'Pauze';
    timer = setInterval(tick, 1000);
  });
  if (autoStart) setTimeout(() => btn.click(), 0);
  return wrap;
}

function restScreen(w, rerender) {
  const step = run.steps[run.pos];
  const item = w.items[step.idx];
  const total = Math.max(1, Math.round((run.restUntil - Date.now()) / 1000));
  const ringWrap = h('div', { class: 'center-box' });
  const draw = () => {
    const left = Math.max(0, Math.ceil((run.restUntil - Date.now()) / 1000));
    ringWrap.replaceChildren(ring(left, total, { size: 220, stroke: 16, label: `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`, sub: 'rust', color: 'var(--blue)' }));
    if (left <= 3 && left > 0) beep(520, 80);
    if (left <= 0) { stopTimer(); beep(990, 400); run.phase = 'work'; saveDraft(); rerender(); }
  };
  draw();
  timer = setInterval(draw, 1000);
  return shell(w, [
    h('div', { class: 'eyebrow wo-block' }, 'Rust'),
    ringWrap,
    h('div', { class: 'btn-row' },
      h('button', { class: 'btn ghost', onclick: () => { run.restUntil += 30000; saveDraft(); rerender(); } }, '+30 s'),
      h('button', { class: 'btn primary', onclick: () => { stopTimer(); run.phase = 'work'; saveDraft(); rerender(); } }, 'Overslaan')),
    h('div', { class: 'card next-up' }, h('div', { class: 'small muted' }, 'Hierna'),
      h('b', {}, item.exercise.name), h('div', { class: 'small muted' }, step.kind === 'set' ? `Set ${step.set} van ${item.sets}` : itemTarget(item))),
  ], rerender);
}

function intervalScreen(w, item, rerender) {
  const ex = item.exercise;
  const st = run.interval && run.interval.idx === run.steps[run.pos].idx ? run.interval
    : (run.interval = { idx: run.steps[run.pos].idx, round: 1, phase: 'ready', until: null, done: 0 });
  const ringWrap = h('div', { class: 'center-box' });
  const info = h('div', { class: 'center wo-target' });
  const btn = h('button', { class: 'btn primary wide big-btn' });

  const finishIntervals = () => {
    stopTimer();
    run.sets.push({ code: ex.code, block: item.block, set: 1, value: st.done, targetMax: item.sets, band: null, steps: null });
    run.interval = null;
    next(rerender, 0);
  };
  const draw = () => {
    const left = st.until ? Math.max(0, Math.ceil((st.until - Date.now()) / 1000)) : item.work;
    const total = st.phase === 'rest' ? item.rest : item.work;
    ringWrap.replaceChildren(ring(left, total, {
      size: 220, stroke: 16, label: `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`,
      sub: st.phase === 'rest' ? 'rust' : st.phase === 'work' ? 'werk!' : 'klaar?', color: st.phase === 'rest' ? 'var(--blue)' : 'var(--accent)',
    }));
    info.textContent = `Ronde ${st.round} van ${item.sets}`;
    btn.replaceChildren(st.phase === 'ready' ? 'START' : 'Stop en bewaar rondes');
    if (st.until && left <= 3 && left > 0) beep(520, 80);
    if (st.until && left <= 0) {
      if (st.phase === 'work') {
        st.done++;
        if (st.round >= item.sets) { beep(990, 600); finishIntervals(); return; }
        st.phase = 'rest'; st.until = Date.now() + item.rest * 1000; beep(440, 300);
      } else {
        st.round++; st.phase = 'work'; st.until = Date.now() + item.work * 1000; beep(990, 300);
      }
      saveDraft();
    }
  };
  btn.addEventListener('click', () => {
    if (st.phase === 'ready') {
      st.phase = 'work'; st.until = Date.now() + item.work * 1000; beep(990, 300);
      stopTimer(); timer = setInterval(draw, 250); draw();
    } else finishIntervals();
  });
  draw();
  if (st.phase !== 'ready') timer = setInterval(draw, 250);
  return shell(w, [
    h('div', { class: 'eyebrow wo-block' }, BLOCKS[item.block]),
    h('a', { class: 'wo-name', href: `#/oefening/${ex.code}` }, ex.name, icon('chevronR', 'muted')),
    h('div', { class: 'wo-target' }, itemTarget(item)),
    ringWrap, info, btn,
    h('p', { class: 'hint' }, ex.code.startsWith('BAG') ? 'Combinaties: 1-2, 1-2-3, 1-2-3-2. Handen terug naar je gezicht, blijf bewegen.' : ''),
  ], rerender);
}

function finishScreen(w, rerender) {
  stopTimer();
  let rpe = 7;
  const notes = h('input', { type: 'text', placeholder: 'Notitie (mag leeg)' });
  const rpeWrap = h('div', { class: 'rpe' });
  const drawRpe = () => rpeWrap.replaceChildren(...[...Array(10)].map((_, i) => h('button', {
    class: rpe === i + 1 ? 'on' : '', onclick: () => { rpe = i + 1; drawRpe(); },
  }, i + 1)));
  drawRpe();
  const mainSets = run.sets.filter((s) => s.block === 'MAIN').length;
  const minutes = Math.max(1, Math.round((Date.now() - new Date(run.started)) / 60000));
  return h('div', { class: 'page workout' },
    h('div', { class: 'center-box done-hero' }, h('div', { class: 'logo' }, icon('check')), h('h1', {}, 'Goed gedaan!'),
      h('p', { class: 'muted' }, `${w.title} · ${minutes} min · ${mainSets} krachtsets`)),
    h('div', { class: 'card' }, h('h2', {}, 'Hoe zwaar was het?'), rpeWrap,
      h('div', { class: 'small muted', style: { marginTop: '8px' } }, '1 = heel licht · 7 = stevig, nog 2–3 herhalingen over · 10 = alles gegeven')),
    h('div', { class: 'card' }, notes),
    h('button', {
      class: 'btn primary wide big-btn',
      onclick: () => {
        try {
          const result = ts.saveSession({ date: run.date, workout: run.workout, started: run.started,
            ended: new Date().toISOString(), rpe, notes: notes.value, sets: run.sets });
          const date = run.date;
          clearDraft(); run = null;
          try { wakeLock?.release(); } catch { /* */ }
          showResult(result, date);
        } catch (e) { alert(e.message); }
      },
    }, 'OPSLAAN'));
}

function showResult(result, date) {
  sessionStorage.setItem('sport-result', JSON.stringify(result));
  location.hash = `#/training/klaar/${date}`;
}

export function renderResult(rerender, date) {
  let result;
  try { result = JSON.parse(sessionStorage.getItem('sport-result') || 'null'); } catch { result = null; }
  const page = h('div', { class: 'page' },
    h('div', { class: 'center-box done-hero' }, h('div', { class: 'logo' }, icon('check')), h('h1', {}, 'Opgeslagen')));
  if (result?.records?.length) {
    page.append(h('div', { class: 'card' }, h('h2', {}, 'Nieuwe records'),
      result.records.map((r) => h('div', { class: 'fact' }, h('span', {}, r.name), h('b', {}, `${r.value}${r.measure === 'TIME' ? ' s' : ''}`)))));
  }
  for (const s of result?.suggestions || []) {
    const card = h('div', { class: 'card tip' }, h('p', {}, s.message));
    card.append(h('div', { class: 'btn-row' },
      h('button', { class: 'btn primary', onclick: () => { ts.applyProgress(s); card.replaceChildren(h('p', { class: 'muted' }, 'Toegepast. Volgende training gebruikt dit niveau.')); } }, 'Doen'),
      h('button', { class: 'btn ghost', onclick: () => card.remove() }, 'Nog niet')));
    page.append(card);
  }
  if (!result?.suggestions?.length && !result?.records?.length) {
    page.append(h('p', { class: 'muted center' }, 'Blijf zo doorgaan. Haal je in alle sets de bovengrens, dan stelt de app een zwaardere variant voor.'));
  }
  page.append(h('a', { class: 'btn ghost wide', href: `#/training/dag/${date}` }, 'Naar de training'),
    h('a', { class: 'btn ghost wide', href: '#/vandaag' }, 'Naar vandaag'));
  return page;
}

export function leavingWorkout() {
  stopTimer();
}
