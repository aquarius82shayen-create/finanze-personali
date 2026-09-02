const CACHE = "matteos-finance-v4-20260903";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/metal-duck.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => key === CACHE ? null : caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const request = event.request;
  const url = new URL(request.url);
  const isNavigation = request.mode === "navigate" || url.pathname.endsWith("/index.html");

  if (isNavigation) {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response && response.status === 200 && url.origin === self.location.origin) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(request, copy));
      }
      return response;
    }))
  );
});
