# Technical decisions

Short records of choices made during the build. Architecture decisions themselves live in
`docs/architecture/docs/02-ARCHITECTUUR.md`; this file only records implementation choices and deviations.

1. **Next.js 16.4.5 with Cache Components.** One cached publication snapshot (`use cache`, tag `catalog`)
   plus per-record tags (`artwork:<slug>`, `creator:<slug>`, `technique:<slug>`). The webhook expires tags
   with `{ expire: 0 }` for delete/unpublish and `"max"` (stale-while-revalidate) for edits. No legacy
   route-segment caching config is mixed in.
2. **Search without a client index.** `/collection/` parses the URL on the server and streams the result
   inside a Suspense boundary (partial prerender). Filtered pages render `noindex, follow` and a canonical to
   the unfiltered page; unfiltered pagination keeps a self canonical.
3. **Static CSP, no nonces.** Pages stay prerendered, so the policy is static. Next.js inline bootstrap
   scripts require `script-src 'unsafe-inline'`. Everything else is `self` + `cdn.sanity.io`; preview
   deployments additionally allow `vercel.live` for the Vercel toolbar. Revisit if nonce-based CSP becomes
   worth making every route dynamic.
4. **Validation with zod on the server for every source.** Studio validation mirrors the rules but is not
   relied upon. The dataset is rejected as a whole if any rule fails, so a broken import cannot partially
   publish.
5. **Publication boundary as explicit projection.** `public-projection.ts` copies an allowlist of fields;
   nothing is spread. Unit tests inject private fields and assert they never appear in the output.
6. **Certainty vocabulary.** `verified | documented_attribution | probable | hypothesis | unknown`.
   The four labels from the supplementary audit (`documented`, `attributed`, `possibly-attributed`,
   `unidentified`) are rejected by the schema and must be mapped explicitly during import.
7. **Contact.** Without mail credentials the contact page shows the real email address, not a form. With
   Resend configured, "sent" is only shown after the provider accepted the message. The in-memory rate
   limiter is best-effort per instance; a shared store is an open dependency.
8. **Images.** Object images are always `object-contain` with known dimensions. Local SVG placeholders are
   served unoptimised; Sanity images will go through Sanity's pipeline (one optimisation layer).
9. **No animation library.** CSS transitions only; reduced motion collapses them.
10. **Studio as separate package** (`studio/`), excluded from the site's TypeScript and lint, so nothing from
    Studio can end up in the public bundle.
11. **Draft preview through Next.js Draft Mode.** `/api/draft/?secret=…&slug=…` checks
    `SANITY_PREVIEW_SECRET` (constant-time, at least 32 characters; without it the route returns 404), turns on
    Draft Mode for that browser session and redirects to a path rebuilt from the validated slug (no open
    redirect). In Draft Mode every cached read re-runs per request and is never stored, responses are
    `no-store`, and every page carries `noindex` plus a visible "Preview" banner with a *Leave preview* button.
    The repository then reads Sanity's `drafts` perspective; draft and in-review works are shown with their
    status and the same publication blockers the server enforces. Withdrawn works and uncleared images stay
    hidden even in preview. If the drafts fail validation, the preview shows published content and lists the
    problems instead of failing. Tested end to end with the fixture draft (`tests/e2e/preview.spec.ts`).
    Interim choice: a shared secret in the preview link. Once the Sanity project exists, switch the Studio
    side to the Presentation tool with short-lived preview secrets (`@sanity/preview-url-secret`), so no
    long-lived secret sits in a bookmark or the Studio bundle.
12. **Share image and icons.** `/og-default.png` (1200×630) is used whenever a page has no raster image;
    SVG placeholders are never offered as social previews. Favicon (ICO + SVG) and Apple touch icon are
    generated from one monogram.
13. **Museum reference works instead of placeholders.** Until MURANIQ's own photographs and records exist, the
    site shows real objects from museum open-access collections (CC0 photographs only) so the design can be
    judged with real glass. They carry a `reference` block (holder, accession number, record URL, licence, credit
    line); validation only allows it on fixture records in `private_collection`. Every surface states who holds the
    object, links the museum record and offers no enquiry; the contact page and API refuse them. Attribution
    wording follows the museum record exactly ("Attributed to" only where the museum says so). AIC descriptive text
    (CC BY) is not reused. The Sanity Studio schema does not yet have the `reference` field: it is only needed
    for these fixtures and should not be added to real collection records.
14. **Luxury art direction.** See `docs/ART-DIRECTION.md`. Gold-toned text on light surfaces uses `accent-ink`
    (#735A2E) for contrast; the two brighter golds are for dark surfaces and ornaments.
15. **Signatures & Marks.** See `docs/SIGNATURES.md`. A separate `SignatureReference` record (one documented
    example) links to the observation on a collection object's `Mark` instead of copying it; marks on objects held
    elsewhere carry their observation on the reference and stay external objects. Kind of mark and how it was
    applied are separate fields. A personal signature belongs to a person and a factory mark to a firm; a firm's
    mark appears on a person's profile only as context of a firmly documented work and never in the compact block.
    Photographs need established rights, web clearance, credit, a source and a review date; recognition use is
    recorded separately and only affects the internal export. The full-screen viewer is shared
    (`ViewerDialog`, rendered in a portal on `<body>`), so object views and signature references behave the same.
