import type { Deck, Slide } from '../engine/types'
import { strings } from '../i18n'

// The slide card's proportions at 1600 px wide (its cqw units): padding 4, gap 1.6, title 3.4 or 6.
const W = 1600
const H = 900
const PAD = 64
const GAP = 25.6

export function slideFacts(slide: Slide, deck: Deck): string[] {
  const t = strings[deck.lang]
  const q = slide.quality
  if (!q) return []
  const facts = [
    ...Object.entries(q.emptyByColumn).filter(([, n]) => n > 0).map(([c, n]) => `${c}: ${n} ${t.qEmpty}`),
    ...Object.entries(q.mismatches).filter(([, n]) => n > 0).map(([c, n]) => `${c}: ${n} ${t.qMismatch}`),
    ...(q.duplicateRows ? [`${q.duplicateRows} ${t.qDuplicates}`] : []),
    ...(q.skippedRows ? [`${q.skippedRows} ${t.qSkipped}`] : []),
    ...(q.sampled ? [`${q.sampled} ${t.qSampled}`] : []),
  ]
  return facts.length ? facts : [t.qClean]
}

export function metaLine(deck: Deck): string {
  const t = strings[deck.lang]
  const { source } = deck
  return `${source.sheet} · ${source.rows} ${t.rows} × ${source.cols} ${t.columns} · ${new Date().toLocaleDateString(deck.lang === 'ar' ? 'ar' : 'en-GB', { dateStyle: 'long' })}`
}

// Greedy word wrap; a single word wider than the box stays on its own line.
export function wrapLines(text: string, maxWidth: number, measure: (s: string) => number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word
    if (line && measure(next) > maxWidth) {
      lines.push(line)
      line = word
    } else line = next
  }
  if (line) lines.push(line)
  return lines
}

// Draws the slide on a 2x canvas without cloning the DOM; chart is the live Chart.js canvas, if any.
export async function renderSlide(slide: Slide, deck: Deck, chart: HTMLCanvasElement | null): Promise<HTMLCanvasElement> {
  const root = getComputedStyle(document.documentElement)
  const v = (n: string) => root.getPropertyValue(n).trim()
  const display = v('--font-display')
  const body = v('--font-body')
  const big = slide.kind !== 'finding'
  const titleSize = big ? 96 : 54.4
  await Promise.all([document.fonts.load(`${v('--display-weight')} 40px ${display}`), document.fonts.load(`500 40px ${body}`)])
  await document.fonts.ready

  const c = document.createElement('canvas')
  c.width = W * 2
  c.height = H * 2
  const ctx = c.getContext('2d')!
  ctx.scale(2, 2)
  ctx.fillStyle = v('--color-plate')
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = v('--color-ink')
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, W - 2, H - 2)

  const rtl = deck.lang === 'ar'
  ctx.direction = rtl ? 'rtl' : 'ltr'
  ctx.textAlign = rtl ? 'right' : 'left'
  ctx.textBaseline = 'top'
  const x = rtl ? W - PAD : PAD
  const inner = W - 2 * PAD
  let y = PAD

  ctx.font = `${v('--display-weight')} ${titleSize}px ${display}`
  if (!rtl) ctx.letterSpacing = `${-0.025 * titleSize}px`
  ctx.fillStyle = v('--color-ink')
  for (const line of wrapLines(slide.title, inner, (s) => ctx.measureText(s).width)) {
    ctx.fillText(line, x, y)
    y += titleSize * 1.15
  }
  ctx.letterSpacing = '0px'
  y += GAP

  const text = (s: string, size: number, weight: number, color: string, at: number) => {
    ctx.font = `${weight} ${size}px ${body}`
    ctx.fillStyle = color
    ctx.fillText(s, x, at)
  }

  if (slide.kind === 'title') text(metaLine(deck), 32, 400, v('--color-muted'), y)
  if (slide.quality) {
    ctx.fillStyle = v('--color-ink')
    ctx.fillRect(PAD, y, inner, 2)
    y += 2
    for (const f of slideFacts(slide, deck)) {
      text(f, 32, 400, v('--color-ink'), y + 16)
      y += 32 * 1.3 + 32
      ctx.fillStyle = v('--color-rule')
      ctx.fillRect(PAD, y - 1, inner, 1)
    }
  }
  if (slide.finding) {
    const t = strings[deck.lang]
    const foot = 25.6
    const footY = H - PAD - foot * 1.3
    text(`${slide.finding.columns.join(' · ')} · ${deck.source.rows} ${t.rows}`, foot, 500, v('--color-muted'), footY)
    if (chart) ctx.drawImage(chart, PAD, y, inner, footY - GAP - y)
  }
  return c
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
