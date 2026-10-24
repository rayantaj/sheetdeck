import type { Lang } from '../i18n'
import { cellDate, cellNumber, cellText } from './cells'
import { detectTypes } from './detect'
import { compact } from './format'
import type { Cell, ChartSpec, Finding, FindingKind, Table } from './types'

const LABELS = {
  en: { sum: 'Sum', mean: 'Average', min: 'Min', max: 'Max', others: 'Others', count: 'Rows' },
  ar: { sum: 'المجموع', mean: 'المتوسط', min: 'الأدنى', max: 'الأعلى', others: 'أخرى', count: 'الصفوف' },
}
const IMPORTANT = /total|amount|revenue|sales|price|count|qty|quantity|value|مبيعات|إيراد|كمية|سعر|مجموع|قيمة|عدد|مبلغ/i
const ID_LIKE = /(^|[\s_-])id$|معرّف/i

const sum = (v: number[]) => v.reduce((a, b) => a + b, 0)
const iso = (d: Date) => d.toISOString().slice(0, 10)
const round = (n: number, dp = 0) => Math.round(n * 10 ** dp) / 10 ** dp
const importance = (names: string[]) => (names.some((n) => ID_LIKE.test(n)) ? 0 : names.some((n) => IMPORTANT.test(n)) ? 1.5 : 1)

// 0 for a flat series, else the standard deviation relative to the mean, capped at 1.
export function spread(v: number[]): number {
  if (v.length < 2 || v.every((x) => x === v[0])) return 0
  const m = sum(v) / v.length
  const sd = Math.sqrt(sum(v.map((x) => (x - m) ** 2)) / v.length)
  return Math.min(1, sd / (Math.abs(m) || sd))
}

function bucket(t: number, unit: string): string {
  const d = new Date(t)
  if (unit === 'week') d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  if (unit === 'month') return `${iso(d).slice(0, 7)}-01`
  if (unit === 'quarter') return iso(new Date(Date.UTC(d.getUTCFullYear(), Math.floor(d.getUTCMonth() / 3) * 3, 1)))
  return iso(d)
}

export function findFindings(table: Table, lang: Lang): Finding[] {
  const n = table.rows.length
  if (!n) return []
  const L = LABELS[lang]
  const cols = detectTypes(table)
  const col = <T,>(i: number, f: (c: Cell) => T) => table.rows.map((r) => f(r[i]))
  const present = <T,>(v: (T | null)[]) => v.filter((x): x is T => x !== null)
  const out: Finding[] = []
  const add = (kind: FindingKind, columns: string[], chart: ChartSpec, used: number, variance: number, facts: Finding['facts'], names = columns) => {
    const score = round((used / n) * variance * importance(names), 3)
    if (score > 0) out.push({ id: `${kind}:${columns.join('|')}`, kind, columns, chart, score, facts })
  }
  const topPlusOthers = (sorted: [string, number][], keep: number): [string[], number[]] => {
    const top = sorted.slice(0, keep)
    const rest = sorted.slice(keep)
    if (rest.length) top.push([L.others, sum(rest.map((g) => g[1]))])
    return [top.map((g) => g[0]), top.map((g) => g[1])]
  }

  const idx = (type: string) => cols.flatMap((c, i) => (c.type === type ? [i] : []))
  const nums = new Map(idx('number').map((i) => [i, col(i, cellNumber)]))
  // a flat column says nothing, so no rule uses it
  const measures = [...nums.keys()].filter((i) => spread(present(nums.get(i)!)) > 0)
  const cats = idx('category')
  const lineCat = cats.find((i) => cols[i].stats.distinct >= 2 && cols[i].stats.distinct <= 5)

  for (const m of measures) {
    const v = present(nums.get(m)!)
    const name = cols[m].name
    const stats = [sum(v), sum(v) / v.length, v.reduce((a, b) => Math.min(a, b)), v.reduce((a, b) => Math.max(a, b))]
    add('total', [name], { type: 'bar', labels: [L.sum, L.mean, L.min, L.max], datasets: [{ label: name, data: stats }] }, v.length, spread(v), {
      sum: stats[0], mean: stats[1], min: stats[2], max: stats[3],
    })

    if (v.length >= 50) {
      const [lo, hi] = [stats[2], stats[3]]
      const w = (hi - lo) / 10
      const counts = Array(10).fill(0)
      for (const x of v) counts[Math.min(9, Math.floor((x - lo) / w))]++
      const s = [...v].sort((a, b) => a - b)
      add('distribution', [name], {
        type: 'histogram',
        labels: counts.map((_, b) => `${compact(lo + b * w, lang)}–${compact(lo + (b + 1) * w, lang)}`),
        datasets: [{ label: L.count, data: counts }],
        axis: { x: name, y: L.count },
      }, v.length, spread(v), { p10: s[Math.floor(s.length * 0.1)], p90: s[Math.min(s.length - 1, Math.floor(s.length * 0.9))] })
    }

    for (const c of cats) {
      const text = col(c, cellText)
      const groups = new Map<string, number>()
      let used = 0
      table.rows.forEach((_, r) => {
        const k = text[r]
        const x = nums.get(m)![r]
        if (k === null || x === null) return
        groups.set(k, (groups.get(k) ?? 0) + x)
        used++
      })
      const sorted = [...groups].sort((a, b) => b[1] - a[1])
      const total = sum(sorted.map((g) => g[1]))
      if (sorted.length < 2 || total <= 0 || sorted[sorted.length - 1][1] < 0) continue
      const columns = [cols[c].name, name]
      const axis = { x: columns[0], y: name }
      const leader = { leader: sorted[0][0], share: round((sorted[0][1] / total) * 100) }
      const [labels, data] = topPlusOthers(sorted, 10)
      add('topN', columns, { type: 'bar', labels, datasets: [{ label: name, data }], axis }, used, spread(sorted.map((g) => g[1])), leader, [name])
      const cover = sum(sorted.slice(0, 5).map((g) => g[1])) / total
      if (cover >= 0.6) {
        const [l5, d5] = topPlusOthers(sorted, 5)
        add('share', columns, { type: 'doughnut', labels: l5, datasets: [{ label: name, data: d5 }] }, used, spread(sorted.map((g) => g[1] / total)), {
          ...leader, top: round(cover * 100), n: Math.min(5, sorted.length),
        }, [name])
      }
    }

    for (const d of idx('date')) {
      const dates = col(d, cellDate)
      const pts: { t: number; v: number; c: string | null }[] = []
      const catText = lineCat === undefined ? null : col(lineCat, cellText)
      table.rows.forEach((_, r) => {
        const t = dates[r]
        const x = nums.get(m)![r]
        if (t !== null && x !== null && (!catText || catText[r] !== null)) pts.push({ t, v: x, c: catText?.[r] ?? null })
      })
      if (pts.length < 6) continue
      const span = (pts.reduce((a, p) => Math.max(a, p.t), -Infinity) - pts.reduce((a, p) => Math.min(a, p.t), Infinity)) / 864e5
      const units = span <= 60 ? ['day'] : span <= 548 ? ['month', 'week'] : ['month', 'quarter']
      const unit = units.find((u) => {
        const size = new Set(pts.map((p) => bucket(p.t, u))).size
        return size >= 6 && size <= 60
      })
      if (!unit) continue
      const sums = new Map<string, Map<string, number>>() // category (or '') → bucket → sum
      for (const p of pts) {
        const lines = sums.get(p.c ?? '') ?? sums.set(p.c ?? '', new Map()).get(p.c ?? '')!
        const k = bucket(p.t, unit)
        lines.set(k, (lines.get(k) ?? 0) + p.v)
      }
      const labels = [...new Set(pts.map((p) => bucket(p.t, unit)))].sort()
      const totals = labels.map((k) => sum([...sums.values()].map((l) => l.get(k) ?? 0)))
      const first = totals[0]
      const columns = [cols[d].name, name, ...(lineCat === undefined ? [] : [cols[lineCat].name])]
      add('trend', columns, {
        type: 'line',
        labels,
        datasets: [...sums].map(([k, l]) => ({ label: k || name, data: labels.map((x) => l.get(x) ?? 0) })),
        axis: { x: cols[d].name, y: name },
      }, pts.length, spread(totals), {
        change: first === 0 ? 0 : round(((totals[totals.length - 1] - first) / Math.abs(first)) * 100),
        from: labels[0], to: labels[labels.length - 1], unit,
      }, [name])
    }
  }

  measures.forEach((a, i) => {
    for (const b of measures.slice(i + 1)) {
      const xs: number[] = []
      const ys: number[] = []
      table.rows.forEach((_, r) => {
        const x = nums.get(a)![r]
        const y = nums.get(b)![r]
        if (x !== null && y !== null) {
          xs.push(x)
          ys.push(y)
        }
      })
      if (xs.length < 3) continue
      const mx = sum(xs) / xs.length
      const my = sum(ys) / ys.length
      const cov = sum(xs.map((x, k) => (x - mx) * (ys[k] - my)))
      const r = cov / Math.sqrt(sum(xs.map((x) => (x - mx) ** 2)) * sum(ys.map((y) => (y - my) ** 2)))
      if (!(Math.abs(r) >= 0.5)) continue
      const columns = [cols[a].name, cols[b].name]
      add('compare', columns, { type: 'scatter', labels: xs.map(String), datasets: [{ label: columns[1], data: ys }], axis: { x: columns[0], y: columns[1] } }, xs.length, Math.abs(r), {
        r: round(r, 2),
      })
    }
  })

  return out.sort((a, b) => b.score - a.score).slice(0, 10)
}
