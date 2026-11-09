/**
 * Contact / enquiry validation. Shared by the route handler and the client
 * form (for immediate feedback); the server result is authoritative.
 */
import { z } from "zod";

export const ENQUIRY_LIMITS = { name: 120, email: 254, message: 4000, minMessage: 10 } as const;

export const EnquiryInput = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(ENQUIRY_LIMITS.name, "Please shorten your name."),
  email: z
    .string()
    .trim()
    .max(ENQUIRY_LIMITS.email, "Please check your email address.")
    .pipe(z.email("Please enter a valid email address.")),
  message: z
    .string()
    .trim()
    .min(ENQUIRY_LIMITS.minMessage, "Please write a short message (at least 10 characters).")
    .max(ENQUIRY_LIMITS.message, "Please keep your message under 4,000 characters."),
  objectId: z
    .string()
    .trim()
    .regex(/^MUR-[A-Z0-9-]+$/, "Unknown object reference.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  consent: z.literal("yes", { message: "Please confirm that we may use your details to reply." }),
  /** Honeypot — must stay empty. */
  website: z.string().max(0).optional().or(z.literal("")),
  /** Milliseconds since epoch when the form was rendered (time trap). */
  startedAt: z.coerce.number().int().optional(),
});
export type EnquiryInput = z.infer<typeof EnquiryInput>;

export type FieldErrors = Partial<Record<"name" | "email" | "message" | "objectId" | "consent", string>>;

export type ValidationOutcome =
  | { ok: true; data: EnquiryInput }
  | { ok: false; kind: "invalid"; errors: FieldErrors }
  | { ok: false; kind: "spam" };

export function validateEnquiry(raw: Record<string, unknown>, now = Date.now()): ValidationOutcome {
  const parsed = EnquiryInput.safeParse(raw);
  if (!parsed.success) {
    const errors: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "website" || key === "startedAt") return { ok: false, kind: "spam" };
      if (typeof key === "string" && !(key in errors)) errors[key as keyof FieldErrors] = issue.message;
    }
    return { ok: false, kind: "invalid", errors };
  }
  const { startedAt } = parsed.data;
  // Submissions faster than 2.5 s after render are almost certainly automated.
  if (startedAt !== undefined && now - startedAt < 2500) return { ok: false, kind: "spam" };
  return { ok: true, data: parsed.data };
}
