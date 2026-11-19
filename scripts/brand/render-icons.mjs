/**
 * Renders the raster icons from the logo SVGs (run build-logo.mjs first):
 *
 *   node scripts/brand/render-icons.mjs        (set PW_CHROMIUM_PATH if Playwright's own browser is missing)
 *
 * Writes src/app/favicon.ico (16/32/48), src/app/apple-icon.png (180) and public/og-default.png (1200 x 630).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const STAGE = "#080808";
const dataUrl = (rel) => `data:image/svg+xml;base64,${readFileSync(join(ROOT, rel)).toString("base64")}`;

const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});

async function shoot(width, height, body) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.setContent(
    `<html><body style="margin:0;width:${width}px;height:${height}px;background:${STAGE};display:flex;align-items:center;justify-content:center;overflow:hidden">${body}</body></html>`,
    { waitUntil: "load" },
  );
  const png = await page.screenshot({ type: "png" });
  await page.close();
  return png;
}

// Favicon: the 64 x 64 icon.svg (M on the stage colour) at 16, 32 and 48 px, packed as PNG-in-ICO.
const icon = dataUrl("src/app/icon.svg");
const sizes = [16, 32, 48];
const pngs = [];
for (const s of sizes) {
  const png = await shoot(s, s, `<img src="${icon}" style="width:${s}px;height:${s}px">`);
  // Next.js only accepts RGBA PNGs inside favicon.ico; Chromium writes opaque screenshots as RGB.
  pngs.push(await sharp(png).ensureAlpha().png({ compressionLevel: 9 }).toBuffer());
}
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(s, e);
  header.writeUInt8(s, e + 1);
  header.writeUInt16LE(1, e + 4); // planes
  header.writeUInt16LE(32, e + 6); // bits per pixel
  header.writeUInt32LE(pngs[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
writeFileSync(join(ROOT, "src/app/favicon.ico"), Buffer.concat([header, ...pngs]));

// Apple touch icon: the M alone, about three quarters of the width.
const mono = dataUrl("public/brand/muraniq-monogram-gold.svg");
writeFileSync(join(ROOT, "src/app/apple-icon.png"), await shoot(180, 180, `<img src="${mono}" style="width:134px">`));

// Share image: the full lockup, centred.
const lockup = dataUrl("public/brand/muraniq-lockup-on-dark.svg");
writeFileSync(join(ROOT, "public/og-default.png"), await shoot(1200, 630, `<img src="${lockup}" style="width:560px">`));

await browser.close();
console.log("favicon.ico, apple-icon.png and og-default.png written");
