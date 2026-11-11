/**
 * Signatures & Marks: one public view of each signature reference, shared by
 * maker cards, the compact block on a maker profile, the full section, object
 * pages and (later) the combined index. Pure: no framework imports.
 *
 * Rules (covered by tests/unit/signatures.test.ts):
 * - Only `published` references are projected; a withdrawn reference
 *   disappears from every surface at once because every surface reads this.
 * - A photograph is shown only when it passes `signaturePhotoBlockers`; a
 *   reference without one stays a text reference with its source.
 * - A factory mark or label belongs to the firm (`markOf`). On another
 *   maker's profile it only appears as context of a documented work, and
 *   only when the object documents that maker firmly (verified or a cited
 *   attribution). It is never presented as that maker's signature.
 * - Uncertain readings keep their wording; they never count towards the
 *   maker-card thumbnail, the filter or the compact block.
 */
import type { Artwork, Certainty, CreatorRole, Dataset, MarkApplication, MarkKind } from "./schemas";
import {
  projectSignatureReference,
  type PublicCreator,
  type PublicMedia,
  type PublicSignatureReference,
  type PublicSource,
} from "./public-projection";
import { signaturePhotoBlockers } from "./validate";

/** Firm enough to name a maker without qualification in titles, filters and the compact block. */
export const FIRM: readonly Certainty[] = ["verified", "documented_attribution"];
const firm = (c: Certainty) => FIRM.includes(c);

export type SignaturePerson = {
  id: string | null;
  slug: string | null;
  name: string;
  kind: "person" | "organisation" | null;
  role: CreatorRole;
  certainty: Certainty;
};

export type SignatureSourceRef = {
  source: PublicSource;
  locator?: string;
  consultedOn?: string;
  note?: string;
};

export type SignatureView = {
  id: string;
  title: string;
  sortOrder: number;
  variantGroup: string | null;
  kind: MarkKind;
  application: MarkApplication;
  transcription: string | null;
  transcriptionNote: string | null;
  location: string | null;
  /** Who read the mark: MURANIQ from a photograph, the cited source, or the collection's object record. */
  transcribedFrom: "photograph" | "source" | "object_record";
  transcriptionCertainty: Certainty | null;
  interpretation: { reading: string; certainty: Certainty } | null;
  markOf: SignaturePerson | null;
  /** Date of this example (usually the object's date), with its own source. */
  dating: { label: string; certainty: Certainty; source: PublicSource | null } | null;
  /** Documented period of use of the variant. */
  variantPeriod: { label: string; certainty: Certainty; sources: SignatureSourceRef[] } | null;
  object: {
    title: string;
    /** On-site record (collection object or reference work). */
    href: string | null;
    /** True only for MURANIQ's own collection objects; reference works and external records are false. */
    inCollection: boolean;
    heldBy: { kind: string; institution: string; identifier: string; url: string } | null;
    dateLabel: string | null;
    creators: SignaturePerson[];
  };
  /** Present only when the photograph may be published. */
  photo: { detail: PublicMedia; views: PublicMedia[]; original: PublicMedia | null } | null;
  sources: SignatureSourceRef[];
  reviewedOn: string | null;
};

export type MakerSignature = SignatureView & {
  /** "own": this maker's signature, mark or label. "context": a mark on a documented work by this maker. */
  relation: "own" | "context";
  /** The role in which this maker is involved (own mark: markOf role; context: role on the object). */
  makerRole: CreatorRole | null;
  /** How firmly that involvement is documented. */
  makerCertainty: Certainty | null;
};

export type MakerSignatures = {
  items: MakerSignature[];
  /** For the compact block and the maker card; null hides both. */
  primary: MakerSignature | null;
};

type Inputs = {
  data: Dataset;
  creators: Map<string, PublicCreator>;
  media: Map<string, PublicMedia>;
  sources: Map<string, PublicSource>;
  /** Published artworks by id, with their on-site path. */
  artworks: Map<string, { record: Pick<Artwork, "title" | "creators" | "marks" | "reference" | "dating">; href: string }>;
  today: string;
};

export function buildSignatures({ data, creators, media, sources, artworks, today }: Inputs) {
  const allMedia = new Map(data.media.map((m) => [m.id, m] as const));
  const toRef = (e: { sourceId: string; locator?: string; consultedOn?: string; note?: string }): SignatureSourceRef | null => {
    const s = sources.get(e.sourceId);
    return s ? { source: s, locator: e.locator, consultedOn: e.consultedOn, note: e.note } : null;
  };
  const person = (creatorId: string | undefined, fallbackName: string, role: CreatorRole, certainty: Certainty): SignaturePerson => {
    const c = creatorId ? creators.get(creatorId) : undefined;
    return { id: c?.id ?? null, slug: c?.slug ?? null, name: c?.name ?? fallbackName, kind: c?.kind ?? null, role, certainty };
  };

  const views = new Map<string, SignatureView>();
  for (const raw of data.signatureReferences) {
    const r: PublicSignatureReference | null = projectSignatureReference(raw);
    if (!r) continue;
    // The firm or person whose mark this is must itself be public.
    if (r.markOf && !creators.has(r.markOf.creatorId)) continue;
    const art = r.object.artworkId ? artworks.get(r.object.artworkId) : undefined;
    // A reference tied to an unpublished collection object stays hidden with it.
    if (r.object.artworkId && !art && !r.object.external) continue;
    const mark = r.markRef ? art?.record.marks.find((m) => m.id === r.markRef!.markId) : undefined;
    if (r.markRef && !mark) continue;

    const detailSrc = r.detailImageId ? allMedia.get(r.detailImageId) : undefined;
    const photoOk = r.detailImageId && signaturePhotoBlockers(raw, detailSrc, today).length === 0 && media.has(r.detailImageId);
    const contextViews = r.contextImageIds
      .filter((id) => signaturePhotoBlockers(raw, allMedia.get(id), today).length === 0)
      .map((id) => media.get(id))
      .filter((m): m is PublicMedia => !!m);
    const detail = photoOk ? media.get(r.detailImageId!)! : null;
    const original = detail?.cropOf ? (media.get(detail.cropOf.imageId) ?? null) : null;

    const external = r.object.external;
    const objectCreators: SignaturePerson[] = art
      ? art.record.creators.map((c) => person(c.creatorId, c.creatorId, c.role, c.certainty))
      : (external?.creators ?? []).map((c) => person(c.creatorId, c.name, c.role, c.certainty));

    views.set(r.id, {
      id: r.id,
      title: r.title,
      sortOrder: r.sortOrder,
      variantGroup: r.variantGroup ?? null,
      kind: r.kind,
      application: r.application,
      transcription: mark?.transcription ?? r.observation?.transcription ?? null,
      transcriptionNote: mark?.transcriptionNote ?? r.observation?.transcriptionNote ?? null,
      location: mark?.location ?? r.observation?.location ?? null,
      transcribedFrom: mark ? "object_record" : (r.observation?.transcribedFrom ?? "source"),
      transcriptionCertainty: mark?.transcriptionCertainty ?? r.observation?.transcriptionCertainty ?? null,
      interpretation: mark
        ? mark.interpretation
          ? { reading: mark.interpretation, certainty: mark.interpretationCertainty ?? "hypothesis" }
          : null
        : (r.interpretation ?? null),
      markOf: r.markOf ? person(r.markOf.creatorId, r.markOf.creatorId, r.markOf.role, r.markOf.certainty) : null,
      dating: r.dating
        ? {
            label: r.dating.displayLabel,
            certainty: r.dating.certainty,
            source: r.dating.sourceId ? (sources.get(r.dating.sourceId) ?? null) : null,
          }
        : null,
      variantPeriod: r.variantPeriod
        ? {
            label: r.variantPeriod.displayLabel,
            certainty: r.variantPeriod.certainty,
            sources: r.variantPeriod.evidence.map(toRef).filter((x): x is SignatureSourceRef => !!x),
          }
        : null,
      object: {
        title: art?.record.title ?? external?.title ?? "Documented object",
        href: art?.href ?? null,
        inCollection: !!art && !art.record.reference,
        heldBy: external
          ? { kind: external.kind, institution: external.institution, identifier: external.identifier, url: external.url }
          : art?.record.reference
            ? {
                kind: "museum",
                institution: art.record.reference.institution,
                identifier: art.record.reference.accessionNumber,
                url: art.record.reference.url,
              }
            : null,
        dateLabel: art?.record.dating?.displayLabel ?? external?.dateLabel ?? null,
        creators: objectCreators,
      },
      photo: detail ? { detail, views: contextViews, original } : null,
      sources: r.evidence.map(toRef).filter((x): x is SignatureSourceRef => !!x),
      reviewedOn: r.reviewedOn ?? null,
    });
  }

  const byMaker = new Map<string, MakerSignatures>();
  for (const c of creators.values()) {
    const items: MakerSignature[] = [];
    for (const id of c.signatureRefIds) {
      const v = views.get(id);
      if (!v) continue;
      if (v.markOf?.id === c.id) {
        items.push({ ...v, relation: "own", makerRole: v.markOf.role, makerCertainty: v.markOf.certainty });
        continue;
      }
      // Context only when the object documents this maker firmly.
      const named = v.object.creators.find((p) => p.id === c.id && firm(p.certainty));
      if (named) items.push({ ...v, relation: "context", makerRole: named.role, makerCertainty: named.certainty });
    }
    const eligible = (s: MakerSignature) => {
      if (!s.photo) return false;
      if (s.relation === "own") return !!s.markOf && firm(s.markOf.certainty);
      // An inscription on a work this maker made may lead only when the editor chooses it.
      return s.kind === "inscription" && (s.makerRole === "maker" || s.makerRole === "artist");
    };
    const chosen = items.find((s) => s.id === c.primarySignatureId && eligible(s));
    const fallback = items.find((s) => s.relation === "own" && s.kind !== "inscription" && eligible(s));
    byMaker.set(c.id, { items, primary: chosen ?? fallback ?? null });
  }

  /** References that read an observation from a collection object's mark, keyed "artworkId/markId". */
  const byMark = new Map<string, SignatureView[]>();
  for (const raw of data.signatureReferences) {
    const v = views.get(raw.id);
    if (!v || !raw.markRef) continue;
    const key = `${raw.markRef.artworkId}/${raw.markRef.markId}`;
    byMark.set(key, [...(byMark.get(key) ?? []), v]);
  }

  return { views, byMaker, byMark };
}

/** Exported for the recognition-ready export: stable ids and relations, no presentation. */
export type SignatureIndex = ReturnType<typeof buildSignatures>;
