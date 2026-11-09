import Image from "next/image";
import type { EditorialImage } from "@/content/editorial-images";

/** A historic view used as atmosphere: full image, caption and museum credit always shown. */
export function EditorialFigure({
  image,
  sizes,
  className = "",
  imgClassName = "",
  tone = "dark",
}: {
  image: EditorialImage;
  sizes: string;
  className?: string;
  imgClassName?: string;
  tone?: "dark" | "paper";
}) {
  return (
    <figure className={className}>
      <div className="overflow-hidden">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={sizes}
          loading="lazy"
          className={`h-auto w-full ${imgClassName}`}
        />
      </div>
      <figcaption className={`mt-4 flex flex-col gap-1 text-sm sm:flex-row sm:justify-between sm:gap-6 ${tone === "dark" ? "text-muted-dark" : "text-ink-muted"}`}>
        <span>{image.caption}</span>
        <a href={image.href} className="link-quiet shrink-0" rel="noopener">
          {image.credit}
        </a>
      </figcaption>
    </figure>
  );
}
