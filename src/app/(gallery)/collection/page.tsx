import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/editorial/PageIntro";
import { CategoryTabs } from "@/features/catalog/CategoryTabs";
import { CATEGORIES } from "@/content/categories";
import { routes } from "@/lib/routes";
import { SITE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Collection",
  description: "The MURANIQ collection areas: Murano glass, other glass, fine art and collectible objects.",
  alternates: { canonical: absoluteUrl(routes.collection()) },
  openGraph: { title: `Collection | ${SITE.name}`, url: absoluteUrl(routes.collection()) },
};

export default function CollectionPage() {
  return (
    <>
      <PageIntro crumbs={[{ label: "Collection", href: routes.collection() }]} kicker="The collection" title="Works," accent="seen closely.">
        <p>Choose a collection area. Every work is shown with its documented technique, maker and level of certainty.</p>
        <p className="text-sm">
          Until the collection’s own photography is published, the works shown are reference pieces from public museum
          collections, each clearly credited.
        </p>
      </PageIntro>
      <CategoryTabs />
      <div className="container-gallery pt-12 pb-28 lg:pt-16">
        <ul className="grid gap-8 sm:grid-cols-2">
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link href={routes.category(c.slug)} className="flex h-full flex-col gap-4 border border-line-dark p-8 transition-colors hover:border-on-dark/60">
                <span className="label text-[0.6875rem] text-muted-dark">{c.kicker}</span>
                <h2 className="font-display text-3xl">{c.title}</h2>
                <p className="text-muted-dark">{c.intro}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
