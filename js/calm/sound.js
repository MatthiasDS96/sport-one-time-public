// Geluid voor Rust: zachte toon bij faseswissels en rustgevende achtergrondmuziek, volledig gegenereerd (Web Audio).
let ctx = null;

/** Eén AudioContext; moet binnen een tik voor het eerst gemaakt/hervat worden (iOS). */
function audio() {
  // iOS: ook geluid als de stilschakelaar aan staat (Safari 16.4+)
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* */ }
  ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state !== 'running') ctx.resume?.();
  return ctx;
}

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

/** Zachte belklank. */
export function chime(freq, vol = 0.12, out = null) {
  try {
    const a = audio();
    const o = a.createOscillator();
    const g = a.createGain();
    const t = a.currentTime;
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
    o.connect(g); g.connect(out || a.destination);
    o.start(t); o.stop(t + 2.6);
  } catch { /* geen geluid */ }
}

// Akkoorden (Cmaj7 – Am7 – Fmaj7 – G6sus) en een pentatonische reeks voor losse belnoten.
const CHORDS = [[48, 52, 55, 59], [45, 48, 52, 55], [41, 45, 48, 52], [43, 50, 55, 57]];
const BELLS = [72, 74, 76, 79, 81, 84];
const CHORD_SEC = 14;

let music = null;   // { master, timers, voices }

/** Galm: impulsrespons van uitdovende ruis. */
function reverb(a) {
  const len = a.sampleRate * 4;
  const buf = a.createBuffer(2, len, a.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  }
  const r = a.createConvolver();
  r.buffer = buf;
  return r;
}

export function startMusic() {
  if (music) return;
  try {
    const a = audio();
    const t = a.currentTime;
    const master = a.createGain();
    master.gain.setValueAtTime(0.0001, t);
    master.gain.exponentialRampToValueAtTime(0.5, t + 4);
    const filter = a.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 900;
    const lfo = a.createOscillator();
    const lfoGain = a.createGain();
    lfo.frequency.value = 0.05; lfoGain.gain.value = 300;
    lfo.connect(lfoGain); lfoGain.connect(filter.frequency); lfo.start();
    const rev = reverb(a);
    const wet = a.createGain(); wet.gain.value = 0.6;
    filter.connect(master); filter.connect(rev); rev.connect(wet); wet.connect(master);
    master.connect(a.destination);
    music = { master, filter, rev: wet, timers: [], nodes: [lfo], chord: 0 };

    const playChord = () => {
      const now = a.currentTime;
      for (const n of CHORDS[music.chord % CHORDS.length]) {
        for (const [type, detune] of [['sine', -4], ['triangle', 4]]) {
          const o = a.createOscillator();
          const g = a.createGain();
          o.type = type; o.frequency.value = hz(n); o.detune.value = detune;
          g.gain.setValueAtTime(0.0001, now);
          g.gain.exponentialRampToValueAtTime(0.035, now + 5);
          g.gain.setValueAtTime(0.035, now + CHORD_SEC - 1);
          g.gain.exponentialRampToValueAtTime(0.0001, now + CHORD_SEC + 5);
          o.connect(g); g.connect(filter);
          o.start(now); o.stop(now + CHORD_SEC + 5.1);
        }
      }
      music.chord++;
    };
    const bell = () => {
      if (!music) return;
      chime(hz(BELLS[Math.floor(Math.random() * BELLS.length)]), 0.03, music.filter);
      music.timers.push(setTimeout(bell, 4000 + Math.random() * 6000));
    };
    playChord();
    music.timers.push(setInterval(playChord, CHORD_SEC * 1000), setTimeout(bell, 6000));
  } catch { music = null; }
}

export function stopMusic() {
  if (!music) return;
  const m = music;
  music = null;
  m.timers.forEach((id) => { clearTimeout(id); clearInterval(id); });
  try {
    const t = ctx.currentTime;
    m.master.gain.cancelScheduledValues(t);
    m.master.gain.setValueAtTime(m.master.gain.value || 0.5, t);
    m.master.gain.exponentialRampToValueAtTime(0.0001, t + 2);
    setTimeout(() => { m.nodes.forEach((n) => n.stop()); m.master.disconnect(); }, 2200);
  } catch { /* */ }
}
