// This is the service worker with improved offline support

const CACHE = "pwabuilder-offline-cache-v1";
const offlineFallbackPage = "/offline.html";

const assetsToCache = [
  const assetsToCache = [
  "/",
  "/offline.html",
  "/icons/192x192.png",
  "/icons/512x512.png"
];

// Import Workbox from CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

// Listen for SKIP_WAITING messages
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Precache core files on install
self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(assetsToCache))
  );
});

// Enable navigation preload if supported
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// Runtime caching with Workbox
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  async ({ event }) => {
    try {
      const preloadResp = await event.preloadResponse;
      if (preloadResp) return preloadResp;

      const networkResp = await fetch(event.request);
      return networkResp;
    } catch (error) {
      const cache = await caches.open(CACHE);
      const cachedResp = await cache.match(offlineFallbackPage);
      return cachedResp;
    }
  }
);

// Static asset caching
workbox.routing.registerRoute(
  ({ request }) => ['script', 'style', 'image', 'font'].includes(request.destination),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE,
  })
);
