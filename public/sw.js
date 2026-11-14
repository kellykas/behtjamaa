const CACHE_NAME = "behtjamaa-v6";
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// The page asks a freshly installed worker to take over straight away, so a
// new deployment never leaves a tab running code whose asset files are gone.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Anything not served by this origin (Supabase images, data and auth in
  // particular) is left alone: the browser's own HTTP cache is better at it,
  // and touching those requests only added a cache lookup and a duplicate
  // download to every page view.
  if (url.origin !== self.location.origin) return;

  // Range requests come from audio/video seeking; they cannot be cached.
  if (request.headers.has("range")) return;

  // Pages: go to the network so a fresh deploy is picked up immediately, and
  // fall back to the cached shell when offline. A navigation response is only
  // stored when it really is this app's shell (an offline fallback must never
  // be a login redirect or an error page).
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200 && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", clone));
          }
          return response;
        })
        .catch(() =>
          caches.match("/index.html").then((cached) => cached || Response.error())
        )
    );
    return;
  }

  // Static files are content-hashed by the build, so a cache hit is always the
  // right answer for them. Everything else is fetched from the network first,
  // because a stale unhashed file (sw.js, manifest, icons) would otherwise
  // survive a deployment.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached && /\/assets\/.+-[A-Za-z0-9_-]{8}\./.test(url.pathname)) return cached;

      return fetch(request)
        .then((response) => {
          if (response.status === 200 && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached || Response.error());
    })
  );
});
