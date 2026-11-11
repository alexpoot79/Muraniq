import type { Certainty, CreatorRole, MarkApplication, MarkKind } from "@/content/schemas";
import type { MakerSignature, SignaturePerson, SignatureView } from "@/content/signatures";

/** Plain words for visitors. Field names and statuses stay in the CMS. */
export const KIND_LABEL: Record<MarkKind, string> = {
  personal_signature: "Personal signature",
  factory_mark: "Factory mark",
  label: "Label",
  inscription: "Inscription",
};

/** The compact block's heading: never "signature" for something that is not one. */
export const KIND_REFERENCE_HEADING: Record<MarkKind, string> = {
  personal_signature: "Signature reference",
  factory_mark: "Factory mark reference",
  label: "Label reference",
  inscription: "Inscription reference",
};

export const APPLICATION_LABEL: Record<MarkApplication, string> = {
  diamond_point: "Diamond-point engraving",
  wheel_engraved: "Wheel engraving",
  engraved_other: "Engraved",
  acid_etched: "Acid-etched stamp",
  enamel_painted: "Painted in enamel",
  cane: "Lettered glass cane, in the glass",
  impressed: "Impressed",
  printed_label: "Printed paper label",
  handwritten_label: "Handwritten label",
  unknown: "Method not recorded",
};

export const TRANSCRIBED_FROM: Record<SignatureView["transcribedFrom"], string> = {
  photograph: "Read by MURANIQ from the photograph",
  source: "As written in the cited source",
  object_record: "As recorded in the object’s dossier",
};

const VERB: Record<CreatorRole, string> = {
  designer: "designed by",
  maker: "made by",
  glasshouse: "made at",
  decorator: "decorated by",
  artist: "by",
  publisher: "published by",
};

const ROLE_NOUN: Record<CreatorRole, string> = {
  designer: "designer",
  maker: "maker",
  glasshouse: "glasshouse",
  decorator: "decorator",
  artist: "artist",
  publisher: "publisher",
};

/** Whose mark it is, with the wording its certainty allows. */
export function ownerLine(kind: MarkKind, p: SignaturePerson | null): string | null {
  if (!p) return null;
  const what = KIND_LABEL[kind].toLowerCase();
  switch (p.certainty) {
    case "verified":
      return `${KIND_LABEL[kind]} of ${p.name}`;
    case "documented_attribution":
      return `${KIND_LABEL[kind]}, attributed to ${p.name} in the cited source`;
    case "probable":
      return `Probably ${p.name}’s ${what}`;
    case "hypothesis":
      return `Possibly ${p.name}’s ${what}; a working hypothesis`;
    default:
      return `${KIND_LABEL[kind]}; whose it is has not been established`;
  }
}

/**
 * On another maker's profile a mark is context, never that maker's own:
 * "Factory mark of Venini, on a documented work designed by Carlo Scarpa".
 */
export function contextLine(s: MakerSignature, makerName: string): string {
  const role = s.makerRole ?? "maker";
  const owner = s.markOf ? ` of ${s.markOf.name}` : "";
  const work = s.makerCertainty === "verified" ? `a documented work ${VERB[role]} ${makerName}` : `a work attributed to ${makerName} (${ROLE_NOUN[role]})`;
  return `${KIND_LABEL[s.kind]}${owner}, on ${work}`;
}

export const certaintyWord: Record<Certainty, string> = {
  verified: "Verified",
  documented_attribution: "From a cited source",
  probable: "Probable",
  hypothesis: "Hypothesis",
  unknown: "Not established",
};

/** Lines of a transcription; "/" marks a line break in the record. */
export const transcriptionLines = (t: string) => t.split(/\s+\/\s+/);
