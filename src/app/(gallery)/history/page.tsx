import type { Metadata } from "next";
import Image from "next/image";
import { PageIntro } from "@/components/editorial/PageIntro";
import { HISTORY_INTRO, HISTORY_SECTIONS } from "@/content/history";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";

export const metadata: Metadata = pageMetadata({
  title: "History of Venetian and Murano glass",
  description: "The history of glassmaking in Venice and on Murano, from its origins to today.",
  path: routes.history(),
});

export default function HistoryPage() {
  const sections = HISTORY_SECTIONS.filter((s) => s.body.length > 0);
  return (
    <>
      <PageIntro crumbs={[{ label: "History", href: routes.history() }]} kicker="History" title="Venetian and Murano glass," accent="through the centuries.">
        <p>{HISTORY_INTRO}</p>
      </PageIntro>
      {sections.map((s) => (
        <section key={s.id} id={s.id} aria-labelledby={`h-${s.id}`} className="section-y">
          <div className="container-gallery grid gap-10 lg:grid-cols-12">
            <div className="flex flex-col gap-6 lg:col-span-3">
              <p className="label text-muted-dark">{s.period}</p>
              {s.image && (
                <figure className="flex max-w-[14rem] flex-col gap-2">
                  <Image src={s.image.src} width={s.image.w} height={s.image.h} alt={s.image.alt} sizes="14rem" className="h-auto max-h-56 w-auto max-w-full object-contain" />
                  <figcaption className="text-xs leading-snug text-muted-dark">
                    {s.image.caption}. {s.image.credit}. Reference image, not in the MURANIQ collection.
                  </figcaption>
                </figure>
              )}
            </div>
            <div className="flex flex-col gap-6 lg:col-span-8">
              <h2 id={`h-${s.id}`} className="font-display text-3xl">{s.title}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="text-muted-dark">{p}</p>
              ))}
              {s.sources.length > 0 && (
                <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-dark">
                  {s.sources.map((src) => (
                    <li key={src.url}><a href={src.url} className="link-quiet" rel="noopener">{src.label}</a></li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
