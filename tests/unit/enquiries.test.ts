import { afterEach, describe, expect, it, vi } from "vitest";
import { validateEnquiry } from "@/features/enquiries/validate";
import { deliverEnquiry } from "@/features/enquiries/provider.server";
import { signPayload, verifySignature } from "@/lib/webhook-signature";
import { serializeJsonLd } from "@/components/ui/JsonLd";

const good = {
  name: "Ada Lovelace",
  email: "ada@example.org",
  message: "I would like to know more about this vase.",
  consent: "yes",
  objectId: "MUR-D001",
};

describe("enquiry validation", () => {
  it("accepts a valid enquiry", () => {
    expect(validateEnquiry(good).ok).toBe(true);
  });
  it("reports field errors in English", () => {
    const r = validateEnquiry({ ...good, email: "nope", consent: undefined, message: "hi" });
    expect(r.ok).toBe(false);
    if (!r.ok && r.kind === "invalid") {
      expect(r.errors.email).toMatch(/valid email/);
      expect(r.errors.message).toMatch(/at least 10/);
      expect(r.errors.consent).toBeDefined();
    } else throw new Error("expected invalid");
  });
  it("flags the honeypot and too-fast submissions as spam", () => {
    expect(validateEnquiry({ ...good, website: "http://spam" })).toEqual({ ok: false, kind: "spam" });
    expect(validateEnquiry({ ...good, startedAt: 1000 }, 2000)).toEqual({ ok: false, kind: "spam" });
  });
  it("rejects malformed object references", () => {
    const r = validateEnquiry({ ...good, objectId: "../../etc" });
    expect(r.ok).toBe(false);
  });
});

describe("mail delivery adapter", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("reports not_configured without credentials (no fake success)", async () => {
    const data = (validateEnquiry(good) as unknown as { data: never }).data;
    const r = await deliverEnquiry(data, { requestId: "t" });
    expect(r.status).toBe("not_configured");
  });
  it("distinguishes provider rejection and timeouts", async () => {
    vi.stubEnv("RESEND_API_KEY", "k");
    vi.stubEnv("CONTACT_TO", "to@example.org");
    vi.stubEnv("CONTACT_FROM", "from@example.org");
    const data = (validateEnquiry(good) as unknown as { data: never }).data;
    const rejected = await deliverEnquiry(data, { requestId: "t" }, async () => new Response("no", { status: 422 }));
    expect(rejected).toEqual({ status: "failed", reason: "rejected" });
    const timeout = await deliverEnquiry(data, { requestId: "t" }, async () => {
      throw Object.assign(new Error("t"), { name: "TimeoutError" });
    });
    expect(timeout).toEqual({ status: "failed", reason: "timeout" });
    const ok = await deliverEnquiry(data, { requestId: "t" }, async () => Response.json({ id: "abc" }));
    expect(ok).toEqual({ status: "accepted", providerId: "abc" });
  });
});

describe("webhook signature", () => {
  const secret = "s3cret";
  const body = '{"_type":"artwork","slug":"x"}';
  it("accepts a fresh valid signature on the raw body", () => {
    const now = Date.now();
    expect(verifySignature(signPayload(secret, now, body), body, secret, now)).toEqual({ ok: true });
  });
  it("rejects tampered bodies, wrong secrets, stale timestamps and missing headers", () => {
    const now = Date.now();
    const h = signPayload(secret, now, body);
    expect(verifySignature(h, body + " ", secret, now)).toMatchObject({ ok: false, reason: "mismatch" });
    expect(verifySignature(h, body, "other", now)).toMatchObject({ ok: false, reason: "mismatch" });
    expect(verifySignature(h, body, secret, now + 10 * 60 * 1000)).toMatchObject({ ok: false, reason: "stale" });
    expect(verifySignature(null, body, secret, now)).toMatchObject({ ok: false, reason: "missing" });
    expect(verifySignature("garbage", body, secret, now)).toMatchObject({ ok: false, reason: "malformed" });
  });
});

describe("JSON-LD serialisation", () => {
  it("cannot break out of the script element", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
  });
});
