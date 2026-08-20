/* Service worker minimal — met en cache uniquement la coquille de l'app
   (html/icônes/manifeste) pour un chargement rapide et un fonctionnement
   hors-ligne partiel. Les appels à l'API et au stockage ne sont JAMAIS
   mis en cache : ils ont besoin du réseau pour fonctionner. */

const CACHE_NAME = 'facturation-veto-v1';
const SHELL_FILES = [
  './',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_FILES))
      .catch(() => {}) // ne bloque jamais l'installation si un fichier manque
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Ne jamais intercepter les appels API ou tout ce qui n'est pas GET :
  // la facturation, le stockage et l'IA doivent toujours passer par le réseau.
  if (event.request.method !== 'GET' || url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
