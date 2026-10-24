# Set up the app: parsing in a worker, header and type detection, the landing and sheet picker, the privacy policy, Pages: requirements

T-41 · Feature · the plan Ray approved

## Goal
Set up the app: parsing in a worker, header and type detection, the landing and sheet picker, the privacy policy, Pages

The first Feature: the app builds and its tests run, a dropped file is parsed in a Web Worker, the header row and column types are detected, the landing and the sheet picker exist in the Terrazzo look, the CSP forbids any network call after load and a Playwright test proves it, every merge deploys to GitHub Pages.

## Done when
Each one is something Ray sees in the app; QA proves it with a screenshot.
1. The landing shows the headline 'Your spreadsheet, as a deck.', a drop zone card with a hard offset shadow in the Terrazzo look, and the line 'Nothing leaves this device'.
2. Dropping test/fixtures/sales.csv shows the sheet picker with a five-row preview and the header row highlighted; Continue shows a card with the row count, the column count and each column's detected type (date, category, number).
3. Dropping an .xlsx with a title row above the header detects the header on the second row, and clicking another row changes it.
4. Switching the interface to Arabic turns the landing right-to-left with Arabic text, and a reload keeps it.
5. In the browser's network panel, after the page loads, dropping a file and reaching the summary makes no request to any other host.

## Out of scope
- src/styles/tokens.css and base.css: the theme, already committed; don't regenerate them.
- docs/: the stage documents.
