/**
 * Imports a batch of collection photographs plus the data sheet.
 *
 *   npm run collection:import -- <photo folder> --sheet <datasheet.xlsx|.csv> [options]
 *
 * Options:
 *   --only M007-M030,M041   import only these objects (ranges allowed)
 *   --dry-run               check and write the review sheet + report, change nothing
 *   --report-dir <dir>      where the review sheet and report go (default tmp/collection-import/<time>)
 *
 * Without a photo folder only the data of existing objects is updated.
 * See docs/COLLECTION-PHOTOS.md for the whole workflow.
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp, { type OverlayOptions } from "sharp";
import { withCollection, type OwnCollection } from "../../fixtures/dataset.ts";
import { validateDataset } from "../../src/content/validate.ts";
import { Artwork, MediaAsset, Source, type ViewType } from "../../src/content/schemas/index.ts";
import { assignViews, groupPhotos, idFromPath, type PhotoMeta } from "./group.ts";
import {
  decodeNormalised,
  listImageFiles,
  makeDerivative,
  readCaptureInfo,
  readSlateId,
  thumbnail,
  type Derivative,
} from "./photos.ts";
import { readSheet } from "./read-sheet.ts";
import { buildRecord, upsert, type CollectionStore, type ProcessedPhoto } from "./records.ts";
import { isBlankRow, normaliseId, parseRow, shortId, type IntakeRow, type Problem } from "./sheet.ts";

const ROOT = process.cwd();
const STORE_FILE = path.join(ROOT, "fixtures/collection.json");
const PUBLIC_DIR = path.join(ROOT, "public");
const COLLECTION_IMG = "/images/collection";

type Args = { photos?: string; sheet: string; only?: Set<string>; dryRun: boolean; reportDir: string };

function expandOnly(spec: string): Set<string> {
  const out = new Set<string>();
  for (const part of spec.split(",").map((s) => s.trim()).filter(Boolean)) {
    const [a, b] = part.split("-").length === 2 && !/^mur$/i.test(part.split("-")[0]!) ? part.split("-") : [part];
    const from = normaliseId(a!);
    const to = b ? normaliseId(b) : from;
    if (!from || !to) throw new Error(`--only: '${part}' is geen object-ID of reeks`);
    for (let n = Number(shortId(from).slice(1)); n <= Number(shortId(to).slice(1)); n++)
      out.add(`MUR-M${String(n).padStart(3, "0")}`);
  }
  return out;
}

function parseArgs(argv: string[]): Args {
  let photos: string | undefined;
  let sheet: string | undefined;
  let only: Set<string> | undefined;
  let dryRun = false;
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
  let reportDir = path.join(ROOT, "tmp/collection-import", stamp);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--sheet") sheet = argv[++i];
    else if (a === "--only") only = expandOnly(argv[++i] ?? "");
    else if (a === "--dry-run") dryRun = true;
    else if (a === "--report-dir") reportDir = path.resolve(argv[++i] ?? reportDir);
    else if (!a.startsWith("--")) photos = path.resolve(a);
    else throw new Error(`Onbekende optie ${a}`);
  }
  if (!sheet) throw new Error("Geef de datasheet op met --sheet <bestand>.");
  return { photos, sheet: path.resolve(sheet), only, dryRun, reportDir };
}

type PhotoRecord = PhotoMeta & { derivative?: Derivative; thumb: Buffer };

async function readPhotos(dir: string, problems: Problem[]) {
  const { images, skipped } = await listImageFiles(dir);
  if (skipped.length) console.log(`  ${skipped.length} bestand(en) zonder foto overgeslagen (${skipped.slice(0, 3).join(", ")}${skipped.length > 3 ? " …" : ""})`);
  const records: PhotoRecord[] = [];
  let i = 0;
  for (const img of images) {
    i++;
    process.stdout.write(`\r  foto ${i}/${images.length}`);
    try {
      const buf = await readFile(img.file);
      const info = await readCaptureInfo(buf);
      const norm = await decodeNormalised(buf, img.kind, info);
      const slateId = await readSlateId(norm);
      const meta: PhotoMeta = { rel: img.rel, takenAt: info.takenAt, ...idFromPath(img.rel), ...(slateId ? { slateId } : {}) };
      if (slateId) records.push({ ...meta, thumb: await thumbnail(norm) });
      else {
        const derivative = await makeDerivative(norm);
        records.push({ ...meta, derivative, thumb: derivative.thumb });
      }
    } catch (e) {
      problems.push({ level: "error", message: `Foto ${img.rel} kon niet worden gelezen: ${(e as Error).message}` });
    }
  }
  process.stdout.write("\n");
  return records;
}

/* ------------------------------------------------------------------ */
/* Review sheet (contact sheet)                                        */
/* ------------------------------------------------------------------ */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

type SheetLine = { heading: string; sub: string; tiles: Array<{ thumb: Buffer; caption: string; tone?: "slate" | "error" }> };

async function writeContactSheets(lines: SheetLine[], dir: string): Promise<string[]> {
  const W = 1800;
  const TILE = 220;
  const GAP = 16;
  const HEAD = 76;
  const perRow = Math.floor((W - GAP) / (TILE + GAP));
  const font = `font-family="DejaVu Sans, Arial, sans-serif"`;
  const files: string[] = [];
  const pages: SheetLine[][] = [];
  for (let i = 0; i < lines.length; i += 8) pages.push(lines.slice(i, i + 8));
  for (const [p, page] of pages.entries()) {
    const heights = page.map((l) => HEAD + Math.ceil(l.tiles.length / perRow) * (TILE + 40) + GAP);
    const H = heights.reduce((a, b) => a + b, 0) + GAP;
    const composites: OverlayOptions[] = [];
    let svg = "";
    let y = GAP;
    for (const [li, line] of page.entries()) {
      svg += `<text x="${GAP}" y="${y + 32}" ${font} font-size="30" font-weight="bold" fill="#111">${esc(line.heading)}</text>`;
      svg += `<text x="${GAP}" y="${y + 60}" ${font} font-size="19" fill="#555">${esc(line.sub)}</text>`;
      for (const [ti, tile] of line.tiles.entries()) {
        const x = GAP + (ti % perRow) * (TILE + GAP);
        const ty = y + HEAD + Math.floor(ti / perRow) * (TILE + 40);
        const meta = await sharp(tile.thumb).metadata();
        composites.push({
          input: tile.thumb,
          left: x + Math.round((TILE - (meta.width ?? TILE)) / 2),
          top: ty + Math.round((TILE - (meta.height ?? TILE)) / 2),
        });
        const fill = tile.tone === "error" ? "#b00020" : tile.tone === "slate" ? "#777" : "#111";
        svg += `<rect x="${x - 1}" y="${ty - 1}" width="${TILE + 2}" height="${TILE + 2}" fill="none" stroke="${tile.tone === "error" ? "#b00020" : "#ccc"}"/>`;
        svg += `<text x="${x + TILE / 2}" y="${ty + TILE + 26}" text-anchor="middle" ${font} font-size="19" fill="${fill}">${esc(tile.caption.slice(0, 24))}</text>`;
      }
      y += heights[li]!;
      svg += `<line x1="0" y1="${y - GAP / 2}" x2="${W}" y2="${y - GAP / 2}" stroke="#ddd"/>`;
    }
    const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svg}</svg>`);
    const file = path.join(dir, `contactvel-${String(p + 1).padStart(2, "0")}.jpg`);
    await sharp({ create: { width: W, height: H, channels: 3, background: "#f7f6f3" } })
      .composite([...composites, { input: overlay, left: 0, top: 0 }])
      .jpeg({ quality: 82 })
      .toFile(file);
    files.push(file);
  }
  return files;
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

const VIEW_NL: Record<ViewType, string> = {
  front: "voorkant",
  reverse: "achterkant",
  top: "bovenaanzicht",
  side: "zijkant",
  base: "onderkant",
  signature: "signatuur",
  label: "etiket",
  detail: "detail",
  context: "context",
};

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const problems: Problem[] = [];
  const today = new Date().toISOString().slice(0, 10);
  await mkdir(args.reportDir, { recursive: true });

  // 1. Sheet
  console.log(`Datasheet: ${args.sheet}`);
  const rows: IntakeRow[] = [];
  for (const r of await readSheet(args.sheet)) {
    if (isBlankRow(r.cells)) continue;
    const { value, problems: p } = parseRow(r.cells, r.row);
    problems.push(...p);
    if (value && (!args.only || args.only.has(value.id))) rows.push(value);
  }
  const dupes = rows.map((r) => r.id).filter((id, i, all) => all.indexOf(id) !== i);
  for (const d of new Set(dupes)) problems.push({ level: "error", id: shortId(d), message: "Dit object-ID staat meer dan eens in de datasheet." });

  // 2. Photographs
  let grouping: ReturnType<typeof groupPhotos> | undefined;
  const byRel = new Map<string, PhotoRecord>();
  if (args.photos) {
    console.log(`Foto's: ${args.photos}`);
    const photos = await readPhotos(args.photos, problems);
    for (const p of photos) byRel.set(p.rel, p);
    grouping = groupPhotos(photos);
    problems.push(...grouping.problems);
    console.log(`  ${photos.length} foto's, ${grouping.slates.size} ID-kaartjes, ${grouping.groups.size} objecten, volgorde op ${grouping.orderedBy === "time" ? "opnametijd" : "bestandsnaam"}`);
  }

  // 3. Records
  let store: CollectionStore = JSON.parse(await readFile(STORE_FILE, "utf8"));
  const { techniques, creators, artworks: allArtworks } = withCollection(store as unknown as OwnCollection);
  const rowIds = new Set(rows.map((r) => r.id));
  for (const id of grouping?.groups.keys() ?? [])
    if (!rowIds.has(id) && (!args.only || args.only.has(id)))
      problems.push({ level: "error", id: shortId(id), message: "Foto's gevonden, maar dit object-ID staat niet (ingevuld) in de datasheet." });

  const lines: SheetLine[] = [];
  const writes: Array<{ abs: string; data: Buffer }> = [];
  const deletes: string[] = [];
  const imported: string[] = [];
  const unchanged: string[] = [];
  for (const row of rows) {
    const sid = shortId(row.id);
    if (problems.some((p) => p.level === "error" && p.id === sid)) continue;
    const existing = store.artworks.find((a) => a.id === row.id);
    const group = grouping?.groups.get(row.id) ?? [];
    if (!existing && !group.length) {
      problems.push({ level: "warning", id: sid, row: row.row, message: "Nog geen foto's en nog niet op de site: overgeslagen." });
      continue;
    }
    const views = assignViews(group, row);
    const photos: ProcessedPhoto[] = group.map((g, i) => {
      const d = byRel.get(g.rel)!.derivative!;
      const view = views[i]!;
      const sameView = views.slice(0, i).filter((v) => v === view).length + 1;
      const name = `${sid.toLowerCase()}-${view}${sameView > 1 || view === "detail" ? `-${sameView}` : ""}-${d.hash}.jpg`;
      return { view, src: `${COLLECTION_IMG}/${sid.toLowerCase()}/${name}`, width: d.width, height: d.height };
    });
    const takenSlugs = new Set(allArtworks.filter((a) => a.id !== row.id).map((a) => a.slug));
    const result = buildRecord(row, {
      existing: existing && {
        artwork: existing,
        media: store.media.filter((m) => m.artworkId === row.id),
        sources: store.sources,
      },
      photos: photos.length ? photos : undefined,
      techniques,
      creators,
      takenSlugs,
      today,
    });
    problems.push(...result.problems);
    if (!result.artwork) continue;
    if (existing && !photos.length) {
      // Nothing changed for this object: leave the record (and its date) alone.
      // Compare with schema defaults applied, so `[]` and "not set" count as the same.
      const art = (a: unknown) => JSON.stringify({ ...Artwork.parse(a), updatedAt: undefined });
      const med = (list: unknown[]) => JSON.stringify(list.map((m) => MediaAsset.parse(m)));
      const src = (list: unknown[]) => JSON.stringify(list.map((x) => Source.parse(x)));
      const sameSources = src(result.sources) === src(store.sources.filter((x) => x.id.startsWith(`SRC-${sid}-`)));
      const sameMedia = med(result.media) === med(store.media.filter((m) => m.artworkId === row.id));
      if (art(result.artwork) === art(existing) && sameSources && sameMedia) {
        unchanged.push(sid);
        continue;
      }
    }
    store = upsert(store, { ...result, artwork: result.artwork });
    imported.push(sid);
    group.forEach((g, i) => writes.push({ abs: path.join(PUBLIC_DIR, photos[i]!.src), data: byRel.get(g.rel)!.derivative!.jpeg }));
    for (const src of result.replacedSrcs) if (src.startsWith(`${COLLECTION_IMG}/`)) deletes.push(path.join(PUBLIC_DIR, src));
    const slateTiles = (grouping?.slates.get(row.id) ?? []).map((s) => ({ thumb: byRel.get(s.rel)!.thumb, caption: "ID-kaartje", tone: "slate" as const }));
    lines.push({
      heading: `${sid}  ${result.artwork.title}`,
      sub: [
        result.artwork.status === "published" ? "publiceren" : "concept",
        ...(result.artwork.featured ? ["uitgelicht"] : []),
        group.length ? `${group.length} foto's` : "alleen gegevens bijgewerkt",
        `/collection/objects/${result.artwork.slug}/`,
      ].join(" · "),
      tiles: [...slateTiles, ...group.map((g, i) => ({ thumb: byRel.get(g.rel)!.thumb, caption: `${i + 1} ${VIEW_NL[views[i]!]}` }))],
    });
  }
  if (grouping?.unassigned.length)
    lines.push({
      heading: "Niet toegewezen",
      sub: "foto's vóór het eerste ID-kaartje en zonder object-ID in de naam",
      tiles: grouping.unassigned.map((u) => ({ thumb: byRel.get(u.rel)!.thumb, caption: path.basename(u.rel).slice(0, 24), tone: "error" as const })),
    });

  // 4. Validate the whole dataset exactly as the website will.
  const check = validateDataset(withCollection(store as unknown as OwnCollection));
  if (!check.ok)
    for (const i of check.issues) problems.push({ level: "error", message: `Validatie: ${i.path}: ${i.message}` });

  // 5. Write
  const errors = problems.filter((p) => p.level === "error");
  const blocked = !check.ok;
  if (!args.dryRun && !blocked) {
    for (const w of writes) {
      await mkdir(path.dirname(w.abs), { recursive: true });
      await writeFile(w.abs, w.data);
    }
    for (const d of deletes) if (!writes.some((w) => w.abs === d)) await rm(d, { force: true });
    await writeFile(STORE_FILE, JSON.stringify(store, null, 2) + "\n");
  }

  // 6. Report
  const sheets = lines.length ? await writeContactSheets(lines, args.reportDir) : [];
  const fmt = (p: Problem) => `- ${p.id ? `**${p.id}**${p.row ? ` (rij ${p.row})` : ""}: ` : ""}${p.message}`;
  const mb = writes.reduce((n, w) => n + w.data.length, 0) / 1e6;
  const report = [
    `# Import ${today}${args.dryRun ? " (proef, niets gewijzigd)" : blocked ? " (GESTOPT, niets gewijzigd)" : ""}`,
    "",
    `- Geïmporteerd of bijgewerkt: ${imported.length ? imported.join(", ") : "geen"}`,
    ...(unchanged.length ? [`- Ongewijzigd: ${unchanged.join(", ")}`] : []),
    `- Nieuwe foto's: ${writes.length} (${mb.toFixed(1)} MB), vervangen: ${deletes.length}`,
    `- Contactvel: ${sheets.map((s) => path.basename(s)).join(", ") || "geen"}`,
    "",
    `## Fouten (${errors.length})`,
    ...(errors.length ? errors.map(fmt) : ["Geen."]),
    "",
    `## Aandachtspunten (${problems.length - errors.length})`,
    ...(problems.length - errors.length ? problems.filter((p) => p.level === "warning").map(fmt) : ["Geen."]),
    "",
  ].join("\n");
  await writeFile(path.join(args.reportDir, "rapport.md"), report);
  console.log(`\n${report}`);
  console.log(`Rapport en contactvel: ${args.reportDir}`);
  if (blocked) console.log("Validatie mislukt: er is niets geschreven.");
  process.exitCode = errors.length ? 1 : 0;
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
