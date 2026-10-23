# sheetdeck: the technical choices

Decided 24 Oct 2026, at the Tech stage.

## Platform

A static web app on GitHub Pages at `https://rayantaj.github.io/sheetdeck/` (Vite `base: '/sheetdeck/'`). Laptop first (presenting is a laptop act), phone second (the deck must still read at 390 px). Installable as a PWA so it opens offline after the first visit.

## The privacy rule, enforced

- `index.html` carries a Content Security Policy that forbids every network request after load: `default-src 'self'; connect-src 'none'; img-src 'self' data: blob:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; form-action 'none'; base-uri 'none'`. Fonts, scripts and styles are self-hosted. No analytics, no CDN, no web fonts from Google.
- A test loads the built `dist/` in a browser, drops a sample file, exports, and asserts that the only requests were the page's own files.
- A "Nothing leaves this device" panel shows that policy text, read from the page's own meta tag, so what it says is what runs.

## Stack

- **React 18 + Vite + TypeScript.** Plain CSS with the Hallmark theme's tokens (`src/styles/tokens.css`, `base.css`); no component library. The theme is Terrazzo (see `docs/ui.md`).
- **Parsing:** `xlsx` (SheetJS community edition) for `.xlsx` and `.xls`; `papaparse` for `.csv` with delimiter detection. Both run in a Web Worker (`src/workers/parse.worker.ts`) so a 50 MB file doesn't freeze the page.
- **Charts:** `chart.js` 4 on canvas, so a slide exports to PNG from its own canvas. Fonts in the charts are the theme's.
- **PDF:** `jspdf`, one page per slide at 16:9, each slide rendered to a canvas (`html-to-image` for the non-chart parts).
- **Tests:** Vitest for the engine (types, findings, titles, formatting) with small fixture sheets in `test/fixtures/`; Playwright for the end-to-end flow and the zero-requests check.
- **Fonts:** `@fontsource/syne` (700), `@fontsource/onest` (400, 500), `@fontsource/jetbrains-mono` (500), plus an Arabic body face `@fontsource/ibm-plex-sans-arabic` (400, 500) used when the content is Arabic.
- No other dependencies unless a Feature can't ship without one.

## Data model (in the browser only)

```
Sheet     { name, rows: Cell[][], headerRow: number }
Table     { columns: Column[], rows: Row[] }           // after the header is applied
Column    { name, type: 'number'|'date'|'category'|'text'|'id'|'boolean', stats }
Finding   { kind, columns, title, chart: ChartSpec, score }
Deck      { source: { name, sheet, rows, cols }, slides: Slide[], lang: 'en'|'ar' }
Slide     { id, kind: 'title'|'finding'|'quality', title, finding?, hidden }
```

The deck file `.sheetdeck.json` is `Deck` plus the `Table`, so it reopens without the original file.

## Checks the runner runs

`npm ci`, `npm run lint`, `npm run build`, `npm test` (Vitest), `npm run test:e2e` (Playwright against `dist/`, headless Chromium, including the zero-requests assertion), and `node ~/.claude/skills/hallmark/scripts/sloplint.mjs dist/index.html --genre modern-minimal` for the landing page.

## Risky paths

`src/engine/**` (the findings and titles: a wrong title is a wrong meeting), `index.html` (the CSP), `.github/**`, `package.json`, `package-lock.json`, `vite.config.ts`.

## Deploy

`.github/workflows/pages.yml`: on push to `main`, `npm ci && npm run build`, upload `dist/`, deploy to Pages. Pages is set to GitHub Actions on the repo.

## RTL and languages

The interface language is a switch (remembered). A table whose headers are mostly Arabic sets the deck to Arabic: slides `dir="rtl"`, axis labels in the Arabic face, numbers still Western digits with the language's separators. Charts mirror their legends; bars read right to left.
