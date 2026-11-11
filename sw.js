// Service worker: bewaart de app op het toestel zodat ze zonder internet werkt.
// Verhoog VERSION bij elke nieuwe versie, dan haalt de telefoon de nieuwe bestanden op.
const VERSION = 'sport-v7';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/app.js', 'js/ui.js', 'js/store.js', 'js/dates.js',
  'js/data/foods.js', 'js/data/recipes.js',
  'js/nutrition/calc.js', 'js/nutrition/planner.js', 'js/nutrition/food-store.js', 'js/nutrition/prices.js',
  'js/views/today.js', 'js/views/week.js', 'js/views/recipes.js', 'js/views/shopping.js', 'js/views/profile.js',
  'js/views/training.js', 'js/views/exercises.js', 'js/views/workout.js', 'js/views/calm.js', 'js/calm/calm.js',
  'js/data/exercises.js', 'js/data/videos.js',
  'js/training/catalog.js', 'js/training/library.js', 'js/training/training-store.js',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Eerst het netwerk (zodat updates meteen binnenkomen), zonder internet uit de cache.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // site even weg (bv. 404)? dan de bewaarde versie gebruiken
        if (!res.ok) return caches.match(e.request, { ignoreSearch: true }).then((c) => c || res);
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })),
  );
});
