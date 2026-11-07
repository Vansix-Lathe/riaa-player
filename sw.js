// Network-first: always try the latest files; fall back to cache only when offline.
const CACHE_NAME = 'riaa-player-v35';
const urlsToCache = ['./index.html','./manifest.json','./icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c =>
      // cache:'reload' bypasses the browser HTTP cache so stale copies are never stored
      Promise.all(urlsToCache.map(u =>
        fetch(u, {cache:'reload'}).then(r => { if (r.ok) return c.put(u, r); })
      ))
    ).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, {cache:'no-cache'}).then(res => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
