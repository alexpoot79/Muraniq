import { describe, expect, it } from "vitest";
import { fixtureDataset } from "@fixtures/dataset";
import { validateDataset } from "@/content/validate";
import { buildPublication } from "@/content/publication";
import type { DatasetInput } from "@/content/schemas";

const clone = (): DatasetInput => structuredClone(fixtureDataset);

describe("dataset validation", () => {
  it("accepts the fixture dataset", () => {
    const r = validateDataset(fixtureDataset);
    if (!r.ok) console.error(r.issues);
    expect(r.ok).toBe(true);
  });

  it("rejects a reference to an unknown creator", () => {
    const d = clone();
    d.artworks[0]!.creators = [{ creatorId: "CRE-NOPE", role: "maker", certainty: "probable" }];
    const r = validateDataset(d);
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.message.includes("unknown creator CRE-NOPE"))).toBe(true);
  });

  it("rejects an unknown certainty label", () => {
    const d = clone() as unknown as { artworks: Array<{ id: string; creators: Array<{ certainty: string }> }> };
    d.artworks.find((a) => a.id === "MUR-R008")!.creators[0]!.certainty = "documented"; // legacy label must be mapped explicitly
    expect(validateDataset(d).ok).toBe(false);
  });

  it("does not allow 'verified' without evidence and review date", () => {
    const d = clone();
    d.artworks[0]!.assertions = [{ field: "creator", statement: "Made by X", certainty: "verified", evidence: [] }];
    const r = validateDataset(d);
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.message.includes("verified"))).toBe(true);
  });

  it("does not let a creator credit be 'verified' without a verified creator assertion", () => {
    const d = clone();
    // the bottle's glasshouse claim is only 'probable'; upgrading the credit alone must fail
    d.artworks.find((a) => a.id === "MUR-R008")!.creators = [{ creatorId: "CRE-MIOTTI", role: "glasshouse", certainty: "verified" }];
    const r = validateDataset(d);
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.message.includes("without a verified creator assertion"))).toBe(true);
  });

  it("blocks publication with an image whose rights are not cleared", () => {
    const d = clone();
    d.media.find((m) => m.id === "IMG-R001-FRONT")!.rightsCleared = false;
    const r = validateDataset(d);
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.message.includes("rights are not cleared"))).toBe(true);
  });

  it("rejects duplicate slugs and self-relations", () => {
    const d = clone();
    d.artworks[1]!.slug = d.artworks[0]!.slug;
    d.artworks[2]!.relatedIds = [d.artworks[2]!.id];
    const r = validateDataset(d);
    expect(r.issues.some((i) => i.message.startsWith("duplicate slug"))).toBe(true);
    expect(r.issues.some((i) => i.message.includes("related to itself"))).toBe(true);
  });

  it("rejects an inverted dating range", () => {
    const d = clone();
    d.artworks[0]!.dating = { fromYear: 1970, toYear: 1950, displayLabel: "x", certainty: "probable" };
    expect(validateDataset(d).ok).toBe(false);
  });
});

describe("publication boundary", () => {
  const withLeaks = () => {
    const d = clone() as unknown as Record<string, Array<Record<string, unknown>>>;
    Object.assign(d.artworks![0]!, {
      purchasePrice: 12500,
      insuranceValue: "LEAK-INSURANCE",
      storageLocation: "LEAK-STORAGE",
      internalNotes: "LEAK-NOTES",
    });
    Object.assign(d.creators![0]!, { privateAddress: "LEAK-ADDRESS" });
    Object.assign(d.media![0]!, { originalPath: "/archive/LEAK-ORIGINAL.tif", exif: { gps: "LEAK-GPS" } });
    return d;
  };

  it("never exposes internal fields or drafts in public output", () => {
    const r = validateDataset(withLeaks());
    expect(r.ok).toBe(true);
    const pub = buildPublication(r.data!);
    const json = JSON.stringify(pub);
    for (const needle of ["LEAK-", "purchasePrice", "12500", "insuranceValue", "storageLocation", "internalNotes", "originalPath"]) {
      expect(json).not.toContain(needle);
    }
    expect(json).not.toContain("DRAFT-SENTINEL");
    expect(pub.artworks.find((a) => a.id === "MUR-D007")).toBeUndefined();
    expect(pub.dossiers["draft-vase-not-public"]).toBeUndefined();
  });

  it("withdrawing an artwork removes it from listings, dossiers, related works and maker pages", () => {
    const d = clone();
    d.artworks.find((a) => a.id === "MUR-R008")!.status = "withdrawn";
    const r = validateDataset(d);
    const pub = buildPublication(r.data!);
    expect(pub.artworks.some((a) => a.id === "MUR-R008")).toBe(false);
    expect(pub.dossiers["chalcedony-bottle-miotti"]).toBeUndefined();
    expect(pub.dossiers["chalcedony-ewer-venice"]!.related.some((x) => x.id === "MUR-R008")).toBe(false);
    expect(pub.creators.find((c) => c.slug === "miotti-glasshouse")!.artworkIds).not.toContain("MUR-R008");
  });

  it("does not expose media that is not cleared, even if referenced", () => {
    const d = clone();
    const m = d.media.find((x) => x.id === "IMG-R001-HANDLE")!;
    m.rightsCleared = false;
    d.artworks.find((a) => a.id === "MUR-R001")!.status = "in_review"; // unpublished, so validation passes
    const r = validateDataset(d);
    expect(r.ok).toBe(true);
    const pub = buildPublication(r.data!);
    expect(JSON.stringify(pub)).not.toContain("r001-chalcedony-ewer-handle");
  });

  it("uses consistent attribution wording on cards and dossiers", () => {
    const r = validateDataset(fixtureDataset);
    const pub = buildPublication(r.data!);
    const line = (id: string) => pub.artworks.find((a) => a.id === id)!.attributionLine;
    const card = pub.artworks.find((a) => a.id === "MUR-R008")!;
    expect(card.attributionLine).toBe("Probably by Miotti Glasshouse");
    expect(pub.dossiers[card.slug]!.attributionLine).toBe(card.attributionLine);
    expect(line("MUR-R001")).toBe("Maker not documented");
    expect(line("MUR-R010")).toBe("Attributed to Bernardo Bellotto");
    // firm museum attributions, reviewed against the museum record, read as plain names
    expect(line("MUR-R011")).toBe("Francesco Guardi");
    expect(line("MUR-R009")).toBe("Pietro Bigaglia");
  });
});
