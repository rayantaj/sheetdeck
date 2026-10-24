import { describe, expect, it } from 'vitest'
import { wrapLines } from './png'

const measure = (s: string) => s.length * 10

describe('wrapLines', () => {
  it('breaks at word boundaries within the width', () => {
    expect(wrapLines('top five regions by revenue', 140, measure)).toEqual(['top five', 'regions by', 'revenue'])
  })
  it('keeps an over-wide word on its own line and handles empty text', () => {
    expect(wrapLines('a verylongword b', 50, measure)).toEqual(['a', 'verylongword', 'b'])
    expect(wrapLines('', 50, measure)).toEqual([])
  })
})
