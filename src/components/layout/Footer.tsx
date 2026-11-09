import Link from "next/link";
import { CATEGORIES } from "@/content/categories";
import { routes } from "@/lib/routes";
import { SITE } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-line-dark bg-raised">
      <div className="container-gallery grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-6 max-w-sm text-muted-dark">
            A private collection of Murano glass, studio glass, fine art and collectible objects, with independent
            research into how each piece was made and by whom.
          </p>
          <p className="mt-6">
            <a href={`mailto:${SITE.email}`} className="link-quiet text-on-dark">
              {SITE.email}
            </a>
          </p>
        </div>
        <nav aria-label="Collection" className="md:col-span-3">
          <h2 className="label text-accent">Collection</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={routes.category(c.slug)} className="link-quiet text-muted-dark hover:text-on-dark">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Information" className="md:col-span-4">
          <h2 className="label text-accent">Information</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {[
              { label: "Glass Guide", href: routes.guide() },
              { label: "Attribution & method", href: routes.attribution() },
              { label: "About MURANIQ", href: routes.about() },
              { label: "Contact", href: routes.contact() },
              { label: "Privacy", href: routes.privacy() },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-quiet text-muted-dark hover:text-on-dark">
                  {l.label}
                </Link>
              </li>
            ))}
            {SITE.social.map((s) => (
              <li key={s.href}>
                <a href={s.href} className="link-quiet text-muted-dark hover:text-on-dark" rel="me noopener">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="container-gallery flex flex-col gap-2 border-t border-line-dark py-6 text-sm text-muted-dark sm:flex-row sm:justify-between">
        <p>© {SITE.name}. Images may not be reproduced without permission.</p>
        <p>Attributions state their level of certainty.</p>
      </div>
    </footer>
  );
}
