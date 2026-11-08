import { h, icon, nl, toast, dateInput } from '../ui.js';
import * as store from '../store.js';
import * as fs from '../nutrition/food-store.js';
import { GOALS } from '../nutrition/calc.js';
import { PREP_PRESETS } from '../nutrition/planner.js';
import { fromBelgian, toBelgian, mondayOf, dayShort } from '../dates.js';

/** Formulier voor het profiel; gebruikt in Profiel en bij de eerste start. */
function profileForm(p, onSave, buttonText) {
  const name = h('input', { type: 'text', value: p?.name || '', placeholder: 'Je voornaam' });
  let sex = p?.sex || 'm';
  const birth = dateInput(p?.birth ? toBelgian(p.birth) : '');
  const height = h('input', { type: 'text', inputmode: 'numeric', value: p?.height ?? '', placeholder: 'cm' });
  const weight = h('input', { type: 'text', inputmode: 'decimal', value: p?.weight != null ? String(p.weight).replace('.', ',') : '', placeholder: 'kg' });
  let goal = p?.goal || 'recomp';
  let days = p?.trainingDays ?? 3;
  const err = h('div', { class: 'error' });

  const seg = (options, get, set) => {
    const wrap = h('div', { class: 'segmented' });
    const draw = () => wrap.replaceChildren(...options.map(([v, label]) => h('button', {
      type: 'button', class: get() === v ? 'on' : '', onclick: () => { set(v); draw(); },
    }, label)));
    draw();
    return wrap;
  };

  return h('div', { class: 'form' },
    h('label', {}, 'Naam', name),
    h('div', { class: 'label' }, 'Geslacht', seg([['m', 'Man'], ['v', 'Vrouw']], () => sex, (v) => { sex = v; })),
    h('label', {}, 'Geboortedatum', birth),
    h('div', { class: 'two' }, h('label', {}, 'Lengte (cm)', height), h('label', {}, 'Gewicht (kg)', weight)),
    h('div', { class: 'label' }, 'Doel', seg(Object.entries(GOALS).map(([k, g]) => [k, g.short]), () => goal, (v) => { goal = v; })),
    h('div', { class: 'label' }, 'Trainingen per week', seg([[2, '2'], [3, '3'], [4, '4'], [5, '5+']], () => days, (v) => { days = v; })),
    err,
    h('button', {
      class: 'btn primary wide',
      onclick: () => {
        const b = fromBelgian(birth.value);
        const hgt = Number(height.value);
        const wgt = Number(String(weight.value).replace(',', '.'));
        if (!b) { err.textContent = 'Geef je geboortedatum in als dd/mm/jjjj.'; return; }
        if (!(hgt >= 120 && hgt <= 230)) { err.textContent = 'Geef een lengte tussen 120 en 230 cm in.'; return; }
        if (!(wgt >= 35 && wgt <= 250)) { err.textContent = 'Geef een gewicht tussen 35 en 250 kg in.'; return; }
        err.textContent = '';
        onSave({ name: name.value.trim(), sex, birth: b, height: hgt, weight: Math.round(wgt * 10) / 10, goal, trainingDays: days });
      },
    }, buttonText));
}

export function renderWelcome(rerender) {
  return h('div', { class: 'page welcome' },
    h('div', { class: 'logo' }, icon('dumbbell')),
    h('div', { class: 'eyebrow' }, 'Welkom'),
    h('h1', {}, 'Je persoonlijke eetschema'),
    h('p', { class: 'muted' }, 'Vul je gegevens in. De app berekent hoeveel je per dag nodig hebt en maakt een weekmenu met meal prep, recepten en een boodschappenlijst.'),
    h('div', { class: 'card' }, profileForm(null, (p) => {
      store.update((s) => { s.profile = p; });
      fs.ensurePlan(mondayOf(fs.todayIso()));
      location.hash = '#/vandaag';
      rerender();
    }, 'Maak mijn eetschema')),
    h('p', { class: 'hint' }, 'Alles blijft op dit toestel. Er wordt niets doorgestuurd.'));
}

export function renderProfile(rerender) {
  const s = store.get();
  const t = fs.currentTargets();
  const food = fs.foodSettings();
  const monday = mondayOf(fs.todayIso());

  const changeFood = (fn, msg) => {
    store.update((st) => { st.food = { ...fs.foodSettings(), ...(st.food || {}) }; fn(st.food); });
    fs.replanFromThisWeek(monday);
    toast(msg || 'Weekmenu aangepast');
    rerender();
  };

  const officeDays = h('div', { class: 'segmented' }, [0, 1, 2, 3, 4].map((d) => h('button', {
    class: food.officeDays.includes(d) ? 'on' : '',
    onclick: () => changeFood((f) => {
      f.officeDays = f.officeDays.includes(d) ? f.officeDays.filter((x) => x !== d) : [...f.officeDays, d].sort();
    }),
  }, dayShort(d))));

  const fileInput = h('input', {
    type: 'file', accept: 'application/json,.json', style: { display: 'none' },
    onchange: async () => {
      const file = fileInput.files[0];
      if (!file) return;
      try {
        store.importJson(await file.text());
        toast('Back-up teruggezet');
        rerender();
      } catch (e) { alert(e.message); }
    },
  });

  return h('div', { class: 'page' },
    h('div', { class: 'page-head' }, h('div', {}, h('div', { class: 'eyebrow' }, s.profile.name || 'Profiel'), h('h1', {}, 'Profiel & doelen'))),

    h('div', { class: 'card' },
      h('h2', {}, 'Jouw dagdoel'),
      h('div', { class: 'macro-tiles' },
        tile(nl(t.kcal), 'kcal'), tile(`${t.protein} g`, 'eiwit'), tile(`${t.carbs} g`, 'koolh.'), tile(`${t.fat} g`, 'vet')),
      h('div', { class: 'facts' },
        fact('Ruststofwisseling', `${nl(t.bmr)} kcal`),
        fact('Onderhoud (met activiteit)', `${nl(t.maintenance)} kcal`),
        fact('Doel', `${GOALS[s.profile.goal].label} (${GOALS[s.profile.goal].adjust > 0 ? '+' : ''}${GOALS[s.profile.goal].adjust} kcal)`),
        fact('Eiwit (bereik)', `${t.proteinMin}–${t.proteinMax} g`),
        fact('Water', `± ${nl(t.water, 1)} liter`))),

    h('div', { class: 'card' },
      h('h2', {}, 'Eetschema'),
      h('div', { class: 'label' }, 'Kantoordagen', officeDays),
      h('div', { class: 'label' }, 'Lunch op kantoor', h('div', { class: 'segmented' },
        [['out', 'Buiten eten'], ['prep', 'Meal prep mee']].map(([v, l]) => h('button', {
          class: food.officeLunch === v ? 'on' : '', onclick: () => changeFood((f) => { f.officeLunch = v; }),
        }, l)))),
      h('div', { class: 'label' }, 'Meal prep', h('div', { class: 'options' },
        Object.entries(PREP_PRESETS).map(([k, p]) => h('button', {
          class: `option ${food.prep === k ? 'on' : ''}`, onclick: () => changeFood((f) => { f.prep = k; }),
        }, h('b', {}, p.label), h('div', { class: 'small muted' }, p.help))))),
      h('p', { class: 'hint' }, 'Een wijziging maakt het weekmenu vanaf deze week opnieuw.')),

    h('div', { class: 'card' },
      h('h2', {}, 'Gegevens'),
      profileForm(s.profile, (p) => {
        store.update((st) => { st.profile = p; });
        fs.replanFromThisWeek(monday);
        toast('Profiel bewaard, porties herberekend');
        rerender();
      }, 'Bewaren')),

    h('div', { class: 'card' },
      h('h2', {}, 'Back-up'),
      h('p', { class: 'small muted' }, 'Je gegevens staan enkel op dit toestel. Maak af en toe een back-up (bv. naar iCloud Drive) en zet die terug op je iPad of nieuwe telefoon.'),
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn ghost', onclick: exportBackup }, icon('download'), 'Exporteren'),
        h('button', { class: 'btn ghost', onclick: () => fileInput.click() }, icon('upload'), 'Terugzetten')),
      fileInput),

    h('div', { class: 'card' },
      h('h2', {}, 'Op je beginscherm zetten'),
      h('ol', { class: 'steps small' },
        h('li', {}, 'Open deze pagina in Safari.'),
        h('li', {}, 'Tik op het deel-icoon (vierkant met pijl omhoog).'),
        h('li', {}, 'Kies "Zet op beginscherm" en tik op "Voeg toe".')),
      h('p', { class: 'small muted' }, 'Daarna werkt de app ook zonder internet.')),

    h('button', {
      class: 'btn danger wide',
      onclick: () => {
        if (confirm('Alles wissen op dit toestel? Dit kan je niet ongedaan maken (tenzij je een back-up hebt).')) {
          store.reset(); location.hash = '#/'; rerender();
        }
      },
    }, 'Alles wissen'));
}

function exportBackup() {
  const blob = new Blob([store.exportJson()], { type: 'application/json' });
  const file = new File([blob], `sport-backup-${fs.todayIso()}.json`, { type: 'application/json' });
  if (navigator.canShare?.({ files: [file] })) {
    navigator.share({ files: [file], title: 'Sport back-up' }).catch(() => {});
    return;
  }
  const a = h('a', { href: URL.createObjectURL(blob), download: file.name });
  document.body.append(a);
  a.click();
  a.remove();
}

function tile(value, label) {
  return h('div', { class: 'tile' }, h('div', { class: 'tile-value' }, value), h('div', { class: 'tile-label' }, label));
}

function fact(label, value) {
  return h('div', { class: 'fact' }, h('span', { class: 'muted' }, label), h('b', {}, value));
}
