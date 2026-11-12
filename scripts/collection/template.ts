/**
 * Writes the data-sheet template (Excel) with dropdowns, pre-filled with the
 * objects already on the site and empty rows for the next object ids.
 *
 *   npm run collection:template -- [--to 306] [--out tmp/MURANIQ-datasheet.xlsx]
 *
 * The technique dropdown is read from the site's own technique list, so new
 * Glass Guide techniques appear after regenerating.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";
import { fixtureDataset } from "../../fixtures/dataset.ts";
import collection from "../../fixtures/collection.json";
import {
  AVAILABILITY_CHOICES,
  BASIS_CHOICES,
  CATEGORY_CHOICES,
  COLUMNS,
  OBJECT_TYPES,
  YES_NO,
  shortId,
  type ColumnGroup,
  type ColumnKey,
} from "./sheet.ts";
import type { ArtworkRecord } from "./records.ts";

const GROUP_COLOUR: Record<ColumnGroup, string> = {
  basis: "FF1F2A30",
  maten: "FF3B4A40",
  toeschrijving: "FF4A3B2E",
  merken: "FF3E3550",
  tekst: "FF2E3F55",
  intern: "FF555555",
};

function args() {
  const a = process.argv.slice(2);
  const get = (k: string) => {
    const i = a.indexOf(k);
    return i >= 0 ? a[i + 1] : undefined;
  };
  return {
    to: Number(get("--to") ?? 306),
    out: path.resolve(get("--out") ?? "tmp/MURANIQ-datasheet.xlsx"),
  };
}

const BASIS_FROM_NOTE: Array<[RegExp, string]> = [
  [/signature/i, "Signatuur"],
  [/label/i, "Etiket"],
  [/documentation/i, "Documentatie"],
  [/style/i, "Stijl en vergelijking"],
];

/** Sheet values for an object that is already on the site. */
function rowFromRecord(a: ArtworkRecord): Partial<Record<ColumnKey, string | number>> {
  const techniques = fixtureDataset.techniques;
  const creator = a.assertions?.find((x) => x.field === "creator");
  const maker = creator && creator.certainty !== "unknown" ? creator.statement.replace(/^(Attributed to|Probably by|Possibly by) /, "") : "";
  const basis = creator && creator.certainty !== "unknown" ? (BASIS_FROM_NOTE.find(([re]) => re.test(creator.publicNote ?? ""))?.[1] ?? "") : "";
  const sig = a.marks?.find((m) => m.kind === "signature");
  const lab = a.marks?.find((m) => m.kind === "label");
  const cm = (mm?: number) => (mm ? mm / 10 : "");
  return {
    id: shortId(a.id),
    publish: a.status === "published" ? "ja" : "nee",
    highlight: a.featured ? "ja" : "nee",
    category: CATEGORY_CHOICES[a.category],
    objectType: a.objectType,
    title: a._generated?.includes("title") ? "" : a.title,
    techniques: (a.techniqueIds ?? []).map((id) => techniques.find((t) => t.id === id)?.term ?? id).join(", "),
    colours: (a.colours ?? []).join(", "),
    materials: (a.materials ?? []).join(", "),
    heightCm: cm(a.dimensions?.heightMm),
    widthCm: cm(a.dimensions?.widthMm),
    depthCm: cm(a.dimensions?.depthMm),
    diameterCm: cm(a.dimensions?.diameterMm),
    weightG: a.dimensions?.weightG ?? "",
    maker,
    basis: basis || "Onbekend",
    period: a.dating?.displayLabel ?? "",
    country: a.country ?? "",
    signature: sig ? "ja" : "",
    signatureText: sig?.transcription ?? "",
    signatureLocation: sig?.location ?? "",
    label: lab ? "ja" : "",
    labelText: lab?.transcription ?? "",
    labelLocation: lab?.location ?? "",
    condition: a.condition ?? "",
    availability: AVAILABILITY_CHOICES[a.availability],
  };
}

async function main() {
  const { to, out } = args();
  const wb = new ExcelJS.Workbook();
  wb.creator = "MURANIQ";
  const ws = wb.addWorksheet("Objecten", { views: [{ state: "frozen", xSplit: 1, ySplit: 2 }] });
  const help = wb.addWorksheet("Uitleg");
  const lists = wb.addWorksheet("Lijsten", { state: "hidden" });

  // Lists for the dropdowns.
  const listValues: Record<string, readonly string[]> = {
    yesno: YES_NO,
    category: Object.values(CATEGORY_CHOICES),
    objectType: OBJECT_TYPES,
    techniques: fixtureDataset.techniques.filter((t) => t.status === "published").map((t) => t.term),
    basis: BASIS_CHOICES,
    availability: Object.values(AVAILABILITY_CHOICES),
  };
  const listRef: Record<string, string> = {};
  Object.entries(listValues).forEach(([name, values], i) => {
    const col = String.fromCharCode(65 + i);
    values.forEach((v, r) => (lists.getCell(`${col}${r + 1}`).value = v));
    listRef[name] = `Lijsten!$${col}$1:$${col}$${values.length}`;
  });
  const refFor = (key: ColumnKey) => {
    const c = COLUMNS.find((x) => x.key === key)!;
    if (c.list === "techniques") return listRef.techniques;
    if (c.list === YES_NO) return listRef.yesno;
    if (key === "category") return listRef.category;
    if (key === "objectType") return listRef.objectType;
    if (key === "basis") return listRef.basis;
    if (key === "availability") return listRef.availability;
    return undefined;
  };

  // Header and hint rows.
  ws.columns = COLUMNS.map((c) => ({ key: c.key, width: c.width }));
  COLUMNS.forEach((c, i) => {
    const h = ws.getRow(1).getCell(i + 1);
    h.value = c.header;
    h.font = { bold: true, color: { argb: "FFFFFFFF" } };
    h.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GROUP_COLOUR[c.group] } };
    h.alignment = { vertical: "middle", wrapText: true };
    const hint = ws.getRow(2).getCell(i + 1);
    hint.value = c.hint;
    hint.font = { italic: true, size: 9, color: { argb: "FF777777" } };
    hint.alignment = { wrapText: true, vertical: "top" };
  });
  ws.getRow(1).height = 32;
  ws.getRow(2).height = 26;
  for (const key of ["id", "period", "signatureText", "labelText"] as const) {
    ws.getColumn(COLUMNS.findIndex((c) => c.key === key) + 1).numFmt = "@";
  }

  // Data rows: objects already on the site, then empty rows for the next ids.
  const store = collection as unknown as { artworks: ArtworkRecord[] };
  const rows = store.artworks.map((a) => rowFromRecord(a));
  const highest = Math.max(0, ...store.artworks.map((a) => Number(shortId(a.id).slice(1))));
  for (let n = highest + 1; n <= to; n++) rows.push({ id: `M${String(n).padStart(3, "0")}` });
  rows.forEach((values, i) => {
    const row = ws.getRow(i + 3);
    COLUMNS.forEach((c, ci) => {
      const cell = row.getCell(ci + 1);
      const v = values[c.key];
      if (v !== undefined && v !== "") cell.value = v;
      const ref = refFor(c.key);
      if (ref)
        cell.dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [ref],
          showErrorMessage: !!c.listIsStrict,
          errorStyle: "stop",
          errorTitle: c.header,
          error: "Kies een waarde uit de lijst.",
        };
    });
    if (i < store.artworks.length) row.getCell(1).font = { bold: true };
  });

  // Explanation sheet.
  help.columns = [
    { header: "Kolom", key: "h", width: 26 },
    { header: "Uitleg", key: "t", width: 110 },
  ];
  help.getRow(1).font = { bold: true };
  const intro = [
    ["Werkwijze", "Eén rij per object. Het object-ID is het nummer op het ID-kaartje dat u als eerste foto van het object maakt."],
    ["Vaste fotovolgorde", "ID-kaartje · 1 voorkant · 2 achterkant (schaal/schotel: van boven) · 3 onderkant · 4 signatuur (als die er is) · 5 etiket (als dat er is) · daarna 0–3 details."],
    ["Taal", "Kolomnamen zijn Nederlands; alles wat op de site komt (titel, kleuren, beschrijving, conditie, periode) in het Engels."],
    ["Leeg laten", "Een lege cel betekent: onbekend of niet wijzigen. Er wordt nooit iets verzonnen."],
    ["Privé", "Geen prijzen, verzekeringswaarden, adressen of bewaarplaatsen in dit bestand: de gegevens komen op een openbare site."],
    ["", ""],
  ];
  for (const [h, t] of intro) help.addRow({ h, t }).getCell(1).font = { bold: true };
  for (const c of COLUMNS) help.addRow({ h: c.header, t: c.help });
  help.getColumn(2).alignment = { wrapText: true, vertical: "top" };

  await mkdir(path.dirname(out), { recursive: true });
  await wb.xlsx.writeFile(out);
  console.log(`Sjabloon geschreven: ${out} (${rows.length} rijen, t/m M${String(to).padStart(3, "0")})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
