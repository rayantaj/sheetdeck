# Charts, slides, the editor and presentation mode: tasks

T-43 · in progress.

- [ ] src/ui/ChartView.tsx: a Chart.js 4 wrapper (react-chartjs-2 is not needed: use the Chart constructor on a canvas ref) that draws a ChartSpec with the palette from docs/ui.md in fixed order by dataset index, the theme's fonts, one axis, tabular numerals, a legend when two or more datasets, no animation, and RTL mirroring (rtl: true in Chart.js options and reversed x for bars) when the deck is Arabic. Histogram = bar with no gaps.
- [ ] src/ui/SlideCard.tsx: a 16:9 card in the Terrazzo look: the title in Syne at the top, the chart filling the rest, a footnote line in Onest 500 naming the columns used and the row count; the title slide shows the file name, sheet, rows × columns and the date; the quality slide shows the quality facts as a short ruled list.
- [ ] src/ui/Deck.tsx: the editor: a rail of numbered thumbnails on the left (each a small SlideCard, hidden ones faded, drag to reorder with native HTML drag and drop, an eye button to hide/show), the current slide large on the right, Present and Export buttons at the top right (Export opens the sheet in the next Feature; for now it's disabled with a title), the interface language switch stays in the header.
- [ ] src/ui/SlideEditor.tsx under the slide: the title as an input (edits the slide's title), the chart type as square chips of the types that fit this finding's kind (bar/line for trend, bar/doughnut for share and topN, scatter only for compare, histogram only for distribution), and for topN/share/trend a column picker to swap the measure among the number columns; every edit updates the Deck in App state and re-renders.
- [ ] src/ui/Present.tsx: a full-screen presentation on paper: the slide card without its offset filling the screen at 16:9, arrow keys and swipe to move, Escape to leave, a 'B' key or a tap on the counter for a black pause screen, the counter 'n / N' in mono bottom right; hidden slides are skipped.
- [ ] Route it: after Continue, App builds the deck and shows the editor; the summary card from the last Feature goes away. i18n strings for everything new, en and ar.

## Parts of the work
- Charts, slides, the editor rail, the slide editor, presentation mode (web-developer)
