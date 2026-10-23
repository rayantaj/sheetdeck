# sheetdeck: the brief

Refined 24 Oct 2026, from Ray's idea and his four answers (auto slides; anyone, worldwide; a dropped `.xlsx` or `.csv`; a Hallmark theme). Working name; rename later if a better one comes.

## The idea

You have a spreadsheet and a meeting. Today you build charts by hand, one by one, and paste them into slides. sheetdeck takes the file and gives you the deck: one chart per finding, each with a title that says what the chart shows, in a presentation mode you can run from the browser, and an export as PDF or PNG.

Everything happens on your device. The file is read in the browser, the findings are computed in the browser, the charts are drawn in the browser. Nothing is uploaded; there is no server. The page's own security policy forbids any network request after it loads, so "your data never leaves your device" is something a visitor can check, not something they have to believe. That is the reason to use this instead of pasting the sheet into a chat tool or a cloud dashboard.

## Who it's for

Anyone with a spreadsheet to present: an analyst with an export from a system, a manager with a budget, a teacher with grades, a shop owner with sales. English first, Arabic fully supported (right-to-left slides when the headers are Arabic). No account, no sign-in.

## The first version: what a person can do

1. **Drop a file** (`.xlsx`, `.xls`, `.csv`), or pick one, or try a sample. The sheets and the header row are detected; they can pick another sheet or fix the header row.
2. **See the findings as slides, at once:** a title slide; a slide per finding (a total, a top-ten, a trend over time, a share of the whole, a comparison of two measures, a distribution); a closing slide on the data's quality (empty cells, duplicates, rows skipped). Six to twelve slides for a typical sheet.
3. **Edit a little:** change a slide's title, hide a slide, reorder slides, switch a chart's type among the ones that fit, pick a different column for the same finding.
4. **Present:** full-screen, arrow keys and swipe, slide counter, a black "pause" screen.
5. **Export:** the deck as a PDF, the current slide as a PNG, or the deck as a `.sheetdeck.json` file that reopens later with the same findings (data included, still on the device).
6. **Trust it:** a "nothing leaves this device" line that opens a short explanation and the exact policy the page enforces; the tool works with the network switched off after the first visit.

## What's out

- No cloud, no accounts, no sharing links, no collaboration.
- No formulas, pivots or editing of the data itself; it reads, it doesn't change.
- No AI-written narrative beyond the title sentences the rules produce.
- No Google Sheets link or paste in v1 (asked for later).
- No connectors to databases or APIs.

## What done looks like

A public page at `https://rayantaj.github.io/sheetdeck/`. Ray drops a real export from work, gets a deck that would be fine to show in a meeting after two minutes of edits, exports the PDF, and the browser's network panel shows zero requests after load.

## Language

English first; Arabic second, in the interface and in the slides. Numbers in Western digits; dates and numbers formatted for the chosen language.
