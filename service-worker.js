const CACHE_NAME = 'tinh-luong-qd-v2';
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

// Chiến lược: ƯU TIÊN TẢI MẠNG TRƯỚC (network-first).
// Luôn lấy bản mới nhất từ GitHub Pages khi có mạng; chỉ dùng bản đã lưu (cache)
// khi máy bị mất mạng. Điều này đảm bảo mỗi lần cập nhật index.html trên GitHub,
// người dùng sẽ thấy bản mới ngay ở lần mở app tiếp theo (miễn có mạng).
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
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
