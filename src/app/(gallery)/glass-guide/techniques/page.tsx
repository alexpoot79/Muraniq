import Link from "next/link";
import type { Metadata } from "next";
import { getTechniques } from "@/content/repository.server";
import { PageIntro } from "@/components/editorial/PageIntro";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";

export const metadata: Metadata = pageMetadata({
  title: "Glassmaking Techniques",
  description: "Murano glassmaking techniques explained, with examples from the collection.",
  path: routes.techniques(),
});

export default async function TechniquesPage() {
  const techniques = await getTechniques();
  return (
    <>
      <PageIntro
        crumbs={[
          { label: "Glass Guide", href: routes.guide() },
          { label: "Techniques", href: routes.techniques() },
        ]}
        kicker="Glass Guide"
        title="Techniques"
      >
        <p>How the glass was made, how to recognise it, and where to see it in the collection.</p>
      </PageIntro>
      <div className="container-gallery pb-24">
        <ul className="grid gap-px bg-line-dark sm:grid-cols-2">
          {techniques.map((t) => (
            <li key={t.id} className="relative bg-stage py-10 sm:px-8 sm:odd:pl-0">
              <h2 className="display-md">
                <Link href={routes.technique(t.slug)} className="after:absolute after:inset-0 hover:text-accent">
                  {t.term}
                </Link>
              </h2>
              {t.synonyms.length > 0 && <p className="label mt-2 text-muted-dark">Also: {t.synonyms.join(", ")}</p>}
              <p className="mt-4 text-muted-dark">{t.summary}</p>
              <p className="label mt-5 text-on-dark">
                {t.artworkIds.length > 0 ? `${t.artworkIds.length} in the collection` : "No examples published yet"}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
