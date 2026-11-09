import { describe, expect, it } from "vitest";
import { fixtureDataset } from "@fixtures/dataset";
import { validateDataset } from "@/content/validate";
import { buildPublication } from "@/content/publication";
import { catalogHref, isFiltered, parseCatalogQuery, searchCatalog } from "@/features/catalog/query";

const all = buildPublication(validateDataset(fixtureDataset).data!).artworks;

describe("query parsing", () => {
  it("accepts only known parameters and bounded values", () => {
    const q = parseCatalogQuery({
      q: "x".repeat(500),
      category: "murano-glass,not-a-category,<script>",
      sort: "price",
      page: "-3",
      evil: "1",
      attribution: "verified,made-up",
    });
    expect(q.q).toHaveLength(80);
    expect(q.category).toEqual(["murano-glass"]);
    expect(q.sort).toBe("curated");
    expect(q.page).toBe(1);
    expect(q.attribution).toEqual(["verified"]);
    expect(q).not.toHaveProperty("evil");
  });

  it("swaps an inverted period and rejects non-years", () => {
    expect(parseCatalogQuery({ from: "1970", to: "1950" })).toMatchObject({ from: 1950, to: 1970 });
    expect(parseCatalogQuery({ from: "19x0" }).from).toBeNull();
  });

  it("serialises to a stable, shareable URL", () => {
    const q = parseCatalogQuery({ technique: "sommerso,calcedonia", category: "murano-glass", page: "2" });
    expect(catalogHref("/collection/", q)).toBe(
      "/collection/?category=murano-glass&technique=calcedonia%2Csommerso&page=2",
    );
    expect(isFiltered(parseCatalogQuery({}))).toBe(false);
    expect(isFiltered(parseCatalogQuery({ page: "2" }))).toBe(false);
    expect(isFiltered(q)).toBe(true);
  });
});

describe("search and facets", () => {
  it("returns everything in curated order by default", () => {
    const r = searchCatalog(all, parseCatalogQuery({}));
    expect(r.total).toBe(6);
    expect(r.items[0]!.id).toBe("MUR-D001");
  });

  it("ORs within a facet and ANDs between facets", () => {
    const or = searchCatalog(all, parseCatalogQuery({ technique: "sommerso,pulegoso" }));
    expect(or.items.map((a) => a.id).sort()).toEqual(["MUR-D001", "MUR-D006"]);
    const and = searchCatalog(all, parseCatalogQuery({ technique: "sommerso,pulegoso", attribution: "probable" }));
    expect(and.items.map((a) => a.id)).toEqual(["MUR-D001"]);
  });

  it("matches accent-insensitive text and ranks title matches first", () => {
    const r = searchCatalog(all, parseCatalogQuery({ q: "VÁSE" }));
    expect(r.total).toBeGreaterThan(0);
    expect(r.items.every((a) => a.search.title.includes("vase") || a.search.text.includes("vase"))).toBe(true);
    expect(searchCatalog(all, parseCatalogQuery({ q: "submerged" })).items[0]!.id).toBe("MUR-D001"); // synonym
  });

  it("matches periods by overlap and reports undated works separately", () => {
    const r = searchCatalog(all, parseCatalogQuery({ from: "1960", to: "1970" }));
    expect(r.items.map((a) => a.id).sort()).toEqual(["MUR-D001", "MUR-D003"]);
    expect(r.undatedExcluded).toBe(2);
  });

  it("returns a correct empty result", () => {
    const r = searchCatalog(all, parseCatalogQuery({ q: "zzzzqq" }));
    expect(r.total).toBe(0);
    expect(r.items).toEqual([]);
    expect(r.pageCount).toBe(1);
  });

  it("computes disjunctive facet counts", () => {
    const r = searchCatalog(all, parseCatalogQuery({ technique: "sommerso" }));
    expect(r.facets.technique.pulegoso).toBe(1); // still selectable alongside sommerso
    expect(r.facets.category["murano-glass"]).toBe(1);
  });

  it("never returns draft records", () => {
    expect(searchCatalog(all, parseCatalogQuery({ q: "draft" })).total).toBe(0);
  });
});
