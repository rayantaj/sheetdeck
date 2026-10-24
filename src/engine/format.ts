import type { Lang } from '../i18n'

const SUFFIX = { en: ['', 'K', 'M', 'B'], ar: ['', ' ألف', ' مليون', ' مليار'] }

const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
}

// 1234 → 1.2K. String(number) always gives Western digits.
export function compact(n: number, lang: Lang): string {
  let i = 0
  let v = n
  while (Math.abs(v) >= 1000 && i < 3) {
    v /= 1000
    i++
  }
  return String(Math.round(v * (i ? 10 : 100)) / (i ? 10 : 100)) + SUFFIX[lang][i]
}

export const percent = (n: number) => `${Math.round(n)} %`

export const monthName = (month: number, lang: Lang) => MONTHS[lang][month]

// iso = 'YYYY-MM-DD' (a bucket start). Months and quarters read as the month; days and weeks add the day.
export function dateLabel(iso: string, lang: Lang, unit: string, withYear: boolean): string {
  const month = monthName(+iso.slice(5, 7) - 1, lang)
  const day = unit === 'day' || unit === 'week' ? `${+iso.slice(8, 10)} ` : ''
  return `${day}${month}${withYear ? ` ${iso.slice(0, 4)}` : ''}`
}
