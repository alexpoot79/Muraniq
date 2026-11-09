import Link from "next/link";
import { CATEGORIES } from "@/content/categories";
import { routes } from "@/lib/routes";
import { SITE } from "@/lib/site";
import { LogoImage } from "./Logo";

const INFO = [
  { label: "Exhibition", href: routes.exhibition() },
  { label: "Glass Guide", href: routes.guide() },
  { label: "Makers", href: routes.makers() },
  { label: "Techniques", href: routes.techniques() },
  { label: "Attribution & method", href: routes.attribution() },
];

const HOUSE = [
  { label: "About MURANIQ", href: routes.about() },
  { label: "Contact", href: routes.contact() },
  { label: "Privacy", href: routes.privacy() },
];

export function Footer() {
  return (
    <footer className="border-t border-line-dark bg-raised">
      <div className="container-gallery pt-20 pb-10 lg:pt-28">
        <div className="flex flex-col items-center text-center">
          <Link href="/" aria-label="MURANIQ — Home" className="inline-block">
            <LogoImage variant="lockup" height={96} className="h-20 w-auto lg:h-24" />
          </Link>
          <p className="mt-8 max-w-md text-sm text-muted-dark">
            A private collection of Murano glass, studio glass, fine art and collectible objects, with independent
            research into how each piece was made and by whom.
          </p>
          <div className="hairline-gold mt-14 w-full max-w-3xl" />
        </div>

        <div className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <nav aria-label="Collection">
            <h2 className="label text-accent">Collection</h2>
            <ul className="mt-5 flex flex-col gap-1">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link href={routes.category(c.slug)} className="inline-flex min-h-9 items-center text-muted-dark transition-colors hover:text-on-dark">
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Research">
            <h2 className="label text-accent">Research</h2>
            <ul className="mt-5 flex flex-col gap-1">
              {INFO.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-9 items-center text-muted-dark transition-colors hover:text-on-dark">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="MURANIQ">
            <h2 className="label text-accent">MURANIQ</h2>
            <ul className="mt-5 flex flex-col gap-1">
              {HOUSE.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-9 items-center text-muted-dark transition-colors hover:text-on-dark">
                    {l.label}
                  </Link>
                </li>
              ))}
              {SITE.social.map((s) => (
                <li key={s.href}>
                  <a href={s.href} className="inline-flex min-h-9 items-center text-muted-dark hover:text-on-dark" rel="me noopener">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="label text-accent">Enquiries</h2>
            <p className="mt-5 text-muted-dark">Questions about a work, a maker or a mark are welcome.</p>
            <p className="mt-4">
              <a href={`mailto:${SITE.email}`} className="link-quiet font-display text-2xl text-on-dark">
                {SITE.email}
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="container-gallery flex flex-col gap-3 border-t border-line-dark py-7 text-xs tracking-wide text-muted-dark sm:flex-row sm:justify-between">
        <p>© {SITE.name}. Collection photography may not be reproduced without permission.</p>
        <p>
          Reference images: open-access (CC0) photography from the museums credited on each page.
        </p>
      </div>
    </footer>
  );
}
