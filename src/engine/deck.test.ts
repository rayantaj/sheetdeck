import { describe, expect, it } from 'vitest'
import { buildDeck, isArabic } from './deck'
import { readFileSync } from 'node:fs'
import Papa from 'papaparse'
import { applyHeader } from './detect'
import { quality } from './quality'

const csv = (name: string) =>
  applyHeader({ name, rows: Papa.parse<string[]>(readFileSync(`test/fixtures/${name}.csv`, 'utf8'), { skipEmptyLines: true }).data }, 0)

const source = { name: 'x.csv', sheet: 'x', rows: 10, cols: 4 }

describe('deck', () => {
  it('title slide, one slide per finding, quality slide last', () => {
    const d = buildDeck(csv('sales'), source, 'en')
    expect(d.lang).toBe('en')
    expect(d.slides[0].kind).toBe('title')
    expect(d.slides.at(-1)!.kind).toBe('quality')
    expect(d.slides.slice(1, -1).every((s) => s.kind === 'finding' && s.title.length > 0)).toBe(true)
  })
  it('arabic headers make an arabic deck even when asked for English', () => {
    expect(isArabic(csv('arabic'))).toBe(true)
    expect(isArabic(csv('sales'))).toBe(false)
    const d = buildDeck(csv('arabic'), source, 'en')
    expect(d.lang).toBe('ar')
    expect(d.slides.filter((s) => s.finding).every((s) => /[؀-ۿ]/.test(s.title))).toBe(true)
  })
  it('quality counts empty cells, duplicates, skipped rows and mismatches', () => {
    const q = quality({
      columns: [{ name: 'A' }, { name: 'B' }],
      rows: [[1, 'x'], [2, 'y'], [2, 'y'], [3, null], [null, null], [4, 'z'], [5, 'z'], [6, 'z'], [7, 'z'], [8, 'z'], ['oops', 'z']],
    })
    expect(q).toEqual({ emptyByColumn: { A: 1, B: 2 }, duplicateRows: 1, skippedRows: 1, mismatches: { A: 1 } })
  })
})
