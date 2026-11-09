import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Catalog } from "@/features/catalog/Catalog";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CATEGORIES } from "@/content/categories";
import { routes } from "@/lib/routes";
import { SITE, absoluteUrl } from "@/lib/site";

// Canonical is rendered by <Catalog> (filtered → /collection/, paginated → self).
export const metadata: Metadata = {
  title: "Collection",
  description: "Browse and search the MURANIQ collection of Murano glass, studio glass, fine art and collectible objects.",
  openGraph: { title: `Collection | ${SITE.name}`, url: absoluteUrl(routes.collection()) },
};

export default function CollectionPage({ searchParams }: PageProps<"/collection">) {
  return (
    <div className="container-gallery pt-6 pb-24 lg:pt-10">
      <Breadcrumbs items={[{ label: "Collection", href: routes.collection() }]} />
      <header className="mt-8 grid gap-6 border-b border-line-dark pb-10 lg:grid-cols-12">
        <h1 className="display-xl lg:col-span-6">The collection</h1>
        <div className="flex flex-col gap-5 lg:col-span-5 lg:col-start-8 lg:self-end">
          <p className="text-muted-dark">
            Every work in the collection, with its documented technique, maker and level of certainty. Search or
            narrow by area, technique, maker or period.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={routes.category(c.slug)} className="label link-quiet text-on-dark">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </header>
      <div className="mt-10">
        <Suspense fallback={<p className="text-muted-dark">Loading the collection…</p>}>
          <Catalog base={routes.collection()} searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
