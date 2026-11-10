/**
 * Sanity webhook signature verification (header `sanity-webhook-signature`,
 * format `t=<unix ms>,v1=<base64url HMAC-SHA256 of "<t>.<raw body>">`).
 * Verified on the RAW body. A valid signature alone does not prove recency,
 * so the timestamp must also fall inside the allowed window.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export const MAX_SKEW_MS = 5 * 60 * 1000;

export function signPayload(secret: string, timestamp: number, rawBody: string): string {
  const sig = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("base64url");
  return `t=${timestamp},v1=${sig}`;
}

export type SignatureCheck = { ok: true } | { ok: false; reason: "missing" | "malformed" | "stale" | "mismatch" };

export function verifySignature(
  header: string | null,
  rawBody: string,
  secret: string,
  now = Date.now(),
): SignatureCheck {
  if (!header) return { ok: false, reason: "missing" };
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    }),
  );
  const t = Number(parts.t);
  const v1 = parts.v1;
  if (!Number.isFinite(t) || !v1) return { ok: false, reason: "malformed" };
  if (Math.abs(now - t) > MAX_SKEW_MS) return { ok: false, reason: "stale" };
  const expected = signPayload(secret, t, rawBody).split("v1=")[1]!;
  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: "mismatch" };
  return { ok: true };
}
