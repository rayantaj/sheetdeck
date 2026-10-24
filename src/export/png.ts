import html2canvas from 'html2canvas'

// The slide is rendered at 1600 × 900 CSS px, at 2x. html2canvas draws the DOM directly; html-to-image
// fetches the fonts, which the page's connect-src 'none' forbids.
export const renderSlide = (node: HTMLElement) => html2canvas(node, { scale: 2, logging: false })

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
