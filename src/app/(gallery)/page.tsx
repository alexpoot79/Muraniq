import Link from "next/link";
import type { Metadata } from "next";
import { getArtworkBySlug, getArtworks, getFeaturedArtworks, getTechniques } from "@/content/repository.server";
import { CATEGORIES } from "@/content/categories";
import { ArtworkImage } from "@/components/editorial/ArtworkImage";
import { ArtworkCard } from "@/components/editorial/ArtworkCard";
import { CertaintyBadge } from "@/components/ui/CertaintyBadge";
import { FixtureNotice } from "@/components/ui/FixtureNotice";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/metadata";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMetadata({ title: `${SITE.name} | ${SITE.tagline}`, description: SITE.description, path: "/" }),
  title: { absolute: `${SITE.name} | ${SITE.tagline}` },
};

export default async function HomePage() {
  const [featured, all, techniques] = await Promise.all([getFeaturedArtworks(3), getArtworks(), getTechniques()]);
  const heroSummary = featured[0] ?? all[0];
  const hero = heroSummary ? await getArtworkBySlug(heroSummary.slug) : null;
  const heroTechnique = hero?.techniques[0]
    ? techniques.find((t) => t.slug === hero.techniques[0]!.slug)
    : techniques[0];
  const detailImage = hero?.media.find((m) => m.viewType === "detail") ?? null;
  const evidenceExample = hero?.assertions.find((a) => a.field === "creator") ?? null;
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c.slug, all.filter((a) => a.category === c.slug).length]));

  return (
    <>
      {/* 1 — Viewing room hero */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden">
        <div className="container-gallery grid grid-cols-[minmax(0,1fr)] gap-y-8 pt-10 pb-16 lg:grid-cols-12 lg:gap-x-12 lg:pt-16 lg:pb-24">
          <div className="flex flex-col lg:col-span-5 lg:justify-center">
            <p className="label text-accent">Private collection · Independent research</p>
            <h1 id="hero-title" className="display-xl mt-5 text-on-dark">
              Glass and art, seen closely.
            </h1>
          </div>

          {hero && (
            <figure className="lg:col-span-7 lg:row-span-2 lg:row-start-1 lg:col-start-6">
              <Link href={routes.artwork(hero.slug)} className="block bg-raised" aria-label={`View ${hero.title}`}>
                <ArtworkImage
                  media={hero.hero}
                  sizes="(min-width: 64rem) 55vw, 100vw"
                  priority
                  className="mx-auto max-h-[78vh] w-auto max-w-full"
                />
              </Link>
              <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-sm text-muted-dark">
                <span>
                  <span className="text-on-dark">{hero.title}</span> — {hero.attributionLine}
                  {hero.dating ? `, ${hero.dating.displayLabel}` : ""}
                </span>
                {hero.isFixture && <FixtureNotice compact />}
              </figcaption>
            </figure>
          )}

          <div className="flex flex-col gap-8 lg:col-span-5 lg:col-start-1 lg:row-start-2">
            <p className="lede measure text-muted-dark">
              MURANIQ is a private collection of Murano glass, studio glass, fine art and collectible objects. Each
              work is shown in full, with what is known about its making — and an honest account of what is not.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={routes.collection()} className="btn btn-primary">
                Explore the collection
              </Link>
              <Link href={routes.guide()} className="btn btn-ghost">
                Glass Guide
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Collection intro */}
      <section aria-labelledby="intro-title" className="border-t border-line-dark">
        <div className="container-gallery grid gap-8 py-20 md:grid-cols-12 lg:py-28">
          <h2 id="intro-title" className="display-md md:col-span-5">
            A collection built around the object and the evidence.
          </h2>
          <div className="measure flex flex-col gap-5 text-muted-dark md:col-span-6 md:col-start-7">
            <p>
              Every piece has its own dossier: photographs of the front, the reverse, the base and the marks; its
              materials and technique; and the sources behind each attribution.
            </p>
            <p>
              Attributions carry a visible level of certainty, from verified to hypothesis. Selected works are
              occasionally available for acquisition; enquiries about any piece are welcome.
            </p>
          </div>
        </div>
      </section>

      {/* 3 — Selected works (max three, only what exists) */}
      {featured.length > 0 && (
        <section aria-labelledby="selected-title" className="border-t border-line-dark">
          <div className="container-gallery py-20 lg:py-28">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="label text-accent">Selected works</p>
                <h2 id="selected-title" className="display-lg mt-3">
                  From the collection
                </h2>
              </div>
              <Link href={routes.collection()} className="label link-quiet text-on-dark">
                View all works
              </Link>
            </div>
            <ul className="mt-14 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-12">
              {featured.map((a, i) => (
                <li
                  key={a.id}
                  className={
                    featured.length === 3
                      ? i === 0
                        ? "lg:col-span-5"
                        : i === 1
                          ? "lg:col-span-4 lg:col-start-7 lg:mt-32"
                          : "sm:col-span-2 sm:mx-auto sm:w-1/2 lg:col-span-3 lg:col-start-10 lg:mx-0 lg:mt-0 lg:w-auto lg:self-end"
                      : "lg:col-span-5"
                  }
                >
                  <ArtworkCard artwork={a} headingLevel="h3" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 4 — Study room: technique */}
      {heroTechnique && (
        <section aria-labelledby="technique-title" className="surface-paper">
          <div className="container-gallery grid items-center gap-10 py-20 md:grid-cols-12 lg:py-28">
            {detailImage && (
              <figure className="md:col-span-6 lg:col-span-6">
                <ArtworkImage media={detailImage} sizes="(min-width: 48rem) 50vw, 100vw" />
                <figcaption className="mt-3 text-sm text-ink-muted">{detailImage.caption}</figcaption>
              </figure>
            )}
            <div className={`measure flex flex-col gap-5 ${detailImage ? "md:col-span-6 lg:col-span-5 lg:col-start-8" : "md:col-span-8"}`}>
              <p className="label text-ink-muted">Technique</p>
              <h2 id="technique-title" className="display-lg">
                {heroTechnique.term}
              </h2>
              <p className="lede">{heroTechnique.summary}</p>
              <p className="text-ink-muted">{heroTechnique.body[1] ?? heroTechnique.body[0]}</p>
              <p>
                <Link href={routes.technique(heroTechnique.slug)} className="btn btn-ink mt-2">
                  Read about {heroTechnique.term.toLowerCase()}
                </Link>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 5 — Collection areas */}
      <section aria-labelledby="areas-title" className="border-t border-line-dark">
        <div className="container-gallery py-20 lg:py-28">
          <p className="label text-accent">Collection areas</p>
          <h2 id="areas-title" className="display-lg mt-3 max-w-3xl">
            Four areas, one standard of documentation.
          </h2>
          <ul className="mt-14 grid border-t border-line-dark md:grid-cols-2">
            {CATEGORIES.map((c, i) => {
              const n = counts[c.slug] ?? 0;
              return (
                <li
                  key={c.slug}
                  className={`relative border-b border-line-dark py-10 md:px-10 ${i % 2 === 0 ? "md:border-r md:pl-0" : "md:pr-0"}`}
                >
                  <p className="label text-muted-dark">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="display-md mt-3">
                    <Link href={routes.category(c.slug)} className="after:absolute after:inset-0 hover:text-accent">
                      {c.title}
                    </Link>
                  </h3>
                  <p className="mt-3 max-w-md text-muted-dark">{c.intro}</p>
                  <p className="label mt-5 text-on-dark">{n > 0 ? "View works" : "In preparation"}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 6 — Research & provenance: one claim leading to its evidence */}
      {hero && evidenceExample && (
        <section aria-labelledby="research-title" className="border-t border-line-dark bg-raised">
          <div className="container-gallery grid gap-10 py-20 md:grid-cols-12 lg:py-28">
            <div className="md:col-span-5">
              <p className="label text-accent">Research &amp; provenance</p>
              <h2 id="research-title" className="display-lg mt-3">
                Every claim leads to its evidence.
              </h2>
              <p className="mt-6 text-muted-dark">
                A signature is an observation, not a conclusion. We record what is written, what it may mean and how
                sure we are — and link it to the source.
              </p>
              <p className="mt-8">
                <Link href={routes.attribution()} className="link-quiet label text-on-dark">
                  How we attribute
                </Link>
              </p>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <div className="border border-line-dark p-6 sm:p-8">
                <p className="label text-muted-dark">Claim · {hero.title}</p>
                <p className="mt-3 font-display text-3xl">{evidenceExample.statement}</p>
                <div className="mt-5">
                  <CertaintyBadge certainty={evidenceExample.certainty} explain />
                </div>
                {evidenceExample.publicNote && <p className="mt-5 text-muted-dark">{evidenceExample.publicNote}</p>}
                <p className="mt-6">
                  <Link href={`${routes.artwork(hero.slug)}#attribution`} className="btn btn-ghost">
                    See the evidence
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7 — Invitation */}
      <section aria-labelledby="invite-title" className="border-t border-line-dark">
        <div className="container-gallery flex flex-col items-start gap-6 py-20 lg:py-28">
          <h2 id="invite-title" className="display-lg max-w-3xl">
            Questions about a piece, a maker or a mark?
          </h2>
          <p className="measure text-muted-dark">
            We welcome enquiries from collectors, researchers and anyone with information about the works.
          </p>
          <Link href={routes.contact()} className="btn btn-primary">
            Get in touch
          </Link>
        </div>
      </section>
    </>
  );
}
