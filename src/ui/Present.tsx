import { useEffect, useState } from 'react'
import type { Deck } from '../engine/types'
import type { Strings } from '../i18n'
import SlideCard from './SlideCard'

export default function Present({ t, deck, startId, onExit }: { t: Strings; deck: Deck; startId: string; onExit: () => void }) {
  const slides = deck.slides.filter((s) => !s.hidden)
  const from = deck.slides.findIndex((s) => s.id === startId)
  const [n, setN] = useState(() => Math.max(0, slides.findIndex((s) => deck.slides.indexOf(s) >= from)))
  const [paused, setPaused] = useState(false)
  const [touchX, setTouchX] = useState(0)
  const last = slides.length - 1
  const go = (d: number) => {
    setPaused(false)
    setN((i) => Math.min(last, Math.max(0, i + d)))
  }

  useEffect(() => {
    ;(document.activeElement as HTMLElement | null)?.blur() // Space must not re-press the Present button
    const keys: Record<string, () => void> = {
      ArrowRight: () => go(1), ' ': () => go(1), PageDown: () => go(1),
      ArrowLeft: () => go(-1), PageUp: () => go(-1),
      Escape: onExit, b: () => setPaused((p) => !p), B: () => setPaused((p) => !p),
    }
    const onKey = (e: KeyboardEvent) => {
      if (!keys[e.key]) return
      e.preventDefault()
      keys[e.key]()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- go only closes over last, which is fixed while presenting
  }, [onExit])

  return (
    <div
      className="present"
      dir="ltr"
      data-testid="present"
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchX
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
      }}
    >
      <div className="present-slide">{slides[n] && <SlideCard slide={slides[n]} deck={deck} />}</div>
      {paused && <div className="pause" data-testid="pause" />}
      <button className={`counter num${paused ? ' on-black' : ''}`} aria-label={t.pause} onClick={() => setPaused((p) => !p)}>
        {n + 1} / {slides.length}
      </button>
    </div>
  )
}
