import { getArtworkById, getArtworkBySlug } from "@/content/repository.server";
import { recordStatus } from "@/lib/format";

/**
 * Public records for a visitor's Private Selection. The browser keeps the ids;
 * this returns only fields that are already public on the object pages, for
 * at most 24 published works. Unknown or unpublished ids are left out.
 */
const ID_RE = /^MUR-[A-Z0-9-]{1,20}$/;

export type SelectionRecord = {
  id: string;
  slug: string;
  title: string;
  objectType: string;
  dating: string | null;
  attribution: string;
  attributionKnown: boolean;
  status: { kind: string; label: string; note: string };
  hero: { src: string; width: number; height: number; alt: string };
  techniques: string[];
  materials: string[];
  country: string | null;
  dimensions: { heightMm?: number; widthMm?: number; depthMm?: number; diameterMm?: number; weightG?: number };
};

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("ids") ?? "";
  const ids = [...new Set(raw.split(",").map((s) => s.trim()).filter((s) => ID_RE.test(s)))].slice(0, 24);
  const records: SelectionRecord[] = [];
  for (const id of ids) {
    const summary = await getArtworkById(id);
    if (!summary) continue;
    const d = await getArtworkBySlug(summary.slug);
    if (!d) continue;
    records.push({
      id: d.id,
      slug: d.slug,
      title: d.title,
      objectType: d.objectType,
      dating: d.dating?.displayLabel ?? null,
      attribution: d.attributionLine,
      attributionKnown: d.attributionCertainty !== "unknown",
      status: recordStatus({ availability: d.availability, heldBy: d.reference ? { institution: d.reference.institution } : null }),
      hero: { src: d.hero.src, width: d.hero.width, height: d.hero.height, alt: d.hero.alt },
      techniques: d.techniques.map((t) => t.term),
      materials: d.materials,
      country: d.country ?? null,
      dimensions: { ...d.dimensions },
    });
  }
  return Response.json(
    { records },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}
