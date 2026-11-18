/**
 * Reads the data sheet: Excel (.xlsx, also as exported by Google Sheets or
 * Numbers) or CSV (comma or semicolon — Dutch Excel saves with ";").
 */
import { readFile } from "node:fs/promises";
import { strFromU8, unzipSync } from "fflate";
import { mapHeaders, type ColumnKey } from "./sheet.ts";

export type SheetRow = { row: number; cells: Partial<Record<ColumnKey, string>> };

/** Header = the first row (within the first five) that names "Object-ID". */
function rowsFromGrid(grid: string[][], firstRowNumber = 1): SheetRow[] {
  const headerIdx = grid.slice(0, 5).findIndex((r) => mapHeaders(r).size >= 3 && [...mapHeaders(r).values()].includes("id"));
  if (headerIdx < 0) throw new Error("Geen kopregel met 'Object-ID' gevonden in de eerste vijf regels van de datasheet.");
  const map = mapHeaders(grid[headerIdx]!);
  const out: SheetRow[] = [];
  for (let i = headerIdx + 1; i < grid.length; i++) {
    const cells: Partial<Record<ColumnKey, string>> = {};
    for (const [col, key] of map) cells[key] = (grid[i]![col] ?? "").trim();
    out.push({ row: i + firstRowNumber, cells });
  }
  return out;
}

/* A small, dependency-light .xlsx reader. Spreadsheet programs add comments,
 * drawings and styles in many variants; only the cell values are read here, so
 * none of that can break an import. */
const XML_ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
const unescapeXml = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e: string) =>
    e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : XML_ENTITIES[e]!,
  );
const textRuns = (xml: string) => [...xml.matchAll(/<(?:\w+:)?t(?:\s[^>]*)?>([\s\S]*?)<\/(?:\w+:)?t>/g)].map((m) => unescapeXml(m[1]!)).join("");
const colIndex = (ref: string) => [...ref.replace(/\d+$/, "")].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;

export function readXlsxBuffer(buf: Uint8Array): string[][] {
  const files = unzipSync(buf, { filter: (f) => f.name.startsWith("xl/") && f.name.endsWith(".xml") || f.name.endsWith(".rels") });
  const read = (name: string) => (files[name] ? strFromU8(files[name]!) : "");
  const shared = [...read("xl/sharedStrings.xml").matchAll(/<(?:\w+:)?si>([\s\S]*?)<\/(?:\w+:)?si>/g)].map((m) => textRuns(m[1]!));
  // Pick the sheet named "Objecten" (or the first sheet).
  const sheets = [...read("xl/workbook.xml").matchAll(/<(?:\w+:)?sheet\b[^>]*>/g)].map((m) => ({
    name: unescapeXml(/\bname="([^"]*)"/.exec(m[0])?.[1] ?? ""),
    rid: /\br:id="([^"]*)"/.exec(m[0])?.[1] ?? /\bid="([^"]*)"/.exec(m[0])?.[1] ?? "",
  }));
  const chosen = sheets.find((x) => /^(objecten|objects|collectie)$/i.test(x.name)) ?? sheets[0];
  const rels = read("xl/_rels/workbook.xml.rels");
  const target = chosen && new RegExp(`<Relationship\\b[^>]*Id="${chosen.rid}"[^>]*>`).exec(rels)?.[0];
  let sheetPath = target ? /Target="([^"]*)"/.exec(target)?.[1] ?? "" : "";
  sheetPath = sheetPath.startsWith("/") ? sheetPath.slice(1) : `xl/${sheetPath}`;
  const xml = read(sheetPath) || read("xl/worksheets/sheet1.xml");
  if (!xml) throw new Error("De Excel-file bevat geen leesbaar werkblad.");
  const grid: string[][] = [];
  for (const rm of xml.matchAll(/<(?:\w+:)?row\b((?:[^>"]|"[^"]*")*?)(?<!\/)>([\s\S]*?)<\/(?:\w+:)?row>/g)) {
    const r = Number(/\br="(\d+)"/.exec(rm[1]!)?.[1] ?? grid.length + 1) - 1;
    const cells: string[] = [];
    for (const cm of rm[2]!.matchAll(/<(?:\w+:)?c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/(?:\w+:)?c>)/g)) {
      const attrs = cm[1]!;
      const ref = /\br="([A-Z]+\d+)"/.exec(attrs)?.[1];
      const type = /\bt="(\w+)"/.exec(attrs)?.[1];
      const body = cm[2] ?? "";
      const v = /<(?:\w+:)?v>([\s\S]*?)<\/(?:\w+:)?v>/.exec(body)?.[1];
      let value = "";
      if (type === "s") value = shared[Number(v)] ?? "";
      else if (type === "inlineStr") value = textRuns(body);
      else if (type === "b") value = v === "1" ? "ja" : "nee";
      else if (v !== undefined) value = unescapeXml(v);
      cells[ref ? colIndex(ref) : cells.length] = value;
    }
    grid[r] = Array.from(cells, (c) => c ?? "");
  }
  return Array.from(grid, (row) => row ?? []);
}

export async function readXlsx(file: string): Promise<SheetRow[]> {
  return rowsFromGrid(readXlsxBuffer(await readFile(file)));
}

/** Minimal RFC 4180 parser with delimiter detection. */
export function parseCsv(text: string): string[][] {
  const firstLine = text.slice(0, text.indexOf("\n") >= 0 ? text.indexOf("\n") : text.length);
  const counts = [";", ",", "\t"].map((d) => [d, firstLine.split(d).length] as const).sort((a, b) => b[1] - a[1]);
  const delim = counts[0]![0];
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delim) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

export async function readCsv(file: string): Promise<SheetRow[]> {
  const buf = await readFile(file);
  let text = buf.toString("utf8");
  if (text.includes("�")) text = buf.toString("latin1"); // Excel "CSV" on Windows: Windows-1252
  return rowsFromGrid(parseCsv(text.replace(/^﻿/, "")));
}

export async function readSheet(file: string): Promise<SheetRow[]> {
  const head = (await readFile(file)).subarray(0, 4);
  // .xlsx is a zip file ("PK"); uploads may arrive without an extension.
  if (head[0] === 0x50 && head[1] === 0x4b) return readXlsx(file);
  return readCsv(file);
}
