const CACHE_NAME = 'yuanshen-cache-v1';
const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/geometry.html',
  '/functions.html',
  '/calculus.html',
  '/probability.html',
  '/elective.html',
  '/lab.html',
  '/challenge.html',
  '/assets/favicon.svg',
  '/assets/genshin-enhancements.css',
  '/assets/genshin-enhancements.js',
  '/assets/vendor/tailwind-browser-4.3.1.js',
  '/assets/vendor/tailwind-v3.js',
  '/assets/vendor/lucide-1.8.0.min.js',
  '/assets/vendor/katex/katex.min.css',
  '/assets/vendor/katex/katex.min.js',
  '/assets/katex-renderer.js',
  '/assets/back-to-top.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(OFFLINE_URLS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(response => {
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });
      }
      return response;
    }).catch(() => {
      return caches.match(event.request).then(cached => {
        return cached || caches.match('/index.html');
      });
    })
  );
});
