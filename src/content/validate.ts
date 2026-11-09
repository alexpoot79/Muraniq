/**
 * Dataset-level validation: everything a single-record schema cannot see.
 * Used by the repository at load time, by `scripts/validate-content.ts`, and
 * (later) by importers — the same rules everywhere.
 */
import { Dataset, type Artwork, type DatasetInput } from "./schemas";

export type ValidationIssue = { path: string; message: string };
export type ValidationResult =
  | { ok: true; data: Dataset; issues: [] }
  | { ok: false; data?: undefined; issues: ValidationIssue[] };

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const v of values) (seen.has(v) ? dup : seen).add(v);
  return [...dup];
}

export function validateDataset(input: DatasetInput | unknown): ValidationResult {
  const parsed = Dataset.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    };
  }
  const data = parsed.data;
  const issues: ValidationIssue[] = [];
  const push = (path: string, message: string) => issues.push({ path, message });

  // Uniqueness of ids and slugs per entity type.
  const groups = {
    artworks: data.artworks,
    creators: data.creators,
    glasshouses: data.glasshouses,
    techniques: data.techniques,
  } as const;
  for (const [name, list] of Object.entries(groups)) {
    for (const d of duplicates(list.map((x) => x.id))) push(name, `duplicate id ${d}`);
    for (const d of duplicates(list.map((x) => x.slug))) push(name, `duplicate slug ${d}`);
  }
  for (const d of duplicates(data.sources.map((s) => s.id))) push("sources", `duplicate id ${d}`);
  for (const d of duplicates(data.media.map((m) => m.id))) push("media", `duplicate id ${d}`);
  for (const d of duplicates(data.redirects.map((r) => r.from))) push("redirects", `duplicate redirect from ${d}`);

  const ids = {
    artwork: new Map(data.artworks.map((a) => [a.id, a])),
    creator: new Map(data.creators.map((c) => [c.id, c])),
    glasshouse: new Map(data.glasshouses.map((g) => [g.id, g])),
    technique: new Map(data.techniques.map((t) => [t.id, t])),
    source: new Map(data.sources.map((s) => [s.id, s])),
    media: new Map(data.media.map((m) => [m.id, m])),
  };

  const checkSource = (path: string, sourceId: string) => {
    if (!ids.source.has(sourceId)) push(path, `unknown source ${sourceId}`);
  };

  for (const [i, a] of data.artworks.entries()) {
    const p = `artworks[${i}](${a.id})`;
    for (const c of a.creators) if (!ids.creator.has(c.creatorId)) push(p, `unknown creator ${c.creatorId}`);
    for (const g of a.glasshouseIds) if (!ids.glasshouse.has(g)) push(p, `unknown glasshouse ${g}`);
    for (const t of a.techniqueIds) if (!ids.technique.has(t)) push(p, `unknown technique ${t}`);
    for (const s of a.sourceIds) checkSource(p, s);
    for (const r of a.relatedIds) {
      if (r === a.id) push(p, "an artwork cannot be related to itself");
      else if (!ids.artwork.has(r)) push(p, `unknown related artwork ${r}`);
    }
    if (!a.imageIds.includes(a.heroImageId)) push(p, "heroImageId must be one of imageIds");
    for (const m of a.imageIds) {
      const asset = ids.media.get(m);
      if (!asset) push(p, `unknown image ${m}`);
      else if (asset.artworkId && asset.artworkId !== a.id) push(p, `image ${m} belongs to ${asset.artworkId}`);
    }
    for (const mark of a.marks) {
      if (mark.imageId && !a.imageIds.includes(mark.imageId)) push(p, `mark image ${mark.imageId} not in imageIds`);
    }
    for (const as of a.assertions) for (const e of as.evidence) checkSource(`${p}.assertions`, e.sourceId);
    for (const ev of a.provenance) {
      for (const e of ev.evidence) checkSource(`${p}.provenance`, e.sourceId);
      if (ev.fromYear && ev.toYear && ev.fromYear > ev.toYear) push(`${p}.provenance`, "fromYear after toYear");
    }
    // Certainty must be consistent: a creator credit cannot be more certain than
    // the strongest matching assertion supports.
    for (const c of a.creators) {
      if (c.certainty === "verified") {
        const backed = a.assertions.some((as) => as.field === "creator" && as.certainty === "verified");
        if (!backed) push(p, `creator ${c.creatorId} marked verified without a verified creator assertion`);
      }
    }
    if (a.status === "published") for (const issue of publicationBlockers(a, ids)) push(p, issue);
  }

  for (const [i, c] of data.creators.entries()) {
    for (const s of c.sourceIds) checkSource(`creators[${i}](${c.id})`, s);
  }
  for (const [i, g] of data.glasshouses.entries()) {
    for (const cr of g.creatorIds)
      if (!ids.creator.has(cr)) push(`glasshouses[${i}](${g.id})`, `unknown creator ${cr}`);
  }
  for (const [i, t] of data.techniques.entries()) {
    for (const s of t.sourceIds) checkSource(`techniques[${i}](${t.id})`, s);
  }

  return issues.length ? { ok: false, issues } : { ok: true, data, issues: [] };
}

/**
 * Reasons a record may not be published. Shown to editors in Studio and
 * enforced on the server.
 */
export function publicationBlockers(
  a: Artwork,
  ids: { media: Map<string, { rightsCleared: boolean; rights: string }> },
): string[] {
  const out: string[] = [];
  const hero = ids.media.get(a.heroImageId);
  if (!hero) out.push("published artwork needs a hero image");
  else if (!hero.rightsCleared) out.push("hero image rights are not cleared for publication");
  for (const m of a.imageIds) {
    const asset = ids.media.get(m);
    if (asset && !asset.rightsCleared) out.push(`image ${m} is not cleared for publication`);
  }
  if (a.creators.length === 0 && !a.assertions.some((x) => x.field === "creator")) {
    out.push("state the attribution explicitly (an 'unknown' creator assertion is acceptable)");
  }
  return out;
}
