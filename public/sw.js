const CACHE = 'sheetdeck-v2'

const text = (url) => fetch(url).then((r) => r.text())
const abs = (u, base) => new URL(u, base).href

// Precache the page, then follow it: its bundle, the bundle's chunks and worker, the CSS's fonts.
async function precache() {
  const c = await caches.open(CACHE)
  const page = abs('./', self.location)
  const urls = new Set([page, abs('manifest.webmanifest', self.location), abs('icon.svg', self.location)])
  const html = await text(page)
  const assets = [...html.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+)"/g)].map((m) => abs(m[1], page))
  for (const a of assets) {
    urls.add(a)
    const body = await text(a)
    const refs = a.endsWith('.css') ? [...body.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map((m) => abs(m[1], a)) : [...body.matchAll(/(?:\.\/|assets\/)[\w.-]+\.js/g)].map((m) => abs(m[0], m[0].startsWith('./') ? a : page))
    refs.forEach((u) => urls.add(u))
  }
  // allSettled: one missing file must not stop the rest from being cached.
  await Promise.allSettled([...urls].map((u) => c.add(u)))
}

self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(precache())
})

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
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
