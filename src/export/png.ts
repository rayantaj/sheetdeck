import html2canvas from 'html2canvas'

const COLORS = ['error', 'success', 'paper', 'paper-2', 'paper-3', 'plate', 'ink', 'ink-2', 'muted', 'rule', 'accent', 'accent-soft', 'accent-ink', 'focus']

// html2canvas throws on the oklch() tokens, so the stage gets them as rgb: a 1 px canvas converts each one.
function rgbTokens(stage: HTMLElement) {
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!
  const root = getComputedStyle(document.documentElement)
  for (const n of COLORS) {
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = root.getPropertyValue(`--color-${n}`).trim()
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    stage.style.setProperty(`--color-${n}`, `rgb(${r} ${g} ${b})`)
  }
}

// The slide is rendered at 1600 × 900 CSS px, at 2x. html2canvas draws the DOM directly; html-to-image
// fetches the fonts, which the page's connect-src forbids.
export function renderSlide(node: HTMLElement) {
  rgbTokens(node.parentElement ?? node)
  return html2canvas(node, { scale: 2, logging: false })
}

// A blob URL and an anchor click: the only way a file leaves the page.
export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export const canvasBlob = (c: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/png'))
