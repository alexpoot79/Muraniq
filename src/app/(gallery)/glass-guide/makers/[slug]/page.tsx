import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCreatorBySlug, getCreators } from "@/content/repository.server";
import { PageIntro } from "@/components/editorial/PageIntro";
import { ArtworkCard } from "@/components/editorial/ArtworkCard";
import { EditorialStatus } from "@/components/ui/EditorialStatus";
import { FixtureNotice } from "@/components/ui/FixtureNotice";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site";

export async function generateStaticParams() {
  return (await getCreators()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/glass-guide/makers/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCreatorBySlug(slug);
  if (!data) return { title: "Not found", robots: { index: false } };
  return pageMetadata({
    title: `${data.creator.name} — Biography & Works`,
    description: data.creator.summary,
    path: routes.maker(slug),
  });
}

export default async function MakerPage({ params }: PageProps<"/glass-guide/makers/[slug]">) {
  const { slug } = await params;
  const data = await getCreatorBySlug(slug);
  if (!data) notFound();
  const { creator: c, artworks, sources } = data;
  return (
    <>
      <PageIntro
        crumbs={[
          { label: "Glass Guide", href: routes.guide() },
          { label: "Makers", href: routes.makers() },
          { label: c.name, href: routes.maker(c.slug) },
        ]}
        kicker={c.roles.includes("artist") ? "Artist" : c.kind === "person" ? "Maker" : "Glasshouse"}
        title={c.name}
      >
        <p>{c.summary}</p>
        {c.lifeLabel && <p className="mt-3">{c.lifeLabel}</p>}
      </PageIntro>

      <section className="surface-paper" aria-labelledby="bio-title">
        <div className="container-gallery section-y grid gap-10 md:grid-cols-12">
          <h2 id="bio-title" className="display-lg md:col-span-4">
            Biography
          </h2>
          <div className="measure flex flex-col gap-5 md:col-span-8">
            {c.isFixture && <FixtureNotice tone="paper" />}
            <EditorialStatus status={c.biographyStatus} />
            {c.biography.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {c.biography.length === 0 && (
              <p>
                For questions about {c.name} or works by this maker, please{" "}
                <Link href={routes.contact()} className="link-quiet">
                  get in touch
                </Link>
                .
              </p>
            )}
            {sources.length > 0 && (
              <div>
                <h3 className="label text-ink-muted">Sources</h3>
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
                      {s.year ? ` (${s.year})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="works-title" className="container-gallery section-y">
        <p className="label eyebrow text-muted-dark">Works</p>
        <h2 id="works-title" className="display-lg mt-5">
          {artworks.some((a) => a.heldBy) ? "Works shown on MURANIQ" : "Works in the collection"}
        </h2>
        {artworks.length === 0 ? (
          <p className="mt-6 max-w-prose text-muted-dark">
            Works by {c.name} are being catalogued. They will appear here with their own dossier once their
            identification and photography have been reviewed.
          </p>
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
          "@type": c.kind === "person" ? "Person" : "Organization",
          name: c.name,
          url: absoluteUrl(routes.maker(c.slug)),
          description: c.summary,
          ...(c.aliases.length ? { alternateName: c.aliases } : {}),
        }}
      />
    </>
  );
}
