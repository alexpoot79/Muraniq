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

## Luxury redesign with reference photography — 9 November 2026 (local, not yet deployed)

Measured on a local production build (`next build` + `next start`), not on Vercel. Content: 13 museum reference works
with real CC0 photographs (JPEG via `next/image`), so image weight is now realistic.

**Automated checks, all passing:** `tsc --noEmit`, `eslint .`, Vitest 41/41, content validation, `next build`,
Playwright 65 passed / 1 skipped (desktop 1440 px and mobile 390 px): visitor journey, honest empty states and 404,
draft boundary, draft preview, contact API, and axe WCAG 2.2 A/AA on 22 pages plus the full-screen viewer and the
mobile menu.

**Found and fixed by these checks:**

- Gold numerals on paper (#A88A54 on #E8DDCB, 2.4:1) failed contrast. New token `accent-ink` #735A2E (4.8:1) for
  gold-toned text on light surfaces.
- Viewer thumbnails: the whole button was dimmed to 70%, which pushed the label below 4.5:1. Only the picture dims now.
- Viewer thumbnails announced the image description twice ("<alt> Side : <alt>"). Thumbnail images are now
  decorative; the button reads "Side: <description>".
- Collection page footer jumped when the streamed results arrived (CLS 0.12 on desktop). The loading placeholder
  now reserves the space (CLS 0).
- Hero / first viewer image is now preloaded from `<head>` (Next 16 `preload`).

**How the accessibility audit treats motion:** load-time text animations are allowed to finish and scroll-driven
reveals are removed before axe measures contrast, so it judges the colours text settles to. In a real browser, text
at the very bottom edge of the screen is briefly faded until it scrolls further in; with *reduce motion* there is no
fade at all.

**Lighthouse 12.6.1, local, simulated throttling:**

| Page | Form factor | Perf | A11y | Best pr. | SEO | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | mobile | 91–95 | 100 | 100 | 69 | 2.7–3.4 s | 80 ms | 0 |
| `/collection/` | mobile | 89 | 100 | 100 | 66 | 3.8 s | 60 ms | 0 |
| `/collection/objects/chalcedony-ewer-venice/` | mobile | 90–95 | 100 | 100 | 69 | 2.9–3.5 s | 110 ms | 0 |
| `/exhibition/` | mobile | 91 | 100 | 100 | 69 | 3.5 s | 60 ms | 0 |
| `/` | desktop | 100 | 100 | 100 | 69 | 0.8 s | 0 ms | 0 |
| `/collection/` | desktop | 99 | 100 | 100 | 66 | 0.9 s | 10 ms | 0 |
| `/collection/objects/chalcedony-ewer-venice/` | desktop | 100 | 100 | 100 | 69 | 0.8 s | 20 ms | 0 |
| `/exhibition/` | desktop | 100 | 100 | 100 | 69 | 0.7 s | 10 ms | 0 |

(Collection mobile was measured before the CLS and preload fixes; ranges are repeated runs.)

Deviations, explained:

- **SEO 66–69: intentional**, as before: `noindex` until launch.
- **Mobile LCP 2.7–3.8 s in the lab misses the 2.5 s target.** The hero photograph itself arrives early (≈ 18 KB);
  most of the time is *render delay* that Lighthouse attributes to JavaScript under 4× CPU slowdown. Next steps:
  measure on Vercel (CDN, HTTP/2) and with field data; if still over, trim client JavaScript on the home page.
- Not done: manual screen-reader pass, real-device testing, field Core Web Vitals.
