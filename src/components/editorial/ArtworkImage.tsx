import Image from "next/image";
import type { PublicMedia } from "@/content/public-projection";

/**
 * Object photography. Default: the whole photograph at its own proportions
 * (object-contain, known dimensions, no layout shift). `fill` places it in a
 * sized parent; with `fit="contain"` the object is never cropped, with
 * `fit="cover"` only the plain studio backdrop may be trimmed (used for the
 * home hero, where the frame matches the photograph's proportions closely).
 * CMS images will use the Sanity image pipeline via a loader.
 */
export function ArtworkImage({
  media,
  sizes,
  priority = false,
  className = "",
  fill = false,
  fit = "contain",
  decorative = false,
}: {
  media: PublicMedia;
  sizes: string;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  fit?: "contain" | "cover";
  /** The picture sits inside a control or link that already names it: hide it from assistive tech. */
  decorative?: boolean;
}) {
  const alt = decorative ? "" : media.alt;
  // The LCP image is preloaded from <head> (discovered before the CSS) and fetched at high priority.
  const preload = priority;
  const loading = priority ? undefined : "lazy";
  // Next 16 deprecates `priority`; the LCP image is loaded eagerly at high fetch priority instead.
  const fetchPriority = priority ? "high" : "auto";
  if (fill)
    return (
      <Image
        src={media.src}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        loading={loading}
        fetchPriority={fetchPriority}
        className={`${fit === "cover" ? "object-cover" : "object-contain"} ${className}`}
        style={media.focalPoint ? { objectPosition: `${media.focalPoint.x * 100}% ${media.focalPoint.y * 100}%` } : undefined}
      />
    );
  return (
    <Image
      src={media.src}
      alt={alt}
      width={media.width}
      height={media.height}
      sizes={sizes}
      preload={preload}
      loading={loading}
      fetchPriority={fetchPriority}
      className={`h-auto w-full object-contain ${className}`}
    />
  );
}

/**
 * Decorative extension of a photograph's own studio backdrop: a heavily
 * blurred copy behind a contained photograph, so the frame is filled with the
 * photograph's own tones instead of an empty mat. Hidden from assistive tech;
 * the photograph itself is shown whole and unaltered on top.
 */
export function ImageBackdrop({ media, sizes, vignette = true }: { media: PublicMedia; sizes: string; vignette?: boolean }) {
  return (
    <>
      <Image
        src={media.src}
        alt=""
        aria-hidden="true"
        fill
        sizes={sizes}
        loading="lazy"
        className="pointer-events-none scale-125 object-cover opacity-90 blur-2xl saturate-[0.85]"
      />
      {vignette && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_35%,rgb(8_8_8_/_0.72)_100%)]"
        />
      )}
    </>
  );
}
