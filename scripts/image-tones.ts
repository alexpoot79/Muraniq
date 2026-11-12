/**
 * Measures the studio backdrop at the edges of every local photograph and
 * writes `src/content/image-tones.json`. The site uses these colours to extend
 * a photograph's own backdrop to the edges of its frame (flat colour, no blur,
 * no glow), so an object keeps its full contour without a pasted-on rectangle.
 *
 * Only averages of edge pixels are stored; the photograph itself is never
 * changed. Sanity images will use the dominant background colour from Sanity's
 * palette metadata instead.
 *
 * Usage: npm run tones   (run again after adding or replacing photographs)
 */
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import sharp from "sharp";

const ROOT = join(process.cwd(), "public");
const DIRS = ["images"];
const STOPS = 5;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return walk(p);
    return /\.(jpe?g|png|webp)$/i.test(name) ? [p] : [];
  });
}

const hex = (v: number[]) => `#${v.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;

async function tones(file: string): Promise<string[]> {
  const { data, info } = await sharp(file).removeAlpha().resize({ width: 200, fit: "inside" }).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels } = info;
  const edge = Math.max(2, Math.round(w * 0.025));
  const out: string[] = [];
  for (let s = 0; s < STOPS; s++) {
    // A band of rows centred on this stop; both side edges.
    const y0 = Math.max(0, Math.round((s / (STOPS - 1)) * (h - 1) - h * 0.05));
    const y1 = Math.min(h, Math.round((s / (STOPS - 1)) * (h - 1) + h * 0.05) + 1);
    const sum: [number, number, number] = [0, 0, 0];
    let n = 0;
    for (let y = y0; y < y1; y++) {
      for (const xs of [
        [0, edge],
        [w - edge, w],
      ] as const) {
        for (let x = xs[0]; x < xs[1]; x++) {
          const i = (y * w + x) * channels;
          sum[0] += data[i]!;
          sum[1] += data[i + 1]!;
          sum[2] += data[i + 2]!;
          n++;
        }
      }
    }
    out.push(hex(sum.map((c) => c / n)));
  }
  return out;
}

async function main() {
  const result: Record<string, string[]> = {};
  for (const dir of DIRS) {
    for (const file of walk(join(ROOT, dir)).sort()) {
      const key = "/" + relative(ROOT, file).split(sep).join("/");
      result[key] = await tones(file);
    }
  }
  writeFileSync(join(process.cwd(), "src/content/image-tones.json"), JSON.stringify(result, null, 1) + "\n");
  console.log(`Measured ${Object.keys(result).length} photographs.`);
}

void main();
