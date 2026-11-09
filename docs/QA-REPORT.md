# Quality report — measurements and automated checks

Measured results, kept separate from targets. Targets come from `docs/architecture/docs/02-ARCHITECTUUR.md`:
field p75 LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 (mobile and desktop separately); Lighthouse ≥ 95 per category on a
representative production build, with deviations explained; WCAG 2.2 AA as the acceptance standard.

A lab score does not predict field Core Web Vitals, and automated accessibility rules do not prove WCAG
conformance. Field data (CrUX / Vercel Speed Insights) only exists after launch with real traffic.

## Lighthouse — 9 November 2026

Lighthouse 13.5.0, headless Chromium, default simulated throttling (mobile: slow 4G + 4× CPU; desktop preset).
Runs went through the build environment's outbound proxy, which adds latency; treat values as indicative.
All content is demonstration fixtures with SVG placeholder images, so image weight is lower than it will be with
real photography. Re-measure once authentic images are published.

### Baseline: muraniq.vercel.app (deployment live on 9 Nov, before the fixes below)

| Page | Form factor | Perf | A11y | Best pr. | SEO | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | mobile | 97 | 100 | 96 | 69 | 2.4 s | 70 ms | 0 |
| `/collection/` | mobile | 98 | 100 | 96 | 66 | 2.3 s | 70 ms | 0 |
| `/collection/objects/sommerso-vase-amber-and-blue/` | mobile | 94 | 100 | 96 | 69 | 2.6 s | 200 ms | 0 |
| `/` | desktop | 100 | 100 | 96 | 69 | 0.5 s | 0 ms | 0 |
| `/collection/` | desktop | 100 | 100 | 96 | 66 | 0.5 s | 10 ms | 0 |
| `/collection/objects/sommerso-vase-amber-and-blue/` | desktop | 100 | 100 | 96 | 69 | 0.6 s | 0 ms | 0 |

Deviations from the ≥ 95 target, explained:

- **SEO 66–69: intentional.** The only failing audit is *is-crawlable*: the site sends `X-Robots-Tag: noindex`
  and a disallow-all `robots.txt` until launch (`SITE_INDEXABLE`). All other SEO audits pass.
- **Best practices 96:** one console error, a 404 for `/favicon.ico`. Fixed (see below).
- **Object page, mobile performance 94 / LCP 2.6 s:** the main image had no `fetchpriority=high`
  (Next 16 deprecates the `priority` prop) and three display-font files were preloaded, one of them (italic) unused.
  Fixed (see below).

### After the fixes (local production build, `next start`, no CDN)

Fixes: `favicon.ico` + apple touch icon; main artwork image loads eagerly with `fetchpriority=high`; unused italic
font face removed from the preload set.

| Page | Form factor | Perf | A11y | Best pr. | LCP (3 runs) |
| --- | --- | --- | --- | --- | --- |
| `/collection/objects/sommerso-vase-amber-and-blue/` | mobile | 98 / 95 / 98 | 100 | 100 | 2.4 / 3.0 / 2.3 s |

Lighthouse now confirms *fetchpriority=high applied* for the LCP image. The local server has no CDN or Brotli, so
these numbers are not directly comparable with the Vercel baseline. **To do:** repeat the Vercel measurement once the
fixes are deployed (needs the push, which waits for GitHub access).

## Accessibility — automated (axe-core 4.14, WCAG 2.0/2.1/2.2 A + AA rules)

`tests/e2e/accessibility.spec.ts`, desktop 1440 px and mobile 390 px:

- 19 pages: home, collection (plain, filtered + sorted, empty result), two collection areas (one empty), object
  dossier, Glass Guide, makers, maker profile, techniques, technique, attribution, signatures & labels, about,
  contact (plain and with object reference), privacy, 404.
- States: viewer in full screen (zoomed), mobile menu open.
- Keyboard: skip link is the first tab stop, is visible on focus and moves focus to the content; focused controls
  show an outline of at least 2 px.

Result on 9 Nov: one rule failed on the collection pages: *label-content-name-mismatch*. The search button showed
"Go" but was announced as "Search" (WCAG 2.5.3). Fixed: the button now reads "Search". After the fix, all 45
accessibility runs pass (23 tests × 2 viewports, the mobile-menu test only runs on mobile); the full e2e suite is
55 passed, 1 skipped.

Still manual, before launch: screen-reader pass (VoiceOver iOS, NVDA), 200 % / 400 % zoom and text spacing,
forced colours / Windows high contrast, reduced motion, and a review of real image alt texts and captions.

## Remote end-to-end checks

`E2E_BASE_URL=https://muraniq.vercel.app npm run test:e2e` ran against the live Vercel deployment on 9 Nov:
visitor journey (collection → filter → dossier → viewer → enquiry), empty states, drafts absent, homepage reference
and contact API validation, on desktop and mobile: 10/10 passed. The accessibility suite has not yet run remotely
because the search-button fix is not deployed yet.
