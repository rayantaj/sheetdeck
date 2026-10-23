import type { Cell, Column, ColumnType, Sheet, Table } from './types'

const isEmpty = (c: Cell) => c === null || c === '' || (typeof c === 'string' && c.trim() === '')

function toNumber(c: Cell): number | null {
  if (typeof c === 'number') return c
  if (typeof c !== 'string') return null
  const s = c.replace(/[,\s]/g, '')
  return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : null
}

function toDate(c: Cell): Date | null {
  if (c instanceof Date) return c
  if (typeof c !== 'string') return null
  const s = c.trim()
  let m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ].*)?$/.exec(s)
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s)
  return m ? new Date(Date.UTC(+m[3], +m[2] - 1, +m[1])) : null
}

const BOOLS = [['yes', 'no'], ['true', 'false'], ['0', '1']]

export function detectHeaderRow(rows: Cell[][]): number {
  for (let i = 0; i < rows.length - 1; i++) {
    const row = rows[i]
    const width = Math.max(row.length, rows[i + 1].length)
    const labels = row.filter((c) => typeof c === 'string' && c.trim() !== '' && c.length < 60 && toNumber(c) === null && !toDate(c))
    if (labels.length < width * 0.6) continue
    if (rows[i + 1].some((c) => !isEmpty(c) && (typeof c !== 'string' || toNumber(c) !== null || toDate(c)))) return i
  }
  return 0
}

export function applyHeader(sheet: Sheet, headerRow: number): Table {
  const head = sheet.rows[headerRow] ?? []
  const body = sheet.rows.slice(headerRow + 1)
  const width = Math.max(head.length, ...body.map((r) => r.length))
  const pad = (r: Cell[]) => Array.from({ length: width }, (_, i) => r[i] ?? null)
  return {
    columns: pad(head).map((h, i) => ({ name: isEmpty(h) ? `Column ${i + 1}` : String(h).trim() })),
    rows: body.map(pad),
  }
}

function typeOf(values: Cell[], distinct: number, total: number): ColumnType {
  const n = values.length
  if (n === 0) return 'text'
  const share = (f: (c: Cell) => unknown) => values.filter((c) => f(c) !== null).length / n
  const lower = [...new Set(values.map((c) => String(c).toLowerCase()))]
  if (lower.length === 2 && BOOLS.some((p) => lower.every((v) => p.includes(v)))) return 'boolean'
  if (share(toNumber) >= 0.9) return 'number'
  if (share(toDate) >= 0.9) return 'date'
  if (distinct === n && n > 1 && values.every((c) => typeof c === 'string' && /^[A-Za-z0-9_-]{3,}$/.test(c) && /\d/.test(c))) return 'id'
  return distinct <= 30 || distinct <= total * 0.2 ? 'category' : 'text'
}

export function detectTypes(table: Table): Column[] {
  return table.columns.map((col, i) => {
    const values = table.rows.map((r) => r[i]).filter((c) => !isEmpty(c))
    const distinct = new Set(values.map((c) => (c instanceof Date ? c.getTime() : String(c)))).size
    const type = typeOf(values, distinct, table.rows.length)
    const stats: Column['stats'] = { count: values.length, empty: table.rows.length - values.length, distinct }
    if (type === 'number') {
      const nums = values.map(toNumber).filter((v): v is number => v !== null)
      stats.min = Math.min(...nums)
      stats.max = Math.max(...nums)
      stats.sum = nums.reduce((a, b) => a + b, 0)
      stats.mean = stats.sum / nums.length
    } else if (type === 'date') {
      const times = values.map((c) => toDate(c)?.getTime()).filter((v): v is number => v !== undefined)
      stats.min = new Date(Math.min(...times))
      stats.max = new Date(Math.max(...times))
    }
    return { name: col.name, type, stats }
  })
}
