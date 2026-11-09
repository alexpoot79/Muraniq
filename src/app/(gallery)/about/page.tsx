import Link from "next/link";
import type { Metadata } from "next";
import { PageIntro } from "@/components/editorial/PageIntro";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: "About MURANIQ: a private collection with independent research into glass, art and collectible objects.",
  path: routes.about(),
});

export default function AboutPage() {
  return (
    <>
      <PageIntro crumbs={[{ label: "About", href: routes.about() }]} kicker="About" title="About MURANIQ">
        <p>A private collection with independent research.</p>
      </PageIntro>
      <div className="surface-paper">
        <div className="container-gallery grid gap-12 py-16 md:grid-cols-12 lg:py-24">
          <div className="measure flex flex-col gap-5 md:col-span-7">
            <p className="lede">
              MURANIQ is a private collection of Murano glass, studio glass, fine art and collectible objects.
            </p>
            <p>
              The collection is presented as a research archive: every work is photographed from several sides,
              described as it is, and linked to the makers, techniques and sources that explain it. Where knowledge
              is incomplete, we say so.
            </p>
            <p>
              Selected works may occasionally be available for acquisition. Their status is shown on each dossier.
            </p>
            {/* Editorial: replace with the reviewed background text supplied by MURANIQ. */}
          </div>
          <aside className="flex flex-col gap-4 md:col-span-4 md:col-start-9">
            <h2 className="label text-ink-muted">Contact</h2>
            <p>Questions about a work, a maker or the collection are welcome.</p>
            <p>
              <Link href={routes.contact()} className="btn btn-ink">
                Contact MURANIQ
              </Link>
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
