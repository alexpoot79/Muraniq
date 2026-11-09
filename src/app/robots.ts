import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { siteIndexable } from "@/lib/indexing";

export default function robots(): MetadataRoute.Robots {
  // Until launch (SITE_INDEXABLE=true on the production domain) nothing is indexable:
  // *.vercel.app test URLs and previews must never compete with muraniq.nl.
  if (!siteIndexable()) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${SITE.origin}/sitemap.xml`,
    host: SITE.origin,
  };
}
