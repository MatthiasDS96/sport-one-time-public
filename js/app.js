// Hoofdscherm: router (hash-URL's), tabbalk onderaan en service worker.
import { h, icon } from './ui.js';
import * as store from './store.js';
import { renderToday } from './views/today.js';
import { renderWeek } from './views/week.js';
import { renderRecipes, renderRecipe } from './views/recipes.js';
import { renderShopping } from './views/shopping.js';
import { renderProfile, renderWelcome } from './views/profile.js';
import { renderTrainingWeek, renderTrainingDay } from './views/training.js';
import { renderExercises, renderExercise } from './views/exercises.js';
import { renderWorkout, renderResult, leavingWorkout } from './views/workout.js';

const TABS = [
  ['vandaag', 'Vandaag', 'today'],
  ['training', 'Training', 'dumbbell'],
  ['week', 'Eten', 'book'],
  ['boodschappen', 'Boodschappen', 'cart'],
  ['profiel', 'Profiel', 'user'],
];

// routes die onder een tab horen
const TAB_OF = { recepten: 'week', recept: 'week', oefeningen: 'training', oefening: 'training' };

const main = document.getElementById('main');
const nav = document.getElementById('tabs');

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  return { parts, query: new URLSearchParams(qs || '') };
}

let lastHash = null;

export function render() {
  const { parts, query } = parseHash();
  const [route = 'vandaag', arg, arg2] = parts;
  if (!(route === 'training' && arg === 'doe')) leavingWorkout();
  const hasProfile = !!store.get().profile;
  let view;
  try {
    if (!hasProfile) view = renderWelcome(render);
    else if (route === 'week') view = renderWeek(render, arg);
    else if (route === 'training' && arg === 'dag') view = renderTrainingDay(render, arg2);
    else if (route === 'training' && arg === 'doe') view = renderWorkout(render, arg2);
    else if (route === 'training' && arg === 'klaar') view = renderResult(render, arg2);
    else if (route === 'training') view = renderTrainingWeek(render, arg);
    else if (route === 'oefeningen') view = renderExercises(render);
    else if (route === 'oefening') view = renderExercise(render, arg);
    else if (route === 'recepten') view = renderRecipes(render);
    else if (route === 'recept') view = renderRecipe(render, arg, query);
    else if (route === 'boodschappen') view = renderShopping(render, arg);
    else if (route === 'profiel') view = renderProfile(render);
    else view = renderToday(render, arg);
  } catch (e) {
    console.error(e);
    view = h('div', { class: 'page' }, h('h1', {}, 'Er ging iets mis'), h('pre', { class: 'small' }, String(e.stack || e)));
  }
  const scroll = location.hash === lastHash ? window.scrollY : 0;
  main.replaceChildren(view);
  window.scrollTo(0, scroll);
  lastHash = location.hash;

  const active = TAB_OF[route] || (TABS.some((t) => t[0] === route) ? route : 'vandaag');
  nav.hidden = !hasProfile || (route === 'training' && arg === 'doe');
  nav.replaceChildren(...TABS.map(([key, label, ic]) => h('a', {
    href: `#/${key}`, class: key === active ? 'on' : '',
  }, icon(ic), h('span', {}, label))));
}

window.addEventListener('hashchange', render);

// Demo-modus voor schermafbeeldingen: ?demo=1 vult een voorbeeldprofiel in (niet bewaard).
const params = new URLSearchParams(location.search);
if (params.has('demo')) {
  const demo = {
    profile: { name: 'Demo', sex: 'm', birth: '1995-06-15', height: 178, weight: 75, goal: 'recomp', trainingDays: 3 },
  };
  if (params.get('demo') === 'eaten') {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    demo.log = { [iso]: { eaten: { ontbijt: true, snack1: true } } };
  }
  store.replaceForDemo(demo);
}

render();

if ('serviceWorker' in navigator && !params.has('demo') && location.hostname !== 'localhost') {
  navigator.serviceWorker.register('sw.js').catch((e) => console.warn('Service worker', e));
}
