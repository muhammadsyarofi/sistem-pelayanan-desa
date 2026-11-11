/**
 * Service Worker SimpelDesa — Desa Luwung (Network-First + Offline Fallback + Push Notification)
 */

const CACHE_NAME = 'simpeldesa-luwung-v5';
const OFFLINE_ASSETS = [
  './',
  './index.html',
  './styles/main.css?v=5',
  './js/data.js?v=5',
  './js/app.js?v=5',
  './manifest.json',
  './assets/luwung/logo.png',
  './assets/luwung/hero.jpg',
  './assets/luwung/kades.jpg',
  './assets/luwung/gerbang-bata.jpg',
  './assets/luwung/makam-dalam.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Network-First: selalu ambil versi terbaru dari server saat online, gunakan cache hanya saat offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('push', (event) => {
  const payload = event.data ? event.data.json() : {
    title: 'Pengumuman Pemerintah Desa Luwung',
    body: 'Terdapat pembaruan informasi atau status layanan di SimpelDesa.',
    icon: 'assets/luwung/logo.png'
  };
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: 'assets/luwung/logo.png',
      badge: 'assets/luwung/logo.png',
      data: payload.url || './index.html'
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data || './index.html'));
});
