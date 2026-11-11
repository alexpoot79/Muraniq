/**
 * Writes the recognition-ready export of signature references as JSON.
 * Usage:
 *   npm run export:signatures                  # published references, to stdout
 *   npm run export:signatures -- --all         # include drafts (internal use only)
 *   npm run export:signatures -- --out file.json
 *
 * Reads the same validated dataset as `validate:content`. Never includes
 * internal notes or rights evidence. Not a recognition service.
 */
import { writeFileSync } from "node:fs";
import { fixtureDataset } from "../fixtures/dataset.ts";
import { exportSignatures } from "../src/content/signature-export.ts";
import { validateDataset } from "../src/content/validate.ts";

const args = process.argv.slice(2);
const outIndex = args.indexOf("--out");
const out = outIndex >= 0 ? args[outIndex + 1] : undefined;
const scope = args.includes("--all") ? "all" : "published";

const r = validateDataset(fixtureDataset);
if (!r.ok) {
  console.error("Content validation failed; nothing exported:");
  for (const i of r.issues) console.error(`  - ${i.path}: ${i.message}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const json = JSON.stringify(exportSignatures(r.data, { today, scope }), null, 2) + "\n";
if (out) {
  writeFileSync(out, json);
  console.error(`Wrote ${out}`);
} else process.stdout.write(json);
