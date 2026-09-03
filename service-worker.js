const CACHE = "matteos-finance-v5";
const ASSETS = ["./","./index.html","./manifest.json","./metal-duck.svg"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k === CACHE ? null : caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).then(r => {
    if(r && r.status === 200 && new URL(e.request.url).origin === self.location.origin){
      const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy));
    } return r;
  }).catch(() => caches.match("./index.html"))));
});