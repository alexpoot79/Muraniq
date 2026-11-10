import { revalidateTag } from "next/cache";
import { verifySignature } from "@/lib/webhook-signature";
import { TAGS } from "@/content/repository.server";

const MAX_BODY = 64 * 1024;
const ALLOWED_TYPES = new Set(["artwork", "creator", "technique", "glasshouse", "source", "mediaAsset", "redirect"]);

/**
 * Sanity publication webhook → cache invalidation.
 * Configure the webhook with projection {_type, "slug": slug.current, "op": delta::operation()}
 * and the secret in SANITY_WEBHOOK_SECRET. Repeated valid events simply repeat
 * the same idempotent invalidation (no exactly-once promise).
 */
export async function POST(req: Request) {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) return Response.json({ ok: false, error: "not_configured" }, { status: 503 });

  const raw = await req.text();
  if (raw.length > MAX_BODY) return Response.json({ ok: false, error: "too_large" }, { status: 413 });

  const check = verifySignature(req.headers.get("sanity-webhook-signature"), raw, secret);
  if (!check.ok) return Response.json({ ok: false, error: check.reason }, { status: 401 });

  if (process.env.SANITY_PROJECT_ID && req.headers.get("sanity-project-id") && req.headers.get("sanity-project-id") !== process.env.SANITY_PROJECT_ID) {
    return Response.json({ ok: false, error: "wrong_project" }, { status: 400 });
  }

  let payload: { _type?: string; slug?: string; op?: string };
  try {
    payload = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false, error: "bad_json" }, { status: 400 });
  }
  if (!payload._type || !ALLOWED_TYPES.has(payload._type)) {
    return Response.json({ ok: false, error: "ignored_type" }, { status: 400 });
  }

  // Deletions and withdrawals must disappear immediately; normal edits may serve stale while revalidating.
  const profile = payload.op === "delete" || payload.op === "unpublish" ? { expire: 0 } : "max";
  const tags: string[] = [TAGS.catalog];
  if (payload.slug && /^[a-z0-9-]{1,120}$/.test(payload.slug)) {
    if (payload._type === "artwork") tags.push(TAGS.artwork(payload.slug));
    if (payload._type === "creator") tags.push(TAGS.creator(payload.slug));
    if (payload._type === "technique") tags.push(TAGS.technique(payload.slug));
  }
  for (const t of tags) revalidateTag(t, profile);
  return Response.json({ ok: true, tags });
}
