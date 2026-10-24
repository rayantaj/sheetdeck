import { describe, expect, it } from 'vitest'
import { compact, dateLabel, percent } from './format'
import { title } from './titles'
import type { Finding, FindingKind } from './types'

const f = (kind: FindingKind, columns: string[], facts: Finding['facts']): Finding => ({
  id: kind, kind, columns, score: 1, facts, chart: { type: 'bar', labels: [], datasets: [] },
})

const trend = { change: 18, from: '2024-01-01', to: '2024-09-01', unit: 'month' }
const cases: [Finding, string, string][] = [
  [f('total', ['Sales'], { sum: 1200000, mean: 340, min: 5, max: 3000 }), 'Sales: total 1.2M, average 340, from 5 to 3K', 'Sales: المجموع 1.2 مليون، المتوسط 340، من 5 إلى 3 ألف'],
  [f('topN', ['Region', 'Sales'], { leader: 'Riyadh', share: 42 }), 'Sales by region: Riyadh leads with 42 %', 'Sales حسب Region: Riyadh في الصدارة بنسبة 42 %'],
  [f('trend', ['Date', 'Revenue'], trend), 'Revenue rose 18 % from January to September', 'ارتفع Revenue بنسبة 18 % من يناير إلى سبتمبر'],
  [f('trend', ['Date', 'Revenue'], { ...trend, change: -7.4 }), 'Revenue fell 7 % from January to September', 'انخفض Revenue بنسبة 7 % من يناير إلى سبتمبر'],
  [f('trend', ['Date', 'Revenue'], { ...trend, change: 0, to: '2025-02-01' }), 'Revenue stayed level from January 2024 to February 2025', 'استقر Revenue من يناير 2024 إلى فبراير 2025'],
  [f('share', ['Region', 'Sales'], { n: 5, top: 83 }), 'The top 5 region make up 83 % of sales', 'أكبر 5 من Region تشكّل 83 % من Sales'],
  [f('compare', ['Orders', 'Discount'], { r: 0.71 }), 'Orders and discount move together (r = 0.71)', 'Orders وDiscount يتحركان معاً (r = 0.71)'],
  [f('compare', ['Orders', 'Discount'], { r: -0.6 }), 'Orders and discount move in opposite directions (r = -0.60)', 'Orders وDiscount يتحركان في اتجاهين متعاكسين (r = -0.60)'],
  [f('distribution', ['Orders'], { p10: 120, p90: 340 }), 'Most orders are between 120 and 340', 'معظم قيم Orders بين 120 و340'],
]

describe('titles', () => {
  it.each(cases)('%#', (finding, en, ar) => {
    expect(title(finding, 'en')).toBe(en)
    expect(title(finding, 'ar')).toBe(ar)
  })
})

describe('format', () => {
  it('compacts numbers with Western digits', () => {
    expect(compact(1234567, 'en')).toBe('1.2M')
    expect(compact(340000, 'en')).toBe('340K')
    expect(compact(12.345, 'en')).toBe('12.35')
    expect(compact(2500000000, 'ar')).toBe('2.5 مليار')
  })
  it('percent and dates', () => {
    expect(percent(41.6)).toBe('42 %')
    expect(dateLabel('2024-03-04', 'en', 'week', false)).toBe('4 March')
    expect(dateLabel('2024-03-01', 'ar', 'month', true)).toBe('مارس 2024')
  })
})
