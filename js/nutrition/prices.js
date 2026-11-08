// Richtprijzen voor de boodschappenlijst. Geschat (Belgische prijzen, eind 2026), geen live data:
// per product de verpakking en de Delhaize-prijs; Colruyt en Aldi via een gemiddelde prijsfactor.
// De gebruiker kan per product en winkel een eigen prijs ingeven (state.prices).

export const STORES = {
  delhaize: { label: 'Delhaize', factor: 1, search: 'https://www.delhaize.be/nl/shop/search?q=' },
  colruyt: { label: 'Colruyt', factor: 0.92, search: 'https://www.colruyt.be/nl/producten?searchTerm=' },
  aldi: { label: 'Aldi', factor: 0.82, search: 'https://www.aldi.be/nl/zoekresultaten.html?query=' },
};

/** foodId → [verpakking (g, ml of stuks), prijs Delhaize in euro] */
export const PRICES = {
  kipfilet: [500, 6.99], kippendij: [500, 6.49], kipgehakt: [500, 5.99], rundgehakt: [500, 7.49],
  stoofvlees: [500, 8.99], biefstuk: [300, 7.99], varkenshaas: [500, 7.99], varkensreepjes: [400, 5.49],
  kabeljauw: [300, 8.99], mosselen: [1000, 8.99], hambeleg: [150, 2.99], kipbeleg: [150, 2.79],
  ei: [12, 3.99], melk: [1000, 1.19], skyr: [450, 2.49], yoghurt: [500, 1.49], kookroom: [200, 1.29],
  boter: [250, 2.99], pudding: [1, 1.49],
  brood: [20, 2.49], havermout: [500, 1.49], granola: [375, 3.49], rijstwafel: [16, 1.39], wrap: [6, 2.29],
  peperkoek: [500, 2.49],
  rijst: [1000, 3.29], pasta: [500, 1.49], mie: [250, 1.79], kokosmelk: [400, 1.99], currypasta: [100, 2.99],
  sojasaus: [250, 2.49], sesam: [100, 1.99], rijstazijn: [150, 2.99], sriracha: [200, 3.49],
  passata: [500, 1.29], mosterd: [300, 1.49], bouillon: [12, 1.79], bier: [330, 1.49], honing: [250, 3.49],
  pindakaas: [350, 3.29], maizena: [400, 2.29],
  broccoli: [500, 1.99], bloemkool: [800, 2.49], wortel: [1000, 1.49], asperges: [250, 3.49],
  witteasperges: [500, 5.99], butternut: [1000, 2.49], courgette: [300, 0.99], komkommer: [350, 0.99],
  champignons: [250, 1.69], ui: [1000, 1.49], look: [10, 0.69], gember: [100, 0.99], aardappel: [2500, 3.49],
  krieltjes: [1000, 2.99], citroen: [1, 0.49], peterselie: [1, 1.29], banaan: [1, 0.3], appel: [1, 0.45],
  aardbeien: [250, 2.99], erwten: [1000, 2.49], bessen: [500, 3.99], noten: [200, 3.49], eiwitreep: [1, 1.99],
  olie: [1000, 6.99],
};

/** Producten die een winkel (meestal) niet heeft. */
export const NOT_IN = { aldi: ['rijstazijn', 'sriracha'] };

const round2 = (x) => Math.round(x * 100) / 100;

/** Prijs per verpakking in een winkel (eigen prijs gaat voor), of null als niet verkrijgbaar/onbekend. */
export function packPrice(id, store, overrides = {}) {
  const own = overrides[id]?.[store];
  if (own != null) return own;
  if (NOT_IN[store]?.includes(id) || !PRICES[id]) return null;
  return round2(PRICES[id][1] * STORES[store].factor);
}

/**
 * Kost van een boodschappenlijst in één winkel.
 * @param items [{ id, amount }] (amount in g/ml of stuks; 0 = 'naar smaak' → 1 verpakking)
 * @returns { total (aan de kassa, volle verpakkingen), used (enkel wat je verbruikt), missing: [id], lines: { id: { packs, pack, price, cost } } }
 */
export function storeCost(items, store, overrides = {}) {
  const lines = {};
  const missing = [];
  let total = 0;
  let used = 0;
  for (const { id, amount } of items) {
    const price = packPrice(id, store, overrides);
    if (price == null) { missing.push(id); continue; }
    const pack = PRICES[id]?.[0] || 1;
    const packs = Math.max(1, Math.ceil(amount / pack - 1e-9));
    lines[id] = { packs, pack, price, cost: round2(packs * price) };
    total += packs * price;
    used += (Math.max(amount, 1) / pack) * price;
  }
  return { total: round2(total), used: round2(used), missing, lines };
}

/** Kost per winkel, goedkoopste eerst (winkels waar iets ontbreekt achteraan). */
export function compareStores(items, overrides = {}) {
  return Object.keys(STORES)
    .map((store) => ({ store, ...storeCost(items, store, overrides) }))
    .sort((a, b) => a.missing.length - b.missing.length || a.total - b.total);
}

export const euro = (x) => x.toLocaleString('nl-BE', { style: 'currency', currency: 'EUR' });

/** Link naar de zoekpagina van de winkel voor dit product ("mager rundsgehakt (5% vet)" → "mager rundsgehakt"). */
export const searchUrl = (store, name) => STORES[store].search + encodeURIComponent(name.replace(/\s*\(.*\)/, '').trim());
