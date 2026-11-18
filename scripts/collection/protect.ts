/**
 * Turns the owner's photographs that are already on the site into protected
 * web versions (≤ 1600 px, small "© MURANIQ" corner mark, copyright line).
 * New photographs get this automatically from collection:import; this script
 * is for photographs that were published before, or added by hand.
 *
 *   npm run collection:protect -- --backup <folder>   convert, keeping the unprotected files in <folder>
 *   npm run collection:protect -- --dry-run           only list what would change
 *
 * - Only media marked `rights: "owned"` in fixtures/collection.json, never
 *   museum or third-party images.
 * - A file that already carries the MURANIQ copyright line is left alone, so
 *   running it twice never adds a second mark.
 * - Each converted file gets a new name (new content hash), so browsers and the
 *   image CDN cannot keep showing the old, unprotected file.
 * - The unprotected file is copied to --backup first (keep that folder private,
 *   NOT in this public repository), then removed from public/.
 */
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { withCollection, type OwnCollection } from "../../fixtures/dataset.ts";
import { validateDataset } from "../../src/content/validate.ts";
import { decodeNormalised, sniff } from "./photos.ts";
import { isProtected, protectedName, protectPixels } from "./watermark.ts";

const ROOT = process.cwd();
const STORE_FILE = path.join(ROOT, "fixtures/collection.json");
const PUBLIC_DIR = path.join(ROOT, "public");

type Media = { id: string; src: string; width: number; height: number; rights: string };

function parseArgs(argv: string[]) {
  let backup: string | undefined;
  let dryRun = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--dry-run") dryRun = true;
    else if (a === "--backup") backup = argv[++i];
    else throw new Error(`Onbekende optie ${a}`);
  }
  if (!dryRun && !backup) throw new Error("Geef een (privé) map op voor de onbeschermde bestanden: --backup <map>, of gebruik --dry-run.");
  const target = backup && path.resolve(backup);
  // The repository is public: unprotected files may only go outside it, or under the ignored tmp/.
  if (target && target.startsWith(ROOT + path.sep) && !target.startsWith(path.join(ROOT, "tmp") + path.sep))
    throw new Error("De back-upmap mag niet in de (openbare) repository liggen; kies een map erbuiten of onder tmp/.");
  return { backup: target, dryRun };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const store = JSON.parse(await readFile(STORE_FILE, "utf8")) as { media: Media[] } & Record<string, unknown>;
  const owned = store.media.filter((m) => m.rights === "owned" && m.src.startsWith("/images/"));
  console.log(`${owned.length} eigen foto's in fixtures/collection.json`);

  const done: Array<{ id: string; from: string; to: string; before: string; after: string; jpeg: Buffer }> = [];
  let already = 0;
  for (const m of owned) {
    const abs = path.join(PUBLIC_DIR, m.src);
    const buf = await readFile(abs);
    if (await isProtected(buf)) {
      already++;
      continue;
    }
    const kind = sniff(buf.subarray(0, 16));
    if (!kind) throw new Error(`${m.src}: geen leesbare foto`);
    const n = await decodeNormalised(buf, kind, { p3: false });
    const web = await protectPixels(n.data, n.width, n.height);
    const hash = createHash("sha1").update(web.jpeg).digest("hex").slice(0, 8);
    const to = protectedName(m.src, hash);
    done.push({ id: m.id, from: m.src, to, before: `${n.width}×${n.height}`, after: `${web.width}×${web.height}`, jpeg: web.jpeg });
    Object.assign(m, { src: to, width: web.width, height: web.height });
  }

  for (const d of done) console.log(`  ${d.id}: ${d.from} (${d.before}) → ${d.to} (${d.after})`);
  console.log(`${done.length} omgezet${args.dryRun ? " (proef, niets gewijzigd)" : ""}, ${already} waren al beschermd.`);
  if (args.dryRun || !done.length) return;

  // Validate before touching any file, so a failure leaves everything as it was.
  const check = validateDataset(withCollection(store as unknown as OwnCollection));
  if (!check.ok) {
    for (const i of check.issues) console.error(`  - ${i.path}: ${i.message}`);
    throw new Error("Validatie mislukt; er is niets gewijzigd.");
  }
  for (const d of done) {
    const backupFile = path.join(args.backup!, d.from);
    await mkdir(path.dirname(backupFile), { recursive: true });
    await copyFile(path.join(PUBLIC_DIR, d.from), backupFile);
    await mkdir(path.dirname(path.join(PUBLIC_DIR, d.to)), { recursive: true });
    await writeFile(path.join(PUBLIC_DIR, d.to), d.jpeg);
    if (d.to !== d.from) await rm(path.join(PUBLIC_DIR, d.from), { force: true });
  }
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2) + "\n");
  console.log(`fixtures/collection.json bijgewerkt. Onbeschermde bestanden staan in ${args.backup}`);
}

main().catch((e) => {
  console.error((e as Error).message);
  process.exit(1);
});
