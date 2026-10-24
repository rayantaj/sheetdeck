import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import type { Cell, Sheet } from '../engine/types'

const clean = (v: unknown): Cell => (v === '' || v === undefined ? null : (v as Cell))

async function parse(file: File): Promise<Sheet[]> {
  if (/\.csv$/i.test(file.name)) {
    const text = await file.text()
    const { data } = Papa.parse<string[]>(text, { skipEmptyLines: true }) // delimiter auto-detected
    return [{ name: file.name.replace(/\.csv$/i, ''), rows: data.map((r) => r.map(clean)) }]
  }
  const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true })
  return wb.SheetNames.map((name) => ({
    name,
    rows: XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[name], { header: 1, defval: null, blankrows: false }).map((r) => r.map(clean)),
  }))
}

self.onmessage = async (e: MessageEvent<File>) => {
  try {
    self.postMessage({ sheets: await parse(e.data) })
  } catch (err) {
    self.postMessage({ error: String(err) })
  }
}
