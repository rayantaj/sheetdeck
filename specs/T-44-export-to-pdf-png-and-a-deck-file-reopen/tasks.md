# Export to PDF, PNG and a deck file; reopen; the privacy panel; offline; edge states: tasks

T-44 · in progress.

- [ ] src/ui/Export.tsx: a sheet (a Terrazzo card) with three rows: 'PDF, all slides' (jspdf: one landscape 16:9 page per visible slide, each slide rendered to a canvas with html-to-image's toCanvas at 2x, placed edge to edge), 'PNG, this slide' (the same render, downloaded), and 'Deck file' (.sheetdeck.json: the Deck plus the Table, pretty-printed). Downloads use a blob URL and an anchor click; nothing else.
- [ ] Reopen: the drop zone also accepts a .sheetdeck.json file and restores the deck and table straight into the editor (src/engine/deck.ts fromFile with a version field and a clear error for a wrong file).
- [ ] src/ui/Privacy.tsx: the 'Nothing leaves this device' line opens a panel: three plain sentences on what happens in the browser, then the exact CSP text read from the page's own meta tag, and a line on how to check it (the network panel). Also an 'Offline' note once the service worker is in.
- [ ] PWA: public/manifest.webmanifest (name sheetdeck, start_url /sheetdeck/, standalone, theme colour from the paper, icons 192 and 512 from public/icon.svg plus a 512 PNG), a service worker (public/sw.js, registered in production only) that caches the page and its bundle on first load and serves them when offline; the fonts are part of the bundle so they're cached too.
- [ ] Error and edge states: a file that can't be parsed shows a plain message on the landing (no stack trace); a sheet with no detectable header shows the preview with row 1 selected and a hint; an empty sheet says so; a 100k-row table samples 20k rows for the findings and says so on the quality slide.
- [ ] Add the Hallmark lint of the built landing to the checks: npm script 'lint:design' = node ~/.claude/skills/hallmark/scripts/sloplint.mjs dist/index.html --genre modern-minimal, and a short section in README on exports and the deck file.

## Parts of the work
- Export to PDF, PNG and a deck file; reopen; the privacy panel; offline; edge sta (web-developer)
