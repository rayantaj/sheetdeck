import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import * as XLSX from 'xlsx'

describe('xlsx parser (T-125)', () => {
  it('is the fixed SheetJS 0.20.x build', () => {
    const [major, minor] = XLSX.version.split('.').map(Number)
    expect(major).toBe(0)
    expect(minor).toBeGreaterThanOrEqual(20)
  })

  it('still reads an ordinary workbook', () => {
    const buf = readFileSync('test/fixtures/titled.xlsx')
    const wb = XLSX.read(buf, { type: 'buffer', cellDates: true })
    const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: null, blankrows: false })
    expect(rows.length).toBeGreaterThan(1)
  })

  it('does not pollute Object.prototype on a crafted sheet name', () => {
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['a'], [1]]), '__proto__')
    const out = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    try {
      XLSX.read(out, { type: 'buffer' })
    } catch {
      /* rejecting is fine */
    }
    expect(({} as Record<string, unknown>).Sheets).toBeUndefined()
    expect(({} as Record<string, unknown>).a).toBeUndefined()
  })

  it('rejects or safely handles truncated and garbage files', () => {
    const good = readFileSync('test/fixtures/titled.xlsx')
    for (const bad of [good.subarray(0, 40), Buffer.from('not a spreadsheet'.repeat(50))]) {
      let ok: boolean
      try {
        ok = Array.isArray(XLSX.read(bad, { type: 'buffer' }).SheetNames)
      } catch {
        ok = true
      }
      expect(ok).toBe(true)
    }
  })
})
