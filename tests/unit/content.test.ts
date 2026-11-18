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

  it("never publishes a price: not the owner's, not a dealer's", () => {
    const d = clone();
    const a = d.artworks.find((x) => x.id === "MUR-M007")!;
    a.comparables![0]!.stated = ["Offered at €1.234,56."];
    a.description = [...a.description, "Bought for 999 EUR."];
    a.researchStatus!.open = ["Value: USD 5,000 as sold."];
    const r = validateDataset(d);
    expect(r.ok).toBe(false);
    const priced = r.issues.filter((i) => i.message.includes("prices are never published")).map((i) => i.path);
    expect(priced).toEqual(
      expect.arrayContaining([expect.stringContaining("comparables"), expect.stringContaining("description"), expect.stringContaining("researchStatus")]),
    );
  });

  it("keeps prices out of maker profiles and technique texts too", () => {
    const d = clone();
    const c = d.creators.find((x) => x.id === "CRE-OSCAR-ZANETTI")!;
    c.sections = [...(c.sections ?? []), { heading: "Market", paragraphs: ["Sold for £123 (synthetic test value)."] }];
    d.techniques.find((t) => t.id === "TEC-CALCEDONIA")!.body.push("A shell sold for $45 (synthetic test value).");
    const r = validateDataset(d);
    const paths = r.issues.filter((i) => i.message.includes("prices are never published")).map((i) => i.path);
    expect(paths).toEqual(expect.arrayContaining([expect.stringContaining("CRE-OSCAR-ZANETTI"), expect.stringContaining("TEC-CALCEDONIA")]));
  });

  it("checks the techniques named on a maker profile and the makers named on a technique", () => {
    const d = clone();
    d.creators.find((x) => x.id === "CRE-OSCAR-ZANETTI")!.techniqueIds = ["TEC-NOPE"];
    d.techniques.find((t) => t.id === "TEC-CALCEDONIA")!.creatorIds = ["CRE-NOPE"];
    const msgs = validateDataset(d).issues.map((i) => i.message);
    expect(msgs).toEqual(expect.arrayContaining(["unknown technique TEC-NOPE", "unknown creator CRE-NOPE"]));
  });

  it("links the Zanetti shell, its maker and the calcedonio technique both ways, without prices", () => {
    const pub = buildPublication(validateDataset(fixtureDataset).data!);
    const maker = pub.creators.find((c) => c.slug === "oscar-zanetti")!;
    expect(maker.artworkIds).toContain("MUR-M009");
    expect(maker.techniqueIds).toContain("TEC-CALCEDONIA");
    const tech = pub.techniques.find((t) => t.slug === "calcedonia")!;
    expect(tech.artworkIds).toContain("MUR-M009");
    expect(tech.creatorIds).toContain("CRE-OSCAR-ZANETTI");
    const shell = pub.artworks.find((a) => a.id === "MUR-M009")!;
    expect(shell.attributionLine).toBe("Probably by Oscar Zanetti");
    const text = JSON.stringify([maker, tech]);
    expect(text).not.toMatch(/[€$£]\s?\d|\b(?:EUR|USD|GBP)\s?\d/);
  });

  it("rejects a comparable example without a known source", () => {
    const d = clone();
    d.artworks.find((x) => x.id === "MUR-M007")!.comparables![0]!.sourceId = "SRC-NOPE";
    expect(validateDataset(d).issues.some((i) => i.message === "unknown source SRC-NOPE")).toBe(true);
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

  it("shows dealer statements apart from MURANIQ's findings, with their sources, and no prices", () => {
    const pub = buildPublication(validateDataset(fixtureDataset).data!);
    const vase = pub.dossiers["monumental-aquamarine-scavo-corroso-vase"]!;
    expect(vase.attributionLine).toBe("Probably by Seguso Arte Vetro");
    expect(vase.dating).toMatchObject({ certainty: "hypothesis", displayLabel: "Late 20th century (provisional)" });
    // Livio Seguso is an association under research, never the attribution.
    expect(vase.assertions.find((x) => x.statement.includes("Livio Seguso"))!.certainty).toBe("hypothesis");
    expect(vase.creatorLinks).toEqual([]);
    expect(vase.comparables.map((c) => c.kind)).toEqual(["dealer_listing", "dealer_listing"]);
    for (const c of vase.comparables) expect(vase.sources.map((s) => s.id)).toContain(c.sourceId);
    expect(JSON.stringify(vase)).not.toMatch(/[€$£]\s?\d|\d\s?(EUR|USD)\b/);
    // Listed under the Scavo technique.
    expect(pub.techniques.find((t) => t.slug === "scavo")!.artworkIds).toContain("MUR-M007");
  });

  it("uses consistent attribution wording on cards and dossiers", () => {
    const r = validateDataset(fixtureDataset);
    const pub = buildPublication(r.data!);
    const line = (id: string) => pub.artworks.find((a) => a.id === id)!.attributionLine;
    const card = pub.artworks.find((a) => a.id === "MUR-R008")!;
    expect(card.attributionLine).toBe("Probably by Miotti Glasshouse");
    expect(pub.dossiers[card.slug]!.attributionLine).toBe(card.attributionLine);
    expect(line("MUR-R001")).toBe("Maker not documented");
    expect(line("MUR-R009")).toBe("Pietro Bigaglia");
  });
});
