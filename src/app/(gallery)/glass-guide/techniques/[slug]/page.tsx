import type { Metadata } from "next";
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
  const { technique: t, artworks, sources } = data;
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
        <div className="container-gallery grid gap-10 py-16 md:grid-cols-12 lg:py-24">
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
          {t.recognition.length > 0 && (
            <aside className="md:col-span-4 md:col-start-9" aria-labelledby="recognise">
              <h2 id="recognise" className="label text-ink-muted">
                How to recognise it
              </h2>
              <ul className="mt-4 flex flex-col gap-3 border-t border-line-paper pt-4">
                {t.recognition.map((r, i) => (
                  <li key={i} className="border-b border-line-paper pb-3">
                    {r}
                  </li>
                ))}
              </ul>
              {sources.length > 0 && (
                <>
                  <h2 className="label mt-8 text-ink-muted">Sources</h2>
                  <ul className="mt-2 list-disc pl-5">
                    {sources.map((s) => (
                      <li key={s.id}>
                        <cite>{s.title}</cite>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </aside>
          )}
        </div>
      </article>

      <section aria-labelledby="examples" className="container-gallery py-16 lg:py-24">
        <h2 id="examples" className="display-md">
          Examples in the collection
        </h2>
        {artworks.length === 0 ? (
          <p className="mt-6 text-muted-dark">No published examples yet.</p>
        ) : (
          <ul className="mt-10 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
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
