import type { Metadata } from "next";
import Image from "next/image";
import { PageIntro } from "@/components/editorial/PageIntro";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { HISTORY_INTRO, HISTORY_SECTIONS } from "@/content/history";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";

export const metadata: Metadata = pageMetadata({
  title: "History of Venetian and Murano glass",
  description: "The history of glassmaking in Venice and on Murano, from its origins to today.",
  path: routes.history(),
});

/**
 * A digital publication in the study room: one reading column of about 65
 * characters, a compact period index (sticky beside the text on wide screens,
 * a plain list of anchors on narrow ones), the sources of each period directly
 * under its text, and image credits in the captions. Fully readable without
 * motion or JavaScript.
 */
export default function HistoryPage() {
  const sections = HISTORY_SECTIONS.filter((s) => s.body.length > 0);
  return (
    <>
      <PageIntro
        crumbs={[
          { label: "Glass Guide", href: routes.guide() },
          { label: "History of Murano glass", href: routes.history() },
        ]}
        kicker="History of Murano glass"
        title="Venetian and Murano glass,"
        accent="through the centuries."
      >
        <p>{HISTORY_INTRO}</p>
      </PageIntro>

      <div className="container-gallery grid gap-12 pt-10 pb-24 lg:grid-cols-12 lg:gap-16 lg:pt-16">
        <nav aria-labelledby="periods-title" className="lg:col-span-3">
          <div className="lg:sticky lg:top-32">
            <h2 id="periods-title" className="label text-muted-dark">
              Periods
            </h2>
            <ol className="mt-4 border-t border-line-dark">
              {sections.map((s, i) => (
                <li key={s.id} className="border-b border-line-dark">
                  <a href={`#${s.id}`} className="group flex min-h-11 items-baseline gap-4 py-2.5 text-sm transition-colors hover:text-accent">
                    <span aria-hidden="true" className="numeral w-5 shrink-0 text-base text-muted-dark">
                      {i + 1}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-on-dark group-hover:text-accent">{s.title}</span>
                      <span className="text-caption text-muted-dark">{s.period}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="flex flex-col lg:col-span-9">
          {sections.map((s, i) => {
            const sourcesId = `sources-${s.id}`;
            return (
              <section
                key={s.id}
                id={s.id}
                aria-labelledby={`h-${s.id}`}
                className="grid scroll-mt-28 gap-8 border-t border-line-dark py-14 first:border-t-0 first:pt-0 lg:grid-cols-9 lg:gap-12 lg:py-20"
              >
                <header className="flex flex-col gap-5 lg:col-span-3">
                  <p className="flex items-baseline gap-3">
                    <span aria-hidden="true" className="numeral text-2xl text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="label text-muted-dark">{s.period}</span>
                  </p>
                  <h2 id={`h-${s.id}`} className="display-md">
                    {s.title}
                  </h2>
                  {s.image && (
                    <figure className="mt-2 flex max-w-[13rem] flex-col gap-2">
                      <div className="plate p-2">
                        <Image
                          src={s.image.src}
                          width={s.image.w}
                          height={s.image.h}
                          alt={s.image.alt}
                          sizes="13rem"
                          className="mx-auto h-auto max-h-52 w-auto max-w-full object-contain"
                        />
                      </div>
                      <figcaption className="text-caption leading-snug text-muted-dark">
                        {s.image.caption}. {s.image.credit}. Reference image, not in the MURANIQ collection.
                      </figcaption>
                    </figure>
                  )}
                </header>
                <div className="lg:col-span-6">
                  <div className="prose-study">
                    {s.body.map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                  </div>
                  {s.sources.length > 0 && (
                    <aside aria-labelledby={sourcesId} className="mt-10 max-w-[38rem] border-t border-line-dark pt-5">
                      <h3 id={sourcesId} className="label text-muted-dark">
                        Sources for this period
                      </h3>
                      <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm marker:text-muted-dark">
                        {s.sources.map((src) => (
                          <li key={src.url}>
                            <a href={src.url} className="link-quiet" rel="noopener">
                              {src.label}
                            </a>
                          </li>
                        ))}
                      </ol>
                    </aside>
                  )}
                  <p className="mt-8">
                    <a href="#periods-title" className="label inline-flex min-h-11 items-center text-muted-dark hover:text-on-dark">
                      Back to the periods
                    </a>
                  </p>
                </div>
              </section>
            );
          })}
          <div className="border-t border-line-dark pt-12">
            <p className="measure text-muted-dark">
              Each period lists the sources its text was checked against. Claims that could not be checked were left
              out.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-10 gap-y-3">
              <ArrowLink href={routes.techniques()}>Techniques</ArrowLink>
              <ArrowLink href={routes.directory()}>Makers &amp; Workshops</ArrowLink>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
