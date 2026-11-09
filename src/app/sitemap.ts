import type { MetadataRoute } from "next";
import { getArtworks, getCreators, getTechniques } from "@/content/repository.server";
import { CATEGORIES } from "@/content/categories";
import { routes } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site";

/** Generated from published data; only indexable pages are listed. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [artworks, creators, techniques] = await Promise.all([getArtworks(), getCreators(), getTechniques()]);
  const filledCategories = CATEGORIES.filter((c) => artworks.some((a) => a.category === c.slug));
  const statics = [
    routes.home(),
    routes.collection(),
    routes.guide(),
    routes.makers(),
    routes.techniques(),
    routes.attribution(),
    routes.about(),
    routes.contact(),
    routes.privacy(),
  ];
  return [
    ...statics.map((p) => ({ url: absoluteUrl(p) })),
    ...filledCategories.map((c) => ({ url: absoluteUrl(routes.category(c.slug)) })),
    ...artworks.map((a) => ({
      url: absoluteUrl(routes.artwork(a.slug)),
      images: [absoluteUrl(a.hero.src)],
    })),
    ...creators.map((c) => ({ url: absoluteUrl(routes.maker(c.slug)) })),
    ...techniques.map((t) => ({ url: absoluteUrl(routes.technique(t.slug)) })),
  ];
}
