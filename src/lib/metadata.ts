import type { Metadata } from "next";
import { SITE, absoluteUrl } from "./site";

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: { src: string; alt: string; width: number; height: number };
  noindex?: boolean;
  canonical?: string;
}): Metadata {
  const canonical = absoluteUrl(opts.canonical ?? opts.path);
  const image = opts.image ?? { src: "/og-default.png", alt: SITE.name, width: 1200, height: 630 };
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical },
    robots: opts.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: "en_GB",
      url: canonical,
      title: opts.title,
      description: opts.description,
      images: [{ url: absoluteUrl(image.src), width: image.width, height: image.height, alt: image.alt }],
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description },
  };
}
