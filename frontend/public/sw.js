/**
 * Minimal service worker.
 *
 * Exists so the app is installable and survives a flaky connection at the
 * table. Deliberately network-first: menu prices and table availability must
 * never be served stale, so the cache is only a fallback when the network
 * fails outright.
 */
const CACHE = "alibaba-v1";
const SHELL = ["/", "/order", "/menu", "/offline", "/alibaba-logo.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;      // never touch the API
  if (url.pathname.startsWith("/admin")) return;        // staff always live

  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok && request.mode === "navigate") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") return caches.match("/offline");
        return Response.error();
      })
  );
});
