/**
 * Service worker.
 *
 * Deliberately does NOT precache HTML.
 *
 * Next.js references build-hashed JS chunks from each HTML document. A cached
 * page from an earlier deploy points at chunks that no longer exist, so the
 * app loads a shell whose scripts 404, React never hydrates, and the intro
 * overlay — which only leaves via JS — sits on top of a frozen screen. That
 * is what made the installed app appear stuck.
 *
 * So: HTML is always network-first with no precache, hashed build assets are
 * safe to cache forever because their names change per build, and only the
 * offline page is stored up front.
 */
const VERSION = "v2";
const HTML_CACHE = `alibaba-html-${VERSION}`;
const ASSET_CACHE = `alibaba-assets-${VERSION}`;
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(HTML_CACHE)
      .then((c) => c.add(OFFLINE_URL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== HTML_CACHE && k !== ASSET_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch the API
  if (url.pathname.startsWith("/admin")) return;   // staff always live

  // Navigations: network only, falling back to the offline page. Never serve
  // a cached document, or its script tags may point at a dead build.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Hashed build output and static files: safe to cache, names change per build.
  const cacheable =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/splash/") ||
    url.pathname.startsWith("/shop-images/") ||
    /\.(?:png|jpe?g|webp|svg|woff2?|ico)$/.test(url.pathname);

  if (!cacheable) return;

  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(ASSET_CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
    )
  );
});
