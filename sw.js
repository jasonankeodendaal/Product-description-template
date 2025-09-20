const CACHE_NAME = 'ai-product-gen-cache-v10'; // Increment version to trigger update
const APP_SHELL_URLS = [
  '/',
  '/manifest.json',
  '/index.tsx',
  'https://i.ibb.co/7jZ0z3T/ai-tools-logo-v2.png',
  'https://i.ibb.co/6y1jV1h/shortcut-mic.png',
  'https://i.ibb.co/L6Szk5X/shortcut-note.png',
  'https://i.ibb.co/8Y4B05y/shortcut-image.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(APP_SHELL_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

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
    }).then(() => self.clients.claim()) // Take control of open clients immediately
  );
});

// Network-first, falling back to cache strategy
self.addEventListener('fetch', event => {
  // Ignore non-GET requests for caching
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For cross-origin requests (like fonts or CDN scripts), use a cache-first strategy
  // to avoid opaque responses that can't be introspected.
  const isCrossOrigin = new URL(event.request.url).origin !== self.location.origin;
  if (isCrossOrigin) {
      event.respondWith(
          caches.match(event.request).then(cachedResponse => {
              if (cachedResponse) {
                  return cachedResponse;
              }
              return fetch(event.request).then(networkResponse => {
                  return caches.open(CACHE_NAME).then(cache => {
                      if (networkResponse.ok) {
                          cache.put(event.request, networkResponse.clone());
                      }
                      return networkResponse;
                  });
              });
          })
      );
      return;
  }

  // Use network-first for same-origin requests to get the latest content
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      })
      .catch(() => {
        console.log('Service Worker: Network failed, serving from cache for:', event.request.url);
        return caches.match(event.request).then(cachedResponse => {
            return cachedResponse || new Response(JSON.stringify({ error: 'Network error and not in cache' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        });
      })
  );
});