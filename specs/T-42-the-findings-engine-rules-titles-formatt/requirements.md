# The findings engine: rules, titles, formatting, quality, the deck model: requirements

T-42 · Feature · the plan Ray approved

## Goal
The findings engine: rules, titles, formatting, quality, the deck model

Pure, tested code that turns a table into up to ten scored findings (total, top ten, trend, share, compare, distribution), each with a Chart.js-ready spec and a title sentence from the numbers in English or Arabic, plus a data-quality summary and the Deck model.

## Done when
Each one is something Ray sees in the app; QA proves it with a screenshot.
1. After Continue on sales.csv, the page lists at least five findings with titles that name the real columns and numbers, such as a top-ten by category and a trend over the date column.
2. A flat column (the same value in every row) produces no finding about itself.
3. On the Arabic-headed fixture, the findings' titles are in Arabic and the deck language is ar.
4. The findings list shows no more than ten, best first, and never two of the same kind on the same columns.

## Out of scope
- src/engine/detect.ts, parse.ts, the worker: use them as they are.
- src/styles/tokens.css and base.css.
- index.html's CSP.
