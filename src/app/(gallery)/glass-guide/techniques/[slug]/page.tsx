import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTechniqueBySlug, getTechniques } from "@/content/repository.server";
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
  const { technique: t, artworks, sources, makers } = data;
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
            {t.sections.map((section, i) => (
              <section key={section.heading} aria-labelledby={`t-section-${i}`} className="mt-6 flex flex-col gap-5">
                <h3 id={`t-section-${i}`} className="display-sm">
                  {section.heading}
                </h3>
                {section.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </section>
            ))}
          </div>
          {(t.recognition.length > 0 || makers.length > 0 || sources.length > 0) && (
            <aside className="md:col-span-4 md:col-start-9" aria-label={`About ${t.term}: recognition, makers and sources`}>
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
              {makers.length > 0 && (
                <>
                  <h2 className="label mt-8 text-ink-muted">Makers on MURANIQ</h2>
                  <ul className="mt-3 flex flex-col border-t border-line-paper">
                    {makers.map((m) => (
                      <li key={m.slug} className="flex items-baseline justify-between gap-4 border-b border-line-paper py-3">
                        <Link href={routes.maker(m.slug)} className="link-quiet">
                          {m.name}
                        </Link>
                        {m.lifeLabel && <span className="numeral text-sm text-ink-muted">{m.lifeLabel}</span>}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {sources.length > 0 && (
                <>
                  <h2 className="label mt-8 text-ink-muted">Sources</h2>
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
          ...(makers.length
            ? { mentions: makers.map((m) => ({ "@type": m.kind === "person" ? "Person" : "Organization", name: m.name, url: absoluteUrl(routes.maker(m.slug)) })) }
            : {}),
        }}
      />
    </>
  );
}
