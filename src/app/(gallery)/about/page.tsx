import Link from "next/link";
import type { Metadata } from "next";
import { PageIntro } from "@/components/editorial/PageIntro";
import { EditorialFigure } from "@/components/editorial/EditorialFigure";
import { LogoImage } from "@/components/layout/Logo";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { EDITORIAL_IMAGES } from "@/content/editorial-images";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: "About MURANIQ: a private collection with independent research into glass, art and collectible objects.",
  path: routes.about(),
});

const PRINCIPLES = [
  {
    t: "The object first",
    d: "Every work is photographed from several sides, front, reverse, base and marks, and shown uncropped before anything is said about it.",
  },
  {
    t: "Evidence, named",
    d: "Makers, dates and techniques are linked to the sources they rest on: catalogues, archives, museum records and dated examination notes.",
  },
  {
    t: "Certainty, stated",
    d: "Each attribution carries a visible level of certainty, from verified to hypothesis. Where the record is silent, we say so.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageIntro crumbs={[{ label: "About", href: routes.about() }]} kicker="About" title="A private collection," accent="studied closely.">
        <p>Murano glass, other glass and collectible objects, presented as a research archive.</p>
      </PageIntro>

      <section aria-labelledby="about-statement" className="section-y">
        <div className="container-gallery grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <LogoImage variant="monogram" height={56} className="reveal h-14 w-auto" />
          </div>
          <div className="flex flex-col gap-8 lg:col-span-8">
            <h2 id="about-statement" className="reveal statement">
              MURANIQ is a private collection of Murano glass, other glass and collectible objects, shown with
              the same care a museum gives <span className="serif-italic text-accent">to its records.</span>
            </h2>
            <div className="reveal grid gap-6 text-muted-dark md:grid-cols-2">
              <p>
                The collection is presented as a research archive: every work is described as it is, and linked to the
                makers, techniques and sources that explain it. Where knowledge is incomplete, we say so.
              </p>
              <p>
                Selected works may occasionally be available for acquisition. Their status is shown on each dossier, and
                enquiries about any piece are welcome.
              </p>
            </div>
            {/* Editorial: replace with the reviewed background text supplied by MURANIQ. */}
          </div>
        </div>
      </section>

      <div className="container-gallery">
        <EditorialFigure image={EDITORIAL_IMAGES.ponti} sizes="(min-width: 96rem) 86rem, 92vw" className="reveal" />
      </div>

      <section aria-labelledby="principles-title" className="surface-paper section-y mt-24 lg:mt-36">
        <div className="container-gallery">
          <p className="reveal label eyebrow text-ink-muted">Principles</p>
          <h2 id="principles-title" className="reveal display-lg mt-6 max-w-3xl">
            Three rules for <span className="serif-italic">every dossier.</span>
          </h2>
          <ol className="mt-16 grid gap-px bg-line-paper md:grid-cols-3">
            {PRINCIPLES.map((p, i) => (
              <li key={p.t} className="reveal bg-paper py-10 md:px-10 md:first:pl-0">
                <p className="numeral text-3xl text-accent-ink">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="display-sm mt-5">{p.t}</h3>
                <p className="mt-3 text-ink-muted">{p.d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href={routes.contact()} className="btn btn-ink">
              Contact MURANIQ
            </Link>
            <ArrowLink href={routes.attribution()}>How we attribute</ArrowLink>
          </div>
        </div>
      </section>
    </>
  );
}
