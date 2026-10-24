import { toCanvas } from 'html-to-image'

// The slide is rendered at 1600 × 900 CSS px, at 2x.
export const renderSlide = (node: HTMLElement) => toCanvas(node, { pixelRatio: 2 })

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
