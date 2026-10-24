# Export to PDF, PNG and a deck file; reopen; the privacy panel; offline; edge states: design

## Files

New: `src/ui/Export.tsx`, `src/ui/Privacy.tsx`, `src/export/pdf.ts`, `src/export/png.ts`, `public/manifest.webmanifest`, `public/icon.svg`, `public/icon-512.png`, `public/sw.js`, `src/sw-register.ts`. Changed: `src/engine/deck.ts` (toFile/fromFile with `version: 1`), `src/ui/DropZone.tsx` (accepts .sheetdeck.json), `src/App.tsx`, `src/i18n.ts`, `package.json` (jspdf, html2canvas, the lint:design script; html-to-image was dropped because it fetches fonts, which connect-src 'none' blocks; the service worker precaches the page, bundle, chunks and fonts itself on install instead of waiting for a message from the page), `README.md`.

## Export

Render a hidden copy of each visible slide at 1600 × 900 CSS px, `toCanvas` with pixelRatio 2, then `jsPDF({ orientation: 'landscape', unit: 'px', format: [1600, 900] })`, `addImage` per page. PNG: the same canvas, `toBlob`. All in the main thread; show a progress line in the sheet.

## Service worker

On install: cache `index.html`, the manifest and every asset URL the page loaded (from `performance.getEntriesByType('resource')`, sent to the worker by the page after load). On fetch: cache first for same-origin, network otherwise is impossible (CSP), so fall back to the cached index for navigations.

Built differently: the page also sends every `@font-face` URL and the parse worker chunk (`?worker&url`), because neither shows up in `performance` entries before the first file is dropped; the worker also caches any other same-origin GET it sees. The deck file wraps dates as `{ "$date": iso }`. A `.txt` (any extension but xlsx, xls, csv, .sheetdeck.json) is refused in `App.open`, since SheetJS reads text as a sheet. `findHeaderRow` returns null when no header is found, for the hint.

## Not in the code yet
Named above but not there when the plan was approved: new files, or check them.
- `src/ui/Export.tsx`
- `src/ui/Privacy.tsx`
- `src/export/pdf.ts`
- `src/export/png.ts`
- `public/sw.js`
- `src/sw-register.ts`
