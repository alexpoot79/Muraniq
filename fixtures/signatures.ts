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
  {
    // MURANIQ's own object (MUR-M009): the observation lives on the object's mark MRK-M009-SIGNATURE.
    id: "SIG-OSCAR-ZANETTI-M009-SIGNATURE",
    title: "Incised signature on a calcedonio shell bowl",
    sortOrder: 10,
    variantGroup: "cursive-two-lines",
    kind: "personal_signature",
    application: "engraved_other",
    markRef: { artworkId: "MUR-M009", markId: "MRK-M009-SIGNATURE" },
    // Probable until compared with documented signatures: on the maker card and in the compact block it is labelled as probable.
    markOf: { creatorId: "CRE-OSCAR-ZANETTI", role: "maker", certainty: "probable" },
    object: { artworkId: "MUR-M009" },
    detailImageId: "IMG-M009-SIGNATURE",
    contextImageIds: ["IMG-M009-BASE", "IMG-M009-FRONT"],
    evidence: [
      {
        sourceId: "SRC-MURANIQ-OBS-M009",
        consultedOn: "2026-11-18",
        note: "The owner's close-up photograph of the signature on the underside, with the object's Zanetti Murano label.",
      },
    ],
    reviewedOn: "2026-11-18",
    internalNote:
      "Location 'Underside' confirmed by the owner on 18 November 2026. Compare with the incised signatures on the Heritage 2025 lot 29045 and the Halls 2025 lot 12 when those pages can be opened.",
    status: "published",
    updatedAt: "2026-11-18",
  },
  {
    // MURANIQ's own sculpture MUR-M010 and the owner's own photographs (18 Nov 2026).
    // The owner reads the signature as Andrea Tagliapietra's; it is not clearly legible
    // and has not been compared with a documented signature, so it stays "probable". It leads the
    // maker card and the compact block only as long as no firmly documented reference exists, labelled as probable.
    id: "SIG-TAGLIAPIETRA-ANDREA-M010-ENGRAVED",
    title: "Engraved cursive signature on the underside",
    sortOrder: 10,
    variantGroup: "engraved-cursive",
    kind: "personal_signature",
    application: "engraved_other",
    markRef: { artworkId: "MUR-M010", markId: "MRK-M010-SIGNATURE" },
    markOf: { creatorId: "CRE-TAGLIAPIETRA-ANDREA", role: "maker", certainty: "probable" },
    object: { artworkId: "MUR-M010" },
    detailImageId: "IMG-M010-SIGNATURE-DETAIL",
    contextImageIds: ["IMG-M010-SIGNATURE", "IMG-M010-FRONT"],
    evidence: [
      {
        sourceId: "SRC-MURANIQ-OBS-M010",
        consultedOn: "2026-11-18",
        note: "The owner's photographs of the signature and of the whole sculpture.",
      },
    ],
    reviewedOn: "2026-11-18",
    internalNote:
      "Compare with documented signatures (signed auction lots with photographs, a Schiavon certificate) before raising the certainty.",
    status: "published",
    updatedAt: "2026-11-18",
  },
  {
    // MURANIQ's own sculpture MUR-M011 (Il Bacio / The Kiss) and the owner's own photographs (20 Nov 2026).
    // The sculpture is documented by Loredano Rosin's signed certificate no. 589 of 10 October 1989, so the
    // engraved signature on its base is a documented example and may lead the maker card and compact block.
    // The certificate and catalogue themselves are not reproduced (public repository).
    id: "SIG-ROSIN-LOREDANO-M011-ENGRAVED",
    title: "Engraved cursive signature on a black base",
    sortOrder: 10,
    variantGroup: "engraved-cursive-full-name",
    kind: "personal_signature",
    application: "engraved_other",
    markRef: { artworkId: "MUR-M011", markId: "MRK-M011-SIGNATURE" },
    markOf: { creatorId: "CRE-ROSIN", role: "maker", certainty: "documented_attribution" },
    dating: {
      toYear: 1989,
      displayLabel: "1989 or earlier",
      certainty: "documented_attribution",
      sourceId: "SRC-ROSIN-CERTIFICATE-M011",
    },
    object: { artworkId: "MUR-M011" },
    detailImageId: "IMG-M011-SIGNATURE",
    contextImageIds: ["IMG-M011-SIGNATURE-DETAIL", "IMG-M011-SIGNATURE-DETAIL-2", "IMG-M011-SIDE-2"],
    evidence: [
      {
        sourceId: "SRC-MURANIQ-OBS-M011",
        consultedOn: "2026-11-20",
        note: "The owner's photographs of the signature, of each word close up, and of the whole sculpture.",
      },
      {
        sourceId: "SRC-ROSIN-CERTIFICATE-M011",
        consultedOn: "2026-11-20",
        note: "Certificate signed by Loredano Rosin for this sculpture ('Il Bacio / The Kiss', no. 589), stating that he made it by hand to his own design.",
      },
    ],
    reviewedOn: "2026-11-20",
    internalNote:
      "Only one documented example so far. Add further certified works to show how the engraved signature varies; the pen signature on the certificate is much quicker and not comparable letter by letter.",
    status: "published",
    updatedAt: "2026-11-20",
  },
  {
    // MURANIQ's own sculpture MUR-M013 (seated figure) and the owner's own photographs (24 Nov 2026). No certificate
    // has been recorded for it; the owner has verified the signature on the piece against documented signatures
    // (24 Nov 2026), so it is "verified". The certified one on MUR-M011 stays the lead reference.
    id: "SIG-ROSIN-LOREDANO-M013-ENGRAVED",
    title: "Engraved cursive signature on a clear glass base",
    sortOrder: 20,
    variantGroup: "engraved-cursive-full-name",
    kind: "personal_signature",
    application: "engraved_other",
    markRef: { artworkId: "MUR-M013", markId: "MRK-M013-SIGNATURE" },
    markOf: { creatorId: "CRE-ROSIN", role: "maker", certainty: "verified" },
    object: { artworkId: "MUR-M013" },
    detailImageId: "IMG-M013-SIGNATURE",
    contextImageIds: ["IMG-M013-SIGNATURE-DETAIL", "IMG-M013-SIGNATURE-DETAIL-2", "IMG-M013-FRONT"],
    evidence: [
      {
        sourceId: "SRC-MURANIQ-OBS-M013",
        consultedOn: "2026-11-24",
        note: "The owner's photographs of the signature, of each word close up, and of the whole sculpture.",
      },
    ],
    reviewedOn: "2026-11-24",
    internalNote:
      "Compared by eye with the documented signature on MUR-M011: same full-name cursive and dotted engraved line, coarser on the matt side of a clear base. Raise to documented if a certificate or papers for this piece turn up.",
    status: "published",
    updatedAt: "2026-11-24",
  },
  {
    // MURANIQ's own love knot MUR-M014 and the owner's own photographs (24 Nov 2026). The owner has verified the
    // signature on the piece as Renato Anatrà's, after long research against documented signatures (24 Nov 2026), so
    // it is "verified". In the two close-ups it is only partly legible (seen through the base), so no transcription.
    id: "SIG-ANATRA-RENATO-M014-ENGRAVED",
    title: "Engraved signature on a clear glass base",
    sortOrder: 10,
    variantGroup: "engraved-point",
    kind: "personal_signature",
    application: "engraved_other",
    markRef: { artworkId: "MUR-M014", markId: "MRK-M014-SIGNATURE" },
    markOf: { creatorId: "CRE-ANATRA-RENATO", role: "maker", certainty: "verified" },
    object: { artworkId: "MUR-M014" },
    detailImageId: "IMG-M014-SIGNATURE",
    contextImageIds: ["IMG-M014-SIGNATURE-DETAIL", "IMG-M014-FRONT"],
    evidence: [
      {
        sourceId: "SRC-MURANIQ-OBS-M014",
        consultedOn: "2026-11-24",
        note: "Verified by the owner on the piece against documented signatures of Renato Anatrà; the owner's two close-ups and photographs of the whole sculpture.",
      },
    ],
    reviewedOn: "2026-11-24",
    internalNote:
      "Verified by the owner (24 Nov 2026). The photographs show it only partly: add a transcription once the owner gives the exact wording, and a sharper photograph if one is made.",
    status: "published",
    updatedAt: "2026-11-24",
  },
  {
    // MURANIQ's own horse MUR-M012 and the owner's own photographs (20 Nov 2026). The horse is documented by a sheet
    // of Arnaldo Zanella's own catalogue ('Articolo 107, h. 60 cm', identified as his by the owner), so the engraved
    // signature is a documented example and may lead the maker card and compact block. No certificate.
    id: "SIG-ZANELLA-ARNALDO-M012-ENGRAVED",
    title: "Engraved cursive signature ‘A. Zanella’ under the belly of a black glass horse",
    sortOrder: 10,
    variantGroup: "engraved-cursive-initial",
    kind: "personal_signature",
    application: "engraved_other",
    markRef: { artworkId: "MUR-M012", markId: "MRK-M012-SIGNATURE" },
    markOf: { creatorId: "CRE-ZANELLA", role: "maker", certainty: "documented_attribution" },
    dating: {
      fromYear: 1989,
      toYear: 1989,
      displayLabel: "c. 1989",
      certainty: "probable",
      sourceId: "SRC-MURANO-STUDIO-CATALOGUE-1989",
    },
    object: { artworkId: "MUR-M012" },
    detailImageId: "IMG-M012-SIGNATURE",
    contextImageIds: ["IMG-M012-SIGNATURE-2", "IMG-M012-SIDE"],
    evidence: [
      {
        sourceId: "SRC-MURANIQ-OBS-M012",
        consultedOn: "2026-11-20",
        note: "The owner's close-up photographs of the signature, and of the whole horse.",
      },
      {
        sourceId: "SRC-ARTICOLO-107-SHEET",
        consultedOn: "2026-11-20",
        note: "Sheet from Arnaldo Zanella's own catalogue showing this model, 'Articolo 107, h. 60 cm'; it came with the horse.",
      },
    ],
    reviewedOn: "2026-11-20",
    internalNote:
      "Owner (20 Nov 2026): certain it is Arnaldo Zanella's, and the 'Articolo 107' sheet is from his own catalogue. Location 'underside of the belly' confirmed; no certificate. Add further signed works to show how the signature varies.",
    status: "published",
    updatedAt: "2026-11-20",
  },
];

export const SIGNATURE_SOURCE_URLS = { AIC_1979_904, AIC_1988_541_285 };
