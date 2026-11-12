import type { Availability, Dimensions } from "@/content/schemas";

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  private_collection: "Private collection",
  enquiries_welcome: "Enquiries welcome",
  reserved: "Reserved",
  sold: "Sold",
};

/**
 * The three kinds of record a visitor meets, said the same way everywhere:
 * a work that can be acquired, a work kept in the MURANIQ collection, and a
 * research reference held by another institution.
 */
export type RecordStatus = { kind: "available" | "collection" | "reference"; label: string; note: string };

export function recordStatus(a: { availability: Availability; heldBy?: { institution: string } | null }): RecordStatus {
  if (a.heldBy)
    return { kind: "reference", label: "Research reference", note: `Held by ${a.heldBy.institution}. Not part of the MURANIQ collection.` };
  switch (a.availability) {
    case "enquiries_welcome":
      return { kind: "available", label: "Available for acquisition", note: "Enquiries are welcome." };
    case "reserved":
      return { kind: "collection", label: "Reserved", note: "Currently reserved." };
    case "sold":
      return { kind: "collection", label: "Sold", note: "No longer available." };
    default:
      return { kind: "collection", label: "MURANIQ collection", note: "Part of the private collection, not currently offered." };
  }
}

const nf = new Intl.NumberFormat("en-GB");

const one = (v: number) => v.toLocaleString("en-GB", { maximumFractionDigits: 1 });

/** Centimetres for reading. Stored in millimetres; unknown values are omitted, never zero. */
export function cm(mm: number): string {
  return `${one(mm / 10)} cm`;
}

/** Inches, calculated from the measured millimetres (never entered separately). */
export function inches(mm: number): string {
  return `${one(mm / 25.4)} in`;
}

/**
 * Centimetres first, with inches calculated from the same measurement for
 * international readers. Unknown values are omitted, never shown as zero.
 */
export function formatDimensions(d: Dimensions): Array<{ label: string; value: string }> {
  const out: Array<{ label: string; value: string }> = [];
  const mm = (v: number) => `${cm(v)} (${inches(v)})`;
  if (d.heightMm) out.push({ label: "Height", value: mm(d.heightMm) });
  if (d.widthMm) out.push({ label: "Width", value: mm(d.widthMm) });
  if (d.depthMm) out.push({ label: "Depth", value: mm(d.depthMm) });
  if (d.diameterMm) out.push({ label: "Diameter", value: mm(d.diameterMm) });
  if (d.weightG) out.push({ label: "Weight", value: d.weightG >= 1000 ? `${one(d.weightG / 1000)} kg` : `${nf.format(d.weightG)} g` });
  return out;
}

export const VIEW_LABEL: Record<string, string> = {
  front: "Front",
  reverse: "Reverse",
  side: "Side",
  base: "Base",
  signature: "Signature",
  label: "Label",
  detail: "Detail",
  context: "Context",
};
