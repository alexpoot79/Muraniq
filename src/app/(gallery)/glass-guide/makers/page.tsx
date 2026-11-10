import Link from "next/link";
import type { Metadata } from "next";
import { getArtworks, getCreators } from "@/content/repository.server";
import { PageIntro } from "@/components/editorial/PageIntro";
import { ArtworkImage } from "@/components/editorial/ArtworkImage";
import { FixtureNotice } from "@/components/ui/FixtureNotice";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { ROLE_LABEL } from "@/features/artworks/attribution";

export const metadata: Metadata = pageMetadata({
  title: "Makers",
  description: "Makers, glasshouses and artists represented on MURANIQ.",
  path: routes.makers(),
});

const STATUS: Record<string, string> = {
  reviewed: "Biography reviewed",
  migrated_unreviewed: "Biography being checked against sources",
  pending_migration: "Biography in preparation",
  reference_only: "Reference profile",
};

export default async function MakersPage() {
  const [creators, artworks] = await Promise.all([getCreators(), getArtworks()]);
  return (
    <>
      <PageIntro
        crumbs={[
          { label: "Glass Guide", href: routes.guide() },
          { label: "Makers", href: routes.makers() },
        ]}
        kicker="Glass Guide"
        title="Makers"
        accent="and workshops."
      >
        <p>Each profile states what is documented, and what is not.</p>
      </PageIntro>
      <div className="container-gallery pb-28">
        <ul>
          {creators.map((c) => {
            const first = artworks.find((a) => c.artworkIds.includes(a.id));
            return (
              <li key={c.id} className="group reveal relative grid gap-6 border-b border-line-dark py-12 md:grid-cols-12 md:items-center lg:py-14">
                <div className="md:col-span-6">
                  <p className="label text-[0.6875rem] text-muted-dark">
                    {c.roles.map((r) => ROLE_LABEL[r]).join(" · ")}
                    {c.lifeLabel && <span className="numeral ml-4 text-base tracking-normal normal-case">{c.lifeLabel}</span>}
                  </p>
                  <h2 className="display-lg mt-3 transition-transform duration-700 ease-[var(--ease-silk)] lg:group-hover:translate-x-3">
                    <Link href={routes.maker(c.slug)} className="after:absolute after:inset-0">
                      {c.name}
                    </Link>
                  </h2>
                </div>
                <div className="flex flex-col gap-3 md:col-span-4 md:col-start-8">
                  <p className="text-muted-dark">{c.summary}</p>
                  <p className="label text-[0.6875rem] text-on-dark">
                    {c.artworkIds.length > 0
                      ? `${c.artworkIds.length} ${c.artworkIds.length === 1 ? "work" : "works"}`
                      : "Works being catalogued"}
                    <span className="text-muted-dark"> · {STATUS[c.biographyStatus]}</span>
                  </p>
                  {c.isFixture && <FixtureNotice compact />}
                </div>
                {first && (
                  <div aria-hidden="true" className="plate relative hidden aspect-square w-24 overflow-hidden md:col-span-1 md:col-start-12 md:block">
                    <div className="absolute inset-1.5">
                      <ArtworkImage media={first.hero} sizes="96px" fill />
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
