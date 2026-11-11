/**
 * Signatures & Marks — first real references (11 November 2026).
 *
 * Only museum open-access material is used: the Art Institute of Chicago
 * releases these photographs and its record data as CC0. Nothing here comes
 * from the commercial reference sites listed in docs/SIGNATURES.md: those are
 * intake sources only, their photographs are not licensed for reuse.
 *
 * What was checked, and how:
 * - AIC 1979.904 (Pietro Bigaglia, paperweight, 1847): the inscription and
 *   date canes are visible in the museum's own photograph. The museum record
 *   does not transcribe them; the transcription below is MURANIQ's reading of
 *   that photograph and is labelled as such. The detail image is a plain crop
 *   of the same photograph (no colour, contrast or sharpening changes).
 * - AIC 1988.541.285 (Pietro Bigaglia, paperweight, 1846): the museum record
 *   states "signed and dated P.B. / 1845". The signature cane is not visible in
 *   the museum's photograph, so this stays a text reference without a photo.
 */
import type { MediaAsset, SignatureReference } from "@/content/schemas";

const AIC_1979_904 = "https://www.artic.edu/artworks/58835";
const AIC_1988_541_285 = "https://www.artic.edu/artworks/188003";

export const signatureMedia: MediaAsset[] = [
  {
    id: "IMG-R009-INSCRIPTION",
    artworkId: "MUR-R009",
    viewType: "detail",
    src: "/images/signatures/r009-inscription-canes-detail.jpg",
    width: 450,
    height: 575,
    alt: "Detail of the paperweight from above: a white cane with a scalloped pink border lettered in blue “IX CONGRESSO DEGLI SCIENZIATI IN VENEZIA”, and below it a cane with the year 1847, seen upside down",
    caption: "Inscription and date canes (detail of the photograph from above)",
    credit: "The Art Institute of Chicago, 1979.904 · CC0 (detail)",
    rights: "public_domain",
    rightsCleared: true,
    hotspots: [],
    licence: "CC0 1.0",
    sourceUrl: "https://www.artic.edu/iiif/2/2053ba47-e1a3-391f-2bc6-07d45286c286/full/1686,/0/default.jpg",
    cropOf: { imageId: "IMG-R009-TOP", region: { x: 0.3233, y: 0.3855, w: 0.2669, h: 0.341 } },
    rightsEvidence: "AIC API record 58835: is_public_domain=true; data and images CC0 (api.artic.edu licence notice), checked 2026-11-11",
    recognitionUse: "allowed",
  },
];

export const signatureReferences: SignatureReference[] = [
  {
    id: "SIG-BIGAGLIA-R009-INSCRIPTION",
    title: "Inscription and date canes, 1847",
    sortOrder: 10,
    variantGroup: "congress-1847",
    kind: "inscription",
    application: "cane",
    markRef: { artworkId: "MUR-R009", markId: "MRK-R009-INSCRIPTION" },
    dating: {
      fromYear: 1847,
      toYear: 1847,
      displayLabel: "1847",
      certainty: "documented_attribution",
      sourceId: "SRC-AIC-1979-904",
    },
    object: { artworkId: "MUR-R009" },
    detailImageId: "IMG-R009-INSCRIPTION",
    contextImageIds: ["IMG-R009-TOP"],
    evidence: [
      {
        sourceId: "SRC-AIC-1979-904",
        consultedOn: "2026-11-11",
        note: "Maker, date and photograph. The record itself does not transcribe the canes.",
      },
    ],
    reviewedOn: "2026-11-11",
    internalNote: "Read from the CC0 photograph at 1686 px; a sharper photograph of the canes would help confirm the third line.",
    status: "published",
    updatedAt: "2026-11-11",
  },
  {
    id: "SIG-BIGAGLIA-AIC-1988-541-285",
    title: "Initials and date “P.B. / 1845”",
    sortOrder: 20,
    variantGroup: "pb-initials",
    kind: "personal_signature",
    application: "cane",
    observation: {
      transcription: "P.B. / 1845",
      transcriptionNote: "As written in the museum record (“signed and dated P.B. / 1845”). The museum’s photograph does not show the cane.",
      location: "Not stated in the museum record",
      transcribedFrom: "source",
      transcriptionCertainty: "documented_attribution",
    },
    interpretation: {
      reading: "Pietro Bigaglia’s initials and a year, which the museum records as a signature and date.",
      certainty: "documented_attribution",
    },
    markOf: { creatorId: "CRE-BIGAGLIA", role: "maker", certainty: "documented_attribution" },
    dating: {
      fromYear: 1846,
      toYear: 1846,
      displayLabel: "1846 (museum date of the paperweight)",
      certainty: "documented_attribution",
      sourceId: "SRC-AIC-1988-541-285",
    },
    object: {
      external: {
        kind: "museum",
        title: "Paperweight",
        institution: "The Art Institute of Chicago",
        identifier: "1988.541.285",
        url: AIC_1988_541_285,
        dateLabel: "1846",
        creators: [{ name: "Pietro Bigaglia", creatorId: "CRE-BIGAGLIA", role: "maker", certainty: "documented_attribution" }],
      },
    },
    contextImageIds: [],
    evidence: [
      {
        sourceId: "SRC-AIC-1988-541-285",
        consultedOn: "2026-11-11",
        note: "Inscriptions field: “signed and dated P.B. / 1845”. Maker and date of the object.",
      },
    ],
    reviewedOn: "2026-11-11",
    status: "published",
    updatedAt: "2026-11-11",
  },
];

export const SIGNATURE_SOURCE_URLS = { AIC_1979_904, AIC_1988_541_285 };
