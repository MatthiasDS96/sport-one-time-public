// Datums als ISO-strings 'yyyy-mm-dd' (lokale tijd). Weken starten op maandag.

const DAYS = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
const DAYS_SHORT = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september',
  'oktober', 'november', 'december'];

const pad = (n) => String(n).padStart(2, '0');

export function iso(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parse(isoStr) {
  const [y, m, d] = isoStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export function today() {
  return iso(new Date());
}

export function addDays(isoStr, n) {
  const d = parse(isoStr);
  d.setDate(d.getDate() + n);
  return iso(d);
}

/** 0 = maandag … 6 = zondag */
export function dayIndex(isoStr) {
  return (parse(isoStr).getDay() + 6) % 7;
}

export function mondayOf(isoStr) {
  return addDays(isoStr, -dayIndex(isoStr));
}

export function month(isoStr) {
  return Number(isoStr.split('-')[1]);
}

export const dayName = (i) => DAYS[i];
export const dayShort = (i) => DAYS_SHORT[i];

/** 'maandag 9 november' */
export function longDate(isoStr) {
  const d = parse(isoStr);
  return `${DAYS[dayIndex(isoStr)]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** '9 nov' */
export function shortDate(isoStr) {
  const d = parse(isoStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}

/** 'dd/mm/jjjj' → ISO, of null als ongeldig. */
export function fromBelgian(text) {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((text || '').trim());
  if (!m) return null;
  const [, d, mo, y] = m.map(Number);
  const date = new Date(y, mo - 1, d, 12);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return iso(date);
}

export function toBelgian(isoStr) {
  if (!isoStr) return '';
  const [y, m, d] = isoStr.split('-');
  return `${d}/${m}/${y}`;
}
