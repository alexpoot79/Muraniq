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
