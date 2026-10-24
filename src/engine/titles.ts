import type { Lang } from '../i18n'
import { compact, dateLabel, percent } from './format'
import type { Finding } from './types'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function title(f: Finding, lang: Lang): string {
  const { facts: x, columns: c } = f
  const num = (k: string) => compact(x[k] as number, lang)
  const ar = lang === 'ar'
  const m = c[1] ?? c[0] // the number column of every kind but compare and distribution; those use c[0]
  switch (f.kind) {
    case 'total':
      return ar
        ? `${c[0]}: المجموع ${num('sum')}، المتوسط ${num('mean')}، من ${num('min')} إلى ${num('max')}`
        : `${cap(c[0])}: total ${num('sum')}, average ${num('mean')}, from ${num('min')} to ${num('max')}`
    case 'topN':
      return ar
        ? `${m} حسب ${c[0]}: ${x.leader} في الصدارة بنسبة ${percent(x.share as number)}`
        : `${cap(m)} by ${c[0].toLowerCase()}: ${x.leader} leads with ${percent(x.share as number)}`
    case 'trend': {
      const year = String(x.from).slice(0, 4) !== String(x.to).slice(0, 4)
      const from = dateLabel(String(x.from), lang, String(x.unit), year)
      const to = dateLabel(String(x.to), lang, String(x.unit), year)
      const change = x.change as number
      const by = percent(Math.abs(change))
      if (Math.abs(change) < 1) return ar ? `استقر ${m} من ${from} إلى ${to}` : `${cap(m)} stayed level from ${from} to ${to}`
      if (change > 0) return ar ? `ارتفع ${m} بنسبة ${by} من ${from} إلى ${to}` : `${cap(m)} rose ${by} from ${from} to ${to}`
      return ar ? `انخفض ${m} بنسبة ${by} من ${from} إلى ${to}` : `${cap(m)} fell ${by} from ${from} to ${to}`
    }
    case 'share':
      return ar
        ? `أكبر ${x.n} من ${c[0]} تشكّل ${percent(x.top as number)} من ${m}`
        : `The top ${x.n} ${c[0].toLowerCase()} make up ${percent(x.top as number)} of ${m.toLowerCase()}`
    case 'compare': {
      const r = (x.r as number).toFixed(2)
      if (x.r as number > 0) return ar ? `${c[0]} و${c[1]} يتحركان معاً (r = ${r})` : `${cap(c[0])} and ${c[1].toLowerCase()} move together (r = ${r})`
      return ar ? `${c[0]} و${c[1]} يتحركان في اتجاهين متعاكسين (r = ${r})` : `${cap(c[0])} and ${c[1].toLowerCase()} move in opposite directions (r = ${r})`
    }
    case 'distribution':
      return ar
        ? `معظم قيم ${c[0]} بين ${num('p10')} و${num('p90')}`
        : `Most ${c[0].toLowerCase()} are between ${num('p10')} and ${num('p90')}`
  }
}
