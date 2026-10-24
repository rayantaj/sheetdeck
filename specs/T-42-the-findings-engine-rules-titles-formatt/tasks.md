# The findings engine: rules, titles, formatting, quality, the deck model: tasks

T-42 · in progress.

- [ ] src/engine/findings.ts: findFindings(table: Table, lang) → Finding[] with the six rules in docs/architecture.md: total (sum/mean/min/max of a number column), topN (a category by the sum of a number, top 10 plus Others), trend (a date column bucketed by day, week or month so there are 6 to 60 points, against a number, one line per category when 2 to 5 categories), share (a category's share of a number when the top five cover 60 %+), compare (two numbers with |Pearson r| ≥ 0.5), distribution (a number with 50+ rows, 10 bins). Each Finding = { id, kind, columns: string[], chart: ChartSpec, score, facts } where ChartSpec = { type: 'bar'|'line'|'doughnut'|'scatter'|'histogram', labels: string[], datasets: { label, data: number[] }[], axis?: { x, y } } ready for Chart.js, and facts holds the numbers the title needs (leader, share, change, r).
- [ ] Scoring and capping: score = coverage (share of rows used) × variance (0 for a flat series) × importance (column names containing total, amount, revenue, sales, price, count, qty, quantity, value score 1.5; id-like 0). Return at most 10 findings, best first, never two of the same kind on the same columns.
- [ ] src/engine/titles.ts: title(finding, lang) from templates with the facts: 'Sales by region: Riyadh leads with 42 %', 'Revenue rose 18 % from January to September', 'Orders and discount move together (r = 0.71)', 'Most orders are between 120 and 340', in English and Arabic (Arabic templates with the numbers formatted for ar). src/engine/format.ts: compact numbers (1.2M, 340K), percentages, month names, per language, Western digits.
- [ ] src/engine/quality.ts: quality(table) → { emptyByColumn, duplicateRows, skippedRows, mismatches } and src/engine/deck.ts: buildDeck(table, source, lang) → Deck { source, lang, slides } with a title slide, one slide per finding (title from titles.ts), and a closing quality slide; isArabic(table) when 50 %+ of header characters are Arabic letters sets the deck's lang to ar.
- [ ] Tests for every rule and every title template with the three fixtures plus two synthetic tables (a flat series that must score 0; a 2,000-row table that must still finish under 200 ms).
- [ ] Wire it in: after Continue, the summary card lists the findings as text (title, kind, columns, score) under the column summary, so the engine's output can be seen before the slides exist.

## Parts of the work
- The findings engine, titles, formatting, quality, the deck model (web-developer)
