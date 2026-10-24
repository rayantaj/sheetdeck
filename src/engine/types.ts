export type Cell = string | number | boolean | Date | null
export interface Sheet { name: string; rows: Cell[][] }
export type ColumnType = 'number' | 'date' | 'category' | 'text' | 'id' | 'boolean'
export interface Stats { count: number; empty: number; distinct: number; min?: number | Date; max?: number | Date; sum?: number; mean?: number }
export interface Column { name: string; type: ColumnType; stats: Stats }
export interface Table { columns: { name: string }[]; rows: Cell[][] }

export type FindingKind = 'total' | 'topN' | 'trend' | 'share' | 'compare' | 'distribution'
// For 'scatter', labels hold the x values (as text) and data the y values.
export interface ChartSpec {
  type: 'bar' | 'line' | 'doughnut' | 'scatter' | 'histogram'
  labels: string[]
  datasets: { label: string; data: number[] }[]
  axis?: { x: string; y: string }
}
// columns: total/distribution [number]; topN/share [category, number]; trend [date, number, category?]; compare [number, number].
export interface Finding { id: string; kind: FindingKind; columns: string[]; chart: ChartSpec; score: number; facts: Record<string, number | string> }
export interface Quality { emptyByColumn: Record<string, number>; duplicateRows: number; skippedRows: number; mismatches: Record<string, number> }
export interface Slide { id: string; kind: 'title' | 'finding' | 'quality'; title: string; finding?: Finding; quality?: Quality; hidden: boolean }
export interface Deck { source: { name: string; sheet: string; rows: number; cols: number }; lang: 'en' | 'ar'; slides: Slide[] }
