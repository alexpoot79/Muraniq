/**
 * The combined index of signatures, labels and other marks
 * (/glass-guide/signatures-and-labels/). Pure: no framework imports.
 *
 * It reads what is already published and copies nothing:
 * - every public signature reference (the same `SignatureView` the maker
 *   profiles use, with the profiles that list it), and
 * - marks recorded on published collection objects that no reference reads
 *   yet (for instance a factory label on a vase), with the object's own
 *   photograph of the mark and the observation and interpretation exactly as
 *   the object's dossier states them.
 *
 * A mark from an object dossier is never given an owner here: whose it is
 * stays the object's interpretation, with its own certainty.
 */
import type { Certainty, MarkApplication } from "./schemas";
import type { Publication } from "./publication";
import type { PublicMedia } from "./public-projection";
import type { SignaturePerson, SignatureSourceRef, SignatureView } from "./signatures";
import { routes } from "@/lib/routes";

/** The sections of the index, in page order. */
export const INDEX_GROUPS = ["signatures", "labels", "factory_marks", "inscriptions"] as const;
export type IndexGroup = (typeof INDEX_GROUPS)[number];

export type IndexEntry = {
  /** Stable id: the reference id (SIG-…) or the object's mark id (MRK-…). */
  id: string;
  /** Element id on the index page. */
  anchor: string;
  from: "reference" | "object_mark";
  group: IndexGroup;
  /** The reference's kind; null for a mark read from an object dossier. */
  markKind: SignatureView["kind"] | null;
  /** Visitor wording of what the mark is (Personal signature, Label, Stamp …). */
  kindLabel: string;
  application: MarkApplication | null;
  title: string;
  transcription: string | null;
  transcriptionNote: string | null;
  transcriptionCertainty: Certainty | null;
  transcribedFrom: SignatureView["transcribedFrom"];
  location: string | null;
  /** Whose mark it is, only when a signature reference records it. */
  markOf: SignaturePerson | null;
  interpretation: { reading: string; certainty: Certainty | null } | null;
  dating: { label: string; certainty: Certainty } | null;
  object: {
    title: string;
    href: string | null;
    inCollection: boolean;
    heldBy: { institution: string; identifier: string; url: string } | null;
    dateLabel: string | null;
  };
  /** Maker profiles that list this reference, linking to it there. */
  profiles: Array<{ name: string; slug: string; href: string }>;
  photo: { detail: PublicMedia; views: PublicMedia[] } | null;
  source: SignatureSourceRef | null;
  /** For ordering inside a section. */
  sortKey: string;
};

const REFERENCE_KIND: Record<SignatureView["kind"], { group: IndexGroup; label: string }> = {
  personal_signature: { group: "signatures", label: "Personal signature" },
  label: { group: "labels", label: "Label" },
  factory_mark: { group: "factory_marks", label: "Factory mark" },
  inscription: { group: "inscriptions", label: "Inscription" },
};

/** Object marks that belong in this index. Pontil marks, engravings and other marks stay on the object page. */
const OBJECT_MARK_KIND: Record<string, { group: IndexGroup; label: string } | undefined> = {
  signature: { group: "signatures", label: "Signature" },
  label: { group: "labels", label: "Label" },
  stamp: { group: "factory_marks", label: "Stamp" },
  inscription: { group: "inscriptions", label: "Inscription" },
};

const lcFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** Sort by surname for people, by name for firms; objects without a maker sort by their own title. */
function nameKey(p: { name: string; kind: "person" | "organisation" | null } | null | undefined): string | null {
  if (!p) return null;
  if (p.kind !== "person") return p.name.toLowerCase();
  const parts = p.name.trim().split(/\s+/);
  return `${parts.at(-1)} ${parts.slice(0, -1).join(" ")}`.toLowerCase();
}

export function buildSignatureIndex(pub: Publication): IndexEntry[] {
  const entries: IndexEntry[] = [];
  const creatorById = new Map(pub.creators.map((c) => [c.id, c] as const));

  for (const v of pub.signatures) {
    const kind = REFERENCE_KIND[v.kind];
    const profiles = pub.creators
      .filter((c) => pub.makerSignatures[c.id]?.items.some((i) => i.id === v.id))
      .map((c) => ({ name: c.name, slug: c.slug, href: `${routes.maker(c.slug)}#sig-${v.id}` }));
    const lead = v.markOf ?? v.object.creators.find((p) => p.id && creatorById.has(p.id)) ?? null;
    entries.push({
      id: v.id,
      anchor: `sig-${v.id}`,
      from: "reference",
      group: kind.group,
      markKind: v.kind,
      kindLabel: kind.label,
      application: v.application,
      title: v.title,
      transcription: v.transcription,
      transcriptionNote: v.transcriptionNote,
      transcriptionCertainty: v.transcriptionCertainty,
      transcribedFrom: v.transcribedFrom,
      location: v.location,
      markOf: v.markOf,
      interpretation: v.interpretation,
      dating: v.dating ? { label: v.dating.label, certainty: v.dating.certainty } : null,
      object: {
        title: v.object.title,
        href: v.object.href,
        inCollection: v.object.inCollection,
        heldBy: v.object.heldBy
          ? { institution: v.object.heldBy.institution, identifier: v.object.heldBy.identifier, url: v.object.heldBy.url }
          : null,
        dateLabel: v.object.dateLabel,
      },
      profiles,
      photo: v.photo ? { detail: v.photo.detail, views: v.photo.views } : null,
      source: v.sources[0] ?? null,
      sortKey: `${nameKey(lead) ?? v.object.title.toLowerCase()} ${String(v.sortOrder).padStart(4, "0")}`,
    });
  }

  for (const a of Object.values(pub.dossiers)) {
    // Reference works held by museums are shown through their signature references only.
    if (a.reference) continue;
    for (const m of a.marks) {
      const kind = OBJECT_MARK_KIND[m.kind];
      if (!kind || !m.id) continue;
      // Already shown through a signature reference that reads this mark.
      if (pub.markSignatures[`${a.id}/${m.id}`]?.length) continue;
      const detail = m.imageId ? a.media.find((x) => x.id === m.imageId) : undefined;
      const lead = a.creatorLinks.map((c) => creatorById.get(c.id)).find((c) => !!c);
      entries.push({
        id: m.id,
        anchor: `mark-${m.id}`,
        from: "object_mark",
        group: kind.group,
        markKind: null,
        kindLabel: kind.label,
        application: m.application ?? null,
        title: `${kind.label} on the ${lcFirst(m.location)}`,
        transcription: m.transcription ?? null,
        transcriptionNote: m.transcriptionNote ?? null,
        transcriptionCertainty: m.transcriptionCertainty ?? null,
        transcribedFrom: "object_record",
        location: m.location,
        markOf: null,
        interpretation: m.interpretation ? { reading: m.interpretation, certainty: m.interpretationCertainty ?? null } : null,
        dating: null,
        object: {
          title: a.title,
          href: `${routes.artwork(a.slug)}#mark-${m.id}`,
          inCollection: true,
          heldBy: null,
          dateLabel: a.dating?.displayLabel ?? null,
        },
        profiles: [],
        photo: detail ? { detail, views: a.hero.id === detail.id ? [] : [a.hero] } : null,
        source: null,
        sortKey: `${nameKey(lead) ?? a.title.toLowerCase()} 0000`,
      });
    }
  }

  return entries.sort(
    (x, y) => INDEX_GROUPS.indexOf(x.group) - INDEX_GROUPS.indexOf(y.group) || x.sortKey.localeCompare(y.sortKey) || x.id.localeCompare(y.id),
  );
}
