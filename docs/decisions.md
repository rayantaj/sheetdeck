# Decisions

One line each, newest last. Every brief carries them.

- 2026-10-24 · T-41 · Keep build.assetsInlineLimit at 0 in vite.config.ts: fonts under 4 KB would inline as data: URLs, which the CSP's font-src 'self' blocks (Tech lead, T-41).
- 2026-10-24 · T-41 · Never spread a large array into a call such as Math.min(...rows) or Math.max(...nums): sheets of 100k+ rows overflow the call stack, so use reduce or a loop (Tech lead, T-41).
- 2026-10-24 · T-41 · Don't bump xlsx on your own: 0.18.5 has known CVEs, and moving to SheetJS 0.20.x is Ray's call (Tech lead, T-41).
- 2026-10-24 · T-42 · The deck's language follows the header, not the UI: when 50 %+ of the header's letters are Arabic the deck is ar even if the UI is English (Ray, T-42).
- 2026-10-24 · T-42 · A flat column feeds no finding rule and can't make one about itself, since its spread is 0 and its score is 0 (Ray, T-42).
- 2026-10-24 · T-43 · Compare (scatter) findings offer only the Scatter chart type, because a bar chart of a correlation draws one unsorted bar per row under an 'r = …' title, which misleads.
