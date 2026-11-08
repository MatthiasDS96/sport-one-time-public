import {
  h, icon, nl, toast, dateInput, pageHead, macroTiles, fact, segmented, choices, toggleIn,
} from '../ui.js';
import * as store from '../store.js';
import * as fs from '../nutrition/food-store.js';
import * as ts from '../training/training-store.js';
import { GOALS } from '../nutrition/calc.js';
import { PREP_PRESETS } from '../nutrition/planner.js';
import { EQUIPMENT } from '../training/catalog.js';
import { fromBelgian, toBelgian, mondayOf, dayShort, today } from '../dates.js';

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6].map((d) => [d, dayShort(d)]);

/** Formulier voor het profiel; gebruikt in Profiel en bij de eerste start. onSave(profiel, trainingsdagen) */
function profileForm(p, onSave, buttonText) {
  const name = h('input', { type: 'text', value: p?.name || '', placeholder: 'Je voornaam' });
  const birth = dateInput(p?.birth ? toBelgian(p.birth) : '');
  const height = h('input', { type: 'text', inputmode: 'numeric', value: p?.height ?? '', placeholder: 'cm' });
  const weight = h('input', { type: 'text', inputmode: 'decimal', value: p?.weight != null ? String(p.weight).replace('.', ',') : '', placeholder: 'kg' });
  const v = { sex: p?.sex || 'm', goal: p?.goal || 'recomp', days: [...(ts.training()?.days || ts.DEFAULT_TRAINING.days)] };
  const err = h('div', { class: 'error' });

  const save = () => {
    const b = fromBelgian(birth.value);
    const hgt = Number(height.value);
    const wgt = Number(String(weight.value).replace(',', '.'));
    err.textContent = !b ? 'Geef je geboortedatum in als dd/mm/jjjj.'
      : !(hgt >= 120 && hgt <= 230) ? 'Geef een lengte tussen 120 en 230 cm in.'
        : !(wgt >= 35 && wgt <= 250) ? 'Geef een gewicht tussen 35 en 250 kg in.'
          : !v.days.length || v.days.length > 6 ? 'Kies 1 tot 6 trainingsdagen.' : '';
    if (err.textContent) return;
    onSave({ name: name.value.trim(), sex: v.sex, birth: b, height: hgt, weight: Math.round(wgt * 10) / 10,
      goal: v.goal, trainingDays: v.days.length }, v.days);
  };

  return h('div', { class: 'form' },
    h('label', {}, 'Naam', name),
    h('div', { class: 'label' }, 'Geslacht', segmented([['m', 'Man'], ['v', 'Vrouw']], (x) => v.sex === x, (x) => { v.sex = x; })),
    h('label', {}, 'Geboortedatum', birth),
    h('div', { class: 'two' }, h('label', {}, 'Lengte (cm)', height), h('label', {}, 'Gewicht (kg)', weight)),
    h('div', { class: 'label' }, 'Doel', segmented(Object.entries(GOALS).map(([k, g]) => [k, g.short]), (x) => v.goal === x, (x) => { v.goal = x; })),
    h('div', { class: 'label' }, 'Trainingsdagen', segmented(WEEKDAYS, (d) => v.days.includes(d), (d) => { v.days = toggleIn(v.days, d); })),
    err,
    h('button', { class: 'btn primary wide', onclick: save }, buttonText));
}

export function renderWelcome(rerender) {
  return h('div', { class: 'page welcome' },
    h('div', { class: 'logo' }, icon('dumbbell')),
    h('div', { class: 'eyebrow' }, 'Welkom'),
    h('h1', {}, 'Je persoonlijke coach'),
    h('p', { class: 'muted' }, 'Vul je gegevens in. De app maakt een trainingsschema van 13 weken voor thuis (elastiek, bokszak, bank) en een weekmenu met meal prep, recepten en een boodschappenlijst.'),
    h('div', { class: 'card' }, profileForm(null, (p, days) => {
      store.update((s) => { s.profile = p; s.training = { ...ts.DEFAULT_TRAINING, days, sessions: {}, activities: [] }; });
      ts.ensureTraining();
      location.hash = '#/vandaag';
      rerender();
    }, 'Maak mijn schema')),
    h('p', { class: 'hint' }, 'Alles blijft op dit toestel. Er wordt niets doorgestuurd.'));
}

export function renderProfile(rerender) {
  const s = store.get();
  const t = fs.currentTargets();
  const food = fs.foodSettings();
  const goal = GOALS[s.profile.goal];
  const monday = mondayOf(today());
  const done = (msg) => { fs.replanFromThisWeek(monday); toast(msg); rerender(); };
  const changeFood = (fn) => {
    store.update((st) => { st.food = { ...food }; fn(st.food); });
    done('Weekmenu aangepast');
  };

  const fileInput = h('input', {
    type: 'file', accept: 'application/json,.json', style: { display: 'none' },
    onchange: async () => {
      try {
        store.importJson(await fileInput.files[0].text());
        toast('Back-up teruggezet');
        rerender();
      } catch (e) { alert(e.message); }
    },
  });

  return h('div', { class: 'page' },
    pageHead(s.profile.name || 'Profiel', 'Profiel & doelen'),

    h('div', { class: 'card' },
      h('h2', {}, 'Jouw dagdoel'),
      macroTiles({ kcal: t.kcal, p: t.protein, c: t.carbs, f: t.fat }),
      h('div', { class: 'facts' },
        fact('Ruststofwisseling', `${nl(t.bmr)} kcal`),
        fact('Onderhoud (met activiteit)', `${nl(t.maintenance)} kcal`),
        fact('Doel', `${goal.label} (${goal.adjust > 0 ? '+' : ''}${goal.adjust} kcal)`),
        fact('Eiwit (bereik)', `${t.proteinMin}–${t.proteinMax} g`),
        fact('Water', `± ${nl(t.water, 1)} liter`))),

    h('div', { class: 'card' },
      h('h2', {}, 'Eetschema'),
      h('div', { class: 'label' }, 'Kantoordagen', segmented(WEEKDAYS.slice(0, 5), (d) => food.officeDays.includes(d),
        (d) => changeFood((f) => { f.officeDays = toggleIn(f.officeDays, d); }))),
      h('div', { class: 'label' }, 'Lunch op kantoor', segmented([['out', 'Buiten eten'], ['prep', 'Meal prep mee']],
        (x) => food.officeLunch === x, (x) => changeFood((f) => { f.officeLunch = x; }))),
      h('div', { class: 'label' }, 'Meal prep', choices(Object.entries(PREP_PRESETS).map(([k, p]) => ({
        title: p.label, sub: p.help, on: food.prep === k, onClick: () => changeFood((f) => { f.prep = k; }),
      })))),
      h('p', { class: 'hint' }, 'Een wijziging maakt het weekmenu vanaf deze week opnieuw.')),

    h('div', { class: 'card' },
      h('h2', {}, 'Gegevens'),
      profileForm(s.profile, (p, days) => {
        store.update((st) => { st.profile = p; });
        ts.updateTrainingSettings({ days });
        done('Profiel bewaard, schema en porties aangepast');
      }, 'Bewaren')),

    trainingSettings(rerender, done),

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
        h('li', {}, 'Open deze pagina in Safari (niet in een privévenster).'),
        h('li', {}, 'Tik op het deel-icoon (vierkant met pijl omhoog).'),
        h('li', {}, 'Kies "Zet op beginscherm" en tik op "Voeg toe".')),
      h('p', { class: 'small muted' }, 'Daarna werkt de app ook zonder internet.')),

    h('button', {
      class: 'btn danger wide',
      onclick: () => {
        if (!confirm('Alles wissen op dit toestel? Dit kan je niet ongedaan maken (tenzij je een back-up hebt).')) return;
        store.reset(); location.hash = '#/'; rerender();
      },
    }, 'Alles wissen'));
}

/** Niveau, materiaal en nieuw schema. */
function trainingSettings(rerender, done) {
  const t = ts.training();
  const change = (settings, msg) => {
    try { ts.updateTrainingSettings(settings); toast(msg); rerender(); } catch (e) { alert(e.message); }
  };
  return h('div', { class: 'card' },
    h('h2', {}, 'Training'),
    h('div', { class: 'label' }, 'Startniveau', segmented([['BEGINNER', 'Beginner'], ['INTERMEDIATE', 'Gevorderd']], (k) => t.level === k,
      (k) => { if (t.level !== k && confirm('Alle ketens terugzetten naar het startniveau?')) change({ level: k }, 'Niveau aangepast'); })),
    h('div', { class: 'label' }, 'Materiaal', h('div', { class: 'quick' }, Object.entries(EQUIPMENT).map(([k, l]) => h('button', {
      class: `pill-btn ${t.equipment.includes(k) ? 'on' : ''}`,
      onclick: () => change({ equipment: toggleIn(t.equipment, k) }, 'Materiaal aangepast'),
    }, l)))),
    h('p', { class: 'small muted' }, `Schema van 13 weken, week 1 start op ${toBelgian(t.plan.start)}. Trainingsdagen wijzig je hierboven bij Gegevens.`),
    h('button', {
      class: 'btn ghost wide',
      onclick: () => {
        if (!confirm('Een nieuw schema van 13 weken starten vanaf nu? Je gelogde trainingen blijven bewaard.')) return;
        ts.restartPlan();
        done('Nieuw schema gestart');
      },
    }, 'Nieuw schema starten'));
}

function exportBackup() {
  const blob = new Blob([store.exportJson()], { type: 'application/json' });
  const file = new File([blob], `sport-backup-${today()}.json`, { type: 'application/json' });
  if (navigator.canShare?.({ files: [file] })) {
    navigator.share({ files: [file], title: 'Sport back-up' }).catch(() => {});
    return;
  }
  const a = h('a', { href: URL.createObjectURL(blob), download: file.name });
  document.body.append(a);
  a.click();
  a.remove();
}
