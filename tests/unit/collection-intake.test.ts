import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import QRCode from "qrcode";
import sharp from "sharp";
import { withCollection, type OwnCollection } from "@fixtures/dataset";
import collection from "@fixtures/collection.json";
import { validateDataset } from "@/content/validate";
import {
  isBlankRow,
  normaliseId,
  parseCmToMm,
  parsePeriod,
  parseRow,
  viewsForSequence,
  type ColumnKey,
} from "../../scripts/collection/sheet";
import { assignViews, groupPhotos, idFromPath, type PhotoMeta } from "../../scripts/collection/group";
import { buildRecord, upsert, type CollectionStore } from "../../scripts/collection/records";
import { parseCsv, readXlsxBuffer } from "../../scripts/collection/read-sheet";
import { p3ToSrgbInPlace, readSlateId, sniff } from "../../scripts/collection/photos";

const store = collection as unknown as CollectionStore;
const dataset = withCollection(store as unknown as OwnCollection);
const ctxBase = {
  techniques: dataset.techniques as never,
  creators: dataset.creators as never,
  takenSlugs: new Set(dataset.artworks.map((a) => a.slug)),
  today: "2026-11-12",
};
const row = (cells: Partial<Record<ColumnKey, string>>) => {
  const r = parseRow(cells, 9);
  return { value: r.value!, problems: r.problems };
};
const photo = (view: PhotoMeta["explicitView"] & string, i: number) => ({
  view,
  src: `/images/collection/m007/m007-${view}-${i}.jpg`,
  width: 2200,
  height: 1650,
});

describe("data sheet cells", () => {
  it("reads centimetres with a decimal comma and stores millimetres", () => {
    expect(parseCmToMm("24,5")).toBe(245);
    expect(parseCmToMm("12 cm")).toBe(120);
    expect(parseCmToMm("")).toBeUndefined();
    expect(() => parseCmToMm("abc")).toThrow();
    expect(() => parseCmToMm("0")).toThrow();
  });

  it("turns written periods into a label and years without widening them", () => {
    expect(parsePeriod("ca. 1960")).toMatchObject({ displayLabel: "c. 1960", fromYear: 1960, toYear: 1960 });
    expect(parsePeriod("1950s")).toMatchObject({ displayLabel: "1950s", fromYear: 1950, toYear: 1959 });
    expect(parsePeriod("jaren 70")).toMatchObject({ displayLabel: "1970s", fromYear: 1970, toYear: 1979 });
    expect(parsePeriod("1955-65")).toMatchObject({ displayLabel: "1955–1965", fromYear: 1955, toYear: 1965 });
    expect(parsePeriod("20e eeuw")).toMatchObject({ displayLabel: "20th century", fromYear: 1901, toYear: 2000 });
    expect(parsePeriod("Art Deco period")).toMatchObject({ displayLabel: "Art Deco period", recognised: false });
    expect(parsePeriod(" ")).toBeUndefined();
  });

  it("normalises object ids from cards, file names and sheets", () => {
    expect(normaliseId("M7")).toBe("MUR-M007");
    expect(normaliseId("mur-m012")).toBe("MUR-M012");
    expect(normaliseId("zoals op het kaartje")).toBeNull();
  });

  it("reports every problem in a row and never imports the internal note", () => {
    const { value, problems } = row({ id: "M010", maker: "Seguso", heightCm: "x", internalNote: "paid 450" });
    expect(problems.map((p) => p.message).join(" ")).toMatch(/Hoogte/);
    expect(problems.map((p) => p.message).join(" ")).toMatch(/basis van de toeschrijving/);
    expect(JSON.stringify(value)).not.toContain("450");
    expect(row({ id: "M010", maker: "X", basis: "Documentatie" }).problems.some((p) => /Bron/.test(p.message))).toBe(true);
    expect(isBlankRow({ id: "M011", internalNote: "later" })).toBe(true);
  });
});

describe("photo order", () => {
  it("follows the fixed shooting order, with a top view for open forms", () => {
    expect(viewsForSequence(6, { objectType: "Vase", signature: true, label: true })).toEqual([
      "front", "reverse", "base", "signature", "label", "detail",
    ]);
    expect(viewsForSequence(4, { objectType: "Bowl" })).toEqual(["front", "top", "base", "detail"]);
    expect(viewsForSequence(3, { photoOrder: ["front", "base"] })).toEqual(["front", "base", "detail"]);
  });

  it("splits a camera roll at the ID cards, in order of capture time", () => {
    const shots: PhotoMeta[] = [
      { rel: "c", takenAt: 30, slateId: "MUR-M008" },
      { rel: "a", takenAt: 10, slateId: "MUR-M007" },
      { rel: "z", takenAt: 11 },
      { rel: "b", takenAt: 12 },
      { rel: "d", takenAt: 31 },
      { rel: "early", takenAt: 1 },
    ];
    const g = groupPhotos(shots);
    expect(g.orderedBy).toBe("time");
    expect(g.groups.get("MUR-M007")!.map((p) => p.rel)).toEqual(["z", "b"]);
    expect(g.groups.get("MUR-M008")!.map((p) => p.rel)).toEqual(["d"]);
    expect(g.unassigned.map((p) => p.rel)).toEqual(["early"]);
    expect(g.problems.some((p) => p.level === "error")).toBe(true);
  });

  it("accepts folders or file names with the id, and view words in the name", () => {
    expect(idFromPath("M012/IMG_0001.HEIC")).toEqual({ explicitId: "MUR-M012", explicitView: undefined });
    expect(idFromPath("batch/M012-base.jpg")).toEqual({ explicitId: "MUR-M012", explicitView: "base" });
    expect(idFromPath("IMG_0001.JPG")).toEqual({ explicitId: undefined, explicitView: undefined });
    const shots: PhotoMeta[] = [
      { rel: "M012/1.jpg", explicitId: "MUR-M012" },
      { rel: "M012/2-signatuur.jpg", ...idFromPath("M012/2-signatuur.jpg") },
      { rel: "M012/3.jpg", explicitId: "MUR-M012" },
    ];
    const g = groupPhotos(shots);
    expect(g.orderedBy).toBe("name");
    expect(assignViews(g.groups.get("MUR-M012")!, { objectType: "Vase", signature: true })).toEqual([
      "front", "signature", "reverse",
    ]);
  });
});

describe("records", () => {
  it("builds a new object from the sheet with honest, generated wording", () => {
    const { value } = row({
      id: "M007", publish: "ja", highlight: "ja", category: "Murano Glass", objectType: "Bowl",
      techniques: "Sommerso, Facet-cut glass, Battuto", colours: "blue, amber, colourless", heightCm: "9,5",
      maker: "Flavio Poli", basis: "Stijl en vergelijking", period: "c. 1960", signature: "ja", signatureText: "Murano",
    });
    const r = buildRecord(value, {
      ...ctxBase,
      photos: [photo("front", 1), photo("top", 2), photo("base", 3), photo("signature", 4)],
    });
    const a = r.artwork!;
    expect(a.title).toBe("Sommerso bowl in blue and amber");
    expect(a.slug).toBe("sommerso-bowl-in-blue-and-amber");
    expect(a.techniqueIds).toEqual(["TEC-SOMMERSO", "TEC-MOLATO"]);
    expect(r.problems.some((p) => /Battuto/.test(p.message))).toBe(true);
    expect(a.assertions![0]).toMatchObject({ statement: "Possibly by Flavio Poli", certainty: "hypothesis" });
    expect(a.dating).toMatchObject({ displayLabel: "c. 1960", certainty: "hypothesis" });
    expect(a.dimensions).toEqual({ heightMm: 95 });
    expect(a.marks).toEqual([expect.objectContaining({ kind: "signature", transcription: "Murano", imageId: "IMG-M007-SIGNATURE" })]);
    expect(a.featured).toBe(true);
    expect(a.status).toBe("published");
    expect(r.media.map((m) => m.alt)).toContain("Sommerso bowl in blue and amber, seen from above");
    expect(r.media.every((m) => m.rights === "owned" && m.credit === "Photograph © MURANIQ")).toBe(true);

    // The site's own validation accepts the result.
    const next = upsert(store, { ...r, artwork: a });
    const check = validateDataset(withCollection(next as unknown as OwnCollection));
    expect(check.issues).toEqual([]);
  });

  it("links a known maker and cites documentation as a source", () => {
    const { value } = row({
      id: "M008", category: "Murano Glass", objectType: "Vase", maker: "Loredano Rosin", basis: "Documentatie",
      sourceText: "Certificate of the artist's studio, 2004",
    });
    const r = buildRecord(value, { ...ctxBase, photos: [photo("front", 1)] });
    expect(r.artwork!.creators).toEqual([{ creatorId: "CRE-ROSIN", role: "maker", certainty: "documented_attribution" }]);
    expect(r.sources).toEqual([expect.objectContaining({ id: "SRC-M008-1", title: "Certificate of the artist's studio, 2004" })]);
    expect(r.artwork!.status).toBe("draft");
  });

  it("re-import: empty cells keep the record, the URL never changes, the order only moves with the highlight", () => {
    const ex = store.artworks.find((a) => a.id === "MUR-M002")!;
    const media = store.media.filter((m) => m.artworkId === ex.id);
    const { value } = row({ id: "M002", title: "Faceted vase", heightCm: "28,3", highlight: "nee" });
    const r = buildRecord(value, { ...ctxBase, existing: { artwork: ex, media, sources: [] } });
    const a = r.artwork!;
    expect(a.slug).toBe(ex.slug);
    expect(a.description).toEqual(ex.description);
    expect(a.summary).toBe(ex.summary);
    expect(a.curatedOrder).toBe(ex.curatedOrder);
    expect(a.dimensions).toEqual({ heightMm: 283 });
    expect(r.media.map((m) => m.src)).toEqual(media.map((m) => m.src));
    expect(r.replacedSrcs).toEqual([]);

    const reshot = buildRecord(value, { ...ctxBase, existing: { artwork: ex, media, sources: [] }, photos: [photo("front", 9)] });
    expect(reshot.replacedSrcs).toEqual(media.map((m) => m.src));
  });

  it("refuses a new object without photographs", () => {
    const { value } = row({ id: "M030", category: "Murano Glass", objectType: "Vase" });
    expect(buildRecord(value, ctxBase).artwork).toBeUndefined();
  });
});

describe("reading the sheet", () => {
  it("reads an Excel file, whatever the column order", async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Objecten");
    ws.addRow(["Hoogte (cm)", "Object-ID", "Collectiegebied", "Objectsoort", "Mijn eigen kolom"]);
    ws.addRow(["bijv. 24,5", "zoals op het kaartje", "kies", "", ""]);
    ws.addRow([24.5, "M007", "Murano Glass", "Vase", "x"]);
    const grid = readXlsxBuffer(new Uint8Array(await wb.xlsx.writeBuffer()));
    expect(grid[2]).toEqual(["24.5", "M007", "Murano Glass", "Vase", "x"]);
  });

  it("reads a Dutch Excel CSV (semicolons, quotes, line breaks)", () => {
    expect(parseCsv('Object-ID;Beschrijving\nM007;"A bowl; heavy.\nSecond ""para"""\n')).toEqual([
      ["Object-ID", "Beschrijving"],
      ["M007", 'A bowl; heavy.\nSecond "para"'],
    ]);
  });
});

describe("photographs", () => {
  it("recognises image files without an extension", () => {
    expect(sniff(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe("jpeg");
    expect(sniff(Buffer.from("....ftypheic", "latin1"))).toBe("heic");
    expect(sniff(Buffer.from("PK\u0003\u0004", "latin1"))).toBeNull();
  });

  it("converts Display P3 pixels to sRGB", () => {
    // sRGB (200,100,50) is P3 (187,106,63); the conversion must bring it back.
    const px = Buffer.from([187, 106, 63, 255, 255, 255]);
    p3ToSrgbInPlace(px, 3);
    expect(Math.max(...[...px.subarray(0, 3)].map((v, i) => Math.abs(v - [200, 100, 50][i]!)))).toBeLessThanOrEqual(2);
    expect([...px.subarray(3)]).toEqual([255, 255, 255]);
  });

  it("reads the object id from a photographed ID card", async () => {
    const qr = await QRCode.toBuffer("MUR-M012", { margin: 3, width: 360 });
    const scene = await sharp({ create: { width: 1600, height: 1200, channels: 3, background: "#b9b4ac" } })
      .composite([{ input: await sharp(qr).rotate(7, { background: "#ffffff" }).toBuffer(), left: 600, top: 400 }])
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    expect(await readSlateId({ data: scene.data, width: scene.info.width, height: scene.info.height })).toBe("MUR-M012");
    const plain = await sharp({ create: { width: 800, height: 600, channels: 3, background: "#ddd" } }).raw().toBuffer();
    expect(await readSlateId({ data: plain, width: 800, height: 600 })).toBeUndefined();
  });
});
