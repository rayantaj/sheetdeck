// Production only. The worker precaches the page and its bundle itself when it installs.
export function registerSW() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
}
