const CACHE_NAME = "shed-cache";
const urlsToCache = [
  "index.html",
  "offline.html",
]; // @TODO: Update these pages

//Install Service Worker
addEventListener("install", (event) => {
  //console.log("Hello from service worker!")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        //console.log("Opened Cache");
        return cache.addAll(urlsToCache);
      })
      .catch((err) => console.log("Didn't Add Cache", err))
  );
});
//Listen for Requests
addEventListener("fetch", (event) => {
  //console.log("fetching");
  event.respondWith(
    caches.match(event.request).then((cacheResponse) => {
      //console.log("event", event.request);
      //console.log("cacheRes", cacheResponse);
      return (
        cacheResponse ||
        fetch(event.request).catch(() => caches.match("offline.html"))
      );
    })
  );
});

//Activate the Service Worker
addEventListener("activate", (event) => {
  const cacheWhitelist = [];
  cacheWhitelist.push(CACHE_NAME);

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

addEventListener('activate', event => {
  clients.claim();
});
