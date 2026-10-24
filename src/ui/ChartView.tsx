import { useEffect, useRef } from 'react'
import { Chart, registerables, type ChartConfiguration } from 'chart.js'
import type { ChartSpec } from '../engine/types'
import { colour } from './palette'

Chart.register(...registerables)

const MONO = '"JetBrains Mono", ui-monospace, monospace'

// mini: a rail thumbnail, so no axes, titles or legend.
export default function ChartView({ spec, rtl, mini }: { spec: ChartSpec; rtl: boolean; mini?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const family = rtl ? '"IBM Plex Sans Arabic", sans-serif' : 'Onest, sans-serif'
    const doughnut = spec.type === 'doughnut'
    const type = spec.type === 'histogram' ? 'bar' : spec.type
    const datasets = spec.datasets.map((d, i) => {
      if (doughnut) return { ...d, backgroundColor: spec.labels.map((_, k) => colour(k)), borderColor: '#FDFCFA' }
      if (type === 'line') return { ...d, borderColor: colour(i), backgroundColor: colour(i), borderWidth: 2, pointRadius: 4, tension: 0 }
      if (type === 'scatter') return { label: d.label, data: d.data.map((y, k) => ({ x: Number(spec.labels[k]), y })), backgroundColor: colour(i), pointRadius: 4 }
      return { ...d, backgroundColor: colour(i), ...(spec.type === 'histogram' ? { barPercentage: 1, categoryPercentage: 1 } : { categoryPercentage: 0.9 }) }
    })
    const axis = (title: string | undefined, extra: object) => ({
      display: !mini,
      title: { display: !!title, text: title, font: { family, weight: 500 } },
      ticks: { font: { family: MONO, size: 11 }, color: '#2A2622' },
      grid: { color: 'rgba(42,38,34,0.12)' },
      border: { color: '#2A2622' },
      ...extra,
    })
    const chart = new Chart(ref.current!, {
      type,
      data: { labels: type === 'scatter' ? undefined : spec.labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        layout: { padding: mini ? 0 : 4 },
        plugins: {
          legend: { display: !mini && (spec.datasets.length >= 2 || doughnut), rtl, textDirection: rtl ? 'rtl' : 'ltr', labels: { font: { family } } },
          tooltip: { enabled: !mini, rtl, textDirection: rtl ? 'rtl' : 'ltr' },
        },
        scales: doughnut ? {} : {
          x: axis(spec.axis?.x, { reverse: rtl, grid: { display: false } }),
          y: axis(spec.axis?.y, { position: rtl ? 'right' : 'left', beginAtZero: true }),
        },
      },
    } as ChartConfiguration)
    // the canvas draws before a lazily loaded font arrives, so redraw once they have
    let live = true
    Promise.all([document.fonts.load(`500 12px ${family}`), document.fonts.load(`500 12px ${MONO}`)]).then(() => live && chart.update('none'))
    return () => {
      live = false
      chart.destroy()
    }
  }, [spec, rtl, mini])

  return <canvas ref={ref} aria-hidden="true" />
}
