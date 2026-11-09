/**
 * Mail provider adapter. NOT YET CONNECTED: no provider account or verified
 * sending domain exists. When the env vars below are absent the contact page
 * shows the plain email address instead of a form — never a fake confirmation.
 *
 * Supported provider: Resend HTTP API (single provider, chosen at connection).
 *   RESEND_API_KEY, CONTACT_TO (destination), CONTACT_FROM (verified sender)
 */
import "server-only";
import type { EnquiryInput } from "./validate";

export function enquiryDeliveryConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO && process.env.CONTACT_FROM);
}

export type DeliveryResult =
  | { status: "accepted"; providerId?: string }
  | { status: "not_configured" }
  | { status: "failed"; reason: "timeout" | "rejected" | "network" };

export async function deliverEnquiry(
  input: EnquiryInput,
  context: { objectTitle?: string; requestId: string },
  fetchImpl: typeof fetch = fetch,
): Promise<DeliveryResult> {
  if (!enquiryDeliveryConfigured()) return { status: "not_configured" };
  const subject = context.objectTitle
    ? `Enquiry: ${context.objectTitle} (${input.objectId})`
    : "Enquiry via muraniq.nl";
  const text = [
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    input.objectId ? `Object: ${input.objectId}${context.objectTitle ? ` — ${context.objectTitle}` : ""}` : null,
    "",
    input.message,
    "",
    `Request ID: ${context.requestId}`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  try {
    const res = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM,
        to: [process.env.CONTACT_TO],
        reply_to: input.email,
        subject,
        text,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { status: "failed", reason: "rejected" };
    const body = (await res.json().catch(() => ({}))) as { id?: string };
    // "accepted" means the provider accepted the message, not that it was delivered.
    return { status: "accepted", providerId: body.id };
  } catch (err) {
    const timeout = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    return { status: "failed", reason: timeout ? "timeout" : "network" };
  }
}
