import type { Column, Deck } from '../engine/types'
import type { Strings } from '../i18n'

export default function Summary({ t, columns, rows, deck, onBack }: { t: Strings; columns: Column[]; rows: number; deck: Deck; onBack: () => void }) {
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
      <h2>{t.findings}</h2>
      <p>{t.deckLang}: <span data-testid="deck-lang">{deck.lang}</span></p>
      <ol className="findings" data-testid="findings" lang={deck.lang} dir={deck.lang === 'ar' ? 'rtl' : 'ltr'}>
        {deck.slides.flatMap((s) =>
          s.finding ? [
            <li key={s.id} data-kind={s.finding.kind}>
              <strong>{s.title}</strong>
              <span className="num"> {s.finding.kind} · {s.finding.columns.join(', ')} · {s.finding.score}</span>
            </li>,
          ] : [],
        )}
      </ol>
      <button className="btn" onClick={onBack}>{t.back}</button>
    </section>
  )
}
