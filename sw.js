const CACHE_NAME = "disiplin-cache-v1";
const ASSETS = [
  "./index.html","./report.html","./styles.css",
  "./config.js","./utils.js","./app.js","./report.js","./manifest.webmanifest"
];

self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
});
self.addEventListener("activate", e=>{
  e.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", e=>{
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
