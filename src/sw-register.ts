import workerUrl from './workers/parse.worker.ts?worker&url'

// Production only. Once the page has loaded, hand the worker everything it needs offline.
export function registerSW() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  addEventListener('load', async () => {
    const reg = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
    await navigator.serviceWorker.ready
    const fonts = [...document.styleSheets].flatMap((s) =>
      [...s.cssRules].flatMap((r) => (r instanceof CSSFontFaceRule ? [...r.style.getPropertyValue('src').matchAll(/url\("?([^")]+)"?\)/g)].map((m) => new URL(m[1], s.href ?? location.href).href) : [])),
    )
    const assets = performance.getEntriesByType('resource').map((r) => r.name)
    reg.active?.postMessage({ urls: [...new Set([...assets, ...fonts, new URL(workerUrl, location.href).href])] })
  })
}
