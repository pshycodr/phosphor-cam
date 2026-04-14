const CACHE_NAME = "phosphor-cam-v1.0.2";

const CORE_ASSETS = ["/", "/index.html", "/manifest.json"];

const OPTIONAL_ASSETS = [
  "/assets/logo.webp",
  "/assets/favicon.webp",
  "/icons/icon-192x192.webp",
  "/icons/icon-512x512.webp",
];

// ---------------- INSTALL ----------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      await Promise.all(CORE_ASSETS.map((url) => cache.add(url)));

      await Promise.allSettled(OPTIONAL_ASSETS.map((url) => cache.add(url)));

      await self.skipWaiting();
    })()
  );
});

// ---------------- ACTIVATE ----------------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

// ---------------- FETCH ----------------
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip extensions
  if (
    url.protocol === "chrome-extension:" ||
    url.protocol === "moz-extension:"
  ) {
    return;
  }

  // Handle navigation requests (HTML)
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Fonts (cache-first)
  if (
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com"
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

// Cache First
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) return cached;

  try {
    const res = await fetch(request);

    if (res && res.ok) {
      await cache.put(request, res.clone());
    }

    return res;
  } catch {
    return new Response("", { status: 200 });
  }
}

// Network First (for HTML/navigation)
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const res = await fetch(request);

    if (res && res.ok) {
      await cache.put(request, res.clone());
    }

    return res;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    const fallback = await cache.match("/index.html");
    if (fallback) return fallback;

    return new Response("Offline", { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  try {
    const networkPromise = fetch(request).then((res) => {
      if (res && res.ok) {
        cache.put(request, res.clone());
      }
      return res;
    });

    if (cached) return cached;

    const network = await networkPromise;
    if (network) return network;

    return new Response("Offline", { status: 503 });
  } catch {
    return cached || new Response("Offline", { status: 503 });
  }
}

// ---------------- MESSAGE ----------------
self.addEventListener("message", (event) => {
  const { type } = event.data || {};

  if (type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (type === "CLEAR_CACHE") {
    event.waitUntil(
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
    );
  }

  if (type === "GET_CACHE_STATUS") {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();

        event.ports[0]?.postMessage({
          cached: keys.length,
          cacheKeys: keys.map((r) => r.url),
        });
      })()
    );
  }
});
