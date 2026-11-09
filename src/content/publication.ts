/**
 * Pure transformation from a validated dataset to the public publication
 * snapshot. No framework imports: unit-testable and reused by the repository.
 */
import type { CategorySlug, Certainty, CreatorRole, Dataset } from "./schemas";
import {
  projectArtwork,
  projectCreator,
  projectMedia,
  projectSource,
  projectTechnique,
  type PublicArtworkRecord,
  type PublicCreator,
  type PublicMedia,
  type PublicSource,
  type PublicTechnique,
} from "./public-projection";
import { attributionPhrase } from "@/features/artworks/attribution";
import { publicationBlockers } from "./validate";

export type CreatorLink = {
  id: string;
  slug: string;
  name: string;
  role: CreatorRole;
  certainty: Certainty;
  isFixture: boolean;
};

export type ArtworkSummary = {
  id: string;
  slug: string;
  title: string;
  category: CategorySlug;
  objectType: string;
  attributionLine: string;
  attributionCertainty: Certainty;
  datingLabel: string | null;
  hero: PublicMedia;
  availability: PublicArtworkRecord["availability"];
  isFixture: boolean;
  /** Set when the object is a reference work held by another institution. */
  heldBy: { institution: string; accessionNumber: string } | null;
  featured: boolean;
  curatedOrder: number;
  makerSlugs: string[];
  techniqueSlugs: string[];
  colours: string[];
  materials: string[];
  fromYear: number | null;
  toYear: number | null;
  /** Lower-cased, accent-folded search fields (server-side only). */
  search: { title: string; makers: string; aliases: string; techniques: string; text: string };
};

export type ArtworkDossier = PublicArtworkRecord & {
  creatorLinks: CreatorLink[];
  techniques: Array<Pick<PublicTechnique, "id" | "slug" | "term" | "summary">>;
  media: PublicMedia[];
  hero: PublicMedia;
  sources: PublicSource[];
  related: ArtworkSummary[];
  attributionLine: string;
  attributionCertainty: Certainty;
};

export type PreviewNote = {
  /** Workflow status of the unpublished record shown in preview. */
  status: "draft" | "in_review";
  /** Reasons this record could not be published yet (same rules as the server). */
  blockers: string[];
};

export type Publication = {
  /** Only filled in draft preview: unpublished records keyed by slug. */
  previewNotes: Record<string, PreviewNote>;
  artworks: ArtworkSummary[];
  dossiers: Record<string, ArtworkDossier>;
  creators: Array<PublicCreator & { artworkIds: string[] }>;
  techniques: Array<PublicTechnique & { artworkIds: string[] }>;
  sources: PublicSource[];
  redirects: Dataset["redirects"];
};

export function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

const CERTAINTY_RANK: Record<Certainty, number> = {
  verified: 0,
  documented_attribution: 1,
  probable: 2,
  hypothesis: 3,
  unknown: 4,
};

/**
 * In draft preview, records that are `draft` or `in_review` are shown as if
 * published so editors can review them; `withdrawn` records stay hidden and
 * the media rules are unchanged (only rights-cleared images are ever used).
 */
function asPreview<T extends { status: string }>(record: T): T {
  return record.status === "draft" || record.status === "in_review" ? { ...record, status: "published" } : record;
}

export function buildPublication(input: Dataset, opts: { preview?: boolean } = {}): Publication {
  const preview = opts.preview === true;
  const data: Dataset = preview
    ? {
        ...input,
        artworks: input.artworks.map(asPreview),
        creators: input.creators.map(asPreview),
        glasshouses: input.glasshouses.map(asPreview),
        techniques: input.techniques.map(asPreview),
      }
    : input;
  const previewNotes: Record<string, PreviewNote> = {};
  if (preview) {
    const mediaIndex = new Map(input.media.map((m) => [m.id, m] as const));
    for (const a of input.artworks) {
      if (a.status === "draft" || a.status === "in_review") {
        previewNotes[a.slug] = { status: a.status, blockers: publicationBlockers(a, { media: mediaIndex }) };
      }
    }
  }

  const creators = new Map(
    data.creators.map((c) => [c.id, projectCreator(c)] as const).filter((e): e is [string, PublicCreator] => !!e[1]),
  );
  const techniques = new Map(
    data.techniques
      .map((t) => [t.id, projectTechnique(t)] as const)
      .filter((e): e is [string, PublicTechnique] => !!e[1]),
  );
  const media = new Map(data.media.filter((m) => m.rightsCleared).map((m) => [m.id, projectMedia(m)]));
  const sources = new Map(data.sources.map((s) => [s.id, projectSource(s)]));

  const records = data.artworks
    .map(projectArtwork)
    .filter((a): a is PublicArtworkRecord => a !== null)
    .filter((a) => media.has(a.heroImageId));

  const linksFor = (a: PublicArtworkRecord): CreatorLink[] =>
    a.creators
      .map((c) => {
        const cr = creators.get(c.creatorId);
        return cr
          ? { id: cr.id, slug: cr.slug, name: cr.name, role: c.role, certainty: c.certainty, isFixture: cr.isFixture }
          : null;
      })
      .filter((x): x is CreatorLink => x !== null)
      .sort((x, y) => CERTAINTY_RANK[x.certainty] - CERTAINTY_RANK[y.certainty]);

  const attributionOf = (links: CreatorLink[]): { line: string; certainty: Certainty } => {
    const lead = links[0];
    if (!lead) return { line: attributionPhrase("", "unknown"), certainty: "unknown" };
    return { line: attributionPhrase(lead.name, lead.certainty), certainty: lead.certainty };
  };

  const summaries = new Map<string, ArtworkSummary>();
  for (const a of records) {
    const links = linksFor(a);
    const att = attributionOf(links);
    const techs = a.techniqueIds.map((id) => techniques.get(id)).filter((t): t is PublicTechnique => !!t);
    summaries.set(a.id, {
      id: a.id,
      slug: a.slug,
      title: a.title,
      category: a.category,
      objectType: a.objectType,
      attributionLine: att.line,
      attributionCertainty: att.certainty,
      datingLabel: a.dating?.displayLabel ?? null,
      hero: media.get(a.heroImageId)!,
      availability: a.availability,
      isFixture: a.isFixture,
      heldBy: a.reference ? { institution: a.reference.institution, accessionNumber: a.reference.accessionNumber } : null,
      featured: a.featured,
      curatedOrder: a.curatedOrder,
      makerSlugs: links.map((l) => l.slug),
      techniqueSlugs: techs.map((t) => t.slug),
      colours: a.colours,
      materials: a.materials,
      fromYear: a.dating?.fromYear ?? null,
      toYear: a.dating?.toYear ?? null,
      search: {
        title: fold(a.title),
        makers: fold(links.map((l) => l.name).join(" ")),
        aliases: fold(
          links.flatMap((l) => creators.get(l.id)?.aliases ?? []).join(" ") +
            " " +
            techs.flatMap((t) => t.synonyms).join(" "),
        ),
        techniques: fold(techs.map((t) => t.term).join(" ")),
        text: fold([a.objectType, a.summary, ...a.materials, ...a.colours, a.country ?? ""].join(" ")),
      },
    });
  }

  const artworks = [...summaries.values()].sort(
    (x, y) => x.curatedOrder - y.curatedOrder || x.id.localeCompare(y.id),
  );

  const dossiers: Record<string, ArtworkDossier> = {};
  for (const a of records) {
    const s = summaries.get(a.id)!;
    const sourceIds = new Set([
      ...a.sourceIds,
      ...a.assertions.flatMap((x) => x.evidence.map((e) => e.sourceId)),
      ...a.provenance.flatMap((x) => x.evidence.map((e) => e.sourceId)),
    ]);
    dossiers[a.slug] = {
      ...a,
      creatorLinks: linksFor(a),
      techniques: a.techniqueIds
        .map((id) => techniques.get(id))
        .filter((t): t is PublicTechnique => !!t)
        .map((t) => ({ id: t.id, slug: t.slug, term: t.term, summary: t.summary })),
      media: a.imageIds.map((id) => media.get(id)).filter((m): m is PublicMedia => !!m),
      hero: s.hero,
      sources: [...sourceIds].map((id) => sources.get(id)).filter((x): x is PublicSource => !!x),
      related: a.relatedIds
        .map((id) => summaries.get(id))
        .filter((x): x is ArtworkSummary => !!x)
        .slice(0, 3),
      attributionLine: s.attributionLine,
      attributionCertainty: s.attributionCertainty,
    };
  }

  return {
    previewNotes,
    artworks,
    dossiers,
    creators: [...creators.values()]
      .map((c) => ({ ...c, artworkIds: artworks.filter((a) => a.makerSlugs.includes(c.slug)).map((a) => a.id) }))
      .sort((x, y) => x.name.localeCompare(y.name)),
    techniques: [...techniques.values()]
      .map((t) => ({ ...t, artworkIds: artworks.filter((a) => a.techniqueSlugs.includes(t.slug)).map((a) => a.id) }))
      .sort((x, y) => x.term.localeCompare(y.term)),
    sources: [...sources.values()],
    redirects: data.redirects,
  };
}
