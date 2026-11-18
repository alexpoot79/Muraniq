/**
 * Reading and converting the owner's photographs.
 *
 * - Accepts iPhone HEIC as well as JPEG, PNG, TIFF, WebP and AVIF, with or
 *   without a file extension (uploads arrive without one).
 * - Upright (EXIF orientation), converted to sRGB (iPhone photographs are
 *   Display P3), resized to at most 2200 px, saved as JPEG.
 * - ALL metadata is removed from the published file: no GPS location, no
 *   camera serial, no capture time. Only pixels reach the public repository.
 * - No retouching: no colour, contrast or background edits.
 */
import { createHash } from "node:crypto";
import { open, readdir, stat } from "node:fs/promises";
import path from "node:path";
import exifr from "exifr";
import jsQR from "jsqr";
import sharp from "sharp";
// heic-decode ships no types.
// @ts-expect-error -- untyped module
import heicDecode from "heic-decode";
import { normaliseId } from "./sheet.ts";

export const MAX_EDGE = 2200;
export const JPEG_QUALITY = 85;

export type ImageKind = "jpeg" | "png" | "heic" | "avif" | "tiff" | "webp";

export function sniff(head: Buffer): ImageKind | null {
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "jpeg";
  if (head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (head.subarray(4, 8).toString("latin1") === "ftyp") {
    const brand = head.subarray(8, 12).toString("latin1");
    if (brand === "avif" || brand === "avis") return "avif";
    if (["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1"].includes(brand)) return "heic";
  }
  if (head.subarray(0, 4).toString("latin1") === "RIFF" && head.subarray(8, 12).toString("latin1") === "WEBP") return "webp";
  const t = head.subarray(0, 4).toString("hex");
  if (t === "49492a00" || t === "4d4d002a") return "tiff";
  return null;
}

async function head(file: string): Promise<Buffer> {
  const fh = await open(file, "r");
  try {
    const buf = Buffer.alloc(16);
    await fh.read(buf, 0, 16, 0);
    return buf;
  } finally {
    await fh.close();
  }
}

export async function listImageFiles(root: string): Promise<{ images: Array<{ file: string; rel: string; kind: ImageKind }>; skipped: string[] }> {
  const images: Array<{ file: string; rel: string; kind: ImageKind }> = [];
  const skipped: string[] = [];
  async function walk(dir: string) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || entry.name === "__MACOSX") continue;
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile()) {
        const kind = sniff(await head(file));
        if (kind) images.push({ file, rel: path.relative(root, file), kind });
        else skipped.push(path.relative(root, file));
      }
    }
  }
  const s = await stat(root);
  if (s.isFile()) {
    const kind = sniff(await head(root));
    if (kind) images.push({ file: root, rel: path.basename(root), kind });
  } else await walk(root);
  return { images, skipped };
}

export type CaptureInfo = { takenAt?: number; p3: boolean };

/** Capture time (to the millisecond where the camera records it) and colour profile. */
export async function readCaptureInfo(buf: Buffer): Promise<CaptureInfo> {
  try {
    const m = await exifr.parse(buf, {
      tiff: true,
      exif: true,
      icc: true,
      gps: false,
      xmp: false,
      iptc: false,
      mergeOutput: true,
    });
    const date: unknown = m?.DateTimeOriginal ?? m?.CreateDate;
    const sub = Number(String(m?.SubSecTimeOriginal ?? "0").padEnd(3, "0").slice(0, 3));
    const takenAt = date instanceof Date && !Number.isNaN(date.getTime()) ? date.getTime() + (Number.isFinite(sub) ? sub : 0) : undefined;
    return { takenAt, p3: /p3/i.test(String(m?.ProfileDescription ?? "")) };
  } catch {
    return { p3: false };
  }
}

export type Normalised = { data: Buffer; width: number; height: number };

/* Display P3 → sRGB (both D65, same transfer curve): linearise, 3×3 matrix, clip, re-encode. */
const P3_TO_SRGB = [1.2249401, -0.2249404, 0, -0.0420569, 1.0420571, 0, -0.0196376, -0.0786361, 1.0982735];
const TO_LINEAR = Float64Array.from({ length: 256 }, (_, i) => {
  const c = i / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
});
const ENC_STEPS = 4096;
const TO_SRGB8 = Uint8Array.from({ length: ENC_STEPS + 1 }, (_, i) => {
  const l = i / ENC_STEPS;
  const c = l <= 0.0031308 ? l * 12.92 : 1.055 * l ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, c)) * 255);
});

const enc = (v: number) => TO_SRGB8[Math.round((v < 0 ? 0 : v > 1 ? 1 : v) * ENC_STEPS)]!;

export function p3ToSrgbInPlace(rgb: Buffer, channels: number) {
  const m = P3_TO_SRGB;
  for (let i = 0; i < rgb.length; i += channels) {
    const r = TO_LINEAR[rgb[i]!]!;
    const g = TO_LINEAR[rgb[i + 1]!]!;
    const b = TO_LINEAR[rgb[i + 2]!]!;
    rgb[i] = enc(m[0]! * r + m[1]! * g + m[2]! * b);
    rgb[i + 1] = enc(m[3]! * r + m[4]! * g + m[5]! * b);
    rgb[i + 2] = enc(m[6]! * r + m[7]! * g + m[8]! * b);
  }
}

/** Upright 8-bit sRGB pixels, whatever the input format. */
export async function decodeNormalised(buf: Buffer, kind: ImageKind, info: CaptureInfo): Promise<Normalised> {
  if (kind === "heic") {
    // libheif applies the HEIF rotation/mirroring itself; pixels come out in the file's colour space.
    const img: { width: number; height: number; data: Uint8ClampedArray } = await heicDecode({ buffer: buf });
    const rgba = Buffer.from(img.data.buffer, img.data.byteOffset, img.data.byteLength);
    if (info.p3) p3ToSrgbInPlace(rgba, 4);
    const { data, info: out } = await sharp(rgba, { raw: { width: img.width, height: img.height, channels: 4 } })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    return { data, width: out.width, height: out.height };
  }
  // sharp converts an embedded ICC profile (e.g. Display P3) to sRGB and applies EXIF orientation.
  const { data, info: out } = await sharp(buf, { failOn: "none" })
    .rotate()
    .flatten({ background: "#ffffff" })
    .toColourspace("srgb")
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: out.width, height: out.height };
}

const raw = (n: Normalised) => sharp(n.data, { raw: { width: n.width, height: n.height, channels: 3 } });

/** The object id on an ID card, or undefined when the photograph shows no MURANIQ QR code. */
export async function readSlateId(n: Normalised): Promise<string | undefined> {
  for (const edge of [1200, 2000]) {
    const { data, info } = await raw(n)
      .resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const code = jsQR(new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength), info.width, info.height, {
      inversionAttempts: "attemptBoth",
    });
    if (code?.data) {
      const id = normaliseId(code.data.replace(/^MURANIQ[:\s]*/i, ""));
      if (id) return id;
    }
  }
  return undefined;
}

export type Derivative = { jpeg: Buffer; width: number; height: number; hash: string; thumb: Buffer };

/** Web JPEG without any metadata, plus a thumbnail for the review sheet. */
export async function makeDerivative(n: Normalised): Promise<Derivative> {
  const { data: jpeg, info } = await raw(n)
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });
  const thumb = await sharp(jpeg).resize({ width: 220, height: 220, fit: "inside" }).jpeg({ quality: 80 }).toBuffer();
  const hash = createHash("sha1").update(jpeg).digest("hex").slice(0, 8);
  return { jpeg, width: info.width, height: info.height, hash, thumb };
}

export async function thumbnail(n: Normalised): Promise<Buffer> {
  return raw(n).resize({ width: 220, height: 220, fit: "inside" }).jpeg({ quality: 80 }).toBuffer();
}
