/**
 * Central route helper. Links, canonicals, breadcrumbs and the sitemap all use
 * these functions so the URL contract (with trailing slashes) is defined once.
 */
import type { CategorySlug } from "@/content/schemas";

export const routes = {
  home: () => "/",
  collection: () => "/collection/",
  category: (slug: CategorySlug) => `/collection/${slug}/`,
  artwork: (slug: string) => `/collection/objects/${slug}/`,
  exhibition: () => "/exhibition/",
  guide: () => "/glass-guide/",
  makers: () => "/glass-guide/makers/",
  maker: (slug: string) => `/glass-guide/makers/${slug}/`,
  techniques: () => "/glass-guide/techniques/",
  technique: (slug: string) => `/glass-guide/techniques/${slug}/`,
  attribution: () => "/glass-guide/attribution/",
  about: () => "/about/",
  contact: (objectId?: string) => (objectId ? `/contact/?object=${encodeURIComponent(objectId)}` : "/contact/"),
  privacy: () => "/privacy/",
} as const;

export type Crumb = { label: string; href: string };
