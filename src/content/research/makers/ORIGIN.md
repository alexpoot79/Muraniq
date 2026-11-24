# Makers & Workshops research data

Copied unchanged from `research/makers/data/` on branch `claude/project-thread-d9abh3`
(commit 7687e5d, research date 2026-11-10). That branch is the source of truth: edit the data there,
run its `scripts/validate.py`, then copy the JSON files here again.

The site projects this data in `src/content/makers-directory.ts`. Only entities, relationships and works whose
status is VERIFIED, PARTIALLY_VERIFIED, ATTRIBUTED or DISPUTED are published, each with its status shown.
UNVERIFIED records stay out. Only images labelled PUBLIC DOMAIN are shown, from local copies in
`public/images/makers/` (see `docs/IMAGE-SOURCES.md`).

Later additions were made on `main` in `research/makers/data/` (validated with `scripts/validate.py`, exported with
`scripts/export.py`) and copied here: the Zanetti records (18 Nov 2026, MUR-M009) and Vetreria Artistica Rosis
(`ORG-ROSIS`, 24 Nov 2026, MUR-M015).
