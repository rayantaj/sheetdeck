import { jsPDF } from 'jspdf'

// One landscape 16:9 page per canvas, placed edge to edge.
export function pdfBlob(canvases: HTMLCanvasElement[]): Blob {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1600, 900] })
  canvases.forEach((c, i) => {
    if (i) pdf.addPage([1600, 900], 'landscape')
    pdf.addImage(c.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 1600, 900)
  })
  return pdf.output('blob')
}
