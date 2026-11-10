# MURANIQ — Goal register

Persistent status of goals G0–G6 from `docs/architecture/docs/04-GOALS.md`.
Statuses: `niet gestart`, `actief`, `wacht op afhankelijkheid`, `gereed`.
Last update: 9 November 2026.

| Goal | Status | Evidence | Open dependency |
| --- | --- | --- | --- |
| G0 Uitgangssituatie | gereed | Inventory below | — |
| G1 Contentcontract en publicatiegrens | gereed (lokaal) | `npm test`: 41 unit tests incl. boundary, drafts, withdrawal, certainty rules, preview build | First real record from the collection |
| G2 Redactie tot veilige preview | wacht op afhankelijkheid | Studio schemas (`studio/`, typechecks), Sanity adapter (published + drafts perspective), signed revalidation webhook (tested), draft preview via secret link + Draft Mode: banner, `noindex`, `no-store`, draft status and publication blockers, no leak to other visitors (e2e `preview.spec.ts`, with fixtures) | Sanity project + private dataset (Growth plan, owner decision); `SANITY_PREVIEW_SECRET` in Vercel; end-to-end edit → preview → publish → withdraw test against the real dataset |
| G3 Referentiepagina's | gereed met fixtures | Homepage + object dossier; Playwright on 1440 and 390 px; manual 320/390/768/1440 checks, no horizontal scroll; viewer keyboard + focus return tested; axe WCAG 2.2 A/AA checks on 19 pages + viewer + menu (`docs/QA-REPORT.md`) | Authentic cleared photography and one real dossier for final visual review; manual screen-reader pass |
| G4 Collectie en onderzoek | gereed met fixtures | Shareable filter URLs, empty states, back/forward via URL, server-side index (only the page of results reaches the browser), makers (migrated bios), techniques, attribution method | Real objects; source review of the migrated biographies |
| G5 Contact, migratie, kwaliteit | actief | Contact validation + provider adapter tested with mocks; API rejects invalid input (e2e); CSP + security headers; sitemap/robots/canonical; redirect plan; Lighthouse on muraniq.vercel.app (mobile perf 94–98, desktop 100, a11y 100; SEO 66–69 only because of the intentional pre-launch `noindex`), fixes for favicon, LCP priority and fonts (`docs/QA-REPORT.md`) | Mail provider + verified sending domain; shared rate-limit store; re-measure after deploy; field CWV after launch; full URL crawl of the current site |
| G6 Productierelease | niet gestart | — | Explicit approval by Alex after reviewing the protected preview |

## G0 inventory (9 Nov 2026)

- Repository started empty; this branch contains the complete new codebase.
- Tooling: Node 22, Next.js 16.4.5 (Cache Components), React 19.3.1, TypeScript 5.9.3, Tailwind 4.3.5, zod 4.6.7, Vitest 5.1.0, Playwright 1.65.0. Versions pinned exactly; one lockfile at the root (Studio has its own, separate bundle).
- Fonts: Cormorant Garamond 500/600 and Inter variable, self-hosted WOFF2 (OFL licences in `src/app/fonts/`), ≈95 KB total. The unused italic face was removed on 9 Nov to cut preloads.
- Collection data: **none available yet**. Since the luxury redesign (9 Nov 2026) the 13 published works are **museum reference works**: real objects held by the Cleveland Museum of Art and the Art Institute of Chicago, shown with the museums' CC0 photographs, marked "Reference work. Held by …" on every page, never offered for enquiry or sale. The placeholder drawings and the fictional maker "Atelier Esempio" are gone. Sources and licences: `docs/IMAGE-SOURCES.md`. They must be replaced by MURANIQ's own objects before launch.
- Real makers present as profiles: Arnaldo Zanella and Loredano Rosin, biographies migrated verbatim from muraniq.nl and marked as not yet source-reviewed. No fixture object is attributed to them. Full URL inventory: `docs/MIGRATION-INVENTORY.md`.
- `/alchemy` (l-gevity skills) is not installed in this environment; technical decisions are recorded in `docs/DECISIONS.md`.
- Vercel project imported by Alex; production URL `muraniq.vercel.app` (branch deploys). Remote check 9 Nov: all pages 200, drafts absent, contact API validates (422), security headers present.
- Not reachable from the build environment: api.vercel.com, api.sanity.io.

## Next bounded step

Push the local commits once GitHub access is restored, let Vercel redeploy, then re-run the full e2e suite
(incl. accessibility) and Lighthouse against `muraniq.vercel.app` and update `docs/QA-REPORT.md`.
