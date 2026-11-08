// Oefeningenbibliotheek (zelfde data als de desktopversie) en materiaalregels.
import DATA from '../data/exercises.js';
import VIDEOS from '../data/videos.js';

export const CHAINS = {
  PUSH_H: { label: 'Duwen', help: 'Opdrukken: borst, schouders, triceps' },
  PUSH_V: { label: 'Duwen boven het hoofd', help: 'Pike push-ups richting handstand: schouders' },
  PULL_H: { label: 'Trekken (roeien)', help: 'Rug en biceps, horizontaal' },
  PULL_V: { label: 'Trekken (verticaal)', help: 'Brede rugspier, van boven naar beneden' },
  SQUAT: { label: 'Benen (squat)', help: 'Dijen en billen' },
  HINGE: { label: 'Heup & hamstrings', help: 'Billen, hamstrings, onderrug' },
  TRICEPS: { label: 'Dips', help: 'Triceps en borst' },
  CORE: { label: 'Core', help: 'Buikspieren en rompstabiliteit' },
  CALF: { label: 'Kuiten', help: 'Kuitspieren' },
};

export const CATEGORIES = {
  STRENGTH: 'Kracht', ACCESSORY: 'Aanvullend', CONDITIONING: 'Conditie', POWER: 'Explosief',
  WARMUP: 'Opwarming', MOBILITY: 'Mobiliteit & stretching',
};

export const EQUIPMENT = {
  BAND: 'Weerstandselastiek',
  DOOR_ANCHOR: 'Deuranker voor elastiek',
  PUNCHING_BAG: 'Bokszak',
  BENCH: 'Bank',
  CHAIR: 'Stevige stoel',
  TABLE: 'Stevige tafel (onder roeien)',
  PULLUP_BAR: 'Rekstok',
};

export const BANDS = ['LIGHT', 'MEDIUM', 'HEAVY', 'EXTRA_HEAVY'];
export const BAND_LABELS = { LIGHT: 'Licht', MEDIUM: 'Middel', HEAVY: 'Zwaar', EXTRA_HEAVY: 'Extra zwaar' };

/** Oefeningen met standaardwaarden ingevuld (zoals de desktop-import). */
export const EXERCISES = DATA.exercises.map((j) => ({
  code: j.code,
  name: j.name,
  chain: j.chain || null,
  category: j.category || (j.chain ? 'STRENGTH' : 'ACCESSORY'),
  level: j.chain ? j.level : 0,
  measure: j.measure || 'REPS',
  perSide: !!j.perSide,
  min: j.min,
  max: j.max,
  band: !!j.band,
  equipment: j.equipment || [],
  muscles: j.muscles || '',
  description: j.description || '',
  tips: j.tips || [],
  mistakes: j.mistakes || [],
}));

const BY_CODE = new Map(EXERCISES.map((e) => [e.code, e]));

export const byCode = (code) => BY_CODE.get(code) || null;

export function ladder(chain) {
  return EXERCISES.filter((e) => e.chain === chain).sort((a, b) => a.level - b.level);
}

/** Een stoel mag een bank vervangen, niet omgekeerd. */
export function hasEquipment(exercise, available) {
  const set = new Set(available);
  return exercise.equipment.every((n) => set.has(n) || (n === 'BENCH' && set.has('CHAIR')));
}

export function availableLadder(chain, equipment) {
  return ladder(chain).filter((e) => hasEquipment(e, equipment));
}

export function startCode(level, chain) {
  return DATA.startLevels[level]?.[chain] || null;
}

/** Dichtstbijzijnde haalbare oefening: eerst makkelijker, anders moeilijker. */
export function nearestAvailable(chain, wanted, equipment) {
  if (hasEquipment(wanted, equipment)) return wanted;
  const l = ladder(chain);
  const easier = l.filter((e) => e.level < wanted.level && hasEquipment(e, equipment)).pop();
  return easier || l.find((e) => e.level > wanted.level && hasEquipment(e, equipment)) || null;
}

/** Startniveaus per keten voor nieuw profiel, rekening houdend met materiaal. */
export function initialLevels(level, equipment, existing = {}) {
  const out = {};
  for (const chain of Object.keys(CHAINS)) {
    const l = ladder(chain);
    if (!l.length) continue;
    const current = existing[chain] && byCode(existing[chain].code);
    const wanted = current || byCode(startCode(level, chain)) || l[0];
    const fit = nearestAvailable(chain, wanted, equipment);
    if (!fit) continue;
    if (current && current.code === fit.code) {
      out[chain] = existing[chain];
    } else {
      out[chain] = fit.band ? { code: fit.code, band: 'LIGHT', steps: 1 } : { code: fit.code };
    }
  }
  return out;
}

export function videoUrl(exercise) {
  const q = VIDEOS[exercise.code] || `${exercise.name} oefening uitvoering`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

/** Uitvoering in stappen: één per zin. */
export function steps(exercise) {
  return exercise.description.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
}

export function targetText(exercise) {
  const range = exercise.min === exercise.max ? `${exercise.min}` : `${exercise.min}–${exercise.max}`;
  const unit = { REPS: 'herh.', TIME: 's', ROUNDS: 'rondes' }[exercise.measure];
  return `${range} ${unit}${exercise.perSide ? ' per kant' : ''}`;
}
