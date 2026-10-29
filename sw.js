/**
 * Service Worker：离线缓存
 * 策略：HTML 走网络优先（保证更新），静态资源走缓存优先
 */
// 版本号变更会强制刷新缓存 —— 每次发版务必 +1，否则用户会一直拿到旧代码
const CACHE = 'guyi-app-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/theme.css',
  './css/pages.css',
  './js/app.js',
  './js/data/content.js',
  './js/core/ui.js',
  './js/core/icons.js',
  './js/core/router.js',
  './js/core/store.js',
  './js/core/media.js',
  './js/core/sn.js',
  './js/core/nfc.js',
  './js/pages/parts.js',
  './js/pages/home.js',
  './js/pages/products.js',
  './js/pages/product-detail.js',
  './js/pages/sn-query.js',
  './js/pages/collection.js',
  './js/pages/about.js',
  './js/pages/culture.js',
  './js/pages/project.js',
  './js/pages/team.js',
  './js/pages/admin-login.js',
  './js/pages/admin-list.js',
  './js/pages/admin-edit.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 导航请求：网络优先，失败回退 index.html（离线可用）
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 静态资源：缓存优先，后台更新
  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
