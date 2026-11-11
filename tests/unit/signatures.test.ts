/**
 * Signatures & Marks: required checks 1–10 of the brief at data level.
 *
 * Everything named "TEST FIXTURE" below is synthetic and exists only in this
 * file. It never enters fixtures/dataset.ts and can never reach a build.
 */
import { describe, expect, it } from "vitest";
import { fixtureDataset } from "@fixtures/dataset";
import { buildPublication } from "@/content/publication";
import { exportSignatures } from "@/content/signature-export";
import type { DatasetInput, MediaAsset, SignatureReference } from "@/content/schemas";
import { signaturePhotoBlockers, validateDataset } from "@/content/validate";

const TODAY = "2026-11-11";
const clone = (): DatasetInput => structuredClone(fixtureDataset);

function publish(d: DatasetInput) {
  const r = validateDataset(d);
  if (!r.ok) throw new Error(r.issues.map((i) => `${i.path}: ${i.message}`).join("\n"));
  return buildPublication(r.data, { today: TODAY });
}

const sigs = (d: DatasetInput) => d.signatureReferences as SignatureReference[];
const creator = (d: DatasetInput, id: string) => d.creators.find((c) => c.id === id)!;

/* ---------------- synthetic TEST FIXTURES (this file only) ---------------- */

const testPhoto = (id: string, over: Partial<MediaAsset> = {}): MediaAsset => ({
  id,
  viewType: "signature",
  src: "/images/test-fixture-not-a-real-signature.jpg",
  width: 800,
  height: 600,
  alt: "TEST FIXTURE: placeholder for a signature photograph",
  credit: "TEST FIXTURE credit",
  rights: "owned",
  rightsCleared: true,
  hotspots: [],
  recognitionUse: "unknown",
  ...over,
});

const testRef = (id: string, over: Partial<SignatureReference> = {}): SignatureReference => ({
  id,
  title: `TEST FIXTURE ${id}`,
  sortOrder: 100,
  kind: "personal_signature",
  application: "diamond_point",
  observation: {
    transcription: "Test / 1960",
    location: "Underside",
    transcribedFrom: "photograph",
    transcriptionCertainty: "verified",
  },
  markOf: { creatorId: "CRE-TEST-DESIGNER", role: "designer", certainty: "verified" },
  object: {
    external: {
      kind: "museum",
      title: "TEST FIXTURE vase",
      institution: "TEST FIXTURE museum",
      identifier: "T.1",
      url: "https://example.org/test-fixture",
      creators: [
        { name: "TEST FIXTURE designer", creatorId: "CRE-TEST-DESIGNER", role: "designer", certainty: "verified" },
        { name: "TEST FIXTURE glasshouse", creatorId: "CRE-TEST-GLASSHOUSE", role: "glasshouse", certainty: "verified" },
      ],
    },
  },
  contextImageIds: [],
  evidence: [{ sourceId: "SRC-AIC-1979-904" }],
  reviewedOn: TODAY,
  status: "published",
  updatedAt: TODAY,
  ...over,
});

/** The fixture dataset plus a TEST FIXTURE designer and glasshouse with three references. */
function withTestMakers() {
  const d = clone();
  d.creators.push(
    {
      id: "CRE-TEST-DESIGNER",
      slug: "test-fixture-designer",
      kind: "person",
      name: "TEST FIXTURE designer",
      roles: ["designer"],
      summary: "Synthetic record for unit tests.",
      biographyStatus: "reference_only",
      isFixture: true,
      signatureRefIds: ["SIG-TEST-SIGNED-A", "SIG-TEST-SIGNED-B", "SIG-TEST-FACTORY"],
      primarySignatureId: "SIG-TEST-FACTORY",
      status: "published",
    },
    {
      id: "CRE-TEST-GLASSHOUSE",
      slug: "test-fixture-glasshouse",
      kind: "organisation",
      name: "TEST FIXTURE glasshouse",
      roles: ["glasshouse"],
      summary: "Synthetic record for unit tests.",
      biographyStatus: "reference_only",
      isFixture: true,
      signatureRefIds: ["SIG-TEST-FACTORY"],
      status: "published",
    },
  );
  d.media.push(testPhoto("IMG-TEST-A"), testPhoto("IMG-TEST-B"), testPhoto("IMG-TEST-F", { viewType: "base" }));
  sigs(d).push(
    testRef("SIG-TEST-SIGNED-A", { variantGroup: "signed-1960s", detailImageId: "IMG-TEST-A", sortOrder: 2 }),
    testRef("SIG-TEST-SIGNED-B", {
      variantGroup: "signed-1970s",
      detailImageId: "IMG-TEST-B",
      sortOrder: 1,
      observation: { transcription: "T. / 1972", location: "Base", transcribedFrom: "photograph", transcriptionCertainty: "probable" },
    }),
    testRef("SIG-TEST-FACTORY", {
      kind: "factory_mark",
      application: "acid_etched",
      markOf: { creatorId: "CRE-TEST-GLASSHOUSE", role: "glasshouse", certainty: "verified" },
      detailImageId: "IMG-TEST-F",
      observation: { transcription: "TEST / murano", location: "Base", transcribedFrom: "photograph", transcriptionCertainty: "verified" },
    }),
  );
  return d;
}

/* -------------------------------- checks -------------------------------- */

describe("signature references on maker profiles", () => {
  it("1. shows the editor's primary in the compact block and reuses the same record in the section", () => {
    const pub = publish(clone());
    const b = pub.makerSignatures["CRE-BIGAGLIA"]!;
    expect(b.items.map((s) => s.id)).toEqual(["SIG-BIGAGLIA-R009-INSCRIPTION", "SIG-BIGAGLIA-AIC-1988-541-285"]);
    expect(b.primary?.id).toBe("SIG-BIGAGLIA-R009-INSCRIPTION");
    // Same object, same photograph: the block is not a second copy.
    expect(b.primary).toBe(b.items[0]);
    expect(b.primary?.photo?.detail.id).toBe("IMG-R009-INSCRIPTION");
    // The crop keeps its link to the whole photograph.
    expect(b.primary?.photo?.original?.id).toBe("IMG-R009-TOP");
  });

  it("2. keeps variants apart and in the editor's order", () => {
    const pub = publish(withTestMakers());
    const items = pub.makerSignatures["CRE-TEST-DESIGNER"]!.items;
    const own = items.filter((s) => s.relation === "own");
    expect(own.map((s) => s.id)).toEqual(["SIG-TEST-SIGNED-A", "SIG-TEST-SIGNED-B"]);
    expect(own.map((s) => s.variantGroup)).toEqual(["signed-1960s", "signed-1970s"]);
    expect(own.map((s) => s.transcription)).toEqual(["Test / 1960", "T. / 1972"]);
  });

  it("3. gives a maker without references an empty section and no compact block", () => {
    const pub = publish(clone());
    expect(pub.makerSignatures["CRE-ROSIN"]).toEqual({ items: [], primary: null });
  });

  it("4. keeps a reference without a photograph as a text reference with its source", () => {
    const pub = publish(clone());
    const pb = pub.makerSignatures["CRE-BIGAGLIA"]!.items.find((s) => s.id === "SIG-BIGAGLIA-AIC-1988-541-285")!;
    expect(pb.photo).toBeNull();
    expect(pb.transcription).toBe("P.B. / 1845");
    expect(pb.transcribedFrom).toBe("source");
    expect(pb.sources.map((s) => s.source.id)).toEqual(["SRC-AIC-1988-541-285"]);
  });

  it("5. never shows a factory mark as a designer's signature", () => {
    const pub = publish(withTestMakers());
    const designer = pub.makerSignatures["CRE-TEST-DESIGNER"]!;
    const factory = designer.items.find((s) => s.id === "SIG-TEST-FACTORY")!;
    expect(factory.relation).toBe("context");
    expect(factory.markOf?.id).toBe("CRE-TEST-GLASSHOUSE");
    // The editor picked it, but a firm's mark cannot lead a person's profile.
    expect(designer.primary?.id).toBe("SIG-TEST-SIGNED-A");
    // On the glasshouse it is its own mark.
    const house = pub.makerSignatures["CRE-TEST-GLASSHOUSE"]!;
    expect(house.items[0]?.relation).toBe("own");
    expect(house.primary?.id).toBe("SIG-TEST-FACTORY");
  });

  it("5b. rejects a factory mark owned by a person and a signature owned by a firm", () => {
    const d = withTestMakers();
    sigs(d).find((r) => r.id === "SIG-TEST-FACTORY")!.markOf = { creatorId: "CRE-TEST-DESIGNER", role: "designer", certainty: "verified" };
    sigs(d).find((r) => r.id === "SIG-TEST-SIGNED-A")!.markOf = { creatorId: "CRE-TEST-GLASSHOUSE", role: "glasshouse", certainty: "verified" };
    const msgs = validateDataset(d).issues.map((i) => i.message);
    expect(msgs).toContain("a factory mark belongs to the glasshouse or firm, not to a person");
    expect(msgs).toContain("a personal signature must belong to a person, not to a firm");
  });

  it("5c. shows another firm's mark on a maker only when the work names that maker firmly", () => {
    const d = withTestMakers();
    const ext = sigs(d).find((r) => r.id === "SIG-TEST-FACTORY")!.object.external!;
    ext.creators[0]!.certainty = "probable";
    const pub = publish(d);
    expect(pub.makerSignatures["CRE-TEST-DESIGNER"]!.items.map((s) => s.id)).not.toContain("SIG-TEST-FACTORY");
  });
});

describe("nothing uncertain or unreleased is published", () => {
  it("6. hides a photograph that is not cleared, has unknown rights or an expired licence", () => {
    for (const change of [
      (m: MediaAsset) => (m.rightsCleared = false),
      (m: MediaAsset) => (m.rights = "unknown"),
      (m: MediaAsset) => (m.credit = undefined),
      (m: MediaAsset) => (m.licenceExpiresOn = "2026-11-10"),
    ]) {
      const d = withTestMakers();
      change(d.media.find((m) => m.id === "IMG-TEST-A") as MediaAsset);
      const pub = publish(d);
      const a = pub.signatures.find((s) => s.id === "SIG-TEST-SIGNED-A")!;
      expect(a.photo).toBeNull();
      // The reference itself stays, as text with its source.
      expect(a.sources).toHaveLength(1);
      expect(pub.makerSignatures["CRE-TEST-DESIGNER"]!.primary?.id).not.toBe("SIG-TEST-SIGNED-A");
    }
  });

  it("6b. requires a review date and a source before a photograph can be shown", () => {
    const img = testPhoto("IMG-TEST-A");
    expect(signaturePhotoBlockers({ evidence: [{ sourceId: "SRC-AIC-1979-904" }], reviewedOn: TODAY }, img, TODAY)).toEqual([]);
    expect(signaturePhotoBlockers({ evidence: [], reviewedOn: undefined }, img, TODAY)).toEqual([
      "the reference needs a source",
      "the reference has not been reviewed",
    ]);
    const d = withTestMakers();
    delete sigs(d).find((r) => r.id === "SIG-TEST-SIGNED-A")!.reviewedOn;
    expect(validateDataset(d).ok).toBe(false);
  });

  it("6c. keeps an uncertain reading out of the compact block", () => {
    const d = withTestMakers();
    for (const id of ["SIG-TEST-SIGNED-A", "SIG-TEST-SIGNED-B"])
      sigs(d).find((r) => r.id === id)!.markOf = { creatorId: "CRE-TEST-DESIGNER", role: "designer", certainty: "hypothesis" };
    const pub = publish(d);
    expect(pub.makerSignatures["CRE-TEST-DESIGNER"]!.items).toHaveLength(3);
    expect(pub.makerSignatures["CRE-TEST-DESIGNER"]!.primary).toBeNull();
  });

  it("6d. never projects internal notes or rights evidence", () => {
    const d = withTestMakers();
    sigs(d)[0]!.internalNote = "LEAK-INTERNAL-NOTE";
    (d.media.find((m) => m.id === "IMG-R009-INSCRIPTION") as MediaAsset).rightsEvidence = "LEAK-RIGHTS-EVIDENCE";
    const r = validateDataset(d);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const json = JSON.stringify(buildPublication(r.data, { today: TODAY }));
    expect(json).not.toContain("LEAK-INTERNAL-NOTE");
    expect(json).not.toContain("LEAK-RIGHTS-EVIDENCE");
    expect(json).not.toContain("recognitionUse");
    const exported = JSON.stringify(exportSignatures(r.data, { today: TODAY, scope: "all" }));
    expect(exported).not.toContain("LEAK-INTERNAL-NOTE");
    expect(exported).not.toContain("LEAK-RIGHTS-EVIDENCE");
  });

  it("6e. rejects a primary that is not on the maker's list, or a reference that does not involve the maker", () => {
    const d = clone();
    creator(d, "CRE-ROSIN").primarySignatureId = "SIG-BIGAGLIA-R009-INSCRIPTION";
    creator(d, "CRE-ZANELLA").signatureRefIds = ["SIG-BIGAGLIA-AIC-1988-541-285"];
    const msgs = validateDataset(d).issues.map((i) => i.message);
    expect(msgs.some((m) => m.includes("must be one of this maker's signature references"))).toBe(true);
    expect(msgs.some((m) => m.includes("neither is this maker's mark nor documents a work by this maker"))).toBe(true);
  });

  it("6f. keeps the observation in one place: a reference linked to a mark cannot repeat it", () => {
    const d = clone();
    sigs(d)[0]!.observation = { transcription: "x", location: "x", transcribedFrom: "photograph", transcriptionCertainty: "probable" };
    expect(validateDataset(d).issues.some((i) => i.message.includes("the observation lives on the linked mark"))).toBe(true);
  });
});

describe("objects and withdrawal", () => {
  it("7. never presents a museum object as part of the MURANIQ collection", () => {
    const pub = publish(clone());
    for (const s of pub.makerSignatures["CRE-BIGAGLIA"]!.items) {
      expect(s.object.inCollection).toBe(false);
      expect(s.object.heldBy?.institution).toBe("The Art Institute of Chicago");
    }
    // The text-only museum reference has no on-site object page.
    expect(pub.signatures.find((s) => s.id === "SIG-BIGAGLIA-AIC-1988-541-285")!.object.href).toBeNull();
  });

  it("7b. links the mark on the object page back to the reference", () => {
    const pub = publish(clone());
    expect(pub.markSignatures["MUR-R009/MRK-R009-INSCRIPTION"]?.map((s) => s.id)).toEqual(["SIG-BIGAGLIA-R009-INSCRIPTION"]);
  });

  it("9. withdraws a reference everywhere at once", () => {
    const d = clone();
    sigs(d).find((r) => r.id === "SIG-BIGAGLIA-R009-INSCRIPTION")!.status = "draft";
    const pub = publish(d);
    expect(pub.signatures.map((s) => s.id)).not.toContain("SIG-BIGAGLIA-R009-INSCRIPTION");
    expect(pub.makerSignatures["CRE-BIGAGLIA"]!.items.map((s) => s.id)).toEqual(["SIG-BIGAGLIA-AIC-1988-541-285"]);
    expect(pub.makerSignatures["CRE-BIGAGLIA"]!.primary).toBeNull();
    expect(pub.markSignatures["MUR-R009/MRK-R009-INSCRIPTION"]).toBeUndefined();
  });

  it("9b. withdraws a firm's marks when the firm's profile is withdrawn", () => {
    const d = withTestMakers();
    creator(d, "CRE-TEST-GLASSHOUSE").status = "draft";
    const pub = publish(d);
    expect(pub.signatures.map((s) => s.id)).not.toContain("SIG-TEST-FACTORY");
    expect(pub.makerSignatures["CRE-TEST-DESIGNER"]!.items.map((s) => s.id)).not.toContain("SIG-TEST-FACTORY");
  });
});

describe("recognition-ready export", () => {
  it("lists ids, transcriptions, variants, objects, crops and rights without deciding anything", () => {
    const r = validateDataset(clone());
    if (!r.ok) throw new Error("fixture dataset invalid");
    const out = exportSignatures(r.data, { today: TODAY });
    const inscription = out.references.find((x) => x.id === "SIG-BIGAGLIA-R009-INSCRIPTION")!;
    expect(inscription.transcription?.lines[0]).toBe("IX CONGRESSO");
    expect(inscription.transcription?.readFrom).toBe("object_record");
    expect(inscription.object).toMatchObject({ collectionId: "MUR-R009", markId: "MRK-R009-INSCRIPTION", demonstrationFixture: true });
    const detail = inscription.images.find((i) => i.role === "detail")!;
    expect(detail.cropOf?.imageId).toBe("IMG-R009-TOP");
    expect(detail.usableForRecognition).toBe(true);
    expect(out.summary.references).toBe(2);
    expect(JSON.stringify(out)).not.toMatch(/authentic|confidence|score/i);
  });

  it("does not count an image for recognition unless that use is recorded as allowed", () => {
    const d = clone();
    (d.media.find((m) => m.id === "IMG-R009-INSCRIPTION") as MediaAsset).recognitionUse = "unknown";
    const r = validateDataset(d);
    if (!r.ok) throw new Error("invalid");
    const detail = exportSignatures(r.data, { today: TODAY }).references[1]!.images[0]!;
    expect(detail.webPublication.allowed).toBe(true);
    expect(detail.usableForRecognition).toBe(false);
  });
});
