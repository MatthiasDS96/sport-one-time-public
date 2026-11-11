// Rust: overzicht van adem- en begeleide oefeningen, en de speler (cirkel of stappen, toon en stem).
import { h, icon, ring, pageHead, tile, listRow, segmented, toast } from '../ui.js';
import * as store from '../store.js';
import { today } from '../dates.js';
import { BREATHS, GUIDED, exerciseById, timeline, totalSeconds, positionAt, calmStats } from '../calm/calm.js';

const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const prefs = () => ({ sound: true, voice: true, ...store.get().calmPrefs });
const lead = (ic) => h('span', { class: 'lvl' }, icon(ic, 'tiny'));
const duration = (e) => (e.minutes ? `${e.minutes[0]}–${e.minutes.at(-1)} min` : `± ${Math.round(totalSeconds(timeline(e)) / 60)} min`);

function statTiles() {
  const s = calmStats(store.get().calm || [], today());
  return h('div', { class: 'stats-row' }, tile(`${s.week} min`, 'deze week'), tile(s.streak, 'dagen op rij'), tile(`${s.total} min`, 'in totaal'));
}

export function renderCalm() {
  const rows = (list, ic) => h('div', { class: 'card list-card' },
    list.map((e) => listRow(`#/rust/${e.id}`, e.name, `${e.sub} · ${duration(e)}`, lead(ic))));
  return h('div', { class: 'page' },
    pageHead('Rust', 'Tot rust komen'),
    statTiles(),
    h('h2', { class: 'section' }, 'Ademhaling'), rows(BREATHS, 'wind'),
    h('h2', { class: 'section' }, 'Begeleid'), rows(GUIDED, 'leaf'),
    h('p', { class: 'hint' }, 'Tip: na een training of voor het slapengaan helpt 5 minuten al. Zet je geluid aan voor de toon en de stem.'));
}

// ---------------------------------------------------------------- speler
let ses = null;          // { timer, wake, ... } lopende sessie
let audio = null;

function chime(freq) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    audio.resume?.();
    const o = audio.createOscillator();
    const g = audio.createGain();
    const t = audio.currentTime;
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o.connect(g); g.connect(audio.destination);
    o.start(t); o.stop(t + 1.7);
  } catch { /* geen geluid */ }
}

function say(text) {
  const sp = window.speechSynthesis;
  if (!sp || !text) return;
  sp.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = sp.getVoices();
  u.voice = v.find((x) => x.lang === 'nl-BE') || v.find((x) => x.lang?.startsWith('nl')) || null;
  u.lang = u.voice?.lang || 'nl-BE';
  u.rate = 0.9;
  sp.speak(u);
}

const SHORT = { in: 'in', top: 'nog wat', out: 'uit', hold: 'vast' };   // gesproken bij ademhaling
const TONE = { in: 528, top: 660, out: 396, hold: 440 };
const SCALE = { in: 1, top: 1.1, out: 0.55 };

const tabbar = (show) => { const n = document.getElementById('tabs'); if (n) n.hidden = !show; };

/** Stopt een lopende sessie en bewaart de minuten; geeft het aantal bewaarde minuten terug. */
export function leavingCalm() {
  if (!ses) return 0;
  const s = ses;
  ses = null;
  clearInterval(s.timer);
  try { window.speechSynthesis?.cancel(); s.wake?.release(); } catch { /* */ }
  return s.save();
}

function save(id, sec) {
  const min = Math.round(sec / 60);
  if (min < 1) return 0;
  store.update((s) => { s.calm = [...(s.calm || []), { date: today(), id, min }]; });
  return min;
}

export function renderCalmSession(rerender, id) {
  const ex = exerciseById(id);
  if (!ex) return h('div', { class: 'page' }, h('p', {}, 'Oefening niet gevonden.'));
  const breath = !!ex.pattern;
  const p = prefs();
  let minutes = ex.minutes ? ex.minutes[1] : null;
  let tl = timeline(ex, minutes);

  // ---- elementen
  const setup = h('div', { class: 'calm-setup' });
  const orb = h('div', { class: 'orb' });
  const orbText = h('div', { class: 'orb-text' });
  const orbCount = h('div', { class: 'orb-count' });
  const visual = breath
    ? h('div', { class: 'orb-wrap' }, orb, h('div', { class: 'orb-label' }, orbText, orbCount))
    : h('div', { class: 'center-box' });
  const stepText = h('p', { class: 'calm-step' });
  const timeLeft = h('div', { class: 'center muted small' });
  const startBtn = h('button', { class: 'btn primary wide big-btn' }, icon('play'), 'START');
  const stopBtn = h('button', { class: 'btn ghost wide', hidden: true }, 'Stoppen');
  const page = h('div', { class: 'page workout calm' },
    h('div', { class: 'wo-top' },
      h('button', { class: 'icon-btn', 'aria-label': 'Sluiten', onclick: () => stop(true) }, icon('x')),
      h('div', { class: 'wo-title' }, h('b', {}, ex.name), h('span', { class: 'muted small' }, breath ? 'Ademhaling' : 'Begeleid')),
      h('span')),
    visual, stepText, timeLeft, setup, startBtn, stopBtn);

  // ---- toestand
  let elapsed = 0;       // seconden vóór de huidige start
  let startedAt = null;  // Date.now() bij (her)start, null = gepauzeerd
  let idx = -1;
  const now = () => elapsed + (startedAt ? (Date.now() - startedAt) / 1000 : 0);

  const setOrb = (kind, sec) => {
    if (!(kind in SCALE)) return;
    orb.style.transition = `transform ${sec}s ease-in-out`;
    orb.style.transform = `scale(${SCALE[kind]})`;
  };
  const freezeOrb = () => { orb.style.transform = getComputedStyle(orb).transform; orb.style.transition = 'none'; };

  const drawIdle = () => {
    const total = totalSeconds(tl);
    timeLeft.textContent = `${mmss(total)} min`;
    if (breath) { orbText.textContent = 'Klaar?'; orbCount.textContent = ''; orb.style.transform = 'scale(0.55)'; }
    else visual.replaceChildren(ring(0, 1, { size: 200, stroke: 12, label: mmss(total), sub: 'min', color: 'var(--blue)' }));
    stepText.textContent = ex.why || ex.sub;
  };

  const tick = () => {
    const t = now();
    const total = totalSeconds(tl);
    const pos = positionAt(tl, t);
    if (pos.i >= tl.length) { finish(); return; }
    const ph = tl[pos.i];
    if (pos.i !== idx) {
      idx = pos.i;
      if (breath) {
        setOrb(ph.kind, pos.left);
        orbText.textContent = ph.text;
        if (p.sound && TONE[ph.kind]) chime(TONE[ph.kind]);
        if (p.voice) say(SHORT[ph.kind]);
      } else {
        stepText.textContent = ph.text;
        if (p.voice) say(ph.text);
        else if (p.sound) chime(528);
      }
    }
    if (breath) orbCount.textContent = Math.ceil(pos.left);
    else visual.replaceChildren(ring(t, total, { size: 200, stroke: 12, label: mmss(total - t), sub: 'nog', color: 'var(--blue)' }));
    timeLeft.textContent = breath ? `nog ${mmss(total - t)}` : `Stap ${idx + 1} van ${tl.length}`;
  };

  const run = () => {
    startedAt = Date.now();
    idx = -1;      // fase opnieuw tonen (en cirkel verder laten lopen)
    tick();
    ses.timer = setInterval(tick, 200);
    startBtn.replaceChildren('Pauze');
  };
  const pause = () => {
    elapsed = now(); startedAt = null;
    clearInterval(ses.timer);
    if (breath) freezeOrb();
    window.speechSynthesis?.cancel();
    startBtn.replaceChildren(icon('play'), 'Verder');
  };

  // zonder await: iOS staat geluid en stem enkel toe binnen de tik zelf
  function start() {
    const s = ses = { timer: null, wake: null, save: () => save(id, now()) };
    navigator.wakeLock?.request('screen').then((w) => { s.wake = w; }).catch(() => { /* niet ondersteund */ });
    setup.hidden = true; stopBtn.hidden = false;
    if (breath) stepText.textContent = '';
    tabbar(false);
    chime(396);
    run();
  }

  function stop(leave) {
    const min = leavingCalm();
    tabbar(true);
    if (min) toast(`${min} min bewaard`);
    if (leave) history.length > 1 ? history.back() : (location.hash = '#/rust');
    else rerender();
  }

  function finish() {
    elapsed = totalSeconds(tl); startedAt = null;
    const min = leavingCalm();
    tabbar(true);
    if (p.sound) { chime(528); setTimeout(() => chime(396), 600); }
    page.replaceChildren(
      h('div', { class: 'center-box done-hero' }, h('div', { class: 'logo' }, icon('check')), h('h1', {}, 'Mooi zo'),
        h('p', { class: 'muted' }, `${ex.name} · ${min} min`)),
      statTiles(),
      h('p', { class: 'hint' }, 'Sta rustig op en neem het gevoel mee in je dag.'),
      h('a', { class: 'btn ghost wide', href: '#/rust' }, 'Naar Rust'),
      h('a', { class: 'btn ghost wide', href: '#/vandaag' }, 'Naar vandaag'));
  }

  startBtn.addEventListener('click', () => {
    if (!ses) start();
    else if (startedAt) pause();
    else run();
  });
  stopBtn.addEventListener('click', () => stop(false));

  // ---- instellingen vóór de start
  const setPref = (k) => { p[k] = !p[k]; store.update((s) => { s.calmPrefs = { ...prefs(), [k]: p[k] }; }); };
  setup.append(...[
    ex.minutes ? h('div', { class: 'calm-row' }, h('span', { class: 'muted small' }, 'Duur'),
      segmented(ex.minutes.map((m) => [m, `${m} min`]), (m) => m === minutes, (m) => { minutes = m; tl = timeline(ex, m); drawIdle(); }, true)) : null,
    h('div', { class: 'calm-row' }, h('span', { class: 'muted small' }, 'Geluid'),
      segmented([['sound', 'Toon'], ['voice', 'Stem']], (k) => p[k], setPref, true))].filter(Boolean));
  drawIdle();
  return page;
}
