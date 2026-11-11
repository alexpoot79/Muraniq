/**
 * Recognition-ready export of signature references (internal tooling, never a
 * public route). It lists stable ids, transcriptions, variants, documented
 * objects, image ids, crop links and rights, so that a later recognition
 * database can be fed without re-entering anything.
 *
 * It does not recognise, score or authenticate anything. Internal notes and
 * rights evidence are never included. Whether an image may be used for
 * recognition is recorded separately from web publication (`recognitionUse`)
 * and an image counts as usable only when both allow it.
 */
import type { Certainty, Dataset, MediaAsset, SignatureReference } from "./schemas";
import { signaturePhotoBlockers } from "./validate";

export const EXPORT_SCHEMA = "muraniq.signature-references/1";

export type ExportedImage = {
  id: string;
  role: "detail" | "context";
  viewType: MediaAsset["viewType"];
  file: string;
  width: number;
  height: number;
  /** A detail cut from another photograph: the original's id and the area (0–1) it was cut from. */
  cropOf: { imageId: string; region: { x: number; y: number; w: number; h: number } } | null;
  credit: string | null;
  licence: string | null;
  sourceUrl: string | null;
  rights: MediaAsset["rights"];
  webPublication: { allowed: boolean; blockers: string[] };
  recognitionUse: MediaAsset["recognitionUse"];
  licenceExpiresOn: string | null;
  /** Web publication and recognition use both allowed, today. */
  usableForRecognition: boolean;
};

export type ExportedReference = {
  id: string;
  title: string;
  status: SignatureReference["status"];
  kind: SignatureReference["kind"];
  application: SignatureReference["application"];
  variantGroup: string | null;
  sortOrder: number;
  transcription: {
    text: string;
    /** "/" in the literal transcription marks a line break. */
    lines: string[];
    note: string | null;
    location: string | null;
    readFrom: "photograph" | "source" | "object_record";
    certainty: Certainty | null;
  } | null;
  interpretation: { reading: string; certainty: Certainty } | null;
  markOf: { creatorId: string; role: string; certainty: Certainty } | null;
  dating: { label: string; fromYear: number | null; toYear: number | null; certainty: Certainty; sourceId: string | null } | null;
  variantPeriod: { label: string; fromYear: number | null; toYear: number | null; certainty: Certainty; sourceIds: string[] } | null;
  object: {
    collectionId: string | null;
    markId: string | null;
    /** True for MURANIQ's demonstration reference works; never a real collection object. */
    demonstrationFixture: boolean;
    heldElsewhere: { kind: string; institution: string; identifier: string; url: string } | null;
    creators: { creatorId: string | null; name: string | null; role: string; certainty: Certainty }[];
  };
  images: ExportedImage[];
  evidence: { sourceId: string; locator: string | null; consultedOn: string | null }[];
  reviewedOn: string | null;
};

export type SignatureExport = {
  schema: typeof EXPORT_SCHEMA;
  generatedOn: string;
  scope: "published" | "all";
  references: ExportedReference[];
  summary: { references: number; withPublishedPhoto: number; imagesUsableForRecognition: number };
};

const lines = (t: string) => t.split(/\s*\/\s*/).filter(Boolean);

export function exportSignatures(
  data: Dataset,
  { today, scope = "published" }: { today: string; scope?: "published" | "all" },
): SignatureExport {
  const media = new Map(data.media.map((m) => [m.id, m] as const));
  const artworks = new Map(data.artworks.map((a) => [a.id, a] as const));

  const references = data.signatureReferences
    .filter((r) => scope === "all" || r.status === "published")
    .toSorted((a, b) => a.id.localeCompare(b.id))
    .map((r): ExportedReference => {
      const art = r.object.artworkId ? artworks.get(r.object.artworkId) : undefined;
      const mark = r.markRef ? art?.marks.find((m) => m.id === r.markRef!.markId) : undefined;
      const text = mark?.transcription ?? r.observation?.transcription;
      const external = r.object.external;
      const heldElsewhere = external
        ? { kind: external.kind, institution: external.institution, identifier: external.identifier, url: external.url }
        : art?.reference
          ? { kind: "museum", institution: art.reference.institution, identifier: art.reference.accessionNumber, url: art.reference.url }
          : null;

      const image = (id: string, role: ExportedImage["role"]): ExportedImage | null => {
        const m = media.get(id);
        if (!m) return null;
        const blockers = signaturePhotoBlockers(r, m, today);
        const web = blockers.length === 0 && r.status === "published";
        return {
          id: m.id,
          role,
          viewType: m.viewType,
          file: m.src,
          width: m.width,
          height: m.height,
          cropOf: m.cropOf ?? null,
          credit: m.credit ?? null,
          licence: m.licence ?? null,
          sourceUrl: m.sourceUrl ?? null,
          rights: m.rights,
          webPublication: { allowed: web, blockers: r.status === "published" ? blockers : [...blockers, "the reference is not published"] },
          recognitionUse: m.recognitionUse,
          licenceExpiresOn: m.licenceExpiresOn ?? null,
          usableForRecognition: web && m.recognitionUse === "allowed",
        };
      };

      return {
        id: r.id,
        title: r.title,
        status: r.status,
        kind: r.kind,
        application: r.application,
        variantGroup: r.variantGroup ?? null,
        sortOrder: r.sortOrder,
        transcription: text
          ? {
              text,
              lines: lines(text),
              note: mark?.transcriptionNote ?? r.observation?.transcriptionNote ?? null,
              location: mark?.location ?? r.observation?.location ?? null,
              readFrom: mark ? "object_record" : (r.observation?.transcribedFrom ?? "source"),
              certainty: mark?.transcriptionCertainty ?? r.observation?.transcriptionCertainty ?? null,
            }
          : null,
        interpretation: mark
          ? mark.interpretation
            ? { reading: mark.interpretation, certainty: mark.interpretationCertainty ?? "hypothesis" }
            : null
          : (r.interpretation ?? null),
        markOf: r.markOf ?? null,
        dating: r.dating
          ? {
              label: r.dating.displayLabel,
              fromYear: r.dating.fromYear ?? null,
              toYear: r.dating.toYear ?? null,
              certainty: r.dating.certainty,
              sourceId: r.dating.sourceId ?? null,
            }
          : null,
        variantPeriod: r.variantPeriod
          ? {
              label: r.variantPeriod.displayLabel,
              fromYear: r.variantPeriod.fromYear ?? null,
              toYear: r.variantPeriod.toYear ?? null,
              certainty: r.variantPeriod.certainty,
              sourceIds: r.variantPeriod.evidence.map((e) => e.sourceId),
            }
          : null,
        object: {
          collectionId: r.object.artworkId ?? null,
          markId: r.markRef?.markId ?? null,
          demonstrationFixture: art?.isFixture ?? false,
          heldElsewhere,
          creators: art
            ? art.creators.map((c) => ({ creatorId: c.creatorId, name: null, role: c.role, certainty: c.certainty }))
            : (external?.creators ?? []).map((c) => ({ creatorId: c.creatorId ?? null, name: c.name, role: c.role, certainty: c.certainty })),
        },
        images: [
          ...(r.detailImageId ? [image(r.detailImageId, "detail")] : []),
          ...r.contextImageIds.map((id) => image(id, "context")),
        ].filter((x): x is ExportedImage => !!x),
        evidence: r.evidence.map((e) => ({ sourceId: e.sourceId, locator: e.locator ?? null, consultedOn: e.consultedOn ?? null })),
        reviewedOn: r.reviewedOn ?? null,
      };
    });

  return {
    schema: EXPORT_SCHEMA,
    generatedOn: today,
    scope,
    references,
    summary: {
      references: references.length,
      withPublishedPhoto: references.filter((r) => r.images.some((i) => i.role === "detail" && i.webPublication.allowed)).length,
      imagesUsableForRecognition: references.flatMap((r) => r.images).filter((i) => i.usableForRecognition).length,
    },
  };
}
