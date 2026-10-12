/**
 * FarmDirect Farmer - Service Worker
 * Provides genuine offline caching of the complete application shell.
 * Uses Cache-First with Stale-While-Revalidate strategy for local assets,
 * allowing instant offline startup in airplane mode.
 */

const CACHE_NAME = 'farmdirect-farmer-v6';

// All essential local assets required to run 100% offline
const APP_SHELL_ASSETS = [
  './',
  './index.html',
  './styles.css',
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
        // Force waiting service worker to become active
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
        // Immediately take control of all open client tabs
        return self.clients.claim();
      })
  );
});

/**
 * 3. Fetch Event - Genuine Offline Handling
 * Cache-First with background revalidation for local app assets.
 * Offline navigation falls back to cached index.html.
 */
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // If request is a page navigation (HTML document)
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

  // Handle local application asset requests
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch from network in background to update cache for next load (Stale-While-Revalidate)
        fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(req, networkResponse.clone());
              });
            }
          })
          .catch(() => {
            // Network failure is normal and expected when offline/in airplane mode
          });

        return cachedResponse;
      }

      // If not in cache, fetch from network and cache response
      return fetch(req)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // If offline and request is an image or icon, fallback to icon.svg
          if (req.destination === 'image') {
            return caches.match('./icons/icon.svg');
          }
          // Return generic error or empty response
          return new Response('Offline: Content not available in local cache.', {
            status: 503,
            statusText: 'Service Unavailable (Offline)'
          });
        });
    })
  );
});
