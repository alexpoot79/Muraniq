import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Catalog } from "@/features/catalog/Catalog";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CATEGORIES, categoryBySlug } from "@/content/categories";
import { getArtworksByCategory } from "@/content/repository.server";
import { routes } from "@/lib/routes";
import { SITE, absoluteUrl } from "@/lib/site";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/collection/[category]">): Promise<Metadata> {
  const { category } = await params;
  const info = categoryBySlug(category);
  if (!info) return { title: "Not found", robots: { index: false } };
  const works = await getArtworksByCategory(info.slug);
  return {
    title: `${info.title} Collection`,
    description: info.intro,
    // Areas without published works keep their URL but stay out of the index.
    robots: works.length === 0 ? { index: false, follow: true } : undefined,
    openGraph: { title: `${info.title} | ${SITE.name}`, url: absoluteUrl(routes.category(info.slug)) },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/collection/[category]">) {
  const { category } = await params;
  const info = categoryBySlug(category);
  if (!info) notFound();
  const works = await getArtworksByCategory(info.slug);

  return (
    <div className="container-gallery pt-6 pb-24 lg:pt-10">
      <Breadcrumbs
        items={[
          { label: "Collection", href: routes.collection() },
          { label: info.title, href: routes.category(info.slug) },
        ]}
      />
      <header className="mt-8 grid gap-6 border-b border-line-dark pb-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label text-accent">{info.kicker}</p>
          <h1 className="display-xl mt-4">{info.title}</h1>
        </div>
        <p className="text-muted-dark lg:col-span-4 lg:col-start-9 lg:self-end">{info.intro}</p>
      </header>

      {works.length === 0 ? (
        <section className="mt-12 grid gap-8 lg:grid-cols-12" aria-labelledby="prep-title">
          <div className="lg:col-span-7">
            <h2 id="prep-title" className="display-md">
              This area of the collection is being documented.
            </h2>
            <p className="mt-5 max-w-prose text-muted-dark">
              Works in {info.title.toLowerCase()} will appear here once their photography, attribution and sources
              have been reviewed. Until then, the rest of the collection is open to browse.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={routes.collection()} className="btn btn-primary">
                Browse the collection
              </Link>
              <Link href={routes.contact()} className="btn btn-ghost">
                Ask about this area
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <div className="mt-10">
          <Suspense fallback={<p className="text-muted-dark">Loading works…</p>}>
            <Catalog base={routes.category(info.slug)} searchParams={searchParams} fixedCategory={info.slug} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
