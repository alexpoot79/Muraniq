import { draftMode } from "next/headers";
import { safeReturnPath } from "@/lib/preview-access";

/** Leaves the draft preview (POST from the preview banner) and returns to a same-site page. */
export async function POST(req: Request) {
  let returnTo = "/";
  try {
    returnTo = safeReturnPath((await req.formData()).get("return"));
  } catch {
    // No or malformed form body: go home.
  }
  (await draftMode()).disable();
  return new Response(null, {
    status: 303,
    headers: { Location: returnTo, "Cache-Control": "private, no-store, max-age=0" },
  });
}
