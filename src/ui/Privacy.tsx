import { useRef } from 'react'
import type { Strings } from '../i18n'

export default function Privacy({ t }: { t: Strings }) {
  const dlg = useRef<HTMLDialogElement>(null)
  const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content') ?? ''
  return (
    <>
      <button type="button" className="link privacy" onClick={() => dlg.current?.showModal()}>{t.privacy}</button>
      <dialog ref={dlg} className="card sheet" aria-labelledby="privacy-title">
        <h2 id="privacy-title">{t.privacyTitle}</h2>
        <p>{t.privacyBody}</p>
        <p>{t.privacyCsp}</p>
        <pre className="csp" dir="ltr">{csp}</pre>
        <p>{t.privacyCheck}</p>
        {import.meta.env.PROD && 'serviceWorker' in navigator && <p>{t.privacyOffline}</p>}
        <button className="btn" onClick={() => dlg.current?.close()}>{t.close}</button>
      </dialog>
    </>
  )
}
