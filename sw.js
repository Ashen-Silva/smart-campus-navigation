
const CACHE_NAME = 'smart-campus-v7';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/js/MapManager.js',
    '/js/StaffLocatorBoard.js',
];

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force active immediately
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing Old Cache');
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Claim all clients immediately
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
