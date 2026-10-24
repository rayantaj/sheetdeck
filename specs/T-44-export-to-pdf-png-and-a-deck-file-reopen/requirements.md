# Export to PDF, PNG and a deck file; reopen; the privacy panel; offline; edge states: requirements

T-44 · Feature · the plan Ray approved

## Goal
Export to PDF, PNG and a deck file; reopen; the privacy panel; offline; edge states

The deck leaves the browser only as files the user saves: PDF of all slides, PNG of one, a .sheetdeck.json that reopens; the privacy panel shows the exact policy; the page installs and works offline; bad files and empty sheets are handled plainly.

## Done when
Each one is something Ray sees in the app; QA proves it with a screenshot.
1. Export opens a sheet with PDF, PNG and Deck file rows; 'PDF, all slides' downloads a PDF with one page per visible slide, and 'PNG, this slide' downloads the current slide as an image.
2. Dropping a saved .sheetdeck.json on the landing reopens the same deck in the editor with its edited titles kept.
3. The 'Nothing leaves this device' panel shows the policy text including connect-src 'none'.
4. With the network switched off after a first visit, the page still loads and a file can still be dropped and turned into a deck.
5. Dropping a .txt file shows the message that the file couldn't be read, with no error in the console.

## Out of scope
- src/engine/findings.ts, titles.ts: the rules.
- src/styles/tokens.css and base.css.
- index.html's CSP: keep it; the service worker is same-origin.
