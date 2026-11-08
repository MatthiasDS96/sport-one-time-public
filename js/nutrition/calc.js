// Pure berekeningen rond energie en macro's (zelfde formules als de desktopversie: BodyCalc).

export const GOALS = {
  recomp: { label: 'Gespierder + buikvet kwijt', short: 'Recomposition', adjust: -350 },
  fatloss: { label: 'Vet verliezen', short: 'Vet verliezen', adjust: -500 },
  muscle: { label: 'Spiermassa opbouwen', short: 'Spiermassa', adjust: 250 },
};

/** Leeftijd in jaren op een bepaalde datum (ISO-strings 'yyyy-mm-dd'). */
export function ageOn(birthIso, todayIso) {
  const [by, bm, bd] = birthIso.split('-').map(Number);
  const [ty, tm, td] = todayIso.split('-').map(Number);
  let age = ty - by;
  if (tm < bm || (tm === bm && td < bd)) age--;
  return age;
}

/** Ruststofwisseling volgens Mifflin-St Jeor. */
export function bmr(sex, weightKg, heightCm, age) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'm' ? base + 5 : base - 161;
}

/** Activiteitsfactor: zittende job, ± 8 000 stappen, plus trainingsdagen. */
export function activityFactor(trainingDays) {
  if (trainingDays <= 1) return 1.3;
  if (trainingDays === 2) return 1.35;
  if (trainingDays === 3) return 1.4;
  if (trainingDays === 4) return 1.45;
  return 1.55;
}

/**
 * Dagdoelen uit het profiel.
 * Eiwit 2,0 g/kg (bereik 1,6–2,2), vet 0,9 g/kg, rest koolhydraten.
 */
export function targets(profile, todayIso) {
  const age = ageOn(profile.birth, todayIso);
  const b = bmr(profile.sex, profile.weight, profile.height, age);
  const maintenance = b * activityFactor(profile.trainingDays ?? 3);
  const goal = GOALS[profile.goal] ?? GOALS.recomp;
  const kcal = Math.round((maintenance + goal.adjust) / 10) * 10;
  const protein = Math.round(profile.weight * 2.0);
  const fat = Math.round(profile.weight * 0.9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return {
    age,
    bmr: Math.round(b),
    maintenance: Math.round(maintenance),
    kcal,
    protein,
    proteinMin: Math.round(profile.weight * 1.6),
    proteinMax: Math.round(profile.weight * 2.2),
    fat,
    carbs,
    water: Math.round(profile.weight * 0.035 * 10) / 10,
  };
}
