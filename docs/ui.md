# sheetdeck: the look

Decided 24 Oct 2026, at the UI stage. Ray asked for Hallmark to deal three themes and for the pick to happen before any code; he was asleep, so I picked and said why (he can change it in the morning: the tokens are one file).

## The deal

`theme.mjs deal --genre modern-minimal`, seed `browser-only-tool-turns-spreadsheet-8153·fb85e3a1·2026-10-23·r0`:
1. **Terrazzo**: off-white paper, white cards ruled in ink over a hard offset, wide Syne heads over Onest, JetBrains Mono for codes, rust the one signal.
2. **Dusk**: dark, a landscape behind the hero, the product in smoked glass, periwinkle and apricot.
3. **Wayfind**: cool grey paper, Chivo Mono throughout, square 2px borders, cobalt and amber.

**Pick: Terrazzo (1/3).** Charts need light paper and quiet surroundings to read; Dusk's dark glass fights them and photographs don't belong here. Wayfind's mono-everywhere reads as an instrument, cold for "anyone, worldwide". Terrazzo is light, has one clear signal (rust) that charts can leave alone, square and plain, and far from the stock SaaS look. Its "material" here is the spreadsheet itself: the cells, the chart, the deck, shown flat and true, in cards with the hard offset.

## Material

Tokens: Terrazzo's, in `src/styles/tokens.css` (from `theme.mjs scaffold terrazzo`). Paper `oklch(96% 0.009 82)`, plate `oklch(99.5% 0.003 82)`, ink `oklch(16% 0.006 60)`, rule `oklch(81% 0.012 80)`, accent (rust) `oklch(53% 0.15 38)`, focus `oklch(50% 0.16 38)`. Radius 0. Cards: plate inside a 2px ink border over a hard 14px offset in paper-3. Faces: Syne 700 for heads, Onest 400/500 for body and labels, JetBrains Mono 500 for figures that compare and for codes; IBM Plex Sans Arabic for Arabic body text. Motion: still.

## The chart palette (the dataviz rules)

Categorical, in this fixed order, assigned by entity and never cycled; validated with `scripts/validate_palette.js` from the dataviz skill before the first chart ships, in light mode against the paper:

1. ink `#2A2622`
2. rust `#B5472A`
3. slate `#4A6B8A`
4. olive `#6E7A3A`
5. ochre `#B98A2B`
6. plum `#7A4A6E`
7. teal `#2F7F7A`
8. grey `#8C8680` ("others")

Sequential (magnitude): one hue, rust from `#F3E3DD` to `#7A2E18`. Diverging: rust to slate through the paper grey. Status colours are not used in charts.

Marks: bars 2px apart with 4px rounded data ends only when the theme's radius allows (it doesn't: square), 2px lines, 8px markers, tabular numerals, a legend for two or more series, direct labels on at most four, one axis per chart, never two scales.

## Screens, one line each

1. **Landing:** headline "Your spreadsheet, as a deck." One sentence. The drop zone is a card with the hard offset holding a sample deck's first slide; under it "Nothing leaves this device" with the policy behind a disclosure. Three ruled rows below: what you get, what it reads, what it never does. Footer: a colophon line.
2. **Pick the sheet:** sheet tabs as square chips; the five-row preview in a table under a 2px ink rule; the header row in accent-soft; one ink button.
3. **Deck editor:** the rail as small cards (numbers in mono), the slide as one large card at 16:9, the editor strip in Onest 500 labels; Present and Export as the ink primary and the outlined secondary.
4. **Present:** paper background, the slide card without its offset filling the screen, counter in mono bottom right.
5. **Export:** a card with three rows (PDF, PNG, deck file), each a title, a line and a button.

RTL: when the deck is Arabic, the slide and its chart mirror; the editor stays in the interface language.

## Checks on the look

- `sloplint.mjs dist/index.html --genre modern-minimal --render` is one of the project's checks: the landing page can't ship with a floor fail.
- QA screenshots every screen in English and Arabic.
