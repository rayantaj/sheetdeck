import { useEffect, useState } from 'react'
import { parseFile } from './engine/parse'
import { applyHeader } from './engine/detect'
import { buildDeck } from './engine/deck'
import type { Deck as DeckT, Sheet, Table } from './engine/types'
import { loadLang, saveLang, strings, type Lang } from './i18n'
import Deck from './ui/Deck'
import DropZone from './ui/DropZone'
import SheetPicker from './ui/SheetPicker'
import sampleCsv from '../public/sample-sales.csv?raw'

type State =
  | { step: 'empty'; error?: boolean }
  | { step: 'parsing' }
  | { step: 'pick'; sheets: Sheet[]; file: string }
  | { step: 'deck'; table: Table; deck: DeckT }

export default function App() {
  const [lang, setLang] = useState<Lang>(loadLang)
  const [state, setState] = useState<State>({ step: 'empty' })
  const t = strings[lang]

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])

  const open = (file: File) => {
    setState({ step: 'parsing' })
    parseFile(file).then(
      (sheets) => setState({ step: 'pick', sheets, file: file.name }),
      () => setState({ step: 'empty', error: true }),
    )
  }

  const toggle = () => {
    const next = lang === 'en' ? 'ar' : 'en'
    saveLang(next)
    setLang(next)
  }

  return (
    <div className="container page">
      <header className="top">
        <strong className="brand">sheetdeck</strong>
        <button className="btn" onClick={toggle}>{t.toggle}</button>
      </header>
      <main className={state.step === 'deck' ? 'wide' : undefined}>
        {state.step === 'empty' && (
          <>
            <h1>{t.headline}</h1>
            <p className="lead">{t.lead}</p>
            {state.error && <p role="alert" className="error">{t.error}</p>}
            <DropZone t={t} onFile={open} onSample={() => open(new File([sampleCsv], 'sample-sales.csv', { type: 'text/csv' }))} />
          </>
        )}
        {state.step === 'parsing' && <p className="lead">{t.parsing}</p>}
        {state.step === 'pick' && (
          <SheetPicker
            t={t}
            sheets={state.sheets}
            onContinue={(sheet, header) => {
              const table = applyHeader(sheet, header)
              const source = { name: state.file, sheet: sheet.name, rows: table.rows.length, cols: table.columns.length }
              setState({ step: 'deck', table, deck: buildDeck(table, source, lang) })
            }}
          />
        )}
        {state.step === 'deck' && <Deck t={t} deck={state.deck} table={state.table} setDeck={(deck) => setState({ ...state, deck })} onBack={() => setState({ step: 'empty' })} />}
      </main>
    </div>
  )
}
