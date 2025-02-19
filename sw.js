const CACHE_NAME = 'cloudforge-v3';
const ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/theme.css',
    '/js/main.js',
    '/assets/logo.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});

// CloudForgeTech_Home-v1.2