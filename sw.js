const CACHE_NAME = 'workout-tracker-v7';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
  ];

// Install — cache all static assets
self.addEventListener('install', event => {
    event.waitUntil(
          caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
        );
    self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
          caches.keys().then(keys =>
                  Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
                                 )
        );
    self.clients.claim();
});

// Fetch — network-first for HTML, cache-first for others
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

                        // Always fetch HTML fresh from network
                        if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
                              event.respondWith(
                                      fetch(event.request).then(response => {
                                                const clone = response.clone();
                                                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                                                return response;
                                      }).catch(() => caches.match('./index.html'))
                                    );
                              return;
                        }

                        // Cache-first for other assets
                        event.respondWith(
                              caches.match(event.request).then(cached => {
                                      if (cached) return cached;
                                      return fetch(event.request).then(response => {
                                                if (response.ok && event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
                                                            const clone = response.clone();
                                                            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                                                }
                                                return response;
                                      });
                              }).catch(() => caches.match('./index.html'))
                            );
});
