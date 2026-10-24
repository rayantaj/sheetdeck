import type { Deck, Slide } from '../engine/types'
import { strings } from '../i18n'
import { metaLine, slideFacts } from '../export/png'
import ChartView from './ChartView'

// Sized in cqw units, so the same card serves the rail, the editor and Present.
export default function SlideCard({ slide, deck, shadow, mini }: { slide: Slide; deck: Deck; shadow?: boolean; mini?: boolean }) {
  const ar = deck.lang === 'ar'
  const t = strings[deck.lang]
  const { source } = deck
  const f = slide.finding
  const q = slide.quality

  return (
    <div className={`slide-frame${shadow ? ' shadow' : ''}`}>
      <article className={`slide ${slide.kind}`} lang={deck.lang} dir={ar ? 'rtl' : 'ltr'} data-testid="slide">
        <h2 className="slide-title">{slide.title}</h2>
        {slide.kind === 'title' && (
          <p className="slide-meta num">
            {metaLine(deck)}
          </p>
        )}
        {q && (
          <ul className="slide-facts">
            {slideFacts(slide, deck).map((x) => <li key={x}>{x}</li>)}
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
