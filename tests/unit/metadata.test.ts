import { describe, expect, it } from "vitest";
import { pageMetadata } from "@/lib/metadata";

type OgImage = { url: string; width: number; height: number };
const ogImage = (m: ReturnType<typeof pageMetadata>) => (m.openGraph?.images as OgImage[])[0]!;

describe("pageMetadata", () => {
  it("uses the primary domain for canonical and Open Graph URLs", () => {
    const m = pageMetadata({ title: "T", description: "D", path: "/collection/" });
    expect(m.alternates?.canonical).toBe("https://muraniq.nl/collection/");
    expect(ogImage(m).url).toBe("https://muraniq.nl/og-default.png");
  });

  it("keeps raster artwork images for social previews", () => {
    const m = pageMetadata({
      title: "T",
      description: "D",
      path: "/x/",
      image: { src: "https://cdn.sanity.io/images/p/d/abc-1600x1200.jpg", alt: "A", width: 1600, height: 1200 },
    });
    expect(ogImage(m)).toMatchObject({ url: "https://cdn.sanity.io/images/p/d/abc-1600x1200.jpg", width: 1600 });
  });

  it("falls back to the default card for SVG placeholders", () => {
    const m = pageMetadata({
      title: "T",
      description: "D",
      path: "/x/",
      image: { src: "/placeholders/mur-d001-front.svg", alt: "A", width: 1200, height: 1500 },
    });
    expect(ogImage(m)).toMatchObject({ url: "https://muraniq.nl/og-default.png", width: 1200, height: 630 });
  });
});
