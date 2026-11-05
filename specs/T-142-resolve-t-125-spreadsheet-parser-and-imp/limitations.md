# T-142 · T-125 remediation notes

## Fixed
- **xlsx**: 0.18.5 (CVE-2023-30533 prototype pollution, CVE-2024-22363 ReDoS) replaced by the official SheetJS 0.20.3 tarball, `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz` (per docs.sheetjs.com Node.js install page). Parsing still runs in the worker; no runtime network use. Regression tests: `src/engine/xlsx.test.ts`.
- **Reopened deck fields**: slide and column fields are validated in `src/engine/deck.ts` (tests in `deck.test.ts`).
- **GitHub Actions**: all five actions in `.github/workflows/pages.yml` are pinned to commit SHAs (resolved from the tag refs via the GitHub API), version kept in a comment.

## Unresolved limitations (not changed: hosting is out of scope)
- **Framing**: GitHub Pages cannot send `X-Frame-Options` or CSP `frame-ancestors`, and `frame-ancestors` is ignored in a `<meta>` CSP. The page can be framed by other sites. Fix needs a host that sets headers.
- **Shared origin**: the app lives at `rayantaj.github.io/sheetdeck/`, the same origin as other `rayantaj.github.io` project pages. Storage (`localStorage`, which holds only the language choice) is shared with them, and a script on a sibling page could read it. A custom domain would isolate it.
- **Dependency source**: xlsx is no longer on the npm registry (SheetJS publishes only to its CDN), so updates need a manual bump of the tarball URL.
- `npm audit` still lists moderate findings in dev tooling; not part of the parser/import path.
