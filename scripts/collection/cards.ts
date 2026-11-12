/**
 * Printable ID cards (A4, 8 per page): a large object id and a QR code that
 * the importer reads, so photographs never need renaming.
 *
 *   npm run collection:cards -- --from 7 --to 306 [--out tmp/MURANIQ-ID-kaartjes.pdf]
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import QRCode from "qrcode";

function args() {
  const a = process.argv.slice(2);
  const get = (k: string) => {
    const i = a.indexOf(k);
    return i >= 0 ? a[i + 1] : undefined;
  };
  const num = (v: string | undefined, d: number) => Number(String(v ?? d).replace(/^(mur-)?m/i, ""));
  return {
    from: num(get("--from"), 7),
    to: num(get("--to"), 306),
    out: path.resolve(get("--out") ?? "tmp/MURANIQ-ID-kaartjes.pdf"),
  };
}

async function main() {
  const { from, to, out } = args();
  const cards: string[] = [];
  for (let n = from; n <= to; n++) {
    const id = `M${String(n).padStart(3, "0")}`;
    const svg = await QRCode.toString(`MUR-${id}`, { type: "svg", errorCorrectionLevel: "M", margin: 3 });
    cards.push(`<div class="card"><div class="text"><span class="brand">MURANIQ</span><span class="id">${id}</span><span class="note">Foto 0 · leg dit kaartje in beeld, daarna het object</span></div><div class="qr">${svg}</div></div>`);
  }
  const pages: string[] = [];
  for (let i = 0; i < cards.length; i += 8) pages.push(`<section class="page">${cards.slice(i, i + 8).join("")}</section>`);
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: "DejaVu Sans", Arial, sans-serif; color: #111; }
    .page { width: 210mm; height: 297mm; padding: 14.5mm 10mm; display: grid; grid-template-columns: 95mm 95mm; grid-auto-rows: 67mm; page-break-after: always; }
    .card { border: 0.3mm dashed #999; display: flex; align-items: center; justify-content: space-between; padding: 5mm 4mm 5mm 7mm; }
    .text { display: flex; flex-direction: column; gap: 2mm; }
    .brand { font-size: 3.2mm; letter-spacing: 0.8mm; color: #555; }
    .id { font-size: 15mm; font-weight: 700; letter-spacing: -0.3mm; line-height: 1; }
    .note { font-size: 2.4mm; color: #666; max-width: 40mm; }
    .qr { width: 42mm; height: 42mm; }
    .qr svg { width: 100%; height: 100%; }
  </style></head><body>${pages.join("")}</body></html>`;
  await mkdir(path.dirname(out), { recursive: true });
  const htmlFile = out.replace(/\.pdf$/, ".html");
  await writeFile(htmlFile, html);
  const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log(`ID-kaartjes M${String(from).padStart(3, "0")}–M${String(to).padStart(3, "0")}: ${out} (${pages.length} pagina's)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
