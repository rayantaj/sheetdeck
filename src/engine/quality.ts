import { cellDate, cellNumber, cellText } from './cells'
import { detectTypes } from './detect'
import type { Quality, Table } from './types'

export function quality(table: Table): Quality {
  const cols = detectTypes(table)
  const emptyByColumn: Record<string, number> = {}
  const mismatches: Record<string, number> = {}
  cols.forEach((c, i) => {
    if (c.stats.empty) emptyByColumn[c.name] = (emptyByColumn[c.name] ?? 0) + c.stats.empty
    const parse = c.type === 'number' ? cellNumber : c.type === 'date' ? cellDate : null
    const bad = parse ? table.rows.filter((r) => cellText(r[i]) !== null && parse(r[i]) === null).length : 0
    if (bad) mismatches[c.name] = (mismatches[c.name] ?? 0) + bad
  })
  const kept = table.rows.filter((r) => r.some((c) => cellText(c) !== null))
  const seen = new Set(kept.map((r) => JSON.stringify(r)))
  return { emptyByColumn, duplicateRows: kept.length - seen.size, skippedRows: table.rows.length - kept.length, mismatches }
}
