# sheetdeck: the architecture

Decided 24 Oct 2026, at the Architecture stage.

## The parts

**Parsing (a Web Worker)**
- `src/workers/parse.worker.ts`: takes a `File`, returns `Sheet[]` (SheetJS for Excel, PapaParse for CSV). Also `applyHeader(sheet, headerRow) → Table`.
- `src/engine/detect.ts`: `detectHeaderRow(rows)` (the first row where most cells are non-empty short strings and the next rows differ in type), `detectTypes(table)` (a column is a number if 90 %+ of its non-empty cells parse as numbers; a date if 90 %+ parse as dates; an id if unique and mostly codes; a category if the distinct count is under 30 or under 20 % of rows; else text), `stats(column)`.

**The engine (pure, tested, the risky part)**
- `src/engine/findings.ts`: `findFindings(table) → Finding[]`, scored and capped at ten. The rules:
  - **Total** of each number column (sum, mean, min, max), one slide for the most important two.
  - **Top N** (bar): a category by the sum of a number; the top ten plus "others".
  - **Trend** (line): a date column by month, week or day (chosen from the range) against a number; one line per category when there are two to five categories.
  - **Share** (doughnut): a category's share of a number's total, when the top five cover 60 %+.
  - **Compare** (scatter): two number columns with |correlation| ≥ 0.5.
  - **Distribution** (histogram): a number column with 50+ rows, ten bins.
  - Scoring: coverage (how much of the data the chart uses), variance (a flat chart scores low), and column importance (named like total, amount, revenue, count, qty scores higher).
- `src/engine/titles.ts`: `title(finding, lang)`: one sentence from the numbers, never from a model: "Sales by region: Riyadh leads with 42 %", "Revenue rose 18 % from January to September", "Orders and discount move together (r = 0.71)". English and Arabic templates.
- `src/engine/format.ts`: numbers (compact: 1.2M), percentages, dates, per language.
- `src/engine/quality.ts`: empty cells per column, duplicate rows, rows skipped, type mismatches.
- `src/engine/deck.ts`: `buildDeck(table, source, lang) → Deck`; `toFile(deck, table)` and `fromFile(json)`.

**UI (React)**
- `src/App.tsx`: the states: empty (drop zone and sample), parsing, choose sheet and header, deck (editor), present.
- `src/ui/DropZone.tsx`, `SheetPicker.tsx` (sheet tabs and header-row picker with a preview of five rows).
- `src/ui/Deck.tsx`: the slide rail on the left, the current slide large on the right; `SlideCard.tsx` renders a slide (title, chart, footnote with the columns used); `ChartView.tsx` wraps Chart.js with the theme's palette; `SlideEditor.tsx` (title, chart type, hide, column swap).
- `src/ui/Present.tsx`: full-screen, keys, swipe, counter, pause.
- `src/ui/Export.tsx`: PDF, PNG, `.sheetdeck.json`.
- `src/ui/Privacy.tsx`: the "Nothing leaves this device" line and panel.
- `src/i18n.ts`: every interface string, `en` and `ar`.

## How data flows

```mermaid
flowchart LR
  file[File] --> worker[parse.worker] --> sheets[Sheet[]]
  sheets --> header[detectHeaderRow / applyHeader] --> table[Table]
  table --> types[detectTypes] --> findings[findFindings] --> titles[title] --> deck[Deck]
  deck --> Deck_UI[Deck editor] --> Present
  Deck_UI --> Export
  deck --> quality[quality] --> deck
```

1. The file goes to the worker; the page shows the sheets found and the detected header row with a preview.
2. On confirm, the engine builds the deck; the editor shows it. Every edit changes the `Deck` only; charts re-render from it.
3. Present reads the same `Deck`. Export renders each slide to a canvas.
4. Nothing is written anywhere except the files the user saves. `localStorage` holds only the interface language.

## The screens

1. **Landing / drop:** the Hallmark page: one headline, the drop zone as the hero's object, the privacy line, a sample file link. Under it, three short rows on what you get.
2. **Pick the sheet:** tabs for the sheets, a five-row preview, the header row highlighted and changeable, Continue.
3. **Deck editor:** rail of slide thumbnails (numbered, drag to reorder, eye to hide), the slide large, an editor strip under it, Present and Export at the top right.
4. **Present:** the slide at 16:9 filling the screen on paper, the counter bottom right.
5. **Export sheet:** PDF (all), PNG (this slide), `.sheetdeck.json`.

## Rules the code keeps

- The engine (`src/engine/`) is pure functions with tests; it never imports React or the DOM.
- No network after load: the CSP in `index.html` is the law, and the e2e test proves it.
- Titles come from the numbers through templates, never from free text generation.
- Every chart follows the dataviz rules: one axis, categorical colours in a fixed order from the validated palette in `docs/ui.md`, tabular numerals, a legend for two or more series, direct labels on at most four.
- Arabic headers switch the deck to RTL; the interface language is separate.
- Large files: the worker streams CSV; Excel parses whole (SheetJS), with a 100k-row guard that samples for findings and says so on the quality slide.
