# Set up the app: parsing in a worker, header and type detection, the landing and sheet picker, the privacy policy, Pages: design

## Files

New: `package.json`, `package-lock.json`, `vite.config.ts` (base `/sheetdeck/`, worker format es), `tsconfig*.json`, `eslint.config.js`, `playwright.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/i18n.ts`, `src/workers/parse.worker.ts`, `src/engine/parse.ts`, `src/engine/types.ts` (Sheet, Table, Column, Row, Cell), `src/engine/detect.ts`, `src/engine/detect.test.ts`, `src/ui/DropZone.tsx`, `src/ui/SheetPicker.tsx`, `src/ui/Summary.tsx`, `src/styles/app.css` (the page's own rules on the tokens: the card with the hard offset, the ink primary and outlined secondary, the drop zone, the preview table), `public/sample-sales.csv`, `test/fixtures/sales.csv`, `test/fixtures/titled.xlsx`, `test/fixtures/arabic.csv`, `e2e/privacy.spec.ts`, `.github/workflows/pages.yml`, `README.md`.

Already there: `src/styles/tokens.css`, `src/styles/base.css` (Terrazzo), `docs/*`.

## Types

```ts
type Cell = string | number | boolean | Date | null
interface Sheet { name: string; rows: Cell[][] }
interface Column { name: string; type: 'number'|'date'|'category'|'text'|'id'|'boolean'; stats: { count: number; empty: number; distinct: number; min?: number|Date; max?: number|Date; sum?: number; mean?: number } }
interface Table { columns: Column[]; rows: Cell[][] }
```

## Detection

Header row: the first row where 60 %+ of cells are non-empty strings under 60 characters and the row after it has at least one cell of another type. Types: a column is a number when 90 %+ of its non-empty cells are numbers (or strings that parse as numbers with , and spaces removed); a date when 90 %+ are Dates or parse as ISO/dd/mm/yyyy; boolean when the distinct values are two of yes/no/true/false/0/1; id when distinct equals count and values look like codes; category when distinct ≤ 30 or ≤ 20 % of rows; else text.

## Look

Terrazzo (docs/ui.md): paper background, cards as plate inside a 2px ink border over the 14px paper-3 offset, radius 0, Syne 700 heads, Onest body, mono for figures. One ink primary, one outlined secondary. Still, no reveals.

## Privacy

The CSP meta in `index.html`; the e2e test lists `page.on('request')` URLs and asserts each starts with the preview origin plus `/sheetdeck/`.

## Build notes (where the build differs)

- "Try a sample" imports `public/sample-sales.csv` with `?raw` (bundled into the JS), not `fetch`: the CSP's `connect-src 'none'` would block a fetch.
- The e2e test sets the file on the page's file input (the drop zone's own input) rather than a synthetic drag event, and also asserts a `fetch` to another host is refused. Vitest runs only `src/**/*.test.ts`.
- `applyHeader` returns `rows: Cell[][]` as in Types above. `detect.test.ts` reads the three fixtures (`sales.csv`, `titled.xlsx`, `arabic.csv`).

## Not in the code yet
Named above but not there when the plan was approved: new files, or check them.
- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `eslint.config.js`
- `playwright.config.ts`
- `index.html`
- `src/main.tsx`
- `src/App.tsx`
- `src/i18n.ts`
- `src/workers/parse.worker.ts`
- `src/engine/parse.ts`
- `src/engine/types.ts`
- `src/engine/detect.ts`
- `src/engine/detect.test.ts`
- `src/ui/DropZone.tsx`
- `src/ui/SheetPicker.tsx`
- `src/ui/Summary.tsx`
- `src/styles/app.css`
- `e2e/privacy.spec.ts`
- `.github/workflows/pages.yml`
