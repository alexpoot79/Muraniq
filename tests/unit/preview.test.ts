import { afterEach, describe, expect, it } from "vitest";
import { fixtureDataset } from "@fixtures/dataset";
import { validateDataset } from "@/content/validate";
import { buildPublication } from "@/content/publication";
import { previewConfigured, previewSecretMatches, previewTarget, safeReturnPath } from "@/lib/preview-access";

const SECRET = "x".repeat(40);
const original = process.env.SANITY_PREVIEW_SECRET;
afterEach(() => {
  if (original === undefined) delete process.env.SANITY_PREVIEW_SECRET;
  else process.env.SANITY_PREVIEW_SECRET = original;
});

describe("preview access", () => {
  it("is off without a (long enough) secret", () => {
    delete process.env.SANITY_PREVIEW_SECRET;
    expect(previewConfigured()).toBe(false);
    expect(previewSecretMatches("anything")).toBe(false);
    process.env.SANITY_PREVIEW_SECRET = "short";
    expect(previewConfigured()).toBe(false);
    expect(previewSecretMatches("short")).toBe(false);
  });

  it("accepts only the exact secret", () => {
    process.env.SANITY_PREVIEW_SECRET = SECRET;
    expect(previewConfigured()).toBe(true);
    expect(previewSecretMatches(SECRET)).toBe(true);
    expect(previewSecretMatches(SECRET + "y")).toBe(false);
    expect(previewSecretMatches(SECRET.slice(1))).toBe(false);
    expect(previewSecretMatches(null)).toBe(false);
    expect(previewSecretMatches("")).toBe(false);
  });

  it("builds the redirect from a validated slug only (no open redirect)", () => {
    expect(previewTarget(null)).toBe("/");
    expect(previewTarget("draft-vase-not-public")).toBe("/collection/objects/draft-vase-not-public/");
    for (const bad of ["//evil.example", "https://evil.example", "../admin", "a/b", "A-B", "a--b", "-a"]) {
      expect(previewTarget(bad)).toBeNull();
    }
  });

  it("returns only to same-site paths when leaving preview", () => {
    expect(safeReturnPath("/collection/")).toBe("/collection/");
    for (const bad of ["//evil.example/", "https://evil.example/", "/\\evil.example", "collection", null]) {
      expect(safeReturnPath(bad)).toBe("/");
    }
  });
});

describe("draft preview publication", () => {
  const data = (() => {
    const r = validateDataset(fixtureDataset);
    if (!r.ok) throw new Error("fixtures invalid");
    return r.data;
  })();

  it("public build never contains drafts and has no preview notes", () => {
    const pub = buildPublication(data);
    expect(pub.dossiers["draft-vase-not-public"]).toBeUndefined();
    expect(pub.previewNotes).toEqual({});
  });

  it("preview build shows drafts with their status and publication blockers", () => {
    const pub = buildPublication(data, { preview: true });
    expect(pub.dossiers["draft-vase-not-public"]?.title).toBe("Draft vase (must never be public)");
    expect(pub.previewNotes["draft-vase-not-public"]).toEqual({
      status: "draft",
      blockers: ["state the attribution explicitly (an 'unknown' creator assertion is acceptable)"],
    });
    // Published works carry no preview note.
    expect(pub.dossiers["chalcedony-ewer-venice"]).toBeDefined();
    expect(pub.previewNotes["chalcedony-ewer-venice"]).toBeUndefined();
  });

  it("preview keeps withdrawn records and uncleared images hidden", () => {
    const d = structuredClone(data);
    d.artworks[0]!.status = "withdrawn";
    const hidden = d.artworks[0]!.slug;
    const second = d.artworks[1]!;
    const uncleared = second.imageIds.find((id) => id !== second.heroImageId)!;
    d.media.find((m) => m.id === uncleared)!.rightsCleared = false;
    const pub = buildPublication(d, { preview: true });
    expect(pub.dossiers[hidden]).toBeUndefined();
    expect(pub.dossiers[second.slug]!.media.map((m) => m.id)).not.toContain(uncleared);
  });
});
