/*
 * QuotePace service worker (SPEC §6, §15).
 *
 * Two jobs: make the app installable and serve the hashed static assets from
 * cache so a second visit is instant on a bad job-site connection, and receive
 * the push alerts that tell the owner a customer opened or accepted a quote.
 * There are no offline features beyond a fallback page.
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

/*
 * Bump VERSION whenever anything in PRECACHE changes. The cache is keyed by it,
 * so an install that already holds the old copy keeps serving it forever
 * otherwise — which is how the retired lightning-bolt icon survived the rebrand
 * in the "Open in app" chip and on every push notification.
 */
const VERSION = "v3";
const CACHE = `quotepace-${VERSION}`;

/*
 * Cache names this worker is allowed to delete. The old prefix is still here
 * because the app was renamed: a browser that ran QuotePilot holds a
 * quotepilot-* cache that a quotepace-* check would never collect.
 */
const OWNED_CACHE_PREFIXES = ["quotepace-", "quotepilot-"];

const OFFLINE_URL = "/offline.html";

// Cached at install so the fallback is available the moment the network isn't,
// and so a notification can draw its icon on a bad connection.
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/badge-96.png"];

const NOTIFICATION_ICON = "/icons/icon-192.png";
const NOTIFICATION_BADGE = "/icons/badge-96.png";

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
            .filter(
              (key) =>
                OWNED_CACHE_PREFIXES.some((prefix) => key.startsWith(prefix)) &&
                key !== CACHE,
            )
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

/* ------------------------------------------------------------------ *
 * Push (SPEC §15)
 *
 * The payload is built server-side in lib/push.ts and arrives encrypted:
 * { title, body, url, tag }. This is the half of the feature the electrician
 * actually feels — the phone buzzing the moment a customer taps ACCEPT.
 * ------------------------------------------------------------------ */

self.addEventListener("push", (event) => {
  const payload = readPushPayload(event);

  // A push we can't read still has to show something: browsers may revoke the
  // subscription if a push arrives and no notification is displayed.
  const title = payload?.title ?? "QuotePace";
  const body = payload?.body ?? "Something happened with one of your quotes.";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: NOTIFICATION_ICON,
      badge: NOTIFICATION_BADGE,
      // Alerts about one quote share a tag, so the newer one replaces the
      // older instead of stacking. renotify makes the replacement still buzz —
      // "accepted" landing silently on top of "opened" would miss the point.
      tag: payload?.tag ?? "quotepace",
      renotify: true,
      data: { url: payload?.url ?? "/dashboard" },
    }),
  );
});

function readPushPayload(event) {
  if (!event.data) return null;
  try {
    return event.data.json();
  } catch {
    return null;
  }
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(openApp(event.notification.data?.url));
});

/** Focuses a window we already have rather than piling up new ones. */
async function openApp(path) {
  let target;
  try {
    target = new URL(path ?? "/dashboard", self.location.origin);
  } catch {
    target = new URL("/dashboard", self.location.origin);
  }

  // The payload is ours, but a notification should never be able to send the
  // owner off-site.
  if (target.origin !== self.location.origin) {
    target = new URL("/dashboard", self.location.origin);
  }

  const windows = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  for (const client of windows) {
    if (new URL(client.url).origin !== self.location.origin) continue;

    await client.focus();
    try {
      await client.navigate(target.href);
    } catch {
      // Some browsers refuse navigate(); the owner is at least looking at the
      // app now.
    }
    return;
  }

  await self.clients.openWindow(target.href);
}

/*
 * Browsers rotate subscriptions on their own, and this fires with no page open
 * — which is why /api/push/subscribe is a route handler rather than a server
 * action. The old row isn't deleted here: it sorts oldest by last_seen_at, so
 * the per-owner cap evicts it, and a send would prune it on 410 anyway.
 */
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(resubscribe(event));
});

async function resubscribe(event) {
  try {
    let subscription = event.newSubscription;

    if (!subscription) {
      const key = event.oldSubscription?.options?.applicationServerKey;
      if (!key) return;

      subscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      });
    }

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Same-origin, so the session cookie rides along and the server knows
      // whose device this is.
      credentials: "include",
      body: JSON.stringify(subscription.toJSON()),
    });
  } catch (error) {
    // Best effort: the settings toggle re-registers this device next visit.
    console.error("Re-subscribing to push failed", error);
  }
}
