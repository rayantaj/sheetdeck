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

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)
const isStr = (v: unknown) => typeof v === 'string'
const isNum = (v: unknown) => typeof v === 'number' && Number.isFinite(v)
const strs = (v: unknown) => Array.isArray(v) && v.every(isStr)
const numRecord = (v: unknown) => isObj(v) && Object.values(v).every(isNum)
const okCell = (v: unknown) => v === null || isStr(v) || typeof v === 'boolean' || (typeof v === 'number' && !Number.isNaN(v)) || (v instanceof Date && !Number.isNaN(v.getTime()))

function okFinding(f: unknown): boolean {
  if (!isObj(f) || !isStr(f.id) || !['total', 'topN', 'trend', 'share', 'compare', 'distribution'].includes(f.kind as string)) return false
  const c = f.chart
  return (
    strs(f.columns) && isNum(f.score) && isObj(f.facts) && Object.values(f.facts).every((v) => isNum(v) || isStr(v)) &&
    isObj(c) && ['bar', 'line', 'doughnut', 'scatter', 'histogram'].includes(c.type as string) && strs(c.labels) &&
    Array.isArray(c.datasets) && c.datasets.every((d) => isObj(d) && isStr(d.label) && Array.isArray(d.data) && d.data.every(isNum)) &&
    (c.axis === undefined || (isObj(c.axis) && isStr(c.axis.x) && isStr(c.axis.y)))
  )
}

function okQuality(q: unknown): boolean {
  return isObj(q) && numRecord(q.emptyByColumn) && isNum(q.duplicateRows) && isNum(q.skippedRows) && numRecord(q.mismatches) && (q.sampled === undefined || isNum(q.sampled))
}

function okSlide(s: unknown): boolean {
  if (!isObj(s) || !isStr(s.id) || !isStr(s.title) || typeof s.hidden !== 'boolean') return false
  if (s.kind === 'title') return true
  if (s.kind === 'finding') return okFinding(s.finding)
  return s.kind === 'quality' && okQuality(s.quality)
}

function valid(f: unknown): f is { deck: Deck; table: Table } {
  if (!isObj(f) || f.version !== VERSION) return false
  const { deck, table } = f
  if (!isObj(deck) || !isObj(table) || (deck.lang !== 'en' && deck.lang !== 'ar')) return false
  const src = deck.source
  if (!isObj(src) || !isStr(src.name) || !isStr(src.sheet) || !isNum(src.rows) || !isNum(src.cols)) return false
  if (!Array.isArray(deck.slides) || !deck.slides.length || !deck.slides.every(okSlide)) return false
  return Array.isArray(table.columns) && table.columns.every((c) => isObj(c) && isStr(c.name)) && Array.isArray(table.rows) && table.rows.every((r) => Array.isArray(r) && r.every(okCell))
}

export function fromFile(text: string): { deck: Deck; table: Table } {
  let f: unknown
  try {
    f = JSON.parse(text, (_, v) => (v && typeof v === 'object' && '$date' in v ? new Date(v.$date) : v))
  } catch {
    f = null
  }
  if (!valid(f)) throw new Error('Not a sheetdeck file')
  return { deck: f.deck, table: f.table }
}
