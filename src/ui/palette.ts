// docs/ui.md: categorical, fixed order by dataset index, never cycled (grey is "others").
export const PALETTE = ['#2A2622', '#B5472A', '#4A6B8A', '#6E7A3A', '#B98A2B', '#7A4A6E', '#2F7F7A', '#8C8680']
export const colour = (i: number) => PALETTE[Math.min(i, PALETTE.length - 1)]
