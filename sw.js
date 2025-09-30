const STATIC_CACHE_NAME = 'site-static-v23'; // Incremented version
const DYNAMIC_CACHE_NAME = 'site-dynamic-v23'; // Incremented version

// Simplified list of assets for a more robust installation
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/logo.png',
  '/background.jpg'
];

// Install service worker and cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching App Shell...');
        // Use addAll for atomic caching. If any file fails, the SW install fails.
        return cache.addAll(APP_SHELL_URLS);
      })
      .catch(err => {
        console.error('App Shell caching failed:', err);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
        .map(key => {
            console.log('Service Worker: Deleting old cache:', key);
            return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Serve from cache, fallback to network, and cache new requests
self.addEventListener('fetch', event => {
  // Ignore non-GET requests, API calls, and browser extension requests
  if (event.request.method !== 'GET' || event.request.url.includes('/api/') || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cacheRes => {
        // Return from cache if found
        if (cacheRes) {
          return cacheRes;
        }
        
        // Otherwise, fetch from network
        return fetch(event.request).then(fetchRes => {
          // Check for valid responses before caching
          // Allow caching of opaque responses from CDNs
          if (!fetchRes || fetchRes.status !== 200) {
            return fetchRes;
          }

          // Cache the new response for future offline use
          return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            cache.put(event.request.url, fetchRes.clone());
            return fetchRes;
          });
        });
      })
      .catch(() => {
        // Fallback for navigation requests when offline and not in cache
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});