/**
 * Validates the active dataset with the same rules the server applies.
 * Usage: npm run validate:content
 */
import { fixtureDataset } from "../fixtures/dataset.ts";
import { validateDataset } from "../src/content/validate.ts";

const r = validateDataset(fixtureDataset);
if (!r.ok) {
  console.error("Content validation failed:");
  for (const i of r.issues) console.error(`  - ${i.path}: ${i.message}`);
  process.exit(1);
}
const published = r.data.artworks.filter((a) => a.status === "published");
const fixtures = published.filter((a) => a.isFixture).length;
console.log(`Content OK: ${published.length} published artworks (${fixtures} demonstration fixtures), ${r.data.creators.length} creators, ${r.data.techniques.length} techniques.`);
if (fixtures > 0) console.log("Note: demonstration fixtures must be replaced before a public release.");
