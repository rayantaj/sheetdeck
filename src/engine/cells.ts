import type { Cell } from './types'

// Same reading rules as detect.ts (which stays untouched), returning the value or null.
export function cellText(c: Cell): string | null {
  if (c === null) return null
  const s = c instanceof Date ? c.toISOString().slice(0, 10) : String(c).trim()
  return s === '' ? null : s
}

export function cellNumber(c: Cell): number | null {
  if (typeof c === 'number') return Number.isFinite(c) ? c : null
  if (typeof c !== 'string') return null
  const s = c.replace(/[,\s]/g, '')
  return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : null
}

// A date as a UTC timestamp.
export function cellDate(c: Cell): number | null {
  if (c instanceof Date) return Number.isNaN(c.getTime()) ? null : c.getTime()
  if (typeof c !== 'string') return null
  const s = c.trim()
  let m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ].*)?$/.exec(s)
  if (m) return Date.UTC(+m[1], +m[2] - 1, +m[3])
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s)
  return m && +m[2] <= 12 && +m[1] <= 31 ? Date.UTC(+m[3], +m[2] - 1, +m[1]) : null
}
