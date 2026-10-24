import type { Lang } from '../i18n'
import { findFindings } from './findings'
import { quality } from './quality'
import { title } from './titles'
import type { Deck, Table } from './types'

// 50 %+ of the header's letters are Arabic.
export function isArabic(table: Table): boolean {
  const letters = table.columns.map((c) => c.name).join('').match(/\p{L}/gu) ?? []
  return letters.filter((ch) => /[؀-ۿ]/.test(ch)).length >= letters.length / 2 && letters.length > 0
}

export function buildDeck(table: Table, source: Deck['source'], lang: Lang): Deck {
  const l = isArabic(table) ? 'ar' : lang
  return {
    source,
    lang: l,
    slides: [
      { id: 'title', kind: 'title', title: source.name, hidden: false },
      ...findFindings(table, l).map((f) => ({ id: f.id, kind: 'finding' as const, title: title(f, l), finding: f, hidden: false })),
      { id: 'quality', kind: 'quality', title: l === 'ar' ? 'جودة البيانات' : 'Data quality', quality: quality(table), hidden: false },
    ],
  }
}
