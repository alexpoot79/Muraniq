# MURANIQ — Goal register

Persistent status of goals G0–G6 from `docs/architecture/docs/04-GOALS.md`.
Statuses: `niet gestart`, `actief`, `wacht op afhankelijkheid`, `gereed`.
Last update: 9 November 2026.

| Goal | Status | Evidence | Open dependency |
| --- | --- | --- | --- |
| G0 Uitgangssituatie | gereed | Inventory below | — |
| G1 Contentcontract en publicatiegrens | gereed (lokaal) | `npm test` — 31 unit tests incl. boundary, drafts, withdrawal, certainty rules | First real record from the collection |
| G2 Redactie tot veilige preview | wacht op afhankelijkheid | Studio schemas (`studio/`, typechecks), Sanity adapter, signed revalidation webhook (tested) | Sanity project + private dataset (Growth plan, owner decision), draft-preview route, end-to-end publish/withdraw test against the real dataset |
| G3 Referentiepagina's | gereed met fixtures | Homepage + object dossier; Playwright on 1440 and 390 px; manual 320/390/768/1440 checks, no horizontal scroll; viewer keyboard + focus return tested | Authentic cleared photography and one real dossier for final visual review |
| G4 Collectie en onderzoek | gereed met fixtures | Shareable filter URLs, empty states, back/forward via URL, server-side index (only the page of results reaches the browser), makers (migrated bios), techniques, attribution method | Real objects; source review of the migrated biographies |
| G5 Contact, migratie, kwaliteit | actief | Contact validation + provider adapter tested with mocks; API rejects invalid input (e2e); CSP + security headers; sitemap/robots/canonical; redirect plan | Mail provider + verified sending domain; shared rate-limit store; Lighthouse/CWV on the Vercel preview; full URL crawl of the current site |
| G6 Productierelease | niet gestart | — | Explicit approval by Alex after reviewing the protected preview |

## G0 inventory (9 Nov 2026)

- Repository started empty; this branch contains the complete new codebase.
- Tooling: Node 22, Next.js 16.4.5 (Cache Components), React 19.3.1, TypeScript 5.9.3, Tailwind 4.3.5, zod 4.6.7, Vitest 5.1.0, Playwright 1.65.0. Versions pinned exactly; one lockfile at the root (Studio has its own, separate bundle).
- Fonts: Cormorant Garamond 500/600/500-italic and Inter variable, self-hosted WOFF2 (OFL licences in `src/app/fonts/`), ≈118 KB total.
- Collection data: **none available**. All six published objects, the maker "Atelier Esempio" and both sources are demonstration fixtures, visibly marked on every page. Images are generated placeholder drawings labelled "Placeholder · not collection photography".
- Real makers present as profiles: Arnaldo Zanella and Loredano Rosin, biographies migrated verbatim from muraniq.nl and marked as not yet source-reviewed. No fixture object is attributed to them. Full URL inventory: `docs/MIGRATION-INVENTORY.md`.
- `/alchemy` (l-gevity skills) is not installed in this environment; technical decisions are recorded in `docs/DECISIONS.md`.
- Vercel project imported by Alex; production URL `muraniq.vercel.app` (branch deploys). Remote check 9 Nov: all pages 200, drafts absent, contact API validates (422), security headers present.
- Not reachable from the build environment: api.vercel.com, api.sanity.io.

## Next bounded step

Alex imports the repository in Vercel (protected preview). Then: run the e2e suite against the preview URL
(`E2E_BASE_URL=<preview> npm run test:e2e`, with a protection bypass token) and measure Lighthouse.
