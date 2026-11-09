/**
 * Specifications for the locally generated placeholder drawings.
 * These are NOT photographs of collection objects. Every generated file
 * carries a visible "Placeholder" caption and the media records use
 * `rights: "placeholder"`, which the interface surfaces to visitors.
 */
export type Shape = "tall-vase" | "bowl" | "sphere" | "bottle" | "vessel" | "painting" | "paperweight";
export type Texture = "sommerso" | "calcedonia" | "bullicante" | "pulegoso" | "plain" | "canvas";
export type View = "front" | "reverse" | "side" | "base" | "signature" | "label" | "detail";

export type PlaceholderSpec = {
  id: string;
  shape: Shape;
  texture: Texture;
  /** outer, inner, accent */
  palette: [string, string, string];
  view: View;
  width: number;
  height: number;
};

const sizes: Record<View, [number, number]> = {
  front: [1200, 1500],
  reverse: [1200, 1500],
  side: [1200, 1500],
  base: [1200, 1200],
  signature: [1200, 900],
  label: [1200, 900],
  detail: [1200, 900],
};

function spec(
  id: string,
  shape: Shape,
  texture: Texture,
  palette: [string, string, string],
  view: View,
): PlaceholderSpec {
  const [width, height] = shape === "painting" && view === "front" ? [1200, 1500] : sizes[view];
  return { id, shape, texture, palette, view, width, height };
}

const amber: [string, string, string] = ["#c98a2c", "#1d4f8f", "#f2d39a"];
const chalcedony: [string, string, string] = ["#5b3a29", "#a4612f", "#d9b48a"];
const bubbles: [string, string, string] = ["#2f6b5e", "#9fd4c3", "#e8f3ee"];
const smoke: [string, string, string] = ["#6d6a66", "#2c2a28", "#c9c2b8"];
const ruby: [string, string, string] = ["#8e1f2c", "#d9a441", "#f3dcc0"];
const pulegoso: [string, string, string] = ["#4f6f3a", "#8aa66b", "#dfe9cf"];

export const PLACEHOLDER_SPECS: PlaceholderSpec[] = [
  // D001 — sommerso vase, full documentation set (reference object page)
  spec("IMG-D001-FRONT", "tall-vase", "sommerso", amber, "front"),
  spec("IMG-D001-REVERSE", "tall-vase", "sommerso", amber, "reverse"),
  spec("IMG-D001-BASE", "tall-vase", "sommerso", amber, "base"),
  spec("IMG-D001-SIGNATURE", "tall-vase", "sommerso", amber, "signature"),
  spec("IMG-D001-DETAIL", "tall-vase", "sommerso", amber, "detail"),
  // D002 — calcedonia bowl
  spec("IMG-D002-FRONT", "bowl", "calcedonia", chalcedony, "front"),
  spec("IMG-D002-DETAIL", "bowl", "calcedonia", chalcedony, "detail"),
  spec("IMG-D002-BASE", "bowl", "calcedonia", chalcedony, "base"),
  // D003 — bullicante bottle
  spec("IMG-D003-FRONT", "bottle", "bullicante", bubbles, "front"),
  spec("IMG-D003-DETAIL", "bottle", "bullicante", bubbles, "detail"),
  // D004 — studio glass vessel
  spec("IMG-D004-FRONT", "vessel", "plain", smoke, "front"),
  spec("IMG-D004-SIDE", "vessel", "plain", smoke, "side"),
  spec("IMG-D004-SIGNATURE", "vessel", "plain", smoke, "signature"),
  // D005 — collectible paperweight
  spec("IMG-D005-FRONT", "paperweight", "plain", ruby, "front"),
  spec("IMG-D005-LABEL", "paperweight", "plain", ruby, "label"),
  // D006 — pulegoso vase
  spec("IMG-D006-FRONT", "sphere", "pulegoso", pulegoso, "front"),
  spec("IMG-D006-DETAIL", "sphere", "pulegoso", pulegoso, "detail"),
  // D007 — draft record (must never be published)
  spec("IMG-D007-FRONT", "tall-vase", "plain", smoke, "front"),
];

export const placeholderSrc = (id: string) => `/placeholders/${id.toLowerCase()}.svg`;
