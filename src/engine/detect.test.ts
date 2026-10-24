import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { applyHeader, detectHeaderRow, detectTypes } from './detect'
import type { Cell, Sheet } from './types'

const csv = (name: string): Sheet => ({
  name,
  rows: Papa.parse<string[]>(readFileSync(`test/fixtures/${name}.csv`, 'utf8'), { skipEmptyLines: true }).data,
})

const types = (s: Sheet) => detectTypes(applyHeader(s, detectHeaderRow(s.rows))).map((c) => c.type)

describe('detect large and odd input', () => {
  it('handles 300k rows without overflowing the stack', () => {
    const rows: Cell[][] = [['n'], ...Array.from({ length: 300000 }, (_, i) => [i])]
    const [col] = detectTypes(applyHeader({ name: 's', rows }, 0))
    expect(col.stats.max).toBe(299999)
  })
  it('does not read a US date as dd/mm', () => {
    const rows: Cell[][] = [['d'], ['12/25/2024'], ['12/26/2024']]
    expect(detectTypes(applyHeader({ name: 's', rows }, 0))[0].type).not.toBe('date')
  })
})

describe('detect', () => {
  it('sales csv: header row 0, date/category/number/number', () => {
    const s = csv('sales')
    expect(detectHeaderRow(s.rows)).toBe(0)
    expect(types(s)).toEqual(['date', 'category', 'number', 'number'])
    const rev = detectTypes(applyHeader(s, 0))[3].stats
    expect(rev.count).toBe(10)
    expect(rev.max).toBe(3000)
    expect(rev.sum).toBeCloseTo(18001.5)
  })

  it('excel export with a title row: header is the second row', () => {
    const wb = XLSX.read(readFileSync('test/fixtures/titled.xlsx'), { cellDates: true })
    const rows = XLSX.utils.sheet_to_json<Cell[]>(wb.Sheets.Report, { header: 1, defval: null, blankrows: false })
    expect(detectHeaderRow(rows)).toBe(1)
    expect(types({ name: 'Report', rows })).toEqual(['date', 'category', 'number'])
  })

  it('arabic-headed sheet', () => {
    const s = csv('arabic')
    expect(detectHeaderRow(s.rows)).toBe(0)
    expect(applyHeader(s, 0).columns[0].name).toBe('التاريخ')
    expect(types(s)).toEqual(['date', 'category', 'number', 'number'])
  })
})
