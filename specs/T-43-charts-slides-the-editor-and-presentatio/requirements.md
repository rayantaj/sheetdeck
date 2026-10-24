# Charts, slides, the editor and presentation mode: requirements

T-43 · Feature · the plan Ray approved

## Goal
Charts, slides, the editor and presentation mode

The deck as slides in the Terrazzo look: a rail of thumbnails, the slide large, chart type and column swaps, title edits, hide and reorder, and a full-screen presentation mode with keys and swipe; Arabic decks read right-to-left.

## Done when
Each one is something Ray sees in the app; QA proves it with a screenshot.
1. After Continue on sales.csv, the editor shows a rail of numbered slide thumbnails and the first slide large: a title slide with the file name and the row and column counts.
2. Clicking the second thumbnail shows a chart slide with a title sentence, a chart drawn in the palette, and a footnote naming the columns; switching its chart type chip changes the chart.
3. Editing a slide's title in the input changes the title on the slide and in its thumbnail; the eye button fades the thumbnail and Present skips that slide.
4. Present fills the screen with the slide, the right arrow moves to the next slide, the counter reads 2 / N, and Escape returns to the editor.
5. On the Arabic-headed fixture, the slide reads right-to-left with the title in Arabic and the bar chart's categories starting from the right.

## Out of scope
- src/engine/*: the engine is done; change it only if a test proves a bug.
- src/styles/tokens.css and base.css.
- index.html's CSP: Chart.js runs from the bundle; nothing is loaded from elsewhere.
