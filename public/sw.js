/*
 * QuotePilot service worker (SPEC §6).
 *
 * Scope is minimal on purpose: enough to make the app installable and to serve
 * the hashed static assets from cache so a second visit is instant on a bad
 * job-site connection. There are no offline features beyond a fallback page.
 *
 * MULTI-TENANT SAFETY: this never caches an HTML document or an API response.
 * Every page in the signed-in app contains one business's customers and money,
 * and a cache is shared by every session in the browser profile. Only
 * content-hashed build assets and our own icons are stored.
 *
 * Registered from the signed-in app shell only (components/pwa/
 * register-service-worker.tsx), so a homeowner opening /q/<token> never gets a
 * service worker at all.
 */

const VERSION = "v1";
const CACHE = `quotepilot-${VERSION}`;
const OFFLINE_URL = "/offline.html";

// Cached at install so the fallback is available the moment the network isn't.
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png"];

/*
 * On localhost the dev server rebuilds chunks under the same URLs, so caching
 * them would serve stale JavaScript after an edit. The worker still installs,
 * activates and serves the offline fallback, so it stays testable locally.
 */
const IS_DEV =
  self.location.hostname === "localhost" ||
  self.location.hostname === "127.0.0.1";

/** Paths the worker keeps its hands off entirely. */
function isBypassed(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    // The customer quote page stays a plain, uncached web page (SPEC §6, §11).
    url.pathname.startsWith("/q/")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      // A failed precache must not leave a broken worker installed.
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("quotepilot-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isBypassed(url)) return;

  // Pages always come from the network — never the cache. The offline page is
  // shown only when the request genuinely fails.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches
          .match(OFFLINE_URL)
          .then(
            (cached) =>
              cached ??
              new Response("", { status: 504, statusText: "Offline" }),
          ),
      ),
    );
    return;
  }

  if (IS_DEV) return;

  // Build assets are content-hashed, so a hit is always the right bytes.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Icons change only when we regenerate them; show the cached one immediately
  // and refresh it in the background.
  if (url.pathname.startsWith("/icons/")) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  const network = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(CACHE);
        cache.put(request, response.clone());
      }
      return response;
    })
    // With nothing cached and no network, fail the way the browser normally
    // would rather than resolving to undefined.
    .catch(() => cached ?? Response.error());

  return cached ?? network;
}
