const CACHE_NAME = 'safenet-v2';

const PRECACHE_ASSETS = [
  '/',
  '/de/index.html',
  '/en/index.html',
  '/css/style.css',
  '/css/shared.css',
  '/css/navbar.css',
  '/css/footer.css',
  '/css/infobox.css',
  '/css/hero.css',
  '/js/auth.js',
  '/js/supabase.js',
  '/de/partials/navbar.html',
  '/de/partials/footer.html',
  '/en/partials/navbar.html',
  '/en/partials/footer.html',
  '/de/pages/angriff.html',
  '/de/pages/phishing.html',
  '/de/pages/bruteforce.html',
  '/de/pages/socialengineering.html',
  '/de/pages/keylogger.html',
  '/de/pages/wörterbuchangriff.html',
  '/de/pages/ransomware.html',
  '/de/pages/mfa-bypass.html',
  '/de/pages/mitm.html',
  '/de/pages/quishing.html',
  '/de/pages/2fa.html',
  '/en/pages/angriff.html',
  '/en/pages/phishing.html',
  '/en/pages/bruteforce.html',
  '/en/pages/socialengineering.html',
  '/en/pages/keylogger.html',
  '/en/pages/wörterbuchangriff.html',
  '/en/pages/ransomware.html',
  '/en/pages/mfa-bypass.html',
  '/en/pages/mitm.html',
  '/en/pages/quishing.html',
  '/en/pages/2fa.html',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for all resources (CSS must always be fresh)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  const isImage = /\.(png|jpg|jpeg|webp|svg|ico|woff2?)$/.test(url.pathname);

  if (isImage) {
    // Cache-first only for images (stable, large)
    event.respondWith(
      caches.match(event.request).then((cached) =>
        cached || fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
      )
    );
  } else {
    // Network-first for HTML, CSS, JS – always get latest, fallback to cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
