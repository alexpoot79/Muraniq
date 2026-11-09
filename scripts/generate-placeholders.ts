/**
 * Generates the clearly labelled placeholder drawings in public/placeholders/.
 * Run: node --experimental-strip-types scripts/generate-placeholders.ts
 *
 * These are abstract drawings, not representations of real artworks.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PLACEHOLDER_SPECS, type PlaceholderSpec, type Shape } from "../fixtures/placeholder-specs.ts";

const OUT = join(process.cwd(), "public", "placeholders");

// Deterministic PRNG so regenerated files are identical.
function rng(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

/** Half-width profile, y from 0 (top) to 1 (bottom), x as fraction of max width. */
const PROFILES: Record<Shape, Array<[number, number]>> = {
  "tall-vase": [[0, 0.3], [0.04, 0.27], [0.18, 0.33], [0.45, 0.5], [0.72, 0.46], [0.92, 0.34], [1, 0.32]],
  bowl: [[0, 0.98], [0.15, 0.95], [0.45, 0.78], [0.75, 0.48], [0.92, 0.3], [1, 0.3]],
  sphere: [[0, 0.24], [0.06, 0.26], [0.2, 0.62], [0.5, 0.86], [0.8, 0.66], [0.95, 0.38], [1, 0.34]],
  bottle: [[0, 0.1], [0.08, 0.1], [0.1, 0.12], [0.3, 0.13], [0.42, 0.4], [0.55, 0.48], [0.9, 0.46], [1, 0.42]],
  vessel: [[0, 0.36], [0.1, 0.44], [0.35, 0.58], [0.6, 0.52], [0.85, 0.4], [1, 0.3]],
  paperweight: [[0, 0.1], [0.08, 0.55], [0.3, 0.92], [0.6, 0.98], [0.88, 0.85], [1, 0.62]],
  painting: [[0, 1], [1, 1]],
};

function smoothPath(points: Array<[number, number]>): string {
  if (points.length < 2) return "";
  let d = `M${points[0]![0].toFixed(1)},${points[0]![1].toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]!.toFixed(1)},${c1[1]!.toFixed(1)} ${c2[0]!.toFixed(1)},${c2[1]!.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

function vesselPath(shape: Shape, cx: number, top: number, height: number, maxHalf: number, scale = 1, skew = 0) {
  const prof = PROFILES[shape];
  const right = prof.map(([y, x]) => [cx + x * maxHalf * scale + skew * y * maxHalf, top + y * height] as [number, number]);
  const left = [...prof].reverse().map(([y, x]) => [cx - x * maxHalf * scale + skew * y * maxHalf, top + y * height] as [number, number]);
  const r = smoothPath(right);
  const l = smoothPath(left).replace(/^M/, "L");
  return `${r} ${l} Z`;
}

const label = (w: number, h: number) =>
  `<text x="${w / 2}" y="${h - 44}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" letter-spacing="5" fill="#8d857a">PLACEHOLDER · NOT COLLECTION PHOTOGRAPHY</text>`;

const stage = (w: number, h: number) => `
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="75%">
      <stop offset="0" stop-color="#1d1a16"/><stop offset="0.6" stop-color="#0d0c0a"/><stop offset="1" stop-color="#070707"/>
    </radialGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#16130f"/><stop offset="1" stop-color="#080808"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>`;

function texturePattern(spec: PlaceholderSpec, id: string, r: () => number): string {
  const [outer, inner, accent] = spec.palette;
  switch (spec.texture) {
    case "bullicante": {
      let dots = "";
      for (let y = 0; y < 8; y++)
        for (let x = 0; x < 8; x++)
          dots += `<circle cx="${x * 22 + (y % 2) * 11 + 6}" cy="${y * 22 + 6}" r="4.2" fill="${accent}" opacity="0.55"/>`;
      return `<pattern id="${id}" width="176" height="176" patternUnits="userSpaceOnUse"><rect width="176" height="176" fill="${outer}"/>${dots}</pattern>`;
    }
    case "pulegoso": {
      let dots = "";
      for (let i = 0; i < 160; i++)
        dots += `<circle cx="${(r() * 240).toFixed(1)}" cy="${(r() * 240).toFixed(1)}" r="${(1.5 + r() * 6).toFixed(1)}" fill="${accent}" opacity="${(0.15 + r() * 0.35).toFixed(2)}"/>`;
      return `<pattern id="${id}" width="240" height="240" patternUnits="userSpaceOnUse"><rect width="240" height="240" fill="${inner}"/>${dots}</pattern>`;
    }
    case "calcedonia":
      return `<filter id="${id}-f"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.03" numOctaves="4" seed="${Math.floor(r() * 50)}"/><feColorMatrix type="matrix" values="0 0 0 0 0.36  0 0 0 0 0.22  0 0 0 0 0.15  0 0 0 -2.2 1.6"/></filter>
        <pattern id="${id}" width="1200" height="1500" patternUnits="userSpaceOnUse"><rect width="1200" height="1500" fill="${inner}"/><rect width="1200" height="1500" filter="url(#${id}-f)"/><rect width="1200" height="1500" fill="${accent}" opacity="0.12"/></pattern>`;
    default:
      return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${outer}" stop-opacity="0.95"/><stop offset="0.45" stop-color="${accent}" stop-opacity="0.85"/><stop offset="1" stop-color="${outer}" stop-opacity="0.9"/></linearGradient>`;
  }
}

function frontView(spec: PlaceholderSpec, mirrored: boolean, side: boolean): string {
  const { width: w, height: h, palette } = spec;
  const [outer, inner, accent] = palette;
  const r = rng(spec.id);
  const top = h * 0.11;
  const height = spec.shape === "bowl" ? h * 0.36 : spec.shape === "paperweight" ? h * 0.3 : h * 0.7;
  const yTop = spec.shape === "bowl" || spec.shape === "paperweight" ? h * 0.42 : top;
  const maxHalf = spec.shape === "bowl" ? w * 0.4 : spec.shape === "paperweight" ? w * 0.3 : w * 0.36;
  const skew = side ? 0.12 : 0;
  const cx = w / 2;
  const tex = texturePattern(spec, "tex", r);
  const body = vesselPath(spec.shape, cx, yTop, height, maxHalf, 1, skew);
  const core = vesselPath(spec.shape, cx, yTop + height * 0.08, height * 0.86, maxHalf, 0.72, skew);
  const hl = mirrored ? 0.68 : 0.36;
  const fill = spec.texture === "plain" ? `url(#tex)` : `url(#tex)`;
  const sommersoCore =
    spec.texture === "sommerso"
      ? `<path d="${core}" fill="${inner}" opacity="0.92"/>`
      : spec.shape === "paperweight"
        ? `<path d="${vesselPath(spec.shape, cx, yTop + height * 0.3, height * 0.45, maxHalf, 0.4)}" fill="${inner}" opacity="0.8"/>`
        : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  ${stage(w, h)}
  <defs>
    ${spec.texture === "sommerso" ? `<linearGradient id="tex" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${outer}" stop-opacity="0.9"/><stop offset="0.5" stop-color="${accent}" stop-opacity="0.75"/><stop offset="1" stop-color="${outer}" stop-opacity="0.95"/></linearGradient>` : tex}
    <linearGradient id="hl" x1="0" y1="0" x2="1" y2="0">
      <stop offset="${hl - 0.08}" stop-color="#fff" stop-opacity="0"/><stop offset="${hl}" stop-color="#fff" stop-opacity="0.32"/><stop offset="${hl + 0.05}" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="shadow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#000" stop-opacity="0.8"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="${cx}" cy="${yTop + height * 0.45}" rx="${maxHalf * 1.9}" ry="${height * 0.75}" fill="${accent}" opacity="0.06"/>
  <rect y="${yTop + height}" width="${w}" height="${h - yTop - height}" fill="url(#floor)"/>
  <ellipse cx="${cx}" cy="${yTop + height + 6}" rx="${maxHalf * 0.9}" ry="22" fill="url(#shadow)"/>
  <path d="${body}" fill="${fill}"/>
  ${sommersoCore}
  <path d="${body}" fill="url(#hl)"/>
  <path d="${body}" fill="none" stroke="${accent}" stroke-opacity="0.35" stroke-width="2"/>
  <path d="${body}" transform="translate(0 ${2 * (yTop + height)}) scale(1 -1)" fill="${outer}" opacity="0.06"/>
  ${label(w, h)}
</svg>`;
}

function baseView(spec: PlaceholderSpec): string {
  const { width: w, height: h, palette } = spec;
  const [outer, inner, accent] = palette;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  ${stage(w, h)}
  <defs><radialGradient id="g" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="${accent}" stop-opacity="0.9"/><stop offset="0.5" stop-color="${outer}"/><stop offset="1" stop-color="${inner}"/></radialGradient></defs>
  <circle cx="${w / 2}" cy="${h / 2 - 30}" r="${w * 0.33}" fill="url(#g)"/>
  <circle cx="${w / 2}" cy="${h / 2 - 30}" r="${w * 0.26}" fill="none" stroke="${accent}" stroke-opacity="0.45" stroke-width="6"/>
  <circle cx="${w / 2}" cy="${h / 2 - 30}" r="46" fill="${accent}" opacity="0.55"/>
  <circle cx="${w / 2}" cy="${h / 2 - 30}" r="46" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="3"/>
  ${label(w, h)}
</svg>`;
}

function markView(spec: PlaceholderSpec, kind: "signature" | "label"): string {
  const { width: w, height: h, palette } = spec;
  const [outer, , accent] = palette;
  const r = rng(spec.id);
  let scribble = `M${w * 0.25},${h * 0.5}`;
  for (let i = 0; i < 14; i++) {
    const x = w * 0.25 + (i + 1) * (w * 0.5 / 14);
    scribble += ` Q${(x - 18).toFixed(0)},${(h * 0.5 + (r() - 0.5) * 140).toFixed(0)} ${x.toFixed(0)},${(h * 0.5 + (r() - 0.5) * 40).toFixed(0)}`;
  }
  const content =
    kind === "signature"
      ? `<path d="${scribble}" fill="none" stroke="#efe6d6" stroke-opacity="0.75" stroke-width="5" stroke-linecap="round"/>`
      : `<rect x="${w * 0.3}" y="${h * 0.3}" width="${w * 0.4}" height="${h * 0.32}" rx="10" fill="#e8ddcb" transform="rotate(-4 ${w / 2} ${h / 2})"/>
         <rect x="${w * 0.36}" y="${h * 0.39}" width="${w * 0.28}" height="14" fill="#8d857a" transform="rotate(-4 ${w / 2} ${h / 2})"/>
         <rect x="${w * 0.36}" y="${h * 0.46}" width="${w * 0.2}" height="10" fill="#a59d91" transform="rotate(-4 ${w / 2} ${h / 2})"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  ${stage(w, h)}
  <defs><radialGradient id="g" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="${accent}" stop-opacity="0.45"/><stop offset="1" stop-color="${outer}" stop-opacity="0.25"/></radialGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  ${content}
  ${label(w, h)}
</svg>`;
}

function detailView(spec: PlaceholderSpec): string {
  const { width: w, height: h, palette } = spec;
  const [outer, inner, accent] = palette;
  const r = rng(spec.id);
  let inside = "";
  if (spec.texture === "sommerso") {
    inside = `<rect width="${w}" height="${h}" fill="${outer}"/>
      <path d="M0,${h * 0.35} C${w * 0.3},${h * 0.25} ${w * 0.7},${h * 0.45} ${w},${h * 0.32} L${w},${h} L0,${h} Z" fill="${accent}" opacity="0.55"/>
      <path d="M0,${h * 0.5} C${w * 0.3},${h * 0.42} ${w * 0.7},${h * 0.6} ${w},${h * 0.48} L${w},${h} L0,${h} Z" fill="${inner}"/>`;
  } else {
    inside = `<defs>${texturePattern(spec, "tex", r)}</defs><rect width="${w}" height="${h}" fill="url(#tex)"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  ${inside}
  <rect width="${w}" height="${h}" fill="#000" opacity="0.18"/>
  <rect x="0" y="${h - 90}" width="${w}" height="90" fill="#080808" opacity="0.75"/>
  ${label(w, h)}
</svg>`;
}

function render(spec: PlaceholderSpec): string {
  switch (spec.view) {
    case "front":
      return frontView(spec, false, false);
    case "reverse":
      return frontView(spec, true, false);
    case "side":
      return frontView(spec, false, true);
    case "base":
      return baseView(spec);
    case "signature":
      return markView(spec, "signature");
    case "label":
      return markView(spec, "label");
    case "detail":
      return detailView(spec);
  }
}

mkdirSync(OUT, { recursive: true });
for (const spec of PLACEHOLDER_SPECS) {
  const svg = render(spec).replace(/\n\s+/g, "\n");
  writeFileSync(join(OUT, `${spec.id.toLowerCase()}.svg`), svg);
}
console.log(`wrote ${PLACEHOLDER_SPECS.length} placeholders to ${OUT}`);
