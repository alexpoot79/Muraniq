import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Catalog } from "@/features/catalog/Catalog";
import { PageIntro } from "@/components/editorial/PageIntro";
import { CATEGORIES, categoryBySlug } from "@/content/categories";
import { getArtworksByCategory } from "@/content/repository.server";
import { routes } from "@/lib/routes";
import { SITE, absoluteUrl } from "@/lib/site";
import { CategoryTabs } from "@/features/catalog/CategoryTabs";

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
    <>
      <PageIntro
        crumbs={[
          { label: "Collection", href: routes.collection() },
          { label: info.title, href: routes.category(info.slug) },
        ]}
        kicker={info.kicker}
        title={info.title}
      >
        <p>{info.intro}</p>
      </PageIntro>
      <CategoryTabs current={info.slug} />

      {works.length === 0 ? (
        <section className="container-gallery section-y" aria-labelledby="prep-title">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <p className="label eyebrow text-muted-dark">In preparation</p>
            <h2 id="prep-title" className="display-lg mt-6">
              This area is being <span className="serif-italic">documented.</span>
            </h2>
            <p className="mt-6 max-w-prose text-muted-dark">
              Works in {info.title.toLowerCase()} will appear here once their photography, attribution and sources have
              been reviewed. Until then, the rest of the collection is open to browse.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
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
        <div className="container-gallery pt-12 pb-28 lg:pt-16">
          <Suspense fallback={<p className="min-h-svh text-muted-dark">Loading works…</p>}>
            <Catalog base={routes.category(info.slug)} searchParams={searchParams} fixedCategory={info.slug} />
          </Suspense>
        </div>
      )}
    </>
  );
}
