/**
 * Small read contract for public content. Server-only.
 *
 * Caching (Cache Components): the whole publication snapshot is a cached read
 * tagged `catalog`; per-record reads add their own tags. The revalidation
 * webhook maps CMS events to these tags (see src/app/api/revalidate).
 */
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { fixtureDataset } from "@fixtures/dataset";
import { validateDataset } from "./validate";
import { buildPublication, type Publication } from "./publication";
import { fetchSanityDataset, sanityConfigured } from "./sanity.server";
import type { CategorySlug } from "./schemas";

export const TAGS = {
  catalog: "catalog",
  artwork: (slug: string) => `artwork:${slug}`,
  creator: (slug: string) => `creator:${slug}`,
  technique: (slug: string) => `technique:${slug}`,
} as const;

export type ContentSource = "fixtures" | "sanity";

export function contentSource(): ContentSource {
  return process.env.CONTENT_SOURCE === "sanity" && sanityConfigured() ? "sanity" : "fixtures";
}

async function loadPublication(): Promise<Publication> {
  "use cache";
  cacheTag(TAGS.catalog);
  cacheLife("hours");

  const raw = contentSource() === "sanity" ? await fetchSanityDataset() : fixtureDataset;
  const result = validateDataset(raw);
  if (!result.ok) {
    // Fail loudly: never publish a dataset that breaks the publication rules.
    const detail = result.issues.map((i) => `${i.path}: ${i.message}`).join("\n");
    throw new Error(`Content validation failed:\n${detail}`);
  }
  return buildPublication(result.data);
}

export async function getArtworks() {
  return (await loadPublication()).artworks;
}

export async function getFeaturedArtworks(limit = 3) {
  const all = await getArtworks();
  return all.filter((a) => a.featured).slice(0, limit);
}

export async function getArtworksByCategory(category: CategorySlug) {
  return (await getArtworks()).filter((a) => a.category === category);
}

export async function getArtworkBySlug(slug: string) {
  "use cache";
  cacheTag(TAGS.catalog, TAGS.artwork(slug));
  return (await loadPublication()).dossiers[slug] ?? null;
}

export async function getArtworkById(id: string) {
  return (await getArtworks()).find((a) => a.id === id) ?? null;
}

export async function getCreators() {
  return (await loadPublication()).creators;
}

export async function getCreatorBySlug(slug: string) {
  "use cache";
  cacheTag(TAGS.catalog, TAGS.creator(slug));
  const pub = await loadPublication();
  const creator = pub.creators.find((c) => c.slug === slug);
  if (!creator) return null;
  return {
    creator,
    artworks: pub.artworks.filter((a) => creator.artworkIds.includes(a.id)),
    sources: pub.sources.filter((s) => creator.sourceIds.includes(s.id)),
  };
}

export async function getTechniques() {
  return (await loadPublication()).techniques;
}

export async function getTechniqueBySlug(slug: string) {
  "use cache";
  cacheTag(TAGS.catalog, TAGS.technique(slug));
  const pub = await loadPublication();
  const technique = pub.techniques.find((t) => t.slug === slug);
  if (!technique) return null;
  return {
    technique,
    artworks: pub.artworks.filter((a) => technique.artworkIds.includes(a.id)).slice(0, 6),
    sources: pub.sources.filter((s) => technique.sourceIds.includes(s.id)),
  };
}

export async function getRedirects() {
  return (await loadPublication()).redirects;
}
