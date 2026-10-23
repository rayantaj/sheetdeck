export type Cell = string | number | boolean | Date | null
export interface Sheet { name: string; rows: Cell[][] }
export type ColumnType = 'number' | 'date' | 'category' | 'text' | 'id' | 'boolean'
export interface Stats { count: number; empty: number; distinct: number; min?: number | Date; max?: number | Date; sum?: number; mean?: number }
export interface Column { name: string; type: ColumnType; stats: Stats }
export interface Table { columns: { name: string }[]; rows: Cell[][] }
