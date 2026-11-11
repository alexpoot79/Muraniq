/**
 * Publication boundary.
 *
 * Every value that leaves the server passes through one of these functions.
 * They copy an explicit allowlist of fields; nothing is spread from the source
 * record, so an unexpected field (e.g. an internal note that slipped into a
 * dataset) can never reach HTML, the RSC payload, metadata, the sitemap or the
 * search index. Only `published` records are projected.
 */
import type { Artwork, Creator, Glasshouse, MediaAsset, SignatureReference, Source, Technique } from "./schemas";

export type PublicMedia = Pick<
  MediaAsset,
  | "id"
  | "viewType"
  | "src"
  | "width"
  | "height"
  | "alt"
  | "caption"
  | "credit"
  | "focalPoint"
  | "hotspots"
  | "licence"
  | "sourceUrl"
  | "cropOf"
> & { isPlaceholder: boolean };

export function projectMedia(m: MediaAsset): PublicMedia {
  return {
    id: m.id,
    viewType: m.viewType,
    src: m.src,
    width: m.width,
    height: m.height,
    alt: m.alt,
    caption: m.caption,
    credit: m.credit,
    focalPoint: m.focalPoint ? { x: m.focalPoint.x, y: m.focalPoint.y } : undefined,
    hotspots: m.hotspots.map((h) => ({ x: h.x, y: h.y, label: h.label, description: h.description })),
    licence: m.licence,
    sourceUrl: m.sourceUrl,
    cropOf: m.cropOf
      ? { imageId: m.cropOf.imageId, region: { x: m.cropOf.region.x, y: m.cropOf.region.y, w: m.cropOf.region.w, h: m.cropOf.region.h } }
      : undefined,
    isPlaceholder: m.rights === "placeholder",
  };
}

export type PublicArtworkRecord = Pick<
  Artwork,
  | "id"
  | "slug"
  | "title"
  | "category"
  | "objectType"
  | "summary"
  | "description"
  | "creators"
  | "glasshouseIds"
  | "techniqueIds"
  | "materials"
  | "colours"
  | "country"
  | "dating"
  | "dimensions"
  | "heroImageId"
  | "imageIds"
  | "marks"
  | "assertions"
  | "provenance"
  | "condition"
  | "sourceIds"
  | "relatedIds"
  | "availability"
  | "featured"
  | "curatedOrder"
  | "isFixture"
  | "reference"
  | "seo"
  | "updatedAt"
>;

export function projectArtwork(a: Artwork): PublicArtworkRecord | null {
  if (a.status !== "published") return null;
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    category: a.category,
    objectType: a.objectType,
    summary: a.summary,
    description: [...a.description],
    creators: a.creators.map((c) => ({ creatorId: c.creatorId, role: c.role, certainty: c.certainty })),
    glasshouseIds: [...a.glasshouseIds],
    techniqueIds: [...a.techniqueIds],
    materials: [...a.materials],
    colours: [...a.colours],
    country: a.country,
    dating: a.dating
      ? {
          fromYear: a.dating.fromYear,
          toYear: a.dating.toYear,
          displayLabel: a.dating.displayLabel,
          certainty: a.dating.certainty,
        }
      : undefined,
    dimensions: {
      heightMm: a.dimensions.heightMm,
      widthMm: a.dimensions.widthMm,
      depthMm: a.dimensions.depthMm,
      diameterMm: a.dimensions.diameterMm,
      weightG: a.dimensions.weightG,
    },
    heroImageId: a.heroImageId,
    imageIds: [...a.imageIds],
    marks: a.marks.map((m) => ({
      id: m.id,
      kind: m.kind,
      application: m.application,
      location: m.location,
      observation: m.observation,
      transcription: m.transcription,
      transcriptionNote: m.transcriptionNote,
      transcriptionCertainty: m.transcriptionCertainty,
      interpretation: m.interpretation,
      interpretationCertainty: m.interpretationCertainty,
      imageId: m.imageId,
    })),
    assertions: a.assertions.map((x) => ({
      field: x.field,
      statement: x.statement,
      certainty: x.certainty,
      evidence: x.evidence.map((e) => ({ sourceId: e.sourceId, locator: e.locator })),
      publicNote: x.publicNote,
      reviewedOn: x.reviewedOn,
    })),
    provenance: a.provenance.map((p) => ({
      label: p.label,
      fromYear: p.fromYear,
      toYear: p.toYear,
      certainty: p.certainty,
      evidence: p.evidence.map((e) => ({ sourceId: e.sourceId, locator: e.locator })),
    })),
    condition: a.condition,
    sourceIds: [...a.sourceIds],
    relatedIds: [...a.relatedIds],
    availability: a.availability,
    featured: a.featured,
    curatedOrder: a.curatedOrder,
    isFixture: a.isFixture,
    reference: a.reference
      ? {
          institution: a.reference.institution,
          accessionNumber: a.reference.accessionNumber,
          url: a.reference.url,
          licence: a.reference.licence,
          creditLine: a.reference.creditLine,
        }
      : undefined,
    seo: { title: a.seo.title, description: a.seo.description },
    updatedAt: a.updatedAt,
  };
}

export type PublicCreator = Omit<Creator, "status">;
export function projectCreator(c: Creator): PublicCreator | null {
  if (c.status !== "published") return null;
  return {
    id: c.id,
    slug: c.slug,
    kind: c.kind,
    name: c.name,
    aliases: [...c.aliases],
    lifeLabel: c.lifeLabel,
    roles: [...c.roles],
    summary: c.summary,
    biography: [...c.biography],
    biographyStatus: c.biographyStatus,
    sourceIds: [...c.sourceIds],
    legacyPath: c.legacyPath,
    isFixture: c.isFixture,
    signatureRefIds: [...c.signatureRefIds],
    primarySignatureId: c.primarySignatureId,
  };
}

export type PublicGlasshouse = Omit<Glasshouse, "status">;
export function projectGlasshouse(g: Glasshouse): PublicGlasshouse | null {
  if (g.status !== "published") return null;
  return {
    id: g.id,
    slug: g.slug,
    name: g.name,
    location: g.location,
    activeLabel: g.activeLabel,
    summary: g.summary,
    creatorIds: [...g.creatorIds],
  };
}

export type PublicTechnique = Omit<Technique, "status">;
export function projectTechnique(t: Technique): PublicTechnique | null {
  if (t.status !== "published") return null;
  return {
    id: t.id,
    slug: t.slug,
    term: t.term,
    synonyms: [...t.synonyms],
    summary: t.summary,
    body: [...t.body],
    recognition: [...t.recognition],
    sourceIds: [...t.sourceIds],
    editorialStatus: t.editorialStatus,
  };
}

export type PublicSource = Source;
export function projectSource(s: Source): PublicSource {
  return {
    id: s.id,
    type: s.type,
    title: s.title,
    author: s.author,
    publisher: s.publisher,
    year: s.year,
    url: s.url,
    rightsNote: s.rightsNote,
    reliabilityNote: s.reliabilityNote,
    isFixture: s.isFixture,
  };
}

/** Public fields of a signature reference. The internal note never leaves the server. */
export type PublicSignatureReference = Omit<SignatureReference, "internalNote" | "status">;
export function projectSignatureReference(r: SignatureReference): PublicSignatureReference | null {
  if (r.status !== "published") return null;
  const refs = (list: SignatureReference["evidence"]) =>
    list.map((e) => ({ sourceId: e.sourceId, locator: e.locator, consultedOn: e.consultedOn, note: e.note }));
  return {
    id: r.id,
    title: r.title,
    sortOrder: r.sortOrder,
    variantGroup: r.variantGroup,
    kind: r.kind,
    application: r.application,
    markRef: r.markRef ? { artworkId: r.markRef.artworkId, markId: r.markRef.markId } : undefined,
    observation: r.observation
      ? {
          transcription: r.observation.transcription,
          transcriptionNote: r.observation.transcriptionNote,
          location: r.observation.location,
          transcribedFrom: r.observation.transcribedFrom,
          transcriptionCertainty: r.observation.transcriptionCertainty,
        }
      : undefined,
    interpretation: r.interpretation ? { reading: r.interpretation.reading, certainty: r.interpretation.certainty } : undefined,
    markOf: r.markOf ? { creatorId: r.markOf.creatorId, role: r.markOf.role, certainty: r.markOf.certainty } : undefined,
    dating: r.dating
      ? {
          fromYear: r.dating.fromYear,
          toYear: r.dating.toYear,
          displayLabel: r.dating.displayLabel,
          certainty: r.dating.certainty,
          sourceId: r.dating.sourceId,
        }
      : undefined,
    variantPeriod: r.variantPeriod
      ? {
          displayLabel: r.variantPeriod.displayLabel,
          fromYear: r.variantPeriod.fromYear,
          toYear: r.variantPeriod.toYear,
          certainty: r.variantPeriod.certainty,
          evidence: refs(r.variantPeriod.evidence),
        }
      : undefined,
    object: {
      artworkId: r.object.artworkId,
      external: r.object.external
        ? {
            kind: r.object.external.kind,
            title: r.object.external.title,
            institution: r.object.external.institution,
            identifier: r.object.external.identifier,
            url: r.object.external.url,
            dateLabel: r.object.external.dateLabel,
            creators: r.object.external.creators.map((c) => ({
              name: c.name,
              creatorId: c.creatorId,
              role: c.role,
              certainty: c.certainty,
            })),
          }
        : undefined,
    },
    detailImageId: r.detailImageId,
    contextImageIds: [...r.contextImageIds],
    evidence: refs(r.evidence),
    reviewedOn: r.reviewedOn,
    updatedAt: r.updatedAt,
  };
}
