import type { Column } from '../engine/types'
import type { Strings } from '../i18n'

export default function Summary({ t, columns, rows, onBack }: { t: Strings; columns: Column[]; rows: number; onBack: () => void }) {
  return (
    <section className="card summary" data-testid="summary">
      <h2>{t.summary}</h2>
      <p className="figure num">
        <span data-testid="row-count">{rows}</span> {t.rows} · <span data-testid="col-count">{columns.length}</span> {t.columns}
      </p>
      <ul className="cols">
        {columns.map((c, i) => (
          <li key={i}>
            <span>{c.name}</span>
            <span className="type" data-type={c.type}>{t[c.type]}</span>
          </li>
        ))}
      </ul>
      <button className="btn" onClick={onBack}>{t.back}</button>
    </section>
  )
}
