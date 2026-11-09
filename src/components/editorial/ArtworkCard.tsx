import Link from "next/link";
import type { ArtworkSummary } from "@/content/publication";
import { routes } from "@/lib/routes";
import { AVAILABILITY_LABEL } from "@/lib/format";
import { ArtworkImage } from "./ArtworkImage";
import { FixtureNotice } from "@/components/ui/FixtureNotice";

/** No shadows, no price, no hype: the object first, then what is known. */
export function ArtworkCard({
  artwork,
  sizes = "(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 100vw",
  headingLevel = "h3",
  priority = false,
}: {
  artwork: ArtworkSummary;
  sizes?: string;
  headingLevel?: "h2" | "h3";
  priority?: boolean;
}) {
  const H = headingLevel;
  const showAvailability = artwork.availability !== "private_collection";
  return (
    <article className="group relative flex flex-col">
      <div className="relative overflow-hidden bg-raised">
        <ArtworkImage
          media={artwork.hero}
          sizes={sizes}
          priority={priority}
          className="transition-transform duration-500 ease-[var(--ease-gallery)] motion-safe:group-hover:scale-[1.015]"
        />
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <p className="label text-muted-dark">{artwork.attributionLine}</p>
        <H className="font-display text-2xl leading-tight text-on-dark">
          <Link href={routes.artwork(artwork.slug)} className="after:absolute after:inset-0 focus-visible:outline-none">
            {artwork.title}
          </Link>
        </H>
        <p className="text-sm text-muted-dark">
          {[artwork.datingLabel && artwork.datingLabel !== "Not documented" ? artwork.datingLabel : null, artwork.objectType]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {showAvailability && (
            <span className="label border border-line-dark px-2 py-0.5 text-[0.6875rem] text-on-dark">
              {AVAILABILITY_LABEL[artwork.availability]}
            </span>
          )}
          {artwork.isFixture && <FixtureNotice compact />}
        </div>
      </div>
      {/* Focus ring for the stretched link */}
      <span aria-hidden="true" className="pointer-events-none absolute -inset-2 hidden rounded-sm outline-2 outline-accent group-has-[a:focus-visible]:block" />
    </article>
  );
}
