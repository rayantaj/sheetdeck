const CACHE = 'sheetdeck-v1'

self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', 'manifest.webmanifest', 'icon.svg'])))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})

// The page sends every asset it loaded, plus the worker chunk and all font files.
self.addEventListener('message', (e) => {
  const urls = (e.data?.urls ?? []).filter((u) => new URL(u, self.location).origin === self.location.origin)
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(urls)))
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(
      (hit) =>
        hit ??
        fetch(e.request).then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(e.request, res.clone()))
          return res
        }),
    ).catch(() => (e.request.mode === 'navigate' ? caches.match('./') : Response.error())),
  )
})
