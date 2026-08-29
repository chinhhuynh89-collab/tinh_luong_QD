const CACHE_NAME = 'tinh-luong-qd-v3';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Chiến lược: ƯU TIÊN TẢI MẠNG TRƯỚC (network-first), CHỈ áp dụng cho file
// CÙNG DOMAIN với app (GitHub Pages). KHÔNG can thiệp vào các request đi
// tới domain khác (ví dụ Google Apps Script để đếm lượt cài/mở) — để trình
// duyệt tự xử lý trực tiếp, tránh xung đột/lỗi khó lường trên Safari/iOS.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    // Request đi domain khác (Google, v.v.) -> bỏ qua, không can thiệp
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
