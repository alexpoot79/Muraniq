import Link from "next/link";

/**
 * The approved MURANIQ logo (public/brand/). The wordmark is traced 1:1 from the supplied artwork; the gold
 * M (19 Nov 2026) is drawn from the owner's new artwork by scripts/brand/ (build-logo.mjs). Never redrawn or
 * recoloured by hand: change the geometry there and rebuild.
 */
const ASSETS = {
  lockup: { dark: "/brand/muraniq-lockup-on-dark.svg", light: "/brand/muraniq-lockup-on-light.svg", ratio: 870 / 484 },
  wordmark: { dark: "/brand/muraniq-wordmark-ivory.svg", light: "/brand/muraniq-wordmark-ink.svg", ratio: 870 / 119 },
  monogram: { dark: "/brand/muraniq-monogram-gold.svg", light: "/brand/muraniq-monogram-antique.svg", ratio: 724 / 442 },
} as const;

export function LogoImage({
  variant = "lockup",
  tone = "dark",
  height,
  className = "",
}: {
  variant?: keyof typeof ASSETS;
  /** "dark" = for dark backgrounds (gold + ivory), "light" = for beige/ivory backgrounds (antique gold + ink). */
  tone?: "dark" | "light";
  height: number;
  className?: string;
}) {
  const a = ASSETS[variant];
  return (
    // eslint-disable-next-line @next/next/no-img-element -- vector logo, no optimisation needed
    <img
      src={a[tone]}
      alt=""
      width={Math.round(height * a.ratio)}
      height={height}
      className={`block select-none ${className || "h-auto max-w-full"}`}
      draggable={false}
    />
  );
}

/** Home link with the logo lockup. Accessible name: "MURANIQ — Home". */
export function Logo({
  height = 60,
  className = "",
  imgClassName = "",
}: {
  height?: number;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <Link href="/" aria-label="MURANIQ — Home" className={`inline-flex items-center py-2 ${className}`}>
      <LogoImage variant="lockup" height={height} className={imgClassName} />
    </Link>
  );
}
