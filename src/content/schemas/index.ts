/**
 * MURANIQ domain schemas.
 *
 * These describe the *publication* records (the material an editor may release
 * to the website). They are validated on the server for every content source
 * (local fixtures today, Sanity later) so that Studio validation alone is never
 * the only line of defence.
 *
 * Confidential collection administration (purchase prices, insurance values,
 * owner addresses, storage locations, private correspondence) does not belong
 * in these records at all. `public-projection.ts` additionally applies an
 * explicit allowlist, so a stray internal field can never reach HTML, RSC
 * payloads, metadata or the search index.
 */
import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Controlled vocabularies                                             */
/* ------------------------------------------------------------------ */

export const CATEGORY_SLUGS = [
  "murano-glass",
  "other-glass",
  "collectible-objects",
] as const;
export const CategorySlug = z.enum(CATEGORY_SLUGS);
export type CategorySlug = z.infer<typeof CategorySlug>;

/**
 * Certainty attached to every assertion.
 * `verified` requires named evidence AND a review date (enforced below).
 */
export const CERTAINTY = [
  "verified",
  "documented_attribution",
  "probable",
  "hypothesis",
  "unknown",
] as const;
export const Certainty = z.enum(CERTAINTY);
export type Certainty = z.infer<typeof Certainty>;

/** Distinct public states; never conflated. */
export const AVAILABILITY = [
  "private_collection",
  "enquiries_welcome",
  "reserved",
  "sold",
] as const;
export const Availability = z.enum(AVAILABILITY);
export type Availability = z.infer<typeof Availability>;

export const PUBLICATION_STATUS = ["draft", "in_review", "published", "withdrawn"] as const;
export const PublicationStatus = z.enum(PUBLICATION_STATUS);
export type PublicationStatus = z.infer<typeof PublicationStatus>;

export const VIEW_TYPES = ["front", "reverse", "top", "side", "base", "signature", "label", "detail", "context"] as const;
export const ViewType = z.enum(VIEW_TYPES);
export type ViewType = z.infer<typeof ViewType>;

export const RIGHTS_STATUS = ["owned", "licensed", "permission", "public_domain", "unknown", "placeholder"] as const;
export const RightsStatus = z.enum(RIGHTS_STATUS);
export type RightsStatus = z.infer<typeof RightsStatus>;

export const CREATOR_ROLES = ["designer", "maker", "glasshouse", "decorator", "artist", "publisher"] as const;
export const CreatorRole = z.enum(CREATOR_ROLES);
export type CreatorRole = z.infer<typeof CreatorRole>;

const id = (prefix: string) =>
  z.string().regex(new RegExp(`^${prefix}-[A-Z0-9-]+$`), `must look like ${prefix}-XXXX`);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase kebab-case slug");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD");
const year = z.number().int().min(1000).max(2100);

/* ------------------------------------------------------------------ */
/* Shared building blocks                                              */
/* ------------------------------------------------------------------ */

export const Dating = z
  .object({
    fromYear: year.optional(),
    toYear: year.optional(),
    displayLabel: z.string().min(1).max(80),
    certainty: Certainty,
  })
  .refine((d) => d.fromYear === undefined || d.toYear === undefined || d.fromYear <= d.toYear, {
    message: "fromYear must not be after toYear",
  });
export type Dating = z.infer<typeof Dating>;

/** Millimetres / grams. Unknown stays undefined — zero is not "unknown". */
export const Dimensions = z.object({
  heightMm: z.number().positive().optional(),
  widthMm: z.number().positive().optional(),
  depthMm: z.number().positive().optional(),
  diameterMm: z.number().positive().optional(),
  weightG: z.number().positive().optional(),
});
export type Dimensions = z.infer<typeof Dimensions>;

export const SourceRef = z.object({
  sourceId: id("SRC"),
  locator: z.string().max(120).optional(), // page, plate, lot number, URL fragment
  /** When the source was consulted for this claim (exact URL in the Source record). */
  consultedOn: isoDate.optional(),
  /** Short public explanation of what the source shows for this claim. */
  note: z.string().max(300).optional(),
});

export const Assertion = z
  .object({
    field: z.enum(["creator", "glasshouse", "dating", "technique", "origin", "mark", "provenance", "other"]),
    statement: z.string().min(3).max(400),
    certainty: Certainty,
    evidence: z.array(SourceRef).default([]),
    publicNote: z.string().max(800).optional(),
    reviewedOn: isoDate.optional(),
  })
  .superRefine((a, ctx) => {
    if (a.certainty === "verified" && (a.evidence.length === 0 || !a.reviewedOn)) {
      ctx.addIssue({
        code: "custom",
        message: "a 'verified' assertion needs named evidence and a review date",
      });
    }
    if (a.certainty === "documented_attribution" && a.evidence.length === 0) {
      ctx.addIssue({ code: "custom", message: "a documented attribution must cite at least one source" });
    }
  });
export type Assertion = z.infer<typeof Assertion>;

export const CreatorCredit = z.object({
  creatorId: id("CRE"),
  role: CreatorRole,
  certainty: Certainty,
});
export type CreatorCredit = z.infer<typeof CreatorCredit>;

/* ------------------------------------------------------------------ */
/* Entities                                                            */
/* ------------------------------------------------------------------ */

/** Normalised 0–1 rectangle on the original photograph. */
export const Region = z
  .object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    w: z.number().gt(0).max(1),
    h: z.number().gt(0).max(1),
  })
  .refine((r) => r.x + r.w <= 1.0001 && r.y + r.h <= 1.0001, { message: "region must lie inside the photograph" });

/** Whether a photograph may later be used in a recognition (matching) database. Recorded separately from web use. */
export const RECOGNITION_USE = ["allowed", "not_allowed", "unknown"] as const;

export const MediaAsset = z.object({
  id: id("IMG"),
  artworkId: id("MUR").optional(),
  viewType: ViewType,
  src: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().min(8, "alt text must describe the image").max(300),
  caption: z.string().max(300).optional(),
  credit: z.string().max(160).optional(),
  rights: RightsStatus,
  rightsCleared: z.boolean(),
  /** Normalised 0–1 focal point on the uncropped image. */
  focalPoint: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }).optional(),
  hotspots: z
    .array(
      z.object({
        x: z.number().min(0).max(1),
        y: z.number().min(0).max(1),
        label: z.string().min(2).max(80),
        description: z.string().max(400),
      }),
    )
    .default([]),
  /** Public licence wording, e.g. "CC0 1.0". */
  licence: z.string().max(80).optional(),
  /** Where the published file was obtained (the institution's image or record URL). */
  sourceUrl: z.url().optional(),
  /** A detail cut from another photograph: the link to the original is kept, nothing else is altered. */
  cropOf: z.object({ imageId: id("IMG"), region: Region }).optional(),
  /** Licence or permission end date; after it the image is no longer published. */
  licenceExpiresOn: isoDate.optional(),
  /** INTERNAL: where the rights evidence is kept (contract, e-mail, licence page). Never published. */
  rightsEvidence: z.string().max(300).optional(),
  /** INTERNAL: permission for a future recognition database, separate from web publication. */
  recognitionUse: z.enum(RECOGNITION_USE).default("unknown"),
});
export type MediaAsset = z.infer<typeof MediaAsset>;

/**
 * How a mark was applied — kept apart from what kind of mark it is
 * (a factory mark can be acid-etched or engraved; a signature can be a cane).
 */
export const MARK_APPLICATIONS = [
  "diamond_point",
  "wheel_engraved",
  "engraved_other",
  "acid_etched",
  "enamel_painted",
  "cane",
  "impressed",
  "printed_label",
  "handwritten_label",
  "unknown",
] as const;
export const MarkApplication = z.enum(MARK_APPLICATIONS);
export type MarkApplication = z.infer<typeof MarkApplication>;

/**
 * A mark observed on a collection object: the observation and its
 * interpretation live here, once. A SignatureReference may point to it.
 */
export const Mark = z.object({
  /** Stable id, needed when a signature reference points to this mark. */
  id: id("MRK").optional(),
  kind: z.enum(["signature", "label", "pontil", "engraving", "stamp", "inscription", "other"]),
  application: MarkApplication.optional(),
  location: z.string().max(120),
  observation: z.string().max(400),
  /** Literal transcription as observed, kept separate from interpretation. "/" marks a line break, […] an illegible part. */
  transcription: z.string().max(200).optional(),
  /** How the transcription was made and what could not be read. */
  transcriptionNote: z.string().max(300).optional(),
  transcriptionCertainty: Certainty.optional(),
  interpretation: z.string().max(400).optional(),
  interpretationCertainty: Certainty.optional(),
  imageId: id("IMG").optional(),
});
export type Mark = z.infer<typeof Mark>;

export const ProvenanceEvent = z.object({
  label: z.string().min(3).max(240),
  fromYear: year.optional(),
  toYear: year.optional(),
  certainty: Certainty,
  evidence: z.array(SourceRef).default([]),
});
export type ProvenanceEvent = z.infer<typeof ProvenanceEvent>;

/**
 * A reference work held by another institution, shown with that institution's
 * open-access photograph (e.g. CC0) while the collection's own photography is
 * prepared. Never part of the MURANIQ collection and never offered for enquiry.
 */
export const ReferenceHolding = z.object({
  institution: z.string().min(2).max(120),
  accessionNumber: z.string().min(1).max(60),
  url: z.url(),
  licence: z.enum(["CC0"]),
  creditLine: z.string().max(240).optional(),
});
export type ReferenceHolding = z.infer<typeof ReferenceHolding>;

export const Artwork = z.object({
  id: id("MUR"),
  slug,
  title: z.string().min(2).max(160),
  category: CategorySlug,
  objectType: z.string().min(2).max(60),
  summary: z.string().min(10).max(300),
  description: z.array(z.string().min(1)).min(1),
  creators: z.array(CreatorCredit).default([]),
  glasshouseIds: z.array(id("GLH")).default([]),
  techniqueIds: z.array(id("TEC")).default([]),
  materials: z.array(z.string().min(2).max(60)).default([]),
  colours: z.array(z.string().min(2).max(30)).default([]),
  country: z.string().max(60).optional(),
  dating: Dating.optional(),
  dimensions: Dimensions.default({}),
  heroImageId: id("IMG"),
  imageIds: z.array(id("IMG")).min(1),
  marks: z.array(Mark).default([]),
  assertions: z.array(Assertion).default([]),
  provenance: z.array(ProvenanceEvent).default([]),
  condition: z.string().max(800).optional(),
  sourceIds: z.array(id("SRC")).default([]),
  relatedIds: z.array(id("MUR")).max(3).default([]),
  availability: Availability,
  status: PublicationStatus,
  featured: z.boolean().default(false),
  curatedOrder: z.number().int().default(1000),
  /** Visible "demonstration record" marking for local fixtures. */
  isFixture: z.boolean().default(false),
  /** Set only for reference works held by another institution. */
  reference: ReferenceHolding.optional(),
  seo: z.object({ title: z.string().max(70).optional(), description: z.string().max(170).optional() }).default({}),
  updatedAt: isoDate,
});
export type Artwork = z.infer<typeof Artwork>;

export const Creator = z.object({
  id: id("CRE"),
  slug,
  kind: z.enum(["person", "organisation"]),
  name: z.string().min(2).max(120),
  aliases: z.array(z.string()).default([]),
  lifeLabel: z.string().max(60).optional(),
  roles: z.array(CreatorRole).min(1),
  summary: z.string().max(300),
  biography: z.array(z.string()).default([]),
  biographyStatus: z.enum(["reviewed", "migrated_unreviewed", "pending_migration", "reference_only"]),
  sourceIds: z.array(id("SRC")).default([]),
  legacyPath: z.string().startsWith("/").optional(),
  isFixture: z.boolean().default(false),
  /** Signatures & Marks on the profile, in the editor's order. */
  signatureRefIds: z.array(id("SIG")).default([]),
  /** The editor's choice for the compact block by the introduction; must be one of signatureRefIds. */
  primarySignatureId: id("SIG").optional(),
  status: PublicationStatus,
});
export type Creator = z.infer<typeof Creator>;

export const Glasshouse = z.object({
  id: id("GLH"),
  slug,
  name: z.string().min(2).max(120),
  location: z.string().max(120).optional(),
  activeLabel: z.string().max(80).optional(),
  summary: z.string().max(400),
  creatorIds: z.array(id("CRE")).default([]),
  status: PublicationStatus,
});
export type Glasshouse = z.infer<typeof Glasshouse>;

export const Technique = z.object({
  id: id("TEC"),
  slug,
  term: z.string().min(2).max(80),
  synonyms: z.array(z.string()).default([]),
  summary: z.string().min(10).max(300),
  body: z.array(z.string()).min(1),
  recognition: z.array(z.string()).default([]),
  sourceIds: z.array(id("SRC")).default([]),
  editorialStatus: z.enum(["reviewed", "draft_unsourced"]),
  status: PublicationStatus,
});
export type Technique = z.infer<typeof Technique>;

export const Source = z.object({
  id: id("SRC"),
  type: z.enum(["catalogue", "book", "museum", "archive", "auction", "manufacturer", "observation", "other"]),
  title: z.string().min(2).max(240),
  author: z.string().max(160).optional(),
  publisher: z.string().max(160).optional(),
  year: z.string().max(20).optional(),
  url: z.url().optional(),
  rightsNote: z.string().max(240).optional(),
  reliabilityNote: z.string().max(400).optional(),
  isFixture: z.boolean().default(false),
});
export type Source = z.infer<typeof Source>;

export const Redirect = z.object({
  from: z.string().startsWith("/"),
  to: z.string().startsWith("/"),
  reason: z.string().min(3),
  checkedOn: isoDate.optional(),
  /** Only active redirects are emitted; activation is a migration (G6) decision. */
  active: z.boolean(),
});
export type Redirect = z.infer<typeof Redirect>;

/* ------------------------------------------------------------------ */
/* Signature references                                                */
/* ------------------------------------------------------------------ */

/** What a mark is, in plain words on the site. Never inferred from how it was applied. */
export const MARK_KINDS = ["personal_signature", "factory_mark", "label", "inscription"] as const;
export const MarkKind = z.enum(MARK_KINDS);
export type MarkKind = z.infer<typeof MarkKind>;

/** A creator named on the documented object, in a separate role (designer ≠ executing master ≠ glasshouse). */
export const DocumentedCreator = z.object({
  name: z.string().min(2).max(120),
  creatorId: id("CRE").optional(),
  role: CreatorRole,
  certainty: Certainty,
});
export type DocumentedCreator = z.infer<typeof DocumentedCreator>;

/** An object held elsewhere (museum, archive, auction). Never a MURANIQ collection record. */
export const ExternalObject = z.object({
  kind: z.enum(["museum", "archive", "auction", "other"]),
  title: z.string().min(2).max(160),
  institution: z.string().min(2).max(160),
  /** Accession, inventory or lot number. */
  identifier: z.string().min(1).max(80),
  url: z.url(),
  dateLabel: z.string().max(80).optional(),
  creators: z.array(DocumentedCreator).default([]),
});
export type ExternalObject = z.infer<typeof ExternalObject>;

export const SignatureReference = z
  .object({
    id: id("SIG"),
    /** Short title, e.g. "Inscription cane, 1847". */
    title: z.string().min(3).max(120),
    sortOrder: z.number().int().default(100),
    /** Groups photographs of the same variant (same wording, technique and period). */
    variantGroup: z.string().max(60).optional(),
    kind: MarkKind,
    application: MarkApplication,
    /**
     * Observation recorded on a collection object's mark. When set, the
     * transcription and interpretation are read from that mark and must not
     * be repeated here.
     */
    markRef: z.object({ artworkId: id("MUR"), markId: id("MRK") }).optional(),
    /** Observation for marks on objects held elsewhere. */
    observation: z
      .object({
        transcription: z.string().min(1).max(200),
        transcriptionNote: z.string().max(300).optional(),
        location: z.string().max(120),
        /** Read from a photograph by MURANIQ, or quoted from the cited source. */
        transcribedFrom: z.enum(["photograph", "source"]),
        transcriptionCertainty: Certainty,
      })
      .optional(),
    interpretation: z.object({ reading: z.string().min(3).max(400), certainty: Certainty }).optional(),
    /** Whose mark it is: the person who signed, or the firm whose mark or label it is. */
    markOf: z.object({ creatorId: id("CRE"), role: CreatorRole, certainty: Certainty }).optional(),
    /** Date of this example (usually the source object's date) and where that date comes from. */
    dating: Dating.and(z.object({ sourceId: id("SRC").optional() })).optional(),
    /** Documented period of use of this variant. Never derived from a single dated object. */
    variantPeriod: z
      .object({
        displayLabel: z.string().min(1).max(80),
        fromYear: year.optional(),
        toYear: year.optional(),
        certainty: Certainty,
        evidence: z.array(SourceRef).min(1, "a period of use needs its own source"),
      })
      .optional(),
    /** The documented object: a collection record, an object held elsewhere, or both (a reference work). */
    object: z
      .object({ artworkId: id("MUR").optional(), external: ExternalObject.optional() })
      .refine((o) => o.artworkId || o.external, { message: "link the documented object" }),
    /** Close-up of the mark (signature/label/detail view). */
    detailImageId: id("IMG").optional(),
    /** Further views: the whole base, the whole object. */
    contextImageIds: z.array(id("IMG")).max(4).default([]),
    evidence: z.array(SourceRef).min(1, "a reference needs at least one source"),
    reviewedOn: isoDate.optional(),
    /** INTERNAL editorial note. Never published. */
    internalNote: z.string().max(800).optional(),
    status: PublicationStatus,
    updatedAt: isoDate,
  })
  .superRefine((r, ctx) => {
    if (r.markRef && (r.observation || r.interpretation))
      ctx.addIssue({
        code: "custom",
        message: "the observation lives on the linked mark; do not repeat it on the reference",
      });
    if (!r.markRef && !r.observation)
      ctx.addIssue({ code: "custom", message: "record the observation, or link the mark on a collection object" });
    if (r.markRef && r.object.artworkId && r.markRef.artworkId !== r.object.artworkId)
      ctx.addIssue({ code: "custom", message: "the linked mark must be on the documented object" });
    if (r.kind !== "inscription" && !r.markOf)
      ctx.addIssue({ code: "custom", message: "say whose signature, mark or label this is (markOf)" });
    if (r.variantPeriod?.fromYear && r.variantPeriod.toYear && r.variantPeriod.fromYear > r.variantPeriod.toYear)
      ctx.addIssue({ code: "custom", message: "variant period: fromYear must not be after toYear" });
    if (r.status === "published" && !r.reviewedOn)
      ctx.addIssue({ code: "custom", message: "a published reference needs an editorial review date" });
  });
export type SignatureReference = z.infer<typeof SignatureReference>;

export const Dataset = z.object({
  artworks: z.array(Artwork),
  creators: z.array(Creator),
  glasshouses: z.array(Glasshouse),
  techniques: z.array(Technique),
  sources: z.array(Source),
  media: z.array(MediaAsset),
  signatureReferences: z.array(SignatureReference).default([]),
  redirects: z.array(Redirect).default([]),
});
export type Dataset = z.infer<typeof Dataset>;
export type DatasetInput = z.input<typeof Dataset>;
