import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTechniqueBySlug, getTechniques } from "@/content/repository.server";
import { categoryBySlug } from "@/content/categories";
import { periodsMentioning } from "@/content/history";
import { PageIntro } from "@/components/editorial/PageIntro";
import { ArtworkCard } from "@/components/editorial/ArtworkCard";
import { EditorialStatus } from "@/components/ui/EditorialStatus";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { SITE, absoluteUrl } from "@/lib/site";

export async function generateStaticParams() {
  return (await getTechniques()).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/glass-guide/techniques/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTechniqueBySlug(slug);
  if (!data) return { title: "Not found", robots: { index: false } };
  return pageMetadata({
    title: `${data.technique.term} — Glass Technique`,
    description: data.technique.summary,
    path: routes.technique(slug),
  });
}

export default async function TechniquePage({ params }: PageProps<"/glass-guide/techniques/[slug]">) {
  const { slug } = await params;
  const data = await getTechniqueBySlug(slug);
  if (!data) notFound();
  const { technique: t, artworks, sources, makers, areas, total } = data;
  const periods = periodsMentioning(t.slug, t.term);
  return (
    <>
      <PageIntro
        crumbs={[
          { label: "Glass Guide", href: routes.guide() },
          { label: "Techniques", href: routes.techniques() },
          { label: t.term, href: routes.technique(t.slug) },
        ]}
        kicker="Technique"
        title={t.term}
      >
        <p>{t.summary}</p>
      </PageIntro>

      <article className="surface-paper" aria-labelledby="t-body">
        <div className="container-gallery section-y grid gap-14 md:grid-cols-12">
          <div className="measure flex flex-col gap-5 md:col-span-7">
            <h2 id="t-body" className="sr-only">
              About {t.term}
            </h2>
            <EditorialStatus status={t.editorialStatus} />
            {t.body.map((p, i) => (
              <p key={i} className={i === 0 ? "lede" : ""}>
                {p}
              </p>
            ))}
          </div>
          {(t.recognition.length > 0 || sources.length > 0) && (
            <aside className="md:col-span-4 md:col-start-9" aria-label={`Recognising ${t.term}, and sources`}>
              {t.recognition.length > 0 && (
                <>
                  <h2 id="recognise" className="label text-ink-muted">
                    How to recognise it
                  </h2>
                  <ol className="mt-5 flex flex-col border-t border-line-paper">
                    {t.recognition.map((r, i) => (
                      <li key={i} className="flex gap-4 border-b border-line-paper py-4">
                        <span className="numeral text-lg text-accent-ink">{i + 1}</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ol>
                </>
              )}
              {sources.length > 0 && (
                <>
                  <h2 id="sources" className="label mt-8 scroll-mt-28 text-ink-muted first:mt-0">
                    Sources
                  </h2>
                  <ul className="mt-2 list-disc pl-5">
                    {sources.map((s) => (
                      <li key={s.id}>
                        {s.url ? (
                          <a href={s.url} className="link-quiet" rel="noopener">
                            <cite>{s.title}</cite>
                          </a>
                        ) : (
                          <cite>{s.title}</cite>
                        )}
                        {s.publisher ? `, ${s.publisher}` : ""}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </aside>
          )}
        </div>
      </article>

      <nav aria-labelledby="connections" className="container-gallery pt-16 lg:pt-20">
        <h2 id="connections" className="label eyebrow text-muted-dark">
          {t.term} across the archive
        </h2>
        <div className="mt-6 grid border-t border-line-dark sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3 border-b border-line-dark py-6 sm:pr-8 lg:border-r">
            <h3 className="label text-muted-dark">In the history</h3>
            {periods.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {periods.map((p) => (
                  <li key={p.id}>
                    <Link href={`${routes.history()}#${p.id}`} className="link-quiet">
                      {p.title}
                    </Link>{" "}
                    <span className="text-caption text-muted-dark">{p.period}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-dark">Not yet discussed in the history texts.</p>
            )}
          </div>
          <div className="flex flex-col gap-3 border-b border-line-dark py-6 sm:pl-8 lg:border-r lg:px-8">
            <h3 className="label text-muted-dark">Examples</h3>
            {areas.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {areas.map((a) => (
                  <li key={a.category}>
                    <Link href={`${routes.category(a.category)}?technique=${t.slug}`} className="link-quiet">
                      {categoryBySlug(a.category)?.title ?? a.category}
                    </Link>{" "}
                    <span className="text-caption text-muted-dark">
                      {a.works} {a.works === 1 ? "work" : "works"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-dark">No published examples yet.</p>
            )}
          </div>
          <div className="flex flex-col gap-3 border-b border-line-dark py-6 sm:pr-8 lg:border-r lg:px-8">
            <h3 className="label text-muted-dark">Makers</h3>
            {makers.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {makers.map((m) => (
                  <li key={m.slug}>
                    <Link href={routes.maker(m.slug)} className="link-quiet">
                      {m.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-dark">
                {total > 0 ? "The makers of the published examples are not recorded." : "No makers recorded yet."}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3 border-b border-line-dark py-6 sm:pl-8 lg:pl-8">
            <h3 className="label text-muted-dark">Sources</h3>
            <p className="text-sm">
              {sources.length > 0 ? (
                <a href="#sources" className="link-quiet">
                  {sources.length} {sources.length === 1 ? "source" : "sources"} for this text
                </a>
              ) : (
                <span className="text-muted-dark">No sources listed yet.</span>
              )}
            </p>
            <Link href={routes.directory()} className="link-quiet text-sm">
              Makers &amp; Workshops directory
            </Link>
          </div>
        </div>
      </nav>

      <section aria-labelledby="examples" className="container-gallery section-y">
        <p className="label eyebrow text-muted-dark">Study</p>
        <h2 id="examples" className="display-lg mt-5">
          Examples <span className="serif-italic">to look at closely</span>
        </h2>
        {artworks.length === 0 ? (
          <p className="mt-6 text-muted-dark">No published examples yet.</p>
        ) : (
          <ul className="mt-14 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {artworks.map((a) => (
              <li key={a.id}>
                <ArtworkCard artwork={a} />
              </li>
            ))}
          </ul>
        )}
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: `${t.term} — Glass Technique`,
          url: absoluteUrl(routes.technique(t.slug)),
          publisher: { "@type": "Organization", name: SITE.name },
        }}
      />
    </>
  );
}
