/**
 * FarmDirect Farmer - Service Worker
 * Provides genuine offline caching of the complete application shell.
 * Uses Cache-First with Stale-While-Revalidate strategy for local assets,
 * allowing instant offline startup in airplane mode.
 */

const CACHE_NAME = 'farmdirect-farmer-v12';

// All essential local assets required to run 100% offline
const APP_SHELL_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './supabase.js',
  './i18n.js',
  './app.js',
  './db.js',
  './products.js',
  './orders.js',
  './inventory.js',
  './reports.js',
  './sync.js',
  './manifest.json',
  './icons/icon.svg',
  './icons/logo.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

/**
 * 1. Install Event - Pre-cache App Shell
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installing. Pre-caching local app shell...');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(APP_SHELL_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Cache addAll error during install:', err);
      })
  );
});

/**
 * 2. Activate Event - Clean up stale cache versions
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activating. Purging outdated caches...');
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              console.log('[SW] Deleting deprecated cache:', name);
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

/**
 * 3. Fetch Event - Genuine Offline Handling
 * Network-First with Cache Fallback:
 * Always fetches the latest code when network/localhost is accessible,
 * and seamlessly serves from offline cache when in airplane mode or disconnected.
 */
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  // Handle navigation requests
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', clone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('./index.html');
        })
    );
    return;
  }

  // Handle all application shell assets
  event.respondWith(
    fetch(req)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return networkResponse;
      })
      .catch(() => {
        // Offline fallback
        return caches.match(req, { ignoreSearch: true }).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (req.destination === 'image') return caches.match('./icons/icon.svg');
          return new Response('Offline: Content not available in local cache.', {
            status: 503,
            statusText: 'Service Unavailable (Offline)'
          });
        });
      })
  );
});

