/**
 * Protection for the owner's photographs before they go on the website.
 *
 * - A small, quiet "© MURANIQ" mark in the bottom-right corner, drawn from the
 *   approved wordmark (public/brand/), never a font, so it looks the same on
 *   every machine. Ivory on dark corners, ink on light corners, low opacity.
 * - The published file is a web version: at most WEB_MAX_EDGE pixels on the
 *   long edge. The full-size original stays with the owner and in the private
 *   project storage, never in the public repository or on the site.
 * - The file carries one line of copyright metadata (and nothing else: no GPS,
 *   no camera, no capture time). The same line tells the scripts that a file is
 *   already protected, so nothing is ever watermarked twice.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import exifr from "exifr";
import sharp from "sharp";

/** Long edge of every published own photograph. Large originals are never published. */
export const WEB_MAX_EDGE = 1600;
export const WEB_JPEG_QUALITY = 85;

/** EXIF copyright line written into every published own photograph (ASCII only, as EXIF requires). */
export const COPYRIGHT_NOTICE = "Copyright MURANIQ. All rights reserved. Not to be reproduced without permission.";
export const ARTIST = "MURANIQ";

const BRAND_DIR = path.join(process.cwd(), "public/brand");
const IVORY = "#F5F0E7";
const INK = "#14110D";

/* The approved wordmark: one evenodd path in viewBox "196 683 870 119". */
const WORDMARK = (() => {
  const svg = readFileSync(path.join(BRAND_DIR, "muraniq-wordmark-ink.svg"), "utf8");
  const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1];
  const d = /\sd="([^"]+)"/.exec(svg)?.[1];
  if (!viewBox || !d) throw new Error("public/brand/muraniq-wordmark-ink.svg: wordmark path not found");
  const [, , w, h] = viewBox.split(/\s+/).map(Number);
  return { viewBox, d, ratio: w! / h! };
})();

export type Tone = "ivory" | "ink";

/** Size and position of the mark on an image of this size (all in pixels). */
export function markGeometry(width: number, height: number) {
  const long = Math.max(width, height);
  const short = Math.min(width, height);
  const h = Math.max(10, Math.round(long * 0.0125)); // wordmark height: 20 px on a 1600 px photograph
  const r = h * 0.62; // radius of the © circle
  const gap = Math.round(h * 0.55);
  const wordW = Math.round(h * WORDMARK.ratio);
  const boxW = Math.ceil(2 * r + gap + wordW) + 2;
  const boxH = Math.ceil(2 * r) + 2;
  const margin = Math.round(short * 0.03);
  return { h, r, gap, wordW, boxW, boxH, left: width - margin - boxW, top: height - margin - boxH };
}

/** The mark as an SVG of exactly boxW × boxH pixels. */
export function markSvg(width: number, height: number, tone: Tone): string {
  const g = markGeometry(width, height);
  const colour = tone === "ivory" ? IVORY : INK;
  const opacity = tone === "ivory" ? 0.5 : 0.42;
  const cx = 1 + g.r;
  const cy = g.boxH / 2;
  const stroke = Math.max(0.9, g.h * 0.07);
  // The "C" inside the circle: an open arc from upper right, over the top, round to lower right.
  const ri = g.r * 0.5;
  const a = (50 * Math.PI) / 180;
  const p = (s: number) => `${(cx + ri * Math.cos(a)).toFixed(2)},${(cy + s * ri * Math.sin(a)).toFixed(2)}`;
  const wordX = 1 + 2 * g.r + g.gap;
  const wordY = cy - g.h / 2;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${g.boxW}" height="${g.boxH}">`,
    `<g opacity="${opacity}">`,
    `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(g.r - stroke / 2).toFixed(2)}" fill="none" stroke="${colour}" stroke-width="${stroke.toFixed(2)}"/>`,
    `<path d="M${p(-1)} A${ri.toFixed(2)},${ri.toFixed(2)} 0 1 0 ${p(1)}" fill="none" stroke="${colour}" stroke-width="${(stroke * 0.95).toFixed(2)}" stroke-linecap="round"/>`,
    `<svg x="${wordX.toFixed(2)}" y="${wordY.toFixed(2)}" width="${g.wordW}" height="${g.h}" viewBox="${WORDMARK.viewBox}">`,
    `<path fill="${colour}" fill-rule="evenodd" d="${WORDMARK.d}"/>`,
    `</svg>`,
    `</g>`,
    `</svg>`,
  ].join("");
}

/** Ivory on a dark corner, ink on a light one: decided from the pixels the mark will sit on. */
export async function chooseTone(rgb: Buffer, width: number, height: number): Promise<Tone> {
  const g = markGeometry(width, height);
  // (sharp's stats() reads the input image, not the extract, so average the cut-out pixels here.)
  const patch = await sharp(rgb, { raw: { width, height, channels: 3 } })
    .extract({ left: Math.max(0, g.left), top: Math.max(0, g.top), width: Math.min(g.boxW, width), height: Math.min(g.boxH, height) })
    .raw()
    .toBuffer();
  let sum = 0;
  for (let i = 0; i < patch.length; i += 3) sum += 0.2126 * patch[i]! + 0.7152 * patch[i + 1]! + 0.0722 * patch[i + 2]!;
  const luminance = sum / (patch.length / 3);
  return luminance > 140 ? "ink" : "ivory";
}

export type WebPhoto = { jpeg: Buffer; width: number; height: number; tone: Tone };

/**
 * Upright 8-bit sRGB pixels → the published web version: at most WEB_MAX_EDGE
 * on the long edge, the corner mark, the copyright line, nothing else.
 */
export async function protectPixels(rgb: Buffer, width: number, height: number): Promise<WebPhoto> {
  const { data, info } = await sharp(rgb, { raw: { width, height, channels: 3 } })
    .resize({ width: WEB_MAX_EDGE, height: WEB_MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const tone = await chooseTone(data, info.width, info.height);
  const g = markGeometry(info.width, info.height);
  const jpeg = await sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } })
    .composite([{ input: Buffer.from(markSvg(info.width, info.height, tone)), left: g.left, top: g.top }])
    .jpeg({ quality: WEB_JPEG_QUALITY, mozjpeg: true })
    .withExif({ IFD0: { Copyright: COPYRIGHT_NOTICE, Artist: ARTIST } })
    .toBuffer();
  return { jpeg, width: info.width, height: info.height, tone };
}

/** True when the file is a protected web version (it carries the MURANIQ copyright line). */
export async function isProtected(file: Buffer): Promise<boolean> {
  try {
    const m = await exifr.parse(file, { tiff: true, exif: false, gps: false, xmp: false, iptc: false, icc: false });
    return typeof m?.Copyright === "string" && m.Copyright.startsWith("Copyright MURANIQ");
  } catch {
    return false;
  }
}

/** "/images/collection/m007/m007-front-55a34bae.jpg" → ".../m007-front-<hash>.jpg"; a name without a hash gets one. */
export function protectedName(src: string, hash: string): string {
  const dir = path.posix.dirname(src);
  const base = path.posix.basename(src).replace(/\.(jpe?g|png|webp|avif|tiff?)$/i, "");
  return `${dir}/${base.replace(/-[0-9a-f]{8}$/, "")}-${hash}.jpg`;
}
