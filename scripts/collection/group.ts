/**
 * Which photograph belongs to which object. Pure: works on metadata only.
 *
 * Two ways to say it, mixable in one upload:
 * 1. ID card ("slate"): a photograph of the printed card with the object's QR
 *    code starts each object; every following photograph (in order of capture
 *    time) belongs to it until the next card. Nothing needs renaming.
 * 2. Names: a folder or file name that starts with the id ("M007/…",
 *    "M007-base.jpg"). A view word in the file name sets the view.
 */
import type { ViewType } from "../../src/content/schemas/index.ts";
import { PHOTO_VIEWS, normaliseId, shortId, viewsForSequence, type Problem } from "./sheet.ts";

export type PhotoMeta = {
  /** Path relative to the upload folder; also the tie-breaker for ordering. */
  rel: string;
  takenAt?: number;
  /** Object id read from the QR code when this photograph is an ID card. */
  slateId?: string;
  explicitId?: string;
  explicitView?: ViewType;
};

const ID_IN_NAME = /^(?:mur[-_ ]?)?m[-_ ]?0*(\d{1,4})(?=$|[-_ .])/i;

/** Id and view from a relative path such as "M007/IMG_1234.HEIC" or "M007-base-2.jpg". */
export function idFromPath(rel: string): { explicitId?: string; explicitView?: ViewType } {
  const parts = rel.split(/[\\/]/);
  const file = parts.pop() ?? "";
  const stem = file.replace(/\.[a-z0-9]+$/i, "");
  let explicitId: string | undefined;
  const fm = ID_IN_NAME.exec(stem);
  if (fm) explicitId = normaliseId(`M${fm[1]}`) ?? undefined;
  if (!explicitId) {
    for (const dir of parts.reverse()) {
      const dm = ID_IN_NAME.exec(dir);
      if (dm) {
        explicitId = normaliseId(`M${dm[1]}`) ?? undefined;
        break;
      }
    }
  }
  let explicitView: ViewType | undefined;
  if (explicitId) {
    for (const word of stem.toLowerCase().split(/[-_ .]+/)) {
      const v = PHOTO_VIEWS[word];
      if (v) {
        explicitView = v;
        break;
      }
    }
  }
  return { explicitId, explicitView };
}

const byName = (a: PhotoMeta, b: PhotoMeta) => a.rel.localeCompare(b.rel, "en", { numeric: true });

export function orderPhotos(photos: readonly PhotoMeta[]): { ordered: PhotoMeta[]; by: "time" | "name" } {
  const allTimed = photos.length > 0 && photos.every((p) => p.takenAt !== undefined);
  const ordered = [...photos].sort(allTimed ? (a, b) => a.takenAt! - b.takenAt! || byName(a, b) : byName);
  return { ordered, by: allTimed ? "time" : "name" };
}

export type Grouping = {
  /** Per object id, its photographs in shooting order (ID cards left out). */
  groups: Map<string, PhotoMeta[]>;
  /** Per object id, the ID-card photograph(s), for the review sheet. */
  slates: Map<string, PhotoMeta[]>;
  unassigned: PhotoMeta[];
  orderedBy: "time" | "name";
  problems: Problem[];
};

export function groupPhotos(photos: readonly PhotoMeta[]): Grouping {
  const problems: Problem[] = [];
  const groups = new Map<string, PhotoMeta[]>();
  const slates = new Map<string, PhotoMeta[]>();
  const unassigned: PhotoMeta[] = [];
  const add = (m: Map<string, PhotoMeta[]>, id: string, p: PhotoMeta) => m.set(id, [...(m.get(id) ?? []), p]);

  const { ordered, by } = orderPhotos(photos);
  if (by === "name" && photos.length > 1 && photos.some((p) => p.takenAt !== undefined))
    problems.push({
      level: "warning",
      message: "Niet alle foto's hebben een opnametijd; de volgorde is op bestandsnaam bepaald. Controleer het contactvel.",
    });

  let current: string | undefined;
  const seenSlates: string[] = [];
  for (const p of ordered) {
    if (p.slateId) {
      if (seenSlates.includes(p.slateId) && seenSlates[seenSlates.length - 1] !== p.slateId)
        problems.push({
          level: "warning",
          id: shortId(p.slateId),
          message: "Het ID-kaartje komt op twee plaatsen in de reeks voor; de foto's zijn samengevoegd in volgorde van opname.",
        });
      seenSlates.push(p.slateId);
      add(slates, p.slateId, p);
      current = p.slateId;
      continue;
    }
    if (p.explicitId) {
      add(groups, p.explicitId, p);
      continue;
    }
    if (current) add(groups, current, p);
    else unassigned.push(p);
  }
  if (unassigned.length)
    problems.push({
      level: "error",
      message: `${unassigned.length} foto('s) vóór het eerste ID-kaartje en zonder object-ID in de naam: niet toegewezen (zie contactvel).`,
    });
  for (const [id, list] of groups)
    if (list.length > 10)
      problems.push({ level: "warning", id: shortId(id), message: `${list.length} foto's bij één object; is er een ID-kaartje gemist?` });
  return { groups, slates, unassigned, orderedBy: by, problems };
}

/**
 * Views for one object's photographs: a view named in the file name wins;
 * the others follow the fixed shooting order (see `viewsForSequence`).
 */
export function assignViews(
  photos: readonly PhotoMeta[],
  opts: Parameters<typeof viewsForSequence>[1],
): ViewType[] {
  const planned = viewsForSequence(photos.length, opts);
  for (const p of photos) {
    if (!p.explicitView || p.explicitView === "detail") continue;
    const i = planned.indexOf(p.explicitView);
    if (i >= 0) planned.splice(i, 1);
  }
  let next = 0;
  return photos.map((p) => p.explicitView ?? planned[next++] ?? "detail");
}
