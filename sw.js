const STATIC_CACHE_NAME = 'site-static-v22';
const DYNAMIC_CACHE_NAME = 'site-dynamic-v22';

// Comprehensive list of assets needed for the app to work offline
const APP_SHELL_URLS = [
  '/',
  '/index.html', // Explicitly cache the main HTML file
  '/index.tsx',
  '/manifest.json',
  'https://i.ibb.co/d46Mf1g1/7fa06a13-6799-4500-8eb8-b3d1d8b3dfa7.png', // New icon URL
  'https://i.postimg.cc/Fd7t0xX1/bb343bbc-19bb-4fbd-a9d4-2df5d7292898.jpg', // Main background
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://unpkg.com/wavesurfer.js@7',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Patrick+Hand&display=swap',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400..700;1,400..700&display=swap'
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
          // Check for valid, non-opaque responses before caching
          if (!fetchRes || fetchRes.status !== 200 || fetchRes.type !== 'basic') {
            return fetchRes; // Return non-cacheable response as is
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