// Kleine DOM-hulpjes, iconen en herbruikbare componenten.

/** h('div', { class: 'card', onclick: fn }, 'tekst', kindElement, [lijst]) */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

const PATHS = {
  today: 'M12 3v2M12 19v2M5 12H3M21 12h-2M6.3 6.3 4.9 4.9M19.1 19.1l-1.4-1.4M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  week: 'M4 6h16M4 6v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6M4 6V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v1M8 2v4M16 2v4M8 11h2M14 11h2M8 15h2M14 15h2',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5ZM4 19a2 2 0 0 1 2-2h13M9 7h6',
  cart: 'M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6.2M9 20a1 1 0 1 0 0 .1M18 20a1 1 0 1 0 0 .1',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0',
  check: 'M5 12.5 10 17 19 7',
  swap: 'M7 7h11l-3-3M17 17H6l3 3',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  box: 'M4 8l8-4 8 4v8l-8 4-8-4V8ZM4 8l8 4 8-4M12 12v8',
  flame: 'M12 21c4 0 7-2.7 7-6.6 0-3-1.8-5.2-3.6-7-.4 1.8-1.4 3-2.6 3.4.3-3-1.2-5.8-3.8-7.8-.3 3.3-2 5.3-3.6 7.2A7.3 7.3 0 0 0 5 14.4C5 18.3 8 21 12 21Z',
  chevronL: 'M15 5l-7 7 7 7',
  chevronR: 'M9 5l7 7-7 7',
  back: 'M19 12H5M11 6l-6 6 6 6',
  plus: 'M12 5v14M5 12h14',
  office: 'M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M3 21h18M8 8h3M8 12h3M8 16h3',
  refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z',
  snow: 'M12 2v20M4.9 7l14.2 10M4.9 17 19.1 7',
  x: 'M6 6l12 12M18 6 6 18',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  upload: 'M12 20V9M7 14l5-5 5 5M5 4h14',
  play: 'M8 5v14l11-7L8 5Z',
  dumbbell: 'M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12',
};

export function icon(name, cls = '') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', `icon ${cls}`);
  svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', PATHS[name] || '');
  svg.append(p);
  return svg;
}

/** Voortgangsring met groot getal in het midden. */
export function ring(value, max, { size = 168, stroke = 14, label = '', sub = '', color = 'var(--accent)' } = {}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const over = max > 0 && value > max * 1.05;
  const svg = `
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--track)" stroke-width="${stroke}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${over ? 'var(--orange)' : color}"
        stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}"
        transform="rotate(-90 ${size / 2} ${size / 2})"/>
    </svg>`;
  return h('div', { class: 'ring', style: { width: `${size}px`, height: `${size}px` } },
    h('div', { html: svg }),
    h('div', { class: 'ring-center' }, h('div', { class: 'ring-value' }, label), h('div', { class: 'ring-sub' }, sub)));
}

/** Horizontale balk (eiwit, koolhydraten, vet). */
export function bar(name, value, max, color, unit = 'g') {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return h('div', { class: 'bar' },
    h('div', { class: 'bar-head' }, h('span', {}, name), h('span', { class: 'muted' }, h('b', {}, value), ` / ${max} ${unit}`)),
    h('div', { class: 'bar-track' }, h('div', { class: 'bar-fill', style: { width: `${pct}%`, background: color } })));
}

export function chip(text, cls = '') {
  return h('span', { class: `chip ${cls}` }, text);
}

export function nl(n, digits = 0) {
  return Number(n).toLocaleString('nl-BE', { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

/** Onderaan verschijnend meldingetje. */
export function toast(text) {
  const t = h('div', { class: 'toast' }, text);
  document.body.append(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2200);
}

/** Onderblad (bottom sheet) met inhoud; geeft een functie terug om te sluiten. */
export function sheet(title, content) {
  const close = () => { wrap.classList.remove('open'); setTimeout(() => wrap.remove(), 250); };
  const wrap = h('div', { class: 'sheet-wrap', onclick: (e) => { if (e.target === wrap) close(); } },
    h('div', { class: 'sheet' },
      h('div', { class: 'sheet-grip' }),
      h('div', { class: 'sheet-head' }, h('h3', {}, title),
        h('button', { class: 'icon-btn', 'aria-label': 'Sluiten', onclick: close }, icon('x'))),
      content));
  document.body.append(wrap);
  requestAnimationFrame(() => wrap.classList.add('open'));
  return close;
}

/** Tekstveld voor datums dat automatisch '/' invoegt: 01022000 → 01/02/2000. */
export function dateInput(value = '', attrs = {}) {
  const input = h('input', { type: 'text', inputmode: 'numeric', placeholder: 'dd/mm/jjjj', maxlength: 10, value, ...attrs });
  input.addEventListener('input', () => {
    const digits = input.value.replace(/\D/g, '').slice(0, 8);
    let out = digits.slice(0, 2);
    if (digits.length > 2) out += `/${digits.slice(2, 4)}`;
    if (digits.length > 4) out += `/${digits.slice(4)}`;
    input.value = out;
  });
  return input;
}

/** Tabjes bovenaan het eetgedeelte. */
export function foodTabs(active) {
  return h('div', { class: 'segmented top-seg' },
    h('a', { href: '#/week', class: active === 'week' ? 'on' : '' }, 'Weekmenu'),
    h('a', { href: '#/recepten', class: active === 'recepten' ? 'on' : '' }, 'Recepten'));
}
