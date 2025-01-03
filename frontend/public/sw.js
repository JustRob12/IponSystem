self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('ipon-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/src/main.jsx',
        '/src/App.jsx',
        '/src/App.css'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
