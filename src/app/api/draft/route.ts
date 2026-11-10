import { draftMode } from "next/headers";
import { connection } from "next/server";
import { previewConfigured, previewSecretMatches, previewTarget } from "@/lib/preview-access";

const NO_STORE = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
} as const;

/**
 * Opens the draft preview: GET /api/draft/?secret=<SANITY_PREVIEW_SECRET>&slug=<artwork slug>
 * (slug optional → homepage). Draft Mode then lasts until the browser closes or
 * the editor leaves preview. Responses are never cached or indexed.
 */
export async function GET(req: Request) {
  // Always evaluate per request: the secret and the query string are request-time inputs.
  await connection();
  if (!previewConfigured()) return new Response("Not found", { status: 404, headers: NO_STORE });

  const url = new URL(req.url);
  if (!previewSecretMatches(url.searchParams.get("secret"))) {
    return new Response("Invalid preview link", { status: 401, headers: NO_STORE });
  }
  const target = previewTarget(url.searchParams.get("slug"));
  if (!target) return new Response("Invalid slug", { status: 400, headers: NO_STORE });

  (await draftMode()).enable();
  return new Response(null, { status: 307, headers: { ...NO_STORE, Location: target } });
}
