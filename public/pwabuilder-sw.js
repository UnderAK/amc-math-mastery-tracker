const CACHE = "pwa-offline-cache-v1";
const offlinePage = "/offline.html";

importScripts("https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js");

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll([
        "/",
        "/offline.html",
        "/icons/192x192.png",
        "/icons/512x512.png"
      ]);
    })
  );
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

workbox.routing.registerRoute(
  ({ request }) => request.mode === "navigate",
  async ({ event }) => {
    try {
      const preloadResponse = await event.preloadResponse;
      if (preloadResponse) return preloadResponse;

      return await fetch(event.request);
    } catch (err) {
      return caches.match(offlinePage);
    }
  }
);

workbox.routing.registerRoute(
  ({ request }) => ["style", "script", "image", "font"].includes(request.destination),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE,
  })
);
