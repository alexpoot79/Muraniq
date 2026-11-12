import Image from "next/image";
import type { PublicMedia } from "@/content/public-projection";
import TONES from "@/content/image-tones.json";

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
  intrinsic = false,
  feather = false,
}: {
  media: PublicMedia;
  sizes: string;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  fit?: "contain" | "cover";
  /** The picture sits inside a control or link that already names it: hide it from assistive tech. */
  decorative?: boolean;
  /**
   * Size the element to the photograph itself (largest size that fits the parent, never upscaled past it),
   * so the element's edges are the photograph's edges. Needs a parent with a definite size.
   */
  intrinsic?: boolean;
  /** Fade the outermost 3% of the studio backdrop into the frame's measured backdrop tones. Never used in full screen. */
  feather?: boolean;
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
      className={`${intrinsic ? "h-auto max-h-full w-auto max-w-full" : "h-auto w-full"} object-contain ${feather ? "feather" : ""} ${className}`}
    />
  );
}

/** Edge colours of a photograph's studio backdrop, top to bottom (from `npm run tones`). */
export function backdropTones(media: Pick<PublicMedia, "src">): string[] | undefined {
  return (TONES as Record<string, string[]>)[media.src];
}

/**
 * Extends a photograph's own studio backdrop to the edges of its frame with
 * the measured edge colours: flat colour, no blur, no glow. The photograph is
 * shown whole and unaltered on top, so the object keeps its full contour
 * without looking like a print pasted onto a mat. Without measured tones the
 * frame keeps the room's plain mat colour.
 */
export function ImageBackdrop({ media }: { media: Pick<PublicMedia, "src">; sizes?: string; vignette?: boolean }) {
  const t = backdropTones(media);
  if (!t || t.length === 0) return null;
  const stops = t.map((c, i) => `${c} ${Math.round((i / Math.max(1, t.length - 1)) * 100)}%`).join(", ");
  return <span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(to bottom, ${stops})` }} />;
}
