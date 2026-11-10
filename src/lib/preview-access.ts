/**
 * Draft preview access. The preview link carries a shared secret
 * (SANITY_PREVIEW_SECRET, server-only); a valid link turns on Next.js Draft
 * Mode for that browser session only. Without the variable, preview is off.
 *
 * The redirect target is rebuilt from a validated slug, never taken from the
 * query string, so the route cannot be used as an open redirect.
 */
import { createHash, timingSafeEqual } from "node:crypto";
import { routes } from "./routes";

const MIN_SECRET_LENGTH = 32;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function previewConfigured(): boolean {
  return (process.env.SANITY_PREVIEW_SECRET?.length ?? 0) >= MIN_SECRET_LENGTH;
}

/** Constant-time comparison (hashing first equalises the lengths). */
export function previewSecretMatches(given: string | null): boolean {
  const expected = process.env.SANITY_PREVIEW_SECRET;
  if (!given || !expected || expected.length < MIN_SECRET_LENGTH) return false;
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/** Path to open after enabling preview: an artwork dossier for a valid slug, otherwise the homepage. */
export function previewTarget(slug: string | null): string | null {
  if (slug === null || slug === "") return "/";
  return SLUG.test(slug) && slug.length <= 120 ? routes.artwork(slug) : null;
}

/** Where to go after leaving preview: a same-site path only. */
export function safeReturnPath(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  return value.length <= 300 ? value : "/";
}
