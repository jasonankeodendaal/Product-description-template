const CACHE_NAME = 'ai-product-gen-cache-v3'; // Bumped version to ensure update
const URLS_TO_CACHE = [
  '/',
  '/index.html'
  // Other assets like CDN scripts will be cached dynamically on first fetch.
];

// Install the service worker and cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Serve content with a robust cache-first, network-fallback strategy for SPAs
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // If the resource is in the cache, return it
        if (cachedResponse) {
          return cachedResponse;
        }

        // If the resource is not in the cache, try the network
        return fetch(event.request.clone()).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200) {
                // For opaque responses (like from CDNs), we can't check status, but still cache them.
                if (networkResponse.type === 'opaque') {
                     const responseToCache = networkResponse.clone();
                     caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
                }
                return networkResponse;
            }

            // Clone the response and cache it
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
          // The network request failed, likely due to being offline
          console.log('Network request failed:', error);

          // For navigation requests (loading the app page), serve the cached index.html
          if (event.request.mode === 'navigate') {
            console.log('Serving cached index.html as offline fallback.');
            return caches.match('/index.html');
          }

          // For other asset types (e.g., failed API calls), we don't provide a fallback
          // and let the browser handle the error.
        });
      })
  );
});


// Delete old caches on activation
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});