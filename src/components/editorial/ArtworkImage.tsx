import Image from "next/image";
import type { PublicMedia } from "@/content/public-projection";

/**
 * Object photography: always uncropped (object-contain), known dimensions to
 * prevent layout shift. Local SVG placeholders bypass optimisation; CMS images
 * will use the Sanity image pipeline via a loader (one optimisation layer).
 */
export function ArtworkImage({
  media,
  sizes,
  priority = false,
  className = "",
}: {
  media: PublicMedia;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={media.src}
      alt={media.alt}
      width={media.width}
      height={media.height}
      sizes={sizes}
      // Next 16 deprecates `priority`; the LCP image is loaded eagerly at high fetch priority instead.
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      unoptimized={media.src.endsWith(".svg")}
      className={`h-auto w-full object-contain ${className}`}
    />
  );
}
