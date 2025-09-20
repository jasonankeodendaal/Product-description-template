const CACHE_NAME = 'ai-product-gen-cache-v7'; // Incremented version
const APP_SHELL_URLS = [
  '/',
  '/manifest.json',
  '/index.tsx', // Add main script to pre-cache
  'https://i.ibb.co/7jZ0z3T/ai-tools-logo-v2.png'
];

// Install event: cache the application shell and manifest, then force activation.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching App Shell and core assets');
        return cache.addAll(APP_SHELL_URLS);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker.
        return self.skipWaiting();
      })
  );
});

// Activate event: clean up old caches and take immediate control of all clients.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('Service Worker: Deleting old cache', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Take control of all open pages without waiting for a reload.
      return self.clients.claim();
    })
  );
});

// Fetch event: handle requests with appropriate strategies.
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Strategy for manifest.json: Network-first, falling back to cache.
  // This ensures the app manifest is always up-to-date.
  if (url.pathname === '/manifest.json') {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          // If fetch is successful, cache the new manifest
          if (networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If network fails, serve from cache
          console.log('Service Worker: Network failed for manifest. Serving from cache.');
          return caches.match(request);
        })
    );
    return;
  }

  // Strategy for navigation requests (the app itself): Network-first, falling back to cache.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          console.log('Service Worker: Network failed for navigation. Serving cached app shell.');
          return caches.match('/'); // Always fall back to the main app shell
        })
    );
    return;
  }

  // Strategy for all other requests (assets like scripts, styles, images): Cache-first.
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // Return the cached response if it exists.
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If not in cache, fetch from the network.
        return fetch(request.clone()).then(networkResponse => {
          // Check for a valid, cacheable response.
          // Opaque responses are for cross-origin requests without CORS, caching them is a bit risky but often necessary for CDNs.
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
  );
});