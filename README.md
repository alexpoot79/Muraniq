# MURANIQ

Private collection and research archive for Murano glass, studio glass, fine art and collectible objects.
Next.js (App Router, Cache Components) · TypeScript strict · Tailwind CSS v4 · Sanity Studio (planned) · Vercel.

> **Status:** local build with clearly marked demonstration fixtures. Not deployed, CMS and mail not connected.
> The current site on muraniq.nl stays live until an explicit release decision. See `docs/GOALS-STATUS.md`.

## Commands

```bash
npm install
npm run dev              # http://localhost:3000
npm run check            # typecheck + lint + unit tests + content validation
npm run build            # production build
npm run test:e2e         # Playwright: collection → dossier → viewer → enquiry
```

## Where things live

| Path | Purpose |
| --- | --- |
| `src/app/(gallery)/` | Public routes from the URL contract (trailing slashes) |
| `src/content/schemas/` | Domain schemas (zod) incl. certainty, availability, publication status |
| `src/content/validate.ts` | Dataset rules: references, uniqueness, publication blockers |
| `src/content/public-projection.ts` | Field allowlist — the publication boundary |
| `src/content/repository.server.ts` | Cached server reads (`use cache` + tags) |
| `src/content/sanity.server.ts` | Sanity adapter (not yet connected) |
| `src/features/catalog/` | Server-side search, facets, pagination |
| `src/features/artworks/` | Attribution wording, object viewer |
| `src/features/enquiries/` | Contact validation and mail provider adapter |
| `studio/` | Sanity Studio schemas (separate bundle, not shipped to the site) |
| `fixtures/` | Demonstration data and placeholder specs — never production content |
| `docs/architecture/` | The architecture package this build follows |

## Content source

`CONTENT_SOURCE=fixtures` (default) uses the demonstration dataset. `CONTENT_SOURCE=sanity` plus the
`SANITY_*` variables switches to the CMS; the same validation and projection apply. See `.env.example`.
