# Charts, slides, the editor and presentation mode: design

## Files

New: `src/ui/ChartView.tsx`, `src/ui/SlideCard.tsx`, `src/ui/Deck.tsx`, `src/ui/SlideEditor.tsx`, `src/ui/Present.tsx`, `src/ui/palette.ts` (the eight categorical colours and the sequential ramp from docs/ui.md). Changed: `src/App.tsx`, `src/i18n.ts`, `src/styles/app.css`. Removed from the flow: `src/ui/Summary.tsx` (keep the file if a test uses it, otherwise delete).

## State

`App` holds `{ screen: 'landing'|'pick'|'deck'|'present', sheets, table, deck }`; every edit is `setDeck({...deck, slides: ...})`. Chart.js instances are created in an effect and destroyed on unmount or spec change.

## Slide geometry

The card is `aspect-ratio: 16 / 9`, padding `--space-xl`, the title at `--text-section` on one or two lines, the chart in a flex-grow box with a min height, the footnote at `--text-sm`. Present scales the card to fit `min(100vw, 100vh * 16/9)`.

## Keys

ArrowRight/Space/PageDown next, ArrowLeft/PageUp previous, Escape leave, B pause. Touch: swipe left/right.

## As built (differences from the above)

- `App` state is `empty | parsing | pick | deck`; Present is an overlay inside `Deck.tsx` (so the editor keeps its selected slide), not an App screen.
- `palette.ts` holds only the categorical colours; the sequential ramp is unused so it is not there yet.
- Slides are sized in `cqw` units inside a container-query frame, so one card serves rail, editor and Present.
- Measure swap re-runs `findFindings` on a sub-table (date/category + the new number column) in `SlideEditor.tsx`; the engine is untouched. Only columns that yield a finding of the same kind are offered.
- The deck is built once at Continue; toggling the interface language afterwards does not rebuild it (edits would be lost).
- `Summary.tsx` deleted; `e2e/privacy.spec.ts` now asserts the editor's title slide.

## Not in the code yet
Named above but not there when the plan was approved: new files, or check them.
- `src/ui/ChartView.tsx`
- `src/ui/SlideCard.tsx`
- `src/ui/Deck.tsx`
- `src/ui/SlideEditor.tsx`
- `src/ui/Present.tsx`
- `src/ui/palette.ts`
