var CACHE_NAME = 'koddsson-com-service-worker-v1';
var urlsToCache = [
  '/404.html',
  '/index.css',
  '/index.html',
  '/life-calendar/index.css',
  '/life-calendar/index.html',
  '/life-calendar/index.js',
  '/me.jpg',
  '/places/cities.json',
  '/places/index.html',
  '/recipes/index.css',
  '/recipes/index.html',
  '/recipes/index.js',
  '/recipes/index.json',
  '/recipes/recipes/lasagna.json',
  '/recipes/recipes/overnightOatmeal.json',
  '/recipes/recipes/peanutbutterOatmealBars.json',
  '/recipes/recipes/pizzaDough.json',
  '/recipes/recipes/yakisoba.json',
  '/recipes/reset.css'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

self.addEventListener('activate', function(event) {
  var cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
