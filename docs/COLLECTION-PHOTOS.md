# Collection photographs and data: intake workflow

Status 12 November 2026. How MURANIQ's own objects (hundreds of them) get from the owner's camera and data
sheet onto the site, with as little work per object as possible. The owner-facing protocol (in Dutch) is the
Claude Doc "Fotoprotocol MURANIQ-collectie"; this page is the technical side.

## The idea in one paragraph

Each object gets an id (`MUR-M007`, shown as **M007**). The owner photographs a printed **ID card** with that
id and a QR code first, then the object in a **fixed order**. The camera roll is uploaded as it is (iPhone HEIC
is fine, no renaming, file names may even be lost). One row per object goes into the **data sheet** (Excel).
`npm run collection:import` splits the roll at the ID cards, gives every photograph its view from the fixed
order, converts and strips the photographs, writes the records and checks everything with the site's own
validation. A **review sheet** (contact sheet) shows per object which photo became which view.

## Shooting order (after the ID card)

| # | View | Notes |
| --- | --- | --- |
| 1 | `front` | Main photograph (hero). |
| 2 | `reverse`, or `top` for open forms | Open forms: Bowl, Dish, Plate, Ashtray, Centrepiece, Tray, Coupe, Paperweight. |
| 3 | `base` | Underside; shows pontil, signature position, wear. |
| 4 | `signature` | Only when the sheet says Signatuur = ja. |
| 5 | `label` | Only when the sheet says Etiket = ja. |
| 6+ | `detail` | Any number (more than 10 photos per object triggers a warning). |

The column "Afwijkende fotovolgorde" overrides the order for one object (e.g. `front, base, detail`).
A view word in a file name (`M012-base.jpg`, Dutch words too) also wins. `top` ("From above") is a new view type
added for this workflow (schema, Studio list and viewer label).

## Ways to say which object a photograph belongs to

1. **ID card (recommended).** Photos are ordered by EXIF capture time (`DateTimeOriginal` + sub-seconds); every
   photo after a card belongs to that card's object until the next card. The card photo itself is not published.
   Photos before the first card are reported as unassigned (error) and shown in red on the review sheet.
2. **Folder or file name** starting with the id: `M007/IMG_1234.HEIC`, `M007-front.jpg`. Useful for photos made
   with a camera and sorted on a computer.

If not every photo has a capture time, the order falls back to file name (natural sort) with a warning.

## Commands

```bash
npm run collection:cards -- --from 7 --to 306        # printable ID cards (PDF, 8 per A4) -> tmp/
npm run collection:template -- --to 306              # data sheet with dropdowns, pre-filled -> tmp/
npm run collection:import -- <photo folder> --sheet <sheet.xlsx|.csv> [--only M007-M030] [--dry-run] [--report-dir <dir>]
```

`collection:cards` needs Chromium (in the cloud container: `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium`).
Without a photo folder, `collection:import` only updates the data of objects that already exist.

## What the importer does with a photograph

- Reads JPEG, HEIC (iPhone, decoded with `heic-decode`), PNG, TIFF, WebP, AVIF; recognises files without an
  extension by their first bytes (uploads arrive without one). Zip files must be unpacked first.
- Applies EXIF orientation (HEIC: libheif applies the HEIF rotation itself).
- Converts to **sRGB**: iPhone photos are Display P3. JPEGs are converted by sharp from their ICC profile;
  HEIC pixels are converted with the standard P3→sRGB matrix (checked against sharp's ICC conversion: mean
  difference 0.15/255).
- Resizes to at most 2200 px on the long side, JPEG quality 85 (mozjpeg).
- Writes **no metadata at all**: no GPS position, camera serial or capture time reaches the public repository.
- **No retouching**: no colour, contrast, background or haze edits. Good light at capture replaces editing.
- File name `public/images/collection/<id>/<id>-<view>[-n]-<hash>.jpg`. The content hash changes when a photo is
  replaced, so caches never show an old photo.

## What the importer does with a row

Rules live in `scripts/collection/sheet.ts` (cells) and `scripts/collection/records.ts` (records):

- **Empty cell = keep** what the record has (or "not documented" for a new object). Nothing is invented.
- **Generated text** (title, summary, description) is built only from the owner's own data and marked in
  `_generated` so a later import can rewrite it; text the owner (or an editor) wrote is never overwritten by
  generated text. Generated titles look like "Sommerso bowl in blue and amber".
- **Slug** is set at the first import and never changes, so published URLs stay stable when a title changes.
- **Attribution**: "Basis toeschrijving" maps to the site's certainty vocabulary: Signatuur or Etiket →
  `probable`, Documentatie (requires Bron, which becomes a public Source `SRC-M007-1`) → `documented_attribution`,
  Stijl en vergelijking → `hypothesis`, empty → `unknown` ("Maker not documented"). Never `verified`. A maker that
  matches an existing creator (name or alias) is linked; otherwise the attribution is shown unlinked (object page
  and cards now fall back to the creator assertion when there is no linked creator).
- **Period**: "c. 1960" / "ca. 1960" → label "c. 1960", years 1960–1960; "1950s" / "jaren 50" → 1950–1959;
  "1955-65" → 1955–1965; "20th century" / "20e eeuw" → 1901–2000. Anything else is shown literally (warning).
- **Marks**: Signatuur / Etiket = ja creates a `Mark` (`MRK-M007-SIG`, `MRK-M007-LABEL`) with the literal text and
  the photograph of that view.
- **Dimensions**: centimetres with comma or point → millimetres; unknown stays empty, never 0.
- **Highlight** ("Uitgelicht"): `featured` and an early curated order. The order only moves when the highlight
  choice changes, so re-imports never reshuffle the collection.
- **Publiceren**: ja → `published`, otherwise `draft` (drafts are never public; they show in draft preview).
- **Interne notitie** is never read. The sheet must not hold prices, values, addresses or storage locations:
  everything imported ends up in a public repository.
- Unchanged rows are left alone (no new `updatedAt`).

Before anything is written, the whole dataset (reference works + own collection) is validated with
`validateDataset`. If it fails, nothing is written. Rows with errors are skipped and listed in `rapport.md`.

## Where things live

| What | Where |
| --- | --- |
| Own objects, photos, sources | `fixtures/collection.json` (read by `fixtures/dataset.ts` via `withCollection`) |
| Published photographs | `public/images/collection/<id>/` (M001–M006 keep their earlier files until re-shot) |
| Review sheet + report | `tmp/collection-import/<time>/` (git-ignored) or `--report-dir` |
| Code | `scripts/collection/` · tests `tests/unit/collection-intake.test.ts` |

## Batch runbook (Claude, cloud session)

1. Collect the batch: the owner's uploads land in `/mnt/project-files/uploads/hearth/` (named by id, no
   extension). Copy that batch's photo files and the filled sheet into one folder; unzip any zip.
2. Dry run: `npm run collection:import -- <folder> --sheet <sheet> --dry-run --report-dir /mnt/project-files/collectie-fotos/<batch>/`.
   Look at `contactvel-*.jpg` (correct object per card, correct views, nothing unassigned) and `rapport.md`.
3. Real run, then `npm run check` and `npm run build`.
4. Commit on a branch, open a PR, send the owner the review sheet and the Vercel preview. Merge only on the
   owner's approval.

## Scale notes

- Size: real iPhone photos come out at roughly 0.2–0.5 MB each at 2200 px. 300 objects × 5 photos ≈ 300–700 MB in
  git, which is heavy for one repository. Plan: keep the first batches (highlights) in the repository; move
  photographs to the Sanity asset store (already planned as CMS) before the collection grows past about 100
  objects. The data sheet and the records stay the same; only the storage of the photographs changes.
- Vercel's image optimisation has monthly limits on the Hobby plan; check usage after the first large batch.
- Originals stay with the owner (Photos/iCloud and a backup). Only web versions are published.
