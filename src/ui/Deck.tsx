import { useState } from 'react'
import type { Deck as DeckT, Slide, Table } from '../engine/types'
import type { Strings } from '../i18n'
import Export from './Export'
import Present from './Present'
import SlideCard from './SlideCard'
import SlideEditor from './SlideEditor'

export default function Deck({ t, deck, table, setDeck, onBack }: { t: Strings; deck: DeckT; table: Table; setDeck: (d: DeckT) => void; onBack: () => void }) {
  const [cur, setCur] = useState(deck.slides[0].id)
  const [presenting, setPresenting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const slide = deck.slides.find((s) => s.id === cur) ?? deck.slides[0]
  const edit = (next: Slide) => setDeck({ ...deck, slides: deck.slides.map((s) => (s.id === next.id ? next : s)) })
  const move = (from: number, to: number) => {
    const slides = [...deck.slides]
    slides.splice(to, 0, ...slides.splice(from, 1))
    setDeck({ ...deck, slides })
  }

  return (
    <section className="deck" data-testid="deck">
      <div className="deck-bar">
        <button className="btn" onClick={onBack}>{t.back}</button>
        <div className="deck-actions">
          <button className="btn" onClick={() => setExporting(true)}>{t.export}</button>
          <button className="btn primary" disabled={deck.slides.every((s) => s.hidden)} onClick={() => setPresenting(true)}>{t.present}</button>
        </div>
      </div>
      <div className="deck-body">
        <ol className="rail" aria-label={t.slides}>
          {deck.slides.map((s, i) => (
            <li
              key={s.id}
              className={`thumb${s.hidden ? ' faded' : ''}${s.id === slide.id ? ' current' : ''}`}
              draggable
              onDragStart={() => setDragFrom(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dragFrom !== null && move(dragFrom, i)}
            >
              <span className="num thumb-n">{i + 1}</span>
              <button className="thumb-btn" aria-current={s.id === slide.id} aria-label={`${t.slide} ${i + 1}`} onClick={() => setCur(s.id)}>
                <SlideCard slide={s} deck={deck} mini />
              </button>
              <button className="eye" aria-pressed={s.hidden} aria-label={`${s.hidden ? t.show : t.hide} ${t.slide} ${i + 1}`} onClick={() => edit({ ...s, hidden: !s.hidden })}>
                {s.hidden ? '○' : '●'}
              </button>
            </li>
          ))}
        </ol>
        <div className="stage">
          <SlideCard slide={slide} deck={deck} shadow />
          <SlideEditor t={t} deck={deck} table={table} slide={slide} onChange={edit} />
        </div>
      </div>
      {exporting && <Export t={t} deck={deck} table={table} slide={slide} onClose={() => setExporting(false)} />}
      {presenting && <Present t={t} deck={deck} startId={slide.id} onExit={() => setPresenting(false)} />}
    </section>
  )
}
