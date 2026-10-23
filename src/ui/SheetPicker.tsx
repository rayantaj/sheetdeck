import { useState } from 'react'
import { detectHeaderRow } from '../engine/detect'
import type { Sheet } from '../engine/types'
import type { Strings } from '../i18n'

const cell = (c: unknown) => (c instanceof Date ? c.toISOString().slice(0, 10) : c === null ? '' : String(c))

export default function SheetPicker({ t, sheets, onContinue }: { t: Strings; sheets: Sheet[]; onContinue: (s: Sheet, header: number) => void }) {
  const [active, setActive] = useState(0)
  // header overrides per sheet; absent means the detected row
  const [picked, setPicked] = useState<Record<number, number>>({})
  const sheet = sheets[active]
  const detected = detectHeaderRow(sheet.rows)
  const header = picked[active] ?? detected
  // the window starts one row above the detected header, so a title row stays clickable
  const start = Math.max(0, detected - 1)
  const preview = sheet.rows.slice(start, start + 5)
  const width = Math.max(1, ...preview.map((r) => r.length))

  return (
    <section className="card picker">
      <h2>{t.pickTitle}</h2>
      <p>{t.pickHint}</p>
      <div className="tabs" role="tablist" aria-label={t.sheets}>
        {sheets.map((s, i) => (
          <button key={i} role="tab" aria-selected={i === active} className="tab" onClick={() => setActive(i)}>{s.name}</button>
        ))}
      </div>
      <div className="table-wrap">
        <table className="preview">
          <tbody>
            {preview.map((r, i) => (
              <tr key={start + i} data-header={start + i === header} className={start + i === header ? 'is-header' : ''} tabIndex={0} aria-selected={start + i === header} onClick={() => setPicked({ ...picked, [active]: start + i })} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPicked({ ...picked, [active]: start + i }) } }}>
                {Array.from({ length: width }, (_, j) => <td key={j}>{cell(r[j])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="btn primary" onClick={() => onContinue(sheet, header)}>{t.cont}</button>
    </section>
  )
}
