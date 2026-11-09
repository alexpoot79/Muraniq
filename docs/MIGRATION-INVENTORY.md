# Migration inventory — current muraniq.nl

Retrieved 9 November 2026 from `https://muraniq.nl/wp-sitemap.xml` (13 URLs). Host: IONOS (Apache),
WordPress-style sitemap. `www.muraniq.nl` currently answers `302 → https://muraniq.nl` (should become a
permanent redirect after the switch).

| Current URL | Content found | New destination | Status after switch |
| --- | --- | --- | --- |
| `/` | Intro + four entry blocks | `/` | 200 (kept) |
| `/about/` | Contact form (title "Contacteer Muraniq") | `/about/` (real about) + `/contact/` | 200 (kept) |
| `/collection/` | Four areas ("STUDIO GLAS" label) | `/collection/` | 200 (kept) |
| `/collection/murano-glass/` | Intro + Zanella/Rosin teasers | same | 200 (kept) |
| `/collection/studio-glass/` | "Work in progress" | same | 200, noindex until works are published |
| `/collection/fine-art/` | "Work in progress" | same | 200, noindex until works are published |
| `/collection/collectible-objects/` | "Work in progress" | same | 200, noindex until works are published |
| `/glass-guide/` | Empty main content | `/glass-guide/` | 200 (kept) |
| `/glass-guide/makers-and-artists/` | Empty | `/glass-guide/makers/` | 308 (active redirect) |
| `/glass-guide/signatures-and-labels/` | Empty | same path, honest "being catalogued" page | 200, noindex |
| `/glass-guide/techniques/` | Empty | same | 200 (kept) |
| `/arnaldo-zanella/` | Biography + 6 images | `/glass-guide/makers/arnaldo-zanella/` | 308 (active redirect) |
| `/loredano-rosin/` | Biography + 4 images | `/glass-guide/makers/loredano-rosin/` | 308 (active redirect) |

Biographies were migrated verbatim (`fixtures/migrated-biographies.json`) and are shown with the note that
they are being checked against sources.

## Media on the current site (not migrated)

All ten images have empty alt text and no object identification. They must not become objects until the
collection has identified which images show the same work, confirmed rights and supplied originals.

- Zanella page (6): `/wp-content/uploads/go-x/u/04406fe4-…/image-384x512.png`, `52df84d9-…/image-384x512.png`,
  `9ec67e06-…/image-384x412.jpg`, `0c10f0ab-…/image-438x384.jpg`, `e25758ef-…/image-384x512.jpg`,
  `060e9169-…/image-461x384.png`
- Rosin page (4): `680d76b6-…/image-384x611.jpg`, `ffedb9f2-…/image-384x512.jpg`, `fb4deff1-…/image-384x633.jpg`,
  `643b8a00-…/image-512x384.jpg`

The published files are small web derivatives (≈384–633 px); collection photography for the new dossiers
needs the originals from the private archive.
