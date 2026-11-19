/**
 * Builds every MURANIQ logo SVG from the M geometry in ./m-geometry.mjs and the existing wordmark.
 *
 *   node scripts/brand/build-logo.mjs
 *
 * Writes public/brand/*.svg and src/app/icon.svg. The raster icons (favicon.ico, apple-icon.png,
 * og-default.png) are rendered from these files by ./render-icons.mjs.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GRADIENTS, M_BOX, SHAPES } from "./m-geometry.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const r = (v) => Number(v.toFixed(2));
const fmt = ([x, y]) => `${r(x)},${r(y)}`;

/** Centripetal Catmull-Rom through pts, as cubic Bézier commands (no leading M). */
function curve(pts) {
  const p = [[2 * pts[0][0] - pts[1][0], 2 * pts[0][1] - pts[1][1]], ...pts];
  const n = pts.length;
  p.push([2 * pts[n - 1][0] - pts[n - 2][0], 2 * pts[n - 1][1] - pts[n - 2][1]]);
  const out = [];
  for (let i = 1; i < p.length - 2; i++) {
    const [p0, p1, p2, p3] = [p[i - 1], p[i], p[i + 1], p[i + 2]];
    const d1 = Math.max(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) ** 0.5, 1e-6);
    const d2 = Math.max(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) ** 0.5, 1e-6);
    const d3 = Math.max(Math.hypot(p3[0] - p2[0], p3[1] - p2[1]) ** 0.5, 1e-6);
    const c1 = [0, 1].map(
      (k) => (d1 * d1 * p2[k] - d2 * d2 * p0[k] + (2 * d1 * d1 + 3 * d1 * d2 + d2 * d2) * p1[k]) / (3 * d1 * (d1 + d2)),
    );
    const c2 = [0, 1].map(
      (k) => (d3 * d3 * p1[k] - d2 * d2 * p3[k] + (2 * d3 * d3 + 3 * d3 * d2 + d2 * d2) * p2[k]) / (3 * d3 * (d3 + d2)),
    );
    out.push(`C${fmt(c1)} ${fmt(c2)} ${fmt(p2)}`);
  }
  return out.join("");
}

/** A closed outline made of segments; each segment starts where the previous one ended. */
function outline(segments) {
  let d = `M${fmt(segments[0].pts[0])}`;
  for (const s of segments) d += s.line ? s.pts.slice(1).map((q) => `L${fmt(q)}`).join("") : curve(s.pts);
  return d + "Z";
}

const PATHS = Object.fromEntries(Object.entries(SHAPES).map(([k, segs]) => [k, outline(segs)]));

// ---------------------------------------------------------------------------------------------
// Colour schemes. "gold" = the supplied colours, for dark backgrounds. "antique" = the same light
// and shade, mapped onto a deeper bronze-gold range so the M stays legible on ivory and paper.
// ---------------------------------------------------------------------------------------------
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const toHex = (rgb) => "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0").toUpperCase()).join("");
const lum = ([r, g, b]) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;
const DARK = hex("#4F3510");
const LIGHT = hex("#B99550");
function antique(c) {
  const t = Math.min(1, Math.max(0, (lum(hex(c)) - 0.3) / 0.68));
  return toHex(DARK.map((v, i) => v + (LIGHT[i] - v) * t));
}

function defs(scheme, prefix) {
  const grads = Object.entries(GRADIENTS).map(([name, g]) => {
    const stops = g.stops
      .map(([o, c, op]) => {
        const col = scheme === "antique" ? antique(c) : c;
        return `<stop offset="${r(o)}" stop-color="${col}"${op !== undefined && op < 1 ? ` stop-opacity="${op}"` : ""}/>`;
      })
      .join("");
    return `<linearGradient id="${prefix}${name}" gradientUnits="userSpaceOnUse" x1="${g.from[0]}" y1="${g.from[1]}" x2="${g.to[0]}" y2="${g.to[1]}">${stops}</linearGradient>`;
  });
  return `<defs>${grads.join("")}</defs>`;
}

/** The M itself: back to front so the stem covers the hidden end of the thin diagonal. */
function mShapes(prefix) {
  return ["face", "swash", "leftStem", "thin", "rightStem"]
    .map((k) => `<path fill="url(#${prefix}${k})" d="${PATHS[k]}"/>`)
    .join("");
}

const svg = (viewBox, body, title = true) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${title ? ' role="img" aria-label="MURANIQ"><title>MURANIQ</title>' : ">"}${body}</svg>\n`;

// ---------------------------------------------------------------------------------------------
// Lockup: the M centred above the existing wordmark (kept unchanged), in the proportions of the
// supplied artwork: M width = 0.583 x wordmark width, gap = 0.064 x wordmark width.
// ---------------------------------------------------------------------------------------------
const wordmark = (file) => readFileSync(join(ROOT, "public/brand", file), "utf8").match(/<path[^>]*\/>/)[0];
const WM = { x0: 201.0, x1: 1061.0, capTop: 687.6, vbX: 196, vbW: 870, vbBottom: 802 };
const wmWidth = WM.x1 - WM.x0;
export const LOCKUP = (() => {
  const scale = (0.583 * wmWidth) / (118.9 - 47.4); // source px -> lockup units
  const mW = M_BOX.w * scale;
  const mH = M_BOX.h * scale;
  const gap = 0.064 * wmWidth;
  const left = (WM.x0 + WM.x1) / 2 - mW / 2;
  const top = WM.capTop - gap - mH;
  const vbY = Math.floor(top - 4);
  return { scale, left, top, vbY, vbH: WM.vbBottom - vbY };
})();

function lockup(scheme, wordmarkFile) {
  const p = scheme === "gold" ? "g-" : "a-";
  const { scale, left, top, vbY, vbH } = LOCKUP;
  const t = `translate(${r(left - M_BOX.x * scale)} ${r(top - M_BOX.y * scale)}) scale(${r(scale * 1000) / 1000})`;
  return svg(
    `${WM.vbX} ${vbY} ${WM.vbW} ${vbH}`,
    `${defs(scheme, p)}<g transform="${t}">${mShapes(p)}</g>${wordmark(wordmarkFile)}`,
  );
}

const box = `${M_BOX.x} ${M_BOX.y} ${M_BOX.w} ${M_BOX.h}`;
const files = {
  "public/brand/muraniq-monogram-gold.svg": svg(box, defs("gold", "g-") + mShapes("g-")),
  "public/brand/muraniq-monogram-antique.svg": svg(box, defs("antique", "a-") + mShapes("a-")),
  "public/brand/muraniq-lockup-on-dark.svg": lockup("gold", "muraniq-wordmark-ivory.svg"),
  "public/brand/muraniq-lockup-on-light.svg": lockup("antique", "muraniq-wordmark-ink.svg"),
  // Favicon: the M on the site's stage colour, filling most of the square.
  "src/app/icon.svg": (() => {
    const s = 56 / M_BOX.w;
    const tx = 32 - (M_BOX.x + M_BOX.w / 2) * s;
    const ty = 32 - (M_BOX.y + M_BOX.h / 2) * s;
    return svg(
      "0 0 64 64",
      `<rect width="64" height="64" fill="#080808"/>${defs("gold", "g-")}<g transform="translate(${r(tx)} ${r(ty)}) scale(${r(s * 10000) / 10000})">${mShapes("g-")}</g>`,
      false,
    );
  })(),
};

for (const [rel, content] of Object.entries(files)) {
  writeFileSync(join(ROOT, rel), content);
  console.log(`${rel}  ${(content.length / 1024).toFixed(1)} KB`);
}
console.log(`lockup viewBox ratio ${(WM.vbW / LOCKUP.vbH).toFixed(4)} (width / height)`);
