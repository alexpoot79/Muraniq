import Link from "next/link";
import type { Metadata } from "next";
import { getCreators } from "@/content/repository.server";
import { PageIntro } from "@/components/editorial/PageIntro";
import { FixtureNotice } from "@/components/ui/FixtureNotice";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";

export const metadata: Metadata = pageMetadata({
  title: "Makers",
  description: "Makers and workshops represented in the MURANIQ collection.",
  path: routes.makers(),
});

export default async function MakersPage() {
  const creators = await getCreators();
  return (
    <>
      <PageIntro
        crumbs={[
          { label: "Glass Guide", href: routes.guide() },
          { label: "Makers", href: routes.makers() },
        ]}
        kicker="Glass Guide"
        title="Makers"
      >
        <p>Makers and workshops in the collection. Each profile states what is documented and what is not.</p>
      </PageIntro>
      <div className="container-gallery pb-24">
        <ul className="divide-y divide-line-dark">
          {creators.map((c) => (
            <li key={c.id} className="relative grid gap-3 py-10 md:grid-cols-12">
              <h2 className="display-md md:col-span-5">
                <Link href={routes.maker(c.slug)} className="after:absolute after:inset-0 hover:text-accent">
                  {c.name}
                </Link>
              </h2>
              <div className="flex flex-col gap-3 md:col-span-6 md:col-start-7">
                <p className="text-muted-dark">{c.summary}</p>
                <p className="label text-on-dark">
                  {c.artworkIds.length > 0
                    ? `${c.artworkIds.length} ${c.artworkIds.length === 1 ? "work" : "works"} in the collection`
                    : "Works being catalogued"}
                </p>
                {c.isFixture && <FixtureNotice compact />}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
