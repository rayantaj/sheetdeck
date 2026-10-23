import { useRef, useState } from 'react'
import type { Strings } from '../i18n'

export default function DropZone({ t, onFile, onSample }: { t: Strings; onFile: (f: File) => void; onSample: () => void }) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  return (
    <div>
      <div
        className={`card dropzone${over ? ' over' : ''}`}
        data-testid="dropzone"
        onClick={() => input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          const f = e.dataTransfer.files[0]
          if (f) onFile(f)
        }}
      >
        <button type="button" className="dropzone-btn" onClick={(e) => { e.stopPropagation(); input.current?.click() }}>
          <h3>{t.drop}</h3>
          <span>{t.browse}</span>
        </button>
        <input
          ref={input}
          type="file"
          accept=".xlsx,.xls,.csv"
          hidden
          data-testid="file-input"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f) }}
        />
      </div>
      <p className="under">
        <button type="button" className="link" onClick={onSample}>{t.sample}</button>
        <span className="privacy">{t.privacy}</span>
      </p>
    </div>
  )
}
