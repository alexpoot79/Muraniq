import type { Availability, Dimensions } from "@/content/schemas";

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  private_collection: "Private collection",
  enquiries_welcome: "Enquiries welcome",
  reserved: "Reserved",
  sold: "Sold",
};

const nf = new Intl.NumberFormat("en-GB");

/** Millimetres with centimetres for reading; unknown values are omitted, never zero. */
export function formatDimensions(d: Dimensions): Array<{ label: string; value: string }> {
  const out: Array<{ label: string; value: string }> = [];
  const mm = (v: number) => `${nf.format(v)} mm (${(v / 10).toLocaleString("en-GB", { maximumFractionDigits: 1 })} cm)`;
  if (d.heightMm) out.push({ label: "Height", value: mm(d.heightMm) });
  if (d.widthMm) out.push({ label: "Width", value: mm(d.widthMm) });
  if (d.depthMm) out.push({ label: "Depth", value: mm(d.depthMm) });
  if (d.diameterMm) out.push({ label: "Diameter", value: mm(d.diameterMm) });
  if (d.weightG) out.push({ label: "Weight", value: `${nf.format(d.weightG)} g` });
  return out;
}

export const VIEW_LABEL: Record<string, string> = {
  front: "Front",
  reverse: "Reverse",
  top: "From above",
  side: "Side",
  base: "Base",
  signature: "Signature",
  label: "Label",
  detail: "Detail",
  context: "Context",
};
