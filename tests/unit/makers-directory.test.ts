import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import makers from "@/content/research/makers/makers.json";
import workshops from "@/content/research/makers/workshops.json";
import images from "@/content/research/makers/images.json";
import museumImages from "@/content/research/makers/museum-images.json";
import { PUBLIC_STATUSES, directoryDossier, directoryEntries, directoryStats } from "@/content/makers-directory";

const raw = [...makers, ...workshops] as { id: string; name: string; verification_status: string }[];
const entries = directoryEntries();

describe("makers & workshops directory", () => {
  it("publishes only verified, partly verified, attributed or disputed entities", () => {
    expect(entries.length).toBeGreaterThan(0);
    const unverified = new Set(raw.filter((e) => e.verification_status === "UNVERIFIED").map((e) => e.id));
    expect(entries.some((e) => unverified.has(e.id))).toBe(false);
    expect(entries.every((e) => (PUBLIC_STATUSES as readonly string[]).includes(e.status))).toBe(true);
    expect(directoryStats().published + directoryStats().withheld).toBe(raw.length);
  });

  it("gives every entity a unique slug and a dossier", () => {
    const slugs = entries.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) {
      expect(s).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(directoryDossier(s)).toBeDefined();
    }
  });

  it("never fills in a detail the research could not confirm", () => {
    for (const e of entries) {
      for (const f of directoryDossier(e.slug)!.facts) expect(f.v.toLowerCase()).not.toBe("not verified");
    }
  });

  it("links only to published entities and shows only public relationships", () => {
    const published = new Set(entries.map((e) => e.slug));
    for (const e of entries) {
      for (const c of directoryDossier(e.slug)!.connections) {
        for (const l of c.links) {
          if (l.slug) expect(published.has(l.slug)).toBe(true);
          expect(l.status).not.toBe("UNVERIFIED");
        }
      }
    }
  });

  it("shows only public-domain photographs, from local copies", () => {
    const pd = new Set(
      [...images, ...museumImages].filter((i) => i.rights_label === "PUBLIC DOMAIN").map((i) => i.id.toLowerCase()),
    );
    const shown = entries.flatMap((e) => directoryDossier(e.slug)!.works.flatMap((w) => (w.image ? [w.image] : [])));
    expect(shown.length).toBeGreaterThan(0);
    for (const img of shown) {
      const id = img.src.replace("/images/makers/", "").replace(".jpg", "");
      expect(pd.has(id)).toBe(true);
      expect(existsSync(join(process.cwd(), "public", img.src))).toBe(true);
      expect(img.credit).toMatch(/Public domain$/);
    }
  });

  it("shows at most three photographs per maker", () => {
    for (const e of entries) expect(directoryDossier(e.slug)!.works.filter((w) => w.image).length).toBeLessThanOrEqual(3);
  });

  it("does not publish internal research notes", () => {
    const json = JSON.stringify(entries.map((e) => directoryDossier(e.slug)));
    expect(json).not.toContain('"notes"');
    expect(json).not.toContain("research_priority");
  });
});
