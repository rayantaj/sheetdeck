import { useMemo } from 'react'
import { detectTypes } from '../engine/detect'
import { findFindings } from '../engine/findings'
import { title } from '../engine/titles'
import type { ChartSpec, Deck, Finding, FindingKind, Slide, Table } from '../engine/types'
import type { Strings } from '../i18n'

const TYPES: Record<FindingKind, ChartSpec['type'][]> = {
  total: ['bar'], topN: ['bar', 'doughnut'], share: ['bar', 'doughnut'], trend: ['line', 'bar'], compare: ['scatter', 'bar'], distribution: ['histogram'],
}

// The same finding with another number column as its measure, or undefined when that column yields none.
function swap(table: Table, f: Finding, measure: string, lang: Deck['lang']): Finding | undefined {
  const idx = f.columns.map((c, i) => table.columns.findIndex((x) => x.name === (i === 1 ? measure : c)))
  const sub = { columns: idx.map((i) => table.columns[i]), rows: table.rows.map((r) => idx.map((i) => r[i])) }
  return findFindings(sub, lang).find((x) => x.kind === f.kind)
}

export default function SlideEditor({ t, deck, table, slide, onChange }: { t: Strings; deck: Deck; table: Table; slide: Slide; onChange: (s: Slide) => void }) {
  const f = slide.finding
  const numbers = useMemo(() => detectTypes(table).filter((c) => c.type === 'number').map((c) => c.name), [table])
  const options = useMemo(
    () => (f && ['topN', 'share', 'trend'].includes(f.kind) ? numbers.filter((n) => swap(table, f, n, deck.lang)) : []),
    [table, f, numbers, deck.lang],
  )

  return (
    <div className="editor">
      <label className="field">
        <span>{t.titleLabel}</span>
        <input value={slide.title} onChange={(e) => onChange({ ...slide, title: e.target.value })} />
      </label>
      {f && (
        <div className="field">
          <span>{t.chartType}</span>
          <div className="chips">
            {TYPES[f.kind].map((type) => (
              <button key={type} className="chip" aria-pressed={f.chart.type === type} onClick={() => onChange({ ...slide, finding: { ...f, chart: { ...f.chart, type } } })}>
                {t[type]}
              </button>
            ))}
          </div>
        </div>
      )}
      {f && options.length > 1 && (
        <label className="field">
          <span>{t.measure}</span>
          <select
            value={f.columns[1]}
            onChange={(e) => {
              const nf = swap(table, f, e.target.value, deck.lang)
              if (nf) onChange({ ...slide, title: title(nf, deck.lang), finding: { ...nf, chart: { ...nf.chart, type: f.chart.type } } })
            }}
          >
            {options.map((n) => <option key={n}>{n}</option>)}
          </select>
        </label>
      )}
    </div>
  )
}
