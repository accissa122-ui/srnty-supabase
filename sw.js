// sw.js — يجلب الصفحة من الإنترنت أولًا (فيظهر آخر تحديث دائمًا)، والنسخة المحفوظة فقط عند انقطاع النت
const CACHE = 'srnty-net-1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);   // مسح النسخ القديمة
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;   // لا نتدخل في طلبات Supabase
  e.respondWith((async () => {
    try {
      const res = await fetch(r, { cache: 'no-cache' });
      if (res && res.ok) { const c = await caches.open(CACHE); c.put(r, res.clone()); }
      return res;
    } catch (err) {
      const m = (await caches.match(r, { ignoreSearch: true })) || (r.mode === 'navigate' ? (await caches.match('index.html')) || (await caches.match('./')) : null);
      if (m) return m;
      throw err;
    }
  })());
});
