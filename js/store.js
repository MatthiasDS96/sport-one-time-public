// Opslag op het toestel zelf (localStorage). Op een iPhone blijft dit bewaard zolang de app op het
// beginscherm staat. Gebruik Exporteren in Profiel als back-up.

const KEY = 'sport-web-v1';

const EMPTY = () => ({
  version: 1,
  profile: null,       // { name, sex, birth, height, weight, goal, trainingDays }
  food: {},            // eetschema-instellingen (zie DEFAULT_FOOD_SETTINGS)
  plans: {},           // maandag → weekplan
  log: {},             // datum → { eaten: { slot: true }, office: optionId, extras: [{ name, kcal, p }] }
  shopping: {},        // maandag → { id: true } (afgevinkt)
  prices: {},          // eigen prijzen: foodId → { winkel: euro }
  calm: [],            // rustmomenten [{ date, id, min }]
  calmPrefs: {},       // { sound, voice }
});

let state = load();
let demoMode = false;
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...EMPTY(), ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Opslag niet leesbaar', e);
  }
  return EMPTY();
}

function persist() {
  if (demoMode) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Opslaan mislukt', e);
  }
}

export function get() {
  return state;
}

/** Past de toestand aan via een functie die het (kopie-)object wijzigt, en bewaart. */
export function update(fn) {
  const next = structuredClone(state);
  fn(next);
  state = next;
  persist();
  listeners.forEach((l) => l(state));
}

export function onChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function exportJson() {
  return JSON.stringify({ app: 'sport-web', exported: new Date().toISOString(), ...state }, null, 2);
}

export function importJson(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Dit bestand is geen geldige back-up.');
  }
  if (data.app !== 'sport-web') throw new Error('Dit bestand is geen back-up van de Sport-app.');
  const { app, exported, ...rest } = data;
  state = { ...EMPTY(), ...rest };
  persist();
  listeners.forEach((l) => l(state));
}

export function reset() {
  state = EMPTY();
  persist();
  listeners.forEach((l) => l(state));
}

/** Enkel voor schermafbeeldingen/tests: vervangt de toestand zonder op te slaan. */
export function replaceForDemo(s) {
  demoMode = true;
  state = { ...EMPTY(), ...s };
}
