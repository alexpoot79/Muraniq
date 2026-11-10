/** Site-wide constants. Only verified facts belong here. */
export const SITE = {
  name: "MURANIQ",
  origin: "https://muraniq.nl",
  tagline: "Murano Glass, Fine Art & Collectible Objects",
  description:
    "A private collection of Murano glass, studio glass, fine art and collectible objects — documented through independent research, marks, techniques and sources.",
  /** Contact address shown on the current muraniq.nl footer (source audit, 9 Nov 2026). */
  email: "info@muraniq.com",
  /** Social profiles are omitted until verified profile URLs are supplied. */
  social: [] as Array<{ label: string; href: string }>,
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path, SITE.origin).toString();
}
