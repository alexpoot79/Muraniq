/**
 * Publication boundary.
 *
 * Every value that leaves the server passes through one of these functions.
 * They copy an explicit allowlist of fields; nothing is spread from the source
 * record, so an unexpected field (e.g. an internal note that slipped into a
 * dataset) can never reach HTML, the RSC payload, metadata, the sitemap or the
 * search index. Only `published` records are projected.
 */
import type { Artwork, Creator, Glasshouse, MediaAsset, Source, Technique } from "./schemas";

export type PublicMedia = Pick<
  MediaAsset,
  "id" | "viewType" | "src" | "width" | "height" | "alt" | "caption" | "credit" | "focalPoint" | "hotspots"
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
      kind: m.kind,
      location: m.location,
      observation: m.observation,
      transcription: m.transcription,
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
