import { Suspense } from "react";
import type { Metadata } from "next";
import { Catalog } from "@/features/catalog/Catalog";
import { PageIntro } from "@/components/editorial/PageIntro";
import { CategoryTabs } from "@/features/catalog/CategoryTabs";
import { routes } from "@/lib/routes";
import { SITE, absoluteUrl } from "@/lib/site";

// Canonical is rendered by <Catalog> (filtered → /collection/, paginated → self).
export const metadata: Metadata = {
  title: "Collection",
  description: "Browse and search the MURANIQ collection of Murano glass, other glass, fine art and collectible objects.",
  openGraph: { title: `Collection | ${SITE.name}`, url: absoluteUrl(routes.collection()) },
};

export default function CollectionPage({ searchParams }: PageProps<"/collection">) {
  return (
    <>
      <PageIntro crumbs={[{ label: "Collection", href: routes.collection() }]} kicker="The collection" title="Works," accent="seen closely.">
        <p>
          Every work with its documented technique, maker and level of certainty. Narrow by area, technique,
          maker or period.
        </p>
        <p className="text-sm">
          Until the collection’s own photography is published, the works shown are reference pieces from public museum
          collections, each clearly credited.
        </p>
      </PageIntro>
      <CategoryTabs />
      <div className="container-gallery pt-12 pb-28 lg:pt-16">
        <Suspense fallback={<p className="min-h-svh text-muted-dark">Loading the collection…</p>}>
          <Catalog base={routes.collection()} searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}
