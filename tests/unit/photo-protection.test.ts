import { readFile } from "node:fs/promises";
import path from "node:path";
import exifr from "exifr";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import collection from "@fixtures/collection.json";
import { MediaAsset } from "@/content/schemas";
import { projectMedia } from "@/content/public-projection";
import { makeDerivative } from "../../scripts/collection/photos";
import {
  COPYRIGHT_NOTICE,
  WEB_MAX_EDGE,
  isProtected,
  markGeometry,
  protectedName,
  protectPixels,
} from "../../scripts/collection/watermark";

const flat = (width: number, height: number, background: string) =>
  sharp({ create: { width, height, channels: 3, background } }).raw().toBuffer();

/** Mean luminance of the area where the corner mark sits. */
async function markAreaMean(jpeg: Buffer) {
  const { width, height } = await sharp(jpeg).metadata();
  const g = markGeometry(width!, height!);
  const { channels } = await sharp(await sharp(jpeg).extract({ left: g.left, top: g.top, width: g.boxW, height: g.boxH }).toBuffer()).stats();
  return channels[0]!.mean;
}

describe("protected web versions of the owner's photographs", () => {
  it("are at most 1600 px, never enlarged, and carry only the copyright line", async () => {
    const big = await protectPixels(await flat(3024, 4032, "#222222"), 3024, 4032);
    expect(Math.max(big.width, big.height)).toBe(WEB_MAX_EDGE);
    expect(big.width).toBe(1200);
    const small = await protectPixels(await flat(900, 700, "#222222"), 900, 700);
    expect([small.width, small.height]).toEqual([900, 700]);

    const meta = await exifr.parse(big.jpeg, true);
    expect(meta.Copyright).toBe(COPYRIGHT_NOTICE);
    expect(meta.Artist).toBe("MURANIQ");
    for (const tag of ["latitude", "longitude", "GPSLatitude", "DateTimeOriginal", "Make", "Model", "SerialNumber", "BodySerialNumber"])
      expect(meta[tag], tag).toBeUndefined();
    expect(await isProtected(big.jpeg)).toBe(true);
  });

  it("puts a light mark on a dark corner and a dark mark on a light corner", async () => {
    const dark = await protectPixels(await flat(1600, 1200, "#101010"), 1600, 1200);
    expect(dark.tone).toBe("ivory");
    expect(await markAreaMean(dark.jpeg)).toBeGreaterThan(16 + 3); // lighter than the plain background
    const light = await protectPixels(await flat(1600, 1200, "#c8c8c8"), 1600, 1200);
    expect(light.tone).toBe("ink");
    expect(await markAreaMean(light.jpeg)).toBeLessThan(200 - 3); // darker than the plain background
  });

  it("keeps the mark small and quiet: inside the bottom-right corner, under half a percent of the picture", () => {
    for (const [w, h] of [
      [1600, 1200],
      [1200, 1600],
      [919, 1600],
    ] as const) {
      const g = markGeometry(w, h);
      expect(g.left).toBeGreaterThan(w / 2);
      expect(g.top).toBeGreaterThan(h * 0.9);
      expect(g.left + g.boxW).toBeLessThan(w);
      expect(g.top + g.boxH).toBeLessThan(h);
      expect((g.boxW * g.boxH) / (w * h)).toBeLessThan(0.005);
      expect(g.boxW / w).toBeLessThan(0.25);
    }
  });

  it("an unprotected file is recognised, so nothing is ever marked twice", async () => {
    const plain = await sharp(await flat(400, 300, "#888888"), { raw: { width: 400, height: 300, channels: 3 } }).jpeg().toBuffer();
    expect(await isProtected(plain)).toBe(false);
  });

  it("the importer publishes protected versions", async () => {
    const d = await makeDerivative({ data: await flat(2400, 1800, "#303030"), width: 2400, height: 1800 });
    expect([d.width, d.height]).toEqual([1600, 1200]);
    expect(await isProtected(d.jpeg)).toBe(true);
  });

  it("a converted file gets a new name, so the old unprotected one is never served again", () => {
    expect(protectedName("/images/collection/m007/m007-front-55a34bae.jpg", "0123abcd")).toBe("/images/collection/m007/m007-front-0123abcd.jpg");
    expect(protectedName("/images/collection/r025-sommerso-bowl-top-v3.jpg", "0123abcd")).toBe("/images/collection/r025-sommerso-bowl-top-v3-0123abcd.jpg");
  });
});

describe("every own photograph on the site", () => {
  const media = (collection as { media: unknown[] }).media.map((m) => MediaAsset.parse(m));
  const owned = media.filter((m) => m.rights === "owned");

  it("is the protected web version, with the size the page declares", async () => {
    expect(owned.length).toBeGreaterThan(0);
    for (const m of owned) {
      const file = await readFile(path.join(process.cwd(), "public", m.src));
      const { width, height } = await sharp(file).metadata();
      expect(await isProtected(file), `${m.src} has no corner mark (run npm run collection:protect)`).toBe(true);
      expect(Math.max(width!, height!), m.src).toBeLessThanOrEqual(WEB_MAX_EDGE);
      expect([width, height], m.src).toEqual([m.width, m.height]);
    }
  });

  it("is flagged for the right-click and drag guard; museum images are not", () => {
    for (const m of owned) expect(projectMedia(m).ownPhoto).toBe(true);
    const museum = { ...owned[0]!, rights: "public_domain" as const };
    expect(projectMedia(museum).ownPhoto).toBe(false);
  });
});
