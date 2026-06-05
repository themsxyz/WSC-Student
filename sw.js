const CACHE_NAME = "wsc-student-portal-direct-fetch-fixed-v20260605141038";

const ASSETS = [
  "./",
  "./index.html",
  "./fee.html",
  "./result.html",
  "./notice.html",
  "./message.html",
  "./account.html",
  "./config.js",
  "./manifest.json",
  "./css/fonts.css",
  "./css/colors.css",
  "./css/root.css",
  "./css/components.css",
  "./css/apple-menu.css",
  "./css/home.css",
  "./css/fee.css",
  "./css/result.css",
  "./css/notice.css",
  "./css/message.css",
  "./css/account.css",
  "./js/app.js",
  "./js/home.js",
  "./js/fee.js",
  "./js/result.js",
  "./js/notice.js",
  "./js/message.js",
  "./js/account.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(ASSETS.map(asset => cache.add(asset)))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin !== location.origin) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
        return response;
      });
    }).catch(() => caches.match("./index.html"))
  );
});


