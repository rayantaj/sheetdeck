import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { toFile } from '../engine/deck'
import type { Deck, Slide, Table } from '../engine/types'
import type { Strings } from '../i18n'
import { canvasBlob, download, renderSlide } from '../export/png'
import { pdfBlob } from '../export/pdf'
import SlideCard from './SlideCard'

const name = (deck: Deck) => deck.source.name.replace(/\.[^.]+$/, '')

export default function Export({ t, deck, table, slide, onClose }: { t: Strings; deck: Deck; table: Table; slide: Slide; onClose: () => void }) {
  const dlg = useRef<HTMLDialogElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState<Slide | null>(null)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState('')

  useEffect(() => dlg.current?.showModal(), [])

  // Mounts the slide in the hidden stage so its chart paints, then draws the slide on a canvas.
  const draw = async (s: Slide) => {
    flushSync(() => setShown(s))
    await new Promise((r) => requestAnimationFrame(r))
    return renderSlide(s, deck, stage.current!.querySelector('canvas'))
  }

  const run = async (job: () => Promise<void>) => {
    setBusy(true)
    setFailed('')
    try {
      await job()
    } catch (e) {
      console.error(e)
      setFailed(e instanceof Error ? e.message : String(e))
    }
    flushSync(() => setShown(null))
    setBusy(false)
  }

  const pdf = () => run(async () => {
    const canvases = []
    for (const s of deck.slides.filter((x) => !x.hidden)) canvases.push(await draw(s))
    download(pdfBlob(canvases), `${name(deck)}.pdf`)
  })
  const png = () => run(async () => download(await canvasBlob(await draw(slide)), `${name(deck)}-${deck.slides.indexOf(slide) + 1}.png`))
  const file = () => run(async () => download(new Blob([toFile(deck, table)], { type: 'application/json' }), `${name(deck)}.sheetdeck.json`))

  return (
    <>
      <dialog ref={dlg} className="card sheet" aria-labelledby="export-title" onClose={onClose}>
        <h2 id="export-title">{t.export}</h2>
        <div className="export-rows">
          <button className="btn" disabled={busy || deck.slides.every((s) => s.hidden)} onClick={pdf}>{t.exportPdf}</button>
          <button className="btn" disabled={busy} onClick={png}>{t.exportPng}</button>
          <button className="btn" disabled={busy} onClick={file}>{t.exportFile}</button>
        </div>
        {busy && <p role="status">{t.exportWorking}</p>}
        {failed && <p role="alert" className="error">{t.exportFailed} ({failed})</p>}
        <button className="btn" onClick={() => dlg.current?.close()}>{t.close}</button>
      </dialog>
      <div ref={stage} className="export-stage" aria-hidden="true">
        <div className="export-slide">{shown && <SlideCard slide={shown} deck={deck} />}</div>
      </div>
    </>
  )
}
