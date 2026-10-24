import type { Lang } from '../i18n'
import { findFindings } from './findings'
import { quality } from './quality'
import { title } from './titles'
import type { Deck, Table } from './types'

// 50 %+ of the header's letters are Arabic.
export function isArabic(table: Table): boolean {
  const letters = table.columns.map((c) => c.name).join('').match(/\p{L}/gu) ?? []
  return letters.filter((ch) => /[؀-ۿ]/.test(ch)).length >= letters.length / 2 && letters.length > 0
}

const SAMPLE_OVER = 100_000
const SAMPLE_SIZE = 20_000

export function buildDeck(table: Table, source: Deck['source'], lang: Lang): Deck {
  const l = isArabic(table) ? 'ar' : lang
  const big = table.rows.length > SAMPLE_OVER
  // every nth row, so the sample spans the whole table
  const rows = big ? Array.from({ length: SAMPLE_SIZE }, (_, i) => table.rows[Math.floor((i * table.rows.length) / SAMPLE_SIZE)]) : table.rows
  return {
    source,
    lang: l,
    slides: [
      { id: 'title', kind: 'title', title: source.name, hidden: false },
      ...findFindings({ ...table, rows }, l).map((f) => ({ id: f.id, kind: 'finding' as const, title: title(f, l), finding: f, hidden: false })),
      { id: 'quality', kind: 'quality', title: l === 'ar' ? 'جودة البيانات' : 'Data quality', quality: { ...quality(table), ...(big && { sampled: SAMPLE_SIZE }) }, hidden: false },
    ],
  }
}

const VERSION = 1

// Dates are wrapped, so a text cell that looks like an ISO date stays text.
export function toFile(deck: Deck, table: Table): string {
  return JSON.stringify({ version: VERSION, deck, table }, function (k, v) { return this[k] instanceof Date ? { $date: this[k].toISOString() } : v }, 2)
}

export function fromFile(text: string): { deck: Deck; table: Table } {
  let f
  try {
    f = JSON.parse(text, (_, v) => (v && typeof v === 'object' && '$date' in v ? new Date(v.$date) : v))
  } catch {
    f = null
  }
  if (!f || f.version !== VERSION || !Array.isArray(f.deck?.slides) || !f.deck.slides.length || !Array.isArray(f.table?.columns) || !Array.isArray(f.table?.rows)) {
    throw new Error('Not a sheetdeck file')
  }
  return { deck: f.deck, table: f.table }
}
