self.addEventListener('install', event => {
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', function(event) {
  // Basit bir cache örneği (gelişmiş offline için workbox kullanabilirsin)
});
