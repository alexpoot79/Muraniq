import Link from "next/link";
import type { Metadata } from "next";
import { getArtworks } from "@/content/repository.server";
import { ArtworkImage, ImageBackdrop } from "@/components/editorial/ArtworkImage";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { ExhibitionControls } from "@/features/exhibition/ExhibitionControls";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";

export const metadata: Metadata = pageMetadata({
  title: "Exhibition",
  description: "An immersive gallery walk through the works, one object at a time.",
  path: routes.exhibition(),
});

const TRACK = "exhibition-track";

/**
 * Gallery mode: one work per screen, walked sideways with native scroll
 * snapping. No script is needed to move through it; buttons are an extra.
 */
export default async function ExhibitionPage() {
  const works = await getArtworks();
  const total = works.length;
  return (
    <section aria-labelledby="exhibition-title" className="relative bg-stage">
      <div
        id={TRACK}
        tabIndex={0}
        role="region"
        aria-label="Exhibition, one work per screen. Scroll sideways, swipe, or use the arrow keys."
        className="gallery-track flex h-[calc(100svh-4.5rem)] overflow-x-auto overflow-y-hidden focus-visible:outline-offset-[-3px] lg:h-[calc(100svh-6rem)]"
      >
        {/* Opening wall */}
        <div className="relative flex w-screen shrink-0 items-center">
          <div className="container-gallery grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="settle label eyebrow text-muted-dark">Exhibition</p>
              <h1 id="exhibition-title" className="settle settle-1 display-hero mt-8">
                One object, <span className="serif-italic text-accent">one wall.</span>
              </h1>
            </div>
            <div className="settle settle-2 flex flex-col gap-6 text-muted-dark lg:col-span-4 lg:self-end">
              <p className="lede">
                Walk through the works one at a time, each with room around it. Scroll sideways, swipe, or use the arrow
                keys.
              </p>
              <p className="text-sm">
                {total} works. The objects shown are reference pieces from public museum collections, credited on every
                wall.
              </p>
            </div>
          </div>
          <span aria-hidden="true" className="label absolute right-8 bottom-8 hidden items-center gap-4 text-muted-dark lg:inline-flex">
            Begin
            <span className="inline-block h-px w-16 bg-accent" />
          </span>
        </div>

        {works.map((w, i) => (
          <figure
            key={w.id}
            aria-label={`${i + 1} of ${total}: ${w.title}`}
            className="grid w-screen shrink-0 grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_24rem] lg:grid-rows-1"
          >
            <div className="plate relative overflow-hidden">
              <ImageBackdrop media={w.hero} sizes="70vw" />
              <div className="absolute inset-6 sm:inset-12 lg:inset-16">
                <ArtworkImage media={w.hero} sizes="(min-width: 64rem) 65vw, 100vw" fill className="drop-shadow-[0_40px_60px_rgb(0_0_0_/_0.45)]" />
              </div>
            </div>
            <figcaption className="flex flex-col justify-end gap-4 border-line-dark bg-stage px-6 py-6 lg:border-l lg:px-10 lg:py-12">
              <p className="numeral text-2xl text-accent">
                {String(i + 1).padStart(2, "0")}
                <span className="text-muted-dark"> / {String(total).padStart(2, "0")}</span>
              </p>
              <h2 className="display-md">{w.title}</h2>
              <p className="text-sm text-muted-dark">
                {[w.datingLabel, w.objectType].filter(Boolean).join(" · ")}
                {w.attributionCertainty !== "unknown" && <span className="block">{w.attributionLine}</span>}
                {w.heldBy && <span className="block">Museum reference · {w.heldBy.institution} · CC0</span>}
              </p>
              <ArrowLink href={routes.artwork(w.slug)} className="text-on-dark">
                Study this work
              </ArrowLink>
            </figcaption>
          </figure>
        ))}

        {/* Closing wall */}
        <div className="flex w-screen shrink-0 items-center justify-center">
          <div className="flex max-w-xl flex-col items-center gap-8 px-6 text-center">
            <p className="label eyebrow text-muted-dark">End of the exhibition</p>
            <p className="display-lg">
              Continue in <span className="serif-italic">the collection.</span>
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href={routes.collection()} className="btn btn-primary">
                Explore the collection
              </Link>
              <Link href={routes.guide()} className="btn btn-ghost">
                Glass Guide
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute top-6 right-6 hidden lg:block [&>*]:pointer-events-auto">
        <ExhibitionControls trackId={TRACK} />
      </div>
    </section>
  );
}
