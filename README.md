# sheetdeck

Drop an .xlsx or .csv and get a presentation: one chart per finding, with titles, in a presentation mode, exported as PDF or PNG. Everything happens in the browser: nothing is uploaded, no server, and the page's own security policy forbids network calls after it loads, so that's provable. Arabic and English. Live at https://rayantaj.github.io/sheetdeck/.

## Exports and the deck file

Export (in the deck editor) saves three kinds of file, each a plain download:

- PDF, all slides: one landscape 16:9 page per visible slide.
- PNG, this slide: the slide you're on.
- Deck file (`.sheetdeck.json`): the deck, with your edited titles, plus the table. Drop it on the landing page to reopen the deck exactly as you saved it. It holds your data, so keep it as private as the spreadsheet.

`npm run lint:design` checks the built landing (`dist/index.html`) with the Hallmark linter; run `npm run build` first.

Started with AgentHQ. The plan lives in `docs/`.
