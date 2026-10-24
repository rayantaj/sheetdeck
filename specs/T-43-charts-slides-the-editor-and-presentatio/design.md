# Charts, slides, the editor and presentation mode: design

## Files

New: `src/ui/ChartView.tsx`, `src/ui/SlideCard.tsx`, `src/ui/Deck.tsx`, `src/ui/SlideEditor.tsx`, `src/ui/Present.tsx`, `src/ui/palette.ts` (the eight categorical colours and the sequential ramp from docs/ui.md). Changed: `src/App.tsx`, `src/i18n.ts`, `src/styles/app.css`. Removed from the flow: `src/ui/Summary.tsx` (keep the file if a test uses it, otherwise delete).

## State

`App` holds `{ screen: 'landing'|'pick'|'deck'|'present', sheets, table, deck }`; every edit is `setDeck({...deck, slides: ...})`. Chart.js instances are created in an effect and destroyed on unmount or spec change.

## Slide geometry

The card is `aspect-ratio: 16 / 9`, padding `--space-xl`, the title at `--text-section` on one or two lines, the chart in a flex-grow box with a min height, the footnote at `--text-sm`. Present scales the card to fit `min(100vw, 100vh * 16/9)`.

## Keys

ArrowRight/Space/PageDown next, ArrowLeft/PageUp previous, Escape leave, B pause. Touch: swipe left/right.

## Not in the code yet
Named above but not there when the plan was approved: new files, or check them.
- `src/ui/ChartView.tsx`
- `src/ui/SlideCard.tsx`
- `src/ui/Deck.tsx`
- `src/ui/SlideEditor.tsx`
- `src/ui/Present.tsx`
- `src/ui/palette.ts`
