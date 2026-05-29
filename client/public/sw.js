// IMPORTANT: Bump this version whenever you deploy to bust the old cache
const CACHE_NAME = 'aarvieve-arcade-v3';

// Only pre-cache the bare minimum static shell
const STATIC_SHELL = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing v3...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(STATIC_SHELL).catch(() => {})
    )
  );
  // Take over immediately — don't wait for old SW to die
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating v3 — clearing old caches...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);

  // For JS, CSS, and HTML: ALWAYS go network-first so we never serve stale code
  const isAppAsset =
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.tsx') ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    url.pathname.startsWith('/assets/');

  if (isAppAsset) {
    // Network first — fall back to cache only if offline
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Don't cache if bad response
          if (!response || response.status !== 200) return response;
          return response;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(event.request).then(
            (cached) => cached || caches.match('/index.html')
          );
        })
    );
    return;
  }

  // For images and icons: cache-first is fine (they don't change often)
  if (
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname === '/manifest.json'
  ) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) => cached || fetch(event.request)
      )
    );
    return;
  }

  // Everything else: network first
  event.respondWith(
    fetch(event.request).catch(
      () => caches.match(event.request)
    )
  );
});
