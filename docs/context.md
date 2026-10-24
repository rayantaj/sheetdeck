# sheetdeck

In the browser, drop an .xlsx, .xls or .csv and get a deck: one chart per finding, presentation mode, PDF or PNG export. Nothing is uploaded; the page's CSP forbids network calls after load.
Built so far: landing, sheet picker, header and type detection, findings with titles, the deck model, summary card. Planned (docs/architecture.md): deck editor, present, export. Live at https://rayantaj.github.io/sheetdeck/.

## Stack
- React 18, Vite 8, TypeScript 6. Plain CSS with Hallmark's Terrazzo tokens; no component library.
- xlsx 0.18.5 (.xlsx, .xls) and papaparse (.csv), both in a Web Worker.
- Fonts via @fontsource, self-hosted: Syne 700, Onest 400/500, JetBrains Mono 500, IBM Plex Sans Arabic 400/500.
- Vitest (engine tests), Playwright (chromium only, e2e).
- Minimum: modern browsers, no OS minimum. Laptop first, phone at 390 px.

## Where things live
- index.html: the CSP meta tag (the privacy rule), lang, title.
- src/main.tsx: entry; imports styles/tokens.css and base.css first, then the fonts.
- src/App.tsx: landing, then sheet picker, then summary; builds the deck with buildDeck once the summary is shown.
- src/ui/DropZone.tsx: the drop card, file input, 'Try a sample'.
- src/ui/SheetPicker.tsx: sheet tabs, five-row preview, header row by click or Enter/Space, Continue.
- src/ui/Summary.tsx: row and column counts, each column's name and type, then the findings as text (title, kind, columns, score) and the deck language.
- src/i18n.ts: every interface string in en and ar; the language is kept in localStorage.
- src/engine/parse.ts: parseFile(file) to Sheet[], wraps the worker in a promise.
- src/workers/parse.worker.ts: reads .xlsx/.xls (SheetJS) and .csv (papaparse, delimiter auto-detected).
- src/engine/cells.ts: cellText, cellNumber, cellDate; the one place cell values are read.
- src/engine/detect.ts: detectHeaderRow, applyHeader, detectTypes with stats. Tests in detect.test.ts.
- src/engine/types.ts: Cell, Sheet, Column, Table, Finding, ChartSpec, Quality, Slide, Deck.
- src/engine/findings.ts: findFindings(table, lang), six rules (total, topN, trend, share, compare, distribution); score = coverage × variance × importance; top 10, best first. Tests in findings.test.ts.
- src/engine/titles.ts: title(finding, lang) from templates over the facts, en and ar. Tests in titles.test.ts.
- src/engine/format.ts: compact numbers, percent, month names, date labels; Western digits.
- src/engine/quality.ts: quality(table): empty per column, duplicate rows, skipped rows, mismatches.
- src/engine/deck.ts: isArabic(table) and buildDeck(table, source, lang): title slide, one slide per finding, quality slide. Tests in deck.test.ts.
- src/styles/: tokens.css and base.css (the theme, don't regenerate), app.css.
- test/fixtures/: sales.csv (date, category, two numbers), titled.xlsx (title row above header), arabic.csv.
- public/sample-sales.csv: the 'Try a sample' file.
- e2e/privacy.spec.ts: drops a file, reaches the summary, asserts every request is on the page's own origin and path, and that the CSP has connect-src 'none'.
- playwright.config.ts: runs against vite preview on port 4173.
- vite.config.ts: base '/sheetdeck/', React plugin, assetsInlineLimit 0, Vitest on src/**/*.test.ts.
- .github/workflows/pages.yml: on push to main, build and deploy dist/ to GitHub Pages.
- docs/: the stage documents (brief, tech, architecture, ui). Don't edit them here.
- specs/T-41-set-up-the-app-parsing-in-a-worker-heade/: requirements, design, tasks of the landing, parsing, detection and CSP Feature (PR #1).
- specs/T-42-the-findings-engine-rules-titles-formatt/: requirements, design, tasks of the findings engine, titles, formatting, quality and deck model (PR #2).

## How it's checked
- Runner: npm ci, npm run lint, npm run build (tsc -b and vite build), npm test (Vitest).
- Also: npm run test:e2e (Playwright on dist/ via vite preview; includes the zero-requests check).
- Deploy: every push to main, via pages.yml.

## Rules
- src/engine/ is pure: no React, no DOM. Tested with Vitest.
- No network after load: index.html's CSP is the rule. Fonts, scripts and styles are self-hosted. No CDN, analytics or font host.
- Files are parsed in the worker, never on the main thread.
- Titles, once built, come from templates over the numbers, never generated text.
- Findings: at most 10, best first, never two of the same kind on the same columns; a flat column feeds no rule.
- Arabic UI sets dir=rtl and lang=ar; the choice is remembered in localStorage.

## Known debt
- tsconfig.tsbuildinfo is still tracked (PR #2 changed it again). Fix: git rm --cached tsconfig.tsbuildinfo.
- xlsx 0.18.5 has known CVEs (CVE-2023-30533, CVE-2024-22363) on crafted files. Moving to SheetJS 0.20.x is Ray's call.
- SheetPicker: aria-selected on a plain tr is not valid without role=grid. Use aria-current or a visually hidden label.
- Summary lists findings as text; no slides, deck editor, present or export yet.
- format.ts compact(): rounding can print 999,950 as '1000K' instead of 1M; re-check the unit after rounding.
- titles.ts share template: 'The top 5 region make up…' is ungrammatical with singular column names; use 'by region'.
