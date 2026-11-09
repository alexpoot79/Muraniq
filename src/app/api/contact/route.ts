import { randomUUID } from "node:crypto";
import { validateEnquiry } from "@/features/enquiries/validate";
import { deliverEnquiry, enquiryDeliveryConfigured } from "@/features/enquiries/provider.server";
import { getArtworkById } from "@/content/repository.server";

const MAX_BODY = 16 * 1024;

/*
 * Best-effort, per-instance limiter. It is NOT a reliable limit across
 * serverless instances; a shared store (e.g. Upstash/Vercel KV) is required
 * for that and is listed as an open dependency in docs/GOALS-STATUS.md.
 */
const hits = new Map<string, number[]>();
function limited(key: string, now = Date.now()): boolean {
  const windowMs = 10 * 60 * 1000;
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 5;
}

function respond(req: Request, status: number, body: Record<string, unknown>) {
  const wantsJson = (req.headers.get("accept") ?? "").includes("application/json");
  if (wantsJson) return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
  // Progressive enhancement: native form posts are redirected back with a status.
  const url = new URL("/contact/", req.url);
  url.searchParams.set("status", String(body.status));
  if (typeof body.objectId === "string") url.searchParams.set("object", body.objectId);
  return Response.redirect(url, 303);
}

export async function POST(req: Request) {
  const requestId = randomUUID().slice(0, 8);
  const len = Number(req.headers.get("content-length") ?? "0");
  if (len > MAX_BODY) return respond(req, 413, { status: "invalid", requestId });

  let raw: Record<string, unknown>;
  try {
    const type = req.headers.get("content-type") ?? "";
    const text = await req.text();
    if (text.length > MAX_BODY) return respond(req, 413, { status: "invalid", requestId });
    raw = type.includes("application/json")
      ? (JSON.parse(text) as Record<string, unknown>)
      : Object.fromEntries(new URLSearchParams(text).entries());
  } catch {
    return respond(req, 400, { status: "invalid", requestId });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return respond(req, 429, { status: "rate_limited", requestId });

  const v = validateEnquiry(raw);
  if (!v.ok && v.kind === "spam") {
    // Indistinguishable from success for bots; nothing is sent.
    console.info(JSON.stringify({ event: "enquiry.discarded", requestId }));
    return respond(req, 200, { status: "accepted", requestId });
  }
  if (!v.ok) return respond(req, 422, { status: "invalid", errors: v.errors, requestId, objectId: raw.objectId });

  let objectTitle: string | undefined;
  if (v.data.objectId) {
    const art = await getArtworkById(v.data.objectId);
    if (!art) {
      return respond(req, 422, { status: "invalid", errors: { objectId: "Unknown object reference." }, requestId });
    }
    objectTitle = art.title;
  }

  if (!enquiryDeliveryConfigured()) return respond(req, 503, { status: "not_configured", requestId });

  const result = await deliverEnquiry(v.data, { objectTitle, requestId });
  // Log outcome only — never names, addresses or message text.
  console.info(JSON.stringify({ event: "enquiry.delivery", requestId, status: result.status }));
  if (result.status === "accepted") return respond(req, 200, { status: "accepted", requestId, objectId: v.data.objectId });
  return respond(req, 502, { status: "failed", requestId, objectId: v.data.objectId });
}
