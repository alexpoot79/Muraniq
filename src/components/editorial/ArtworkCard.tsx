import Link from "next/link";
import type { ArtworkSummary } from "@/content/publication";
import { routes } from "@/lib/routes";
import { AVAILABILITY_LABEL } from "@/lib/format";
import { ArtworkImage, ImageBackdrop } from "./ArtworkImage";
import { FixtureNotice } from "@/components/ui/FixtureNotice";

/**
 * The object first, then what is known.
 *
 * Every frame in a grid shares one proportion so objects line up. When the
 * photograph's own proportion is close to the frame (within 12%), it fills the
 * frame and only plain studio backdrop is trimmed; otherwise the whole
 * photograph sits on a dark mat. The object itself is never cropped.
 * Pass `ratio="natural"` to show the photograph at its own proportions.
 */
export function ArtworkCard({
  artwork,
  sizes = "(min-width: 80rem) 28vw, (min-width: 40rem) 45vw, 100vw",
  headingLevel = "h3",
  priority = false,
  ratio = 4 / 5,
  tone = "dark",
}: {
  artwork: ArtworkSummary;
  sizes?: string;
  headingLevel?: "h2" | "h3";
  priority?: boolean;
  /** Frame proportion (width / height) or "natural". */
  ratio?: number | "natural";
  tone?: "dark" | "paper";
}) {
  const H = headingLevel;
  const own = artwork.hero.width / artwork.hero.height;
  const frame = ratio === "natural" ? own : ratio;
  const fills = Math.abs(own / frame - 1) <= 0.12;
  const showAvailability = artwork.availability !== "private_collection";
  const muted = tone === "dark" ? "text-muted-dark" : "text-ink-muted";
  const meta = [artwork.datingLabel && artwork.datingLabel !== "Not documented" ? artwork.datingLabel : null, artwork.objectType]
    .filter(Boolean)
    .join(" · ");
  return (
    <article className="group relative flex flex-col">
      <div className="plate relative overflow-hidden" style={{ aspectRatio: String(frame) }}>
        {!fills && <ImageBackdrop media={artwork.hero} sizes={sizes} />}
        <div className={`absolute ${fills ? "inset-0" : "inset-5 sm:inset-7"}`}>
          <ArtworkImage
            media={artwork.hero}
            sizes={sizes}
            priority={priority}
            fill
            fit={fills ? "cover" : "contain"}
            className="transition-transform duration-[1400ms] ease-[var(--ease-silk)] motion-safe:group-hover:scale-[1.04]"
          />
        </div>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_var(--color-accent)] opacity-0 transition-opacity duration-700 group-hover:opacity-50"
        />
      </div>
      <div className="mt-5 flex flex-col gap-1.5">
        {meta && <p className={`label text-[0.6875rem] ${muted}`}>{meta}</p>}
        <H className={`display-sm transition-colors duration-300 ${tone === "dark" ? "text-on-dark group-hover:text-accent" : "text-ink"}`}>
          <Link href={routes.artwork(artwork.slug)} className="after:absolute after:inset-0 focus-visible:outline-none">
            {artwork.title}
          </Link>
        </H>
        {artwork.attributionCertainty !== "unknown" && <p className={`text-sm ${muted}`}>{artwork.attributionLine}</p>}
        {artwork.heldBy ? (
          <p className={`text-xs tracking-wide ${muted}`}>Museum reference · {artwork.heldBy.institution}</p>
        ) : (
          artwork.isFixture && (
            <p className="mt-1">
              <FixtureNotice compact tone={tone} />
            </p>
          )
        )}
        {showAvailability && (
          <p className="mt-2">
            <span className={`label border px-2.5 py-1 text-[0.625rem] ${tone === "dark" ? "border-line-dark text-on-dark" : "border-line-paper text-ink"}`}>
              {AVAILABILITY_LABEL[artwork.availability]}
            </span>
          </p>
        )}
      </div>
      {/* Focus ring for the stretched link */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -inset-2 hidden outline-2 group-has-[a:focus-visible]:block ${tone === "dark" ? "outline-accent" : "outline-ink"}`}
      />
    </article>
  );
}
