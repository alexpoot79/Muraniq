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
  "studio-glass",
  "fine-art",
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

export const VIEW_TYPES = ["front", "reverse", "side", "base", "signature", "label", "detail", "context"] as const;
export const ViewType = z.enum(VIEW_TYPES);
export type ViewType = z.infer<typeof ViewType>;

export const RIGHTS_STATUS = ["owned", "licensed", "permission", "unknown", "placeholder"] as const;
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
});
export type MediaAsset = z.infer<typeof MediaAsset>;

export const Mark = z.object({
  kind: z.enum(["signature", "label", "pontil", "engraving", "stamp", "other"]),
  location: z.string().max(120),
  observation: z.string().max(400),
  /** Literal transcription as observed, kept separate from interpretation. */
  transcription: z.string().max(200).optional(),
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
  biographyStatus: z.enum(["reviewed", "migrated_unreviewed", "pending_migration"]),
  sourceIds: z.array(id("SRC")).default([]),
  legacyPath: z.string().startsWith("/").optional(),
  isFixture: z.boolean().default(false),
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

export const Dataset = z.object({
  artworks: z.array(Artwork),
  creators: z.array(Creator),
  glasshouses: z.array(Glasshouse),
  techniques: z.array(Technique),
  sources: z.array(Source),
  media: z.array(MediaAsset),
  redirects: z.array(Redirect).default([]),
});
export type Dataset = z.infer<typeof Dataset>;
export type DatasetInput = z.input<typeof Dataset>;
