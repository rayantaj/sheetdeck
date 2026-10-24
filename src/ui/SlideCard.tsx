import type { Deck, Slide } from '../engine/types'
import { strings } from '../i18n'
import ChartView from './ChartView'

// Sized in cqw units, so the same card serves the rail, the editor and Present.
export default function SlideCard({ slide, deck, shadow, mini }: { slide: Slide; deck: Deck; shadow?: boolean; mini?: boolean }) {
  const ar = deck.lang === 'ar'
  const t = strings[deck.lang]
  const { source } = deck
  const f = slide.finding
  const q = slide.quality
  const facts = q
    ? [
        ...Object.entries(q.emptyByColumn).filter(([, n]) => n > 0).map(([c, n]) => `${c}: ${n} ${t.qEmpty}`),
        ...Object.entries(q.mismatches).filter(([, n]) => n > 0).map(([c, n]) => `${c}: ${n} ${t.qMismatch}`),
        ...(q.duplicateRows ? [`${q.duplicateRows} ${t.qDuplicates}`] : []),
        ...(q.skippedRows ? [`${q.skippedRows} ${t.qSkipped}`] : []),
      ]
    : []

  return (
    <div className={`slide-frame${shadow ? ' shadow' : ''}`}>
      <article className={`slide ${slide.kind}`} lang={deck.lang} dir={ar ? 'rtl' : 'ltr'} data-testid="slide">
        <h2 className="slide-title">{slide.title}</h2>
        {slide.kind === 'title' && (
          <p className="slide-meta num">
            {source.sheet} · {source.rows} {t.rows} × {source.cols} {t.columns} · {new Date().toLocaleDateString(ar ? 'ar' : 'en-GB', { dateStyle: 'long' })}
          </p>
        )}
        {q && (
          <ul className="slide-facts">
            {(facts.length ? facts : [t.qClean]).map((x) => <li key={x}>{x}</li>)}
          </ul>
        )}
        {f && (
          <>
            <div className="slide-chart"><ChartView spec={f.chart} rtl={ar} mini={mini} /></div>
            <p className="slide-foot">{f.columns.join(' · ')} · {source.rows} {t.rows}</p>
          </>
        )}
      </article>
    </div>
  )
}
