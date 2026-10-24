import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { applyHeader } from './detect'
import { findFindings, spread } from './findings'
import { title } from './titles'
import type { Cell, Table } from './types'

const csv = (name: string): Table =>
  applyHeader({ name, rows: Papa.parse<string[]>(readFileSync(`test/fixtures/${name}.csv`, 'utf8'), { skipEmptyLines: true }).data }, 0)

const kinds = (t: Table) => findFindings(t, 'en').map((f) => f.kind)

describe('findFindings', () => {
  it('sales: all rules that fit, titles name real columns and numbers', () => {
    const fs = findFindings(csv('sales'), 'en')
    expect(fs.length).toBeGreaterThanOrEqual(5)
    expect(new Set(fs.map((f) => f.kind))).toEqual(new Set(['total', 'topN', 'trend', 'share', 'compare']))
    const titles = fs.map((f) => title(f, 'en'))
    expect(titles).toContain('Revenue by region: Riyadh leads with 54 %')
    expect(titles.some((t) => /^Revenue (rose|fell) \d+ % from /.test(t))).toBe(true)
    const trend = fs.find((f) => f.kind === 'trend' && f.columns[1] === 'Revenue')!
    expect(trend.columns).toEqual(['Date', 'Revenue', 'Region'])
    expect(trend.chart.datasets.map((d) => d.label).sort()).toEqual(['Dammam', 'Jeddah', 'Riyadh'])
    const topN = fs.find((f) => f.kind === 'topN' && f.columns[1] === 'Revenue')!
    expect(topN.chart.labels[0]).toBe('Riyadh')
    const compare = fs.find((f) => f.kind === 'compare')!
    expect(compare.facts.r).toBeGreaterThan(0.99)
  })

  it('at most ten, best first, one per kind and columns', () => {
    for (const t of [csv('sales'), csv('arabic'), big()]) {
      const fs = findFindings(t, 'en')
      expect(fs.length).toBeLessThanOrEqual(10)
      expect(fs.map((f) => f.score)).toEqual([...fs.map((f) => f.score)].sort((a, b) => b - a))
      expect(new Set(fs.map((f) => f.kind + f.columns.join())).size).toBe(fs.length)
    }
  })

  it('arabic fixture: Arabic labels', () => {
    const fs = findFindings(csv('arabic'), 'ar')
    expect(fs.length).toBeGreaterThan(0)
    expect(fs.find((f) => f.kind === 'total')!.chart.labels[0]).toBe('المجموع')
    expect(fs.some((f) => f.columns.includes('المدينة'))).toBe(true)
  })

  it('excel export with a title row', () => {
    const wb = XLSX.read(readFileSync('test/fixtures/titled.xlsx'), { cellDates: true })
    const rows = XLSX.utils.sheet_to_json<Cell[]>(wb.Sheets.Report, { header: 1, defval: null, blankrows: false })
    expect(findFindings(applyHeader({ name: 'Report', rows }, 1), 'en').length).toBeGreaterThan(0)
  })

  it('a flat series scores 0 and yields no finding about itself', () => {
    expect(spread([7, 7, 7])).toBe(0)
    const rows: Cell[][] = Array.from({ length: 12 }, (_, i) => [`2024-01-${String(i + 1).padStart(2, '0')}`, 5, i * 3 + (i % 2)])
    const fs = findFindings({ columns: [{ name: 'Day' }, { name: 'Flat' }, { name: 'Sales' }], rows }, 'en')
    expect(fs.length).toBeGreaterThan(0)
    expect(fs.some((f) => f.columns.includes('Flat'))).toBe(false)
  })

  it('a 2,000-row table finishes under 200 ms and gets a distribution', () => {
    const t = big()
    const start = performance.now()
    const fs = findFindings(t, 'en')
    expect(performance.now() - start).toBeLessThan(200)
    expect(fs.map((f) => f.kind)).toContain('distribution')
    expect(kinds(t)).toContain('trend')
    const dist = fs.find((f) => f.kind === 'distribution')!
    expect(dist.chart.datasets[0].data.reduce((a, b) => a + b)).toBe(2000)
    expect(dist.chart.labels).toHaveLength(10)
  })

  it('an id column scores 0; more than ten categories fold into Others', () => {
    const rows: Cell[][] = Array.from({ length: 40 }, (_, i) => [`c${i % 14}`, i + 1, (i * 7) % 11])
    const fs = findFindings({ columns: [{ name: 'Shop' }, { name: 'order id' }, { name: 'Sales' }], rows }, 'en')
    expect(fs.some((f) => f.columns.includes('order id'))).toBe(false)
    const topN = fs.find((f) => f.kind === 'topN')!
    expect(topN.chart.labels).toHaveLength(11)
    expect(topN.chart.labels[10]).toBe('Others')
  })
})

function big(): Table {
  const regions = ['North', 'South', 'East', 'West']
  const rows: Cell[][] = Array.from({ length: 2000 }, (_, i) => {
    const day = new Date(Date.UTC(2023, 0, 1 + (i % 400)))
    return [day, regions[i % 4], (i * 37) % 500 + 20, ((i * 37) % 500 + 20) * 2 + (i % 13), (i * 91) % 17]
  })
  return { columns: ['Date', 'Region', 'Orders', 'Revenue', 'Discount'].map((name) => ({ name })), rows }
}
