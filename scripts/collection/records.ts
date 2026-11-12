/**
 * From a sheet row (+ the photographs of this batch) to the publication
 * records: Artwork, MediaAsset[], Source[]. Pure: no file access.
 *
 * Merge rule on re-import: a filled cell wins; an empty cell keeps what the
 * record already has. Text the importer wrote itself (listed in `_generated`)
 * is rewritten from the current data unless the owner has written their own.
 * The slug is set once and never changes, so published URLs stay stable.
 */
import type { Certainty, CreatorRole, DatasetInput, ViewType } from "../../src/content/schemas/index.ts";
import { attributionPhrase } from "../../src/features/artworks/attribution.ts";
import {
  BASIS_CERTAINTY,
  BASIS_NOTE,
  altText,
  autoSummary,
  autoTitle,
  shortId,
  slugify,
  type IntakeRow,
  type Problem,
} from "./sheet.ts";

export type ArtworkRecord = NonNullable<DatasetInput["artworks"]>[number] & { _generated?: GeneratedField[] };
export type MediaRecord = NonNullable<DatasetInput["media"]>[number];
export type SourceRecord = NonNullable<DatasetInput["sources"]>[number];
export type GeneratedField = "title" | "summary" | "description";

/** The own-collection store (`fixtures/collection.json`). */
export type CollectionStore = {
  note?: string;
  artworks: ArtworkRecord[];
  media: MediaRecord[];
  sources: SourceRecord[];
};

export type TechniqueRef = { id: string; term: string; slug: string; synonyms?: string[] };
export type CreatorRef = { id: string; name: string; aliases?: string[]; kind: "person" | "organisation" };

/** A processed photograph, ready to publish. */
export type ProcessedPhoto = { view: ViewType; src: string; width: number; height: number };

export const PHOTO_CREDIT = "Photograph © MURANIQ";

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export function matchTechniques(names: string[], techniques: readonly TechniqueRef[]) {
  const ids: string[] = [];
  const unknown: string[] = [];
  for (const name of names) {
    const n = norm(name);
    const t = techniques.find(
      (x) => norm(x.term) === n || norm(x.slug) === n || norm(x.id) === n || (x.synonyms ?? []).some((s) => norm(s) === n),
    );
    if (t) {
      if (!ids.includes(t.id)) ids.push(t.id);
    } else unknown.push(name);
  }
  return { ids, unknown };
}

export function matchCreator(name: string, creators: readonly CreatorRef[]): CreatorRef | undefined {
  const n = norm(name);
  return creators.find((c) => norm(c.name) === n || (c.aliases ?? []).some((a) => norm(a) === n));
}

/** "Facet-cut glass" → "Facet-cut"; names that do not read as an adjective are left out of generated titles. */
export function techniqueAdjective(term: string | undefined): string | undefined {
  if (!term || / and /i.test(term)) return undefined;
  return term.replace(/\s+glass$/i, "");
}

export function mediaId(id: string, view: ViewType, n: number) {
  return `IMG-${shortId(id)}-${view.toUpperCase()}${n > 1 ? `-${n}` : ""}`;
}

export type BuildContext = {
  existing?: { artwork: ArtworkRecord; media: MediaRecord[]; sources: SourceRecord[] };
  photos?: ProcessedPhoto[];
  techniques: readonly TechniqueRef[];
  creators: readonly CreatorRef[];
  /** Slugs used by every other artwork in the dataset. */
  takenSlugs: ReadonlySet<string>;
  today: string;
};

export type BuildResult = {
  artwork?: ArtworkRecord;
  media: MediaRecord[];
  sources: SourceRecord[];
  /** Public paths of earlier photographs that this import replaces. */
  replacedSrcs: string[];
  problems: Problem[];
};

export function buildRecord(row: IntakeRow, ctx: BuildContext): BuildResult {
  const sid = shortId(row.id);
  const problems: Problem[] = [];
  const err = (message: string) => problems.push({ level: "error", id: sid, row: row.row, message });
  const warn = (message: string) => problems.push({ level: "warning", id: sid, row: row.row, message });
  const ex = ctx.existing?.artwork;
  const generated = new Set<GeneratedField>(ex?._generated ?? []);

  const category = row.category ?? ex?.category;
  const objectType = row.objectType ?? ex?.objectType;
  if (!category) err("Collectiegebied ontbreekt.");
  if (!objectType) err("Objectsoort ontbreekt.");
  if (!ex && !ctx.photos?.length) err("Geen foto's gevonden voor dit object in deze upload.");
  if (problems.some((p) => p.level === "error")) return { media: [], sources: [], replacedSrcs: [], problems };

  // Techniques
  let techniqueIds = ex?.techniqueIds ?? [];
  if (row.techniques.length) {
    const m = matchTechniques(row.techniques, ctx.techniques);
    techniqueIds = m.ids;
    for (const u of m.unknown)
      warn(`Techniek '${u}' heeft (nog) geen pagina in de Glass Guide en wordt niet getoond.`);
  }
  const firstTerm = ctx.techniques.find((t) => t.id === techniqueIds[0])?.term;
  const adjective = techniqueAdjective(firstTerm);

  const colours = row.colours.length ? row.colours : (ex?.colours ?? []);
  const words = { objectType, colours };

  // Title, slug, summary
  let title: string;
  if (row.title) {
    title = row.title;
    generated.delete("title");
  } else if (ex && !generated.has("title")) title = ex.title;
  else {
    title = autoTitle(words, adjective);
    generated.add("title");
  }
  let slug = ex?.slug;
  if (!slug) {
    slug = slugify(title) || slugify(sid);
    if (ctx.takenSlugs.has(slug)) slug = `${slug}-${sid.toLowerCase()}`;
  }
  let summary: string;
  if (ex && !generated.has("summary")) summary = ex.summary;
  else {
    summary = autoSummary(words, adjective);
    generated.add("summary");
  }

  // Attribution
  const keptAssertions = (ex?.assertions ?? []).filter((a) => a.field !== "creator");
  const ownSourcePrefix = `SRC-${sid}-`;
  let creators = ex?.creators ?? [];
  let creatorAssertion = (ex?.assertions ?? []).find((a) => a.field === "creator");
  let sources: SourceRecord[] = ctx.existing?.sources.filter((s) => s.id.startsWith(ownSourcePrefix)) ?? [];
  const touchedAttribution = row.maker !== undefined || row.basis !== undefined || !creatorAssertion;
  let certainty: Certainty = creatorAssertion?.certainty ?? "unknown";
  if (touchedAttribution) {
    const basis = row.maker ? (row.basis ?? "unknown") : "unknown";
    certainty = BASIS_CERTAINTY[basis];
    sources = [];
    if (basis === "documented" && row.sourceText) {
      sources = [{ id: `${ownSourcePrefix}1`, type: "other", title: row.sourceText, isFixture: false }];
    }
    creatorAssertion = {
      field: "creator",
      statement: certainty === "unknown" ? "Maker not documented" : attributionPhrase(row.maker!, certainty),
      certainty,
      evidence: sources.map((s) => ({ sourceId: s.id })),
      publicNote: BASIS_NOTE[basis],
    };
    creators = [];
    if (row.maker && certainty !== "unknown") {
      const c = matchCreator(row.maker, ctx.creators);
      if (c) {
        const role: CreatorRole = c.kind === "organisation" ? "glasshouse" : "maker";
        creators = [{ creatorId: c.id, role, certainty }];
      } else
        warn(`Maker '${row.maker}' heeft nog geen makerpagina; de toeschrijving staat bij het object, zonder link.`);
    }
  }
  const sourceIds = [...(ex?.sourceIds ?? []).filter((s) => !s.startsWith(ownSourcePrefix)), ...sources.map((s) => s.id)];

  // Dating
  let dating = ex?.dating;
  if (row.period) {
    dating = {
      displayLabel: row.period.displayLabel,
      ...(row.period.fromYear ? { fromYear: row.period.fromYear } : {}),
      ...(row.period.toYear ? { toYear: row.period.toYear } : {}),
      certainty: certainty === "unknown" ? "probable" : certainty,
    };
  }

  // Description
  let description: string[];
  if (row.description?.length) {
    description = row.description;
    generated.delete("description");
  } else if (ex && !generated.has("description")) description = ex.description;
  else {
    description = [
      certainty === "unknown"
        ? `Maker, glasshouse and date have not yet been documented, so no attribution is given.`
        : `${creatorAssertion!.statement}${dating ? `, ${dating.displayLabel}` : ""}. The basis for this attribution is set out under Attribution & Sources.`,
    ];
    generated.add("description");
  }

  // Photographs
  let media: MediaRecord[] = ctx.existing?.media ?? [];
  let replacedSrcs: string[] = [];
  if (ctx.photos?.length) {
    const counts = new Map<ViewType, number>();
    const fresh = ctx.photos.map((p) => {
      const n = (counts.get(p.view) ?? 0) + 1;
      counts.set(p.view, n);
      const detailN = p.view === "detail" ? n : undefined;
      return {
        id: mediaId(row.id, p.view, n),
        artworkId: row.id,
        viewType: p.view,
        src: p.src,
        width: p.width,
        height: p.height,
        alt: altText(title, p.view, detailN && ctx.photos!.filter((x) => x.view === "detail").length > 1 ? detailN : undefined),
        credit: PHOTO_CREDIT,
        rights: "owned",
        rightsCleared: true,
        hotspots: [],
      } satisfies MediaRecord;
    });
    if ((counts.get("front") ?? 0) > 1) warn("Meer dan één vooraanzicht; de eerste is de hoofdfoto.");
    if (!counts.get("front")) warn("Geen vooraanzicht; de eerste foto is de hoofdfoto.");
    replacedSrcs = media.map((m) => m.src).filter((s) => !fresh.some((f) => f.src === s));
    media = fresh;
  } else if (ex && ex.title !== title) {
    // Keep generated alt texts in step with a new title.
    media = media.map((m) => (m.alt.startsWith(`${ex.title}, `) ? { ...m, alt: `${title}, ${m.alt.slice(ex.title.length + 2)}` } : m));
  }
  const imageIds = media.map((m) => m.id);
  const hero = media.find((m) => m.viewType === "front") ?? media[0];

  // Marks
  const keptMarks = (ex?.marks ?? []).filter((m) => m.kind !== "signature" && m.kind !== "label");
  let marks = ex?.marks ?? [];
  const touchedMarks = row.signature !== undefined || row.label !== undefined;
  if (touchedMarks || ctx.photos?.length) {
    const exSig = (ex?.marks ?? []).find((m) => m.kind === "signature");
    const exLab = (ex?.marks ?? []).find((m) => m.kind === "label");
    const withSig = row.signature ?? !!exSig;
    const withLab = row.label ?? !!exLab;
    const sigImg = media.find((m) => m.viewType === "signature")?.id;
    const labImg = media.find((m) => m.viewType === "label")?.id;
    marks = [...keptMarks];
    if (withSig) {
      const location = row.signatureLocation ?? exSig?.location ?? "base";
      const transcription = row.signatureText ?? exSig?.transcription;
      marks.push({
        id: `MRK-${sid}-SIG`,
        kind: "signature",
        location,
        observation: `Signature on the ${location}.`,
        ...(transcription ? { transcription } : {}),
        ...(sigImg ? { imageId: sigImg } : {}),
      });
      if (!sigImg) warn("Signatuur = ja, maar er is geen foto van de signatuur.");
    }
    if (withLab) {
      const location = row.labelLocation ?? exLab?.location ?? "base";
      const transcription = row.labelText ?? exLab?.transcription;
      marks.push({
        id: `MRK-${sid}-LABEL`,
        kind: "label",
        location,
        observation: `Label on the ${location}.`,
        ...(transcription ? { transcription } : {}),
        ...(labImg ? { imageId: labImg } : {}),
      });
      if (!labImg) warn("Etiket = ja, maar er is geen foto van het etiket.");
    }
  }

  const num = Number(sid.slice(1));
  const featured = row.highlight ?? ex?.featured ?? false;
  // The order only moves when the highlight choice changes, so a re-import never reshuffles the collection.
  const curatedOrder =
    ex && (row.highlight === undefined || row.highlight === !!ex.featured)
      ? (ex.curatedOrder ?? 500 + num)
      : featured
        ? num
        : 500 + num;

  const artwork: ArtworkRecord = {
    id: row.id,
    slug,
    title,
    category: category!,
    objectType: objectType!,
    summary,
    description,
    creators,
    techniqueIds,
    materials: row.materials.length
      ? row.materials
      : (ex?.materials ?? (category === "collectible-objects" ? [] : ["Glass"])),
    colours,
    ...((row.country ?? ex?.country ?? (category === "murano-glass" ? "Italy" : undefined))
      ? { country: row.country ?? ex?.country ?? "Italy" }
      : {}),
    ...(dating ? { dating } : {}),
    dimensions: { ...(ex?.dimensions ?? {}), ...row.dimensions },
    heroImageId: hero!.id,
    imageIds,
    marks,
    assertions: [creatorAssertion!, ...keptAssertions],
    ...((row.condition ?? ex?.condition) ? { condition: row.condition ?? ex?.condition } : {}),
    sourceIds,
    relatedIds: ex?.relatedIds ?? [],
    availability: row.availability ?? ex?.availability ?? "private_collection",
    status: row.publish === true ? "published" : row.publish === false ? "draft" : (ex?.status ?? "draft"),
    featured,
    curatedOrder,
    updatedAt: ctx.today,
    ...(generated.size ? { _generated: [...generated].sort() } : {}),
  };
  return { artwork, media, sources, replacedSrcs, problems };
}

/** Puts a rebuilt record into the store, replacing the old one (same id) in place. */
export function upsert(store: CollectionStore, result: Required<Pick<BuildResult, "artwork">> & BuildResult): CollectionStore {
  const id = result.artwork.id;
  const sid = shortId(id);
  const i = store.artworks.findIndex((a) => a.id === id);
  const artworks = [...store.artworks];
  if (i >= 0) artworks[i] = result.artwork;
  else artworks.push(result.artwork);
  artworks.sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));
  const media = [...store.media.filter((m) => m.artworkId !== id), ...result.media].sort((a, b) =>
    (a.artworkId ?? "").localeCompare(b.artworkId ?? "", "en", { numeric: true }),
  );
  const sources = [...store.sources.filter((s) => !s.id.startsWith(`SRC-${sid}-`)), ...result.sources];
  return { ...store, artworks, media, sources };
}
