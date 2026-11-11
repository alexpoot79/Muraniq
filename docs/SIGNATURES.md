# Signatures & Marks

Status 11 November 2026. Module for documented photographs of personal signatures, factory marks, labels and
inscriptions on maker profiles. Brief: "05-CLAUDE-SIGNATUREN-MAKERS.md" (11 Nov 2026). The documents the brief
names as background (`LEESMIJ-MURANIQ.md`, `docs/02-ARCHITECTUUR.md`, `docs/03-CLAUDE-BOUWOPDRACHT.md`) are not
in this repository; the module follows the architecture that is here (`docs/architecture/`, `docs/DECISIONS.md`).

## What a visitor sees

| Where | What |
| --- | --- |
| `/glass-guide/makers/` | A small photograph of the maker's primary reference, its kind and **View signatures** (to `#signatures`). The filter **With signature references** appears only when it separates something; it counts makers with a published, photographed and firmly documented reference. Makers without one keep their card, without thumbnail or link. |
| `/glass-guide/makers/[slug]/` | 1. Introduction. 2. Compact reference block beside it (photograph, short transcription, kind, **View all signature references**) only when a suitable primary exists. 3. Biography. 4. **Signatures & Marks** (`#signatures`). 5. Works, sources. |
| Section `#signatures` | Photographed examples as cards (1, 2 or 3 columns by count and width), each with the photograph, the literal text, the kind (Personal signature / Factory mark / Label / Inscription), how it was applied, the date of this example, the documented period of use (only with its own source), the object and its holder, the source, and **Enlarge**, **View source**, **View documented object**. Filters on kind and period of use appear only when they distinguish something. Marks known only from a source follow as a short text list ("Recorded in sources"), ending with "No photograph of this mark can be shown yet." No references: "No documented signature reference is currently available." |
| Enlarged view | The site's existing viewer dialog (`ViewerDialog`): the whole image (`object-contain`, only scaled), zoom, reset, previous/next through the detail and the whole object, transcription, reading, credit and licence beside the image (below it on phones), the link to the original photograph for a crop, Escape and focus return. |
| `/collection/objects/[slug]/` | A mark recorded on the object shows how it was applied, the reading certainty, what could not be read, and a link back to the reference on the maker profile (`#sig-…`). |
| `/glass-guide/makers-and-workshops/[slug]/` | The research directory's marks (text only, from the research set) in their own **Signatures & Marks** section, labelled by the same kinds. |

The planned combined index is the existing route `/glass-guide/signatures-and-labels/` (the brief calls it
`/glass-guide/signatures-labels/`). It reads the same records (`getSignatureReferences()`), and is a later step
once enough references are published.

## Rules the code enforces

- **One record, one image.** The compact block, the card, the maker card thumbnail and the object page link all
  read the same `SignatureReference` and the same `MediaAsset`. Nothing is copied.
- **Observation in one place.** For a mark on a collection object the transcription, reading and their
  certainties live on the object's `Mark` (`MRK-…`); the reference links to it (`markRef`) and may not repeat it.
  Only marks on objects held elsewhere carry their observation on the reference.
- **Kind ≠ application.** What a mark is (`kind`) is separate from how it was applied (`application`: diamond
  point, wheel, acid-etched, enamel, lettered cane, label …).
- **Whose mark.** A personal signature must belong to a person, a factory mark to a firm (validation rejects
  the reverse). A firm's mark appears on a person's profile only as context: "Factory mark of …, on a documented
  work designed by …", and only when the object names that person as verified or as a cited attribution. It can
  never be the compact block of a person. A Venini mark is never Carlo Scarpa's signature.
- **Certainty.** `verified | documented_attribution | probable | hypothesis | unknown`, separately for the reading,
  the owner of the mark and the date. Only the first two count for thumbnails, the filter and the compact block;
  anything weaker is shown with its wording ("probably", "possibly") in the section only. No "authentic" badge,
  no score.
- **Dates.** The date of the example (usually the object's date, with its source) is separate from the
  documented period of use of a variant, which needs its own source.
- **Objects held elsewhere** stay external (`object.external`: institution, accession or lot number, URL) and are
  labelled "not in the MURANIQ collection". No collection record is created for them.
- **Photographs** are shown only when the image is real, rights are established (not `unknown`/`placeholder`),
  cleared for web publication, credited, within any licence end date, and the reference has a source and an
  editorial review date (`signaturePhotoBlockers`). Otherwise the reference stays a text reference.
- **Crops** are plain crops: no colour, contrast or sharpening changes, no AI, font or vector reconstruction. The
  crop records the original image and the region it was cut from, and the viewer links to the original.
- **Withdrawal.** Unpublishing a reference, the maker it belongs to, or clearing a photograph's rights removes it
  from the maker card, filter count, compact block, section, object page and export at once, because all of them
  read the one projection (`buildSignatures`). With Sanity, a photograph whose clearance is withdrawn drops out of
  the query instead of breaking the build.
- **Never public:** `internalNote`, `rightsEvidence`, `recognitionUse`, drafts. Covered by unit tests.

## For editors (Sanity Studio)

Studio is not yet connected to a Sanity project (see `docs/LAUNCH-PLAN.md`); the schema is ready.

- **Add an example:** open the maker → tab **Signatures & Marks** → *Add item* → *Create new*. Or create it under
  **Signatures & Marks** in the main menu and link it from the maker.
- **Link an existing reference:** same list → *Add item* → pick an existing reference (e.g. a factory mark on a
  work by this designer).
- **Choose the primary:** field *Shown by the introduction*. It must be in the list. Without a released photograph
  the site picks another suitable reference or hides the block.
- **Change the order:** drag the items in the maker's list (the reference's *Default order* is only a fallback).
- **Add a source:** the reference's *Evidence* (source, page/lot, consulted on, note). A source must exist as a
  Source document with its exact URL.
- **Replace a photograph:** *Close-up of the mark* on the reference. Upload only images already released for public
  distribution: Sanity assets are public on the CDN even while the document is a draft.
- **Photograph document:** fill credit, licence, *Where the original file comes from*, *Rights cleared for web
  publication*, *Permission ends on* (if any), *Rights evidence* (internal) and *May be used in a recognition
  database* (separate from web publication). For a detail, set *Detail cut from another photograph* with the
  original and the area.
- **Mark on a collection object:** give it a *Mark ID* (`MRK-…`), the literal transcription (`/` for a line
  break, `[…]` for an illegible part), what could not be read, the certainty of the reading, and the
  interpretation with its own certainty.
- **Publish** with Sanity's own Publish. The reference needs a review date to be published.

## Recognition-ready export

`npm run export:signatures` (add `-- --out file.json`, or `-- --all` to include drafts for internal use) writes
JSON (`muraniq.signature-references/1`) with stable reference, maker, object, mark and image ids, the literal
transcription and its lines, variant groups, the documented object (own or external), crop links, credits,
licences, web-publication blockers and recognition permission per image. An image counts as usable for
recognition only when web publication is allowed and `recognitionUse` is `allowed`. The export decides nothing
about authenticity and contains no internal notes or rights evidence. There is no recognition button, upload or
AI service in the site.

## Data in the preview (checked)

| Reference | Maker | Kind | Photograph | Checked against |
| --- | --- | --- | --- | --- |
| `SIG-BIGAGLIA-R009-INSCRIPTION` "Inscription and date canes, 1847" | Pietro Bigaglia (maker of the object) | Inscription, lettered glass cane | Plain crop of the museum's CC0 photograph, linked to the whole view | The Art Institute of Chicago, 1979.904 (record and photograph, consulted 11 Nov 2026). The museum does not transcribe the canes: the reading "IX CONGRESSO / DEGLI / SCIENZIATI / IN / VENEZIA 184[…]" and "1847" is MURANIQ's, marked *probable*, with what could not be read. |
| `SIG-BIGAGLIA-AIC-1988-541-285` "Initials and date “P.B. / 1845”" | Pietro Bigaglia | Personal signature, lettered glass cane | None: the museum photograph does not show the cane | The Art Institute of Chicago, 1988.541.285, inscription field "signed and dated P.B. / 1845" (consulted 11 Nov 2026). Text reference only. |

The inscription is deliberately not presented as Bigaglia's signature. The Bigaglia paperweight (MUR-R009) is a
museum reference work shown as a demonstration record (decision 13); it is labelled as held by the museum.

Test fixtures for the checks of the brief (variants, a factory mark on a designer, uncleared, expired or unreviewed
photographs, withdrawal) are synthetic, named "TEST FIXTURE", and exist only in `tests/unit/signatures.test.ts`.

## Intake register: start sources

The brief's start sources are intake sources, not an image library. Nothing from them is downloaded, hotlinked
or published, and no claim from them is shown on the site. Claims below are **source claims to be assessed**.

None of the five pages could be opened from the build environment on 11 November 2026 (the hosts do not resolve
there), so nothing from them has been checked yet. The coverage and rights notes below are taken from the brief and
must be confirmed on the live pages before any observation is adopted.

| Source | URL | Covers (per the brief) | Rights as stated (per the brief) | Recognition use | Status |
| --- | --- | --- | --- | --- | --- |
| Muranonet, *Masters and Brands Signatures* | https://www.muranonet.com/blogs/unfold-venice/masters-and-brands-signatures-murano-glass-collector | Alfredo Barbini, Fulvio Bianconi, Napoleone Martinuzzi, Archimede Seguso, Loredano Rosin, Pino Signoretto, Venini, among others | Image credits name the Steinberg Foundation collection, Horst Kolberg and Prestel; no reuse licence shown | Unknown | Not consulted |
| 20th Century Glass, Murano signatures | https://20thcenturyglass.com/glass_encyclopedia/glass_signatures/?info=Murano | Carlo Moretti, Cenedese, Salviati, Onesto, among others | All Rights Reserved | Unknown | Not consulted |
| 20th Century Glass, labels | https://20thcenturyglass.com/glass_encyclopedia/glass_labels/ | Murano factory labels | All Rights Reserved | Unknown | Not consulted |
| askART, Lino Tagliapietra signatures | https://www.askart.com/signatures/Lino_Tagliapietra/11000132/Lino_Tagliapietra | Lino Tagliapietra | Paid database: access to consult, no publication licence shown | Unknown | Not consulted (no subscription taken) |
| FindArtInfo, Pino Signoretto signatures | https://findartinfo.com/artist/pino-signoretto/11EABC0B7A045870AD5FC4B301B9DA2D/signatures | Pino Signoretto | Paid database: access to consult, no publication licence shown | Unknown | Not consulted (no subscription taken) |

Where the named makers already have a page on the site (no empty profiles were created):

| Name | Maker profile (`/glass-guide/makers/`) | Research directory (`/glass-guide/makers-and-workshops/`) |
| --- | --- | --- |
| Loredano Rosin | `loredano-rosin` (no reference yet) | — |
| Alfredo Barbini | — | `alfredo-barbini`, `vetreria-alfredo-barbini` |
| Fulvio Bianconi | — | `fulvio-bianconi` |
| Napoleone Martinuzzi | — | `napoleone-martinuzzi` |
| Archimede Seguso | — | `archimede-seguso`, `vetreria-artistica-archimede-seguso` |
| Pino Signoretto | — | `pino-signoretto` |
| Venini | — | `venini`, `v-s-m-venini-and-c`, `paolo-venini` |
| Carlo Moretti | — | `carlo-moretti` (one text mark from the research set) |
| Cenedese | — | `gino-cenedese`, `gino-cenedese-and-c` |
| Salviati | — | `salviati-and-c`, `antonio-salviati` |
| Lino Tagliapietra | — | `lino-tagliapietra` |
| Onesto | — | — |

Next intake step, once the pages can be read: record each example as a source claim (who, kind, application,
literal text if written out, period if stated, object or lot if named), then look for the object in a museum,
archive or auction record before it becomes a reference. A reference from these sources stays a text reference
until a licence or written permission for the photograph is recorded.

## Still needed

1. **Own photographs** (owner): signatures, labels and whole bases of MURANIQ's own objects (MUR-M001 to M006
   and any signed pieces), with the object photographed whole as well. These are the first real signature
   references for Loredano Rosin, Arnaldo Zanella and others with a profile.
2. **Licences or written permission** for any photograph from the start sources (Steinberg Foundation, Horst
   Kolberg, Prestel, 20th Century Glass), recorded per image, including whether recognition use is allowed.
3. **Museum or auction records** that tie each start-source example to a dated object (accession or lot number).
4. **A sharper photograph of the AIC 1979.904 canes** to confirm the third line and the hidden last digit.
5. **Factory marks and labels** (Venini, Salviati, Barovier & Toso, Seguso, Cenedese, Carlo Moretti, Cappellin
   …) with released photographs and object documentation, before they can appear as photographed references.
6. **Sanity project** (connection, dataset, token) under the existing release agreements, to manage the
   references without code.
