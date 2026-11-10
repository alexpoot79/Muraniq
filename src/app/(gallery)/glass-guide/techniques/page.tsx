import Link from "next/link";
import type { Metadata } from "next";
import { getArtworks, getTechniques } from "@/content/repository.server";
import { PageIntro } from "@/components/editorial/PageIntro";
import { ArtworkImage, ImageBackdrop } from "@/components/editorial/ArtworkImage";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";

export const metadata: Metadata = pageMetadata({
  title: "Glassmaking Techniques",
  description: "Murano glassmaking techniques explained, with examples you can study closely.",
  path: routes.techniques(),
});

export default async function TechniquesPage() {
  const [techniques, artworks] = await Promise.all([getTechniques(), getArtworks()]);
  // Techniques with examples first, then the rest.
  const ordered = [...techniques].sort((a, b) => Number(b.artworkIds.length > 0) - Number(a.artworkIds.length > 0));
  return (
    <>
      <PageIntro
        crumbs={[
          { label: "Glass Guide", href: routes.guide() },
          { label: "Techniques", href: routes.techniques() },
        ]}
        kicker="Glass Guide"
        title="Techniques"
        accent="of the furnace."
      >
        <p>How the glass was made, how to recognise it, and where to see it.</p>
      </PageIntro>
      <div className="container-gallery pb-28">
        <ul className="grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((t) => {
            const example = artworks.find((a) => t.artworkIds.includes(a.id));
            return (
              <li key={t.id} className="group reveal relative flex flex-col">
                {example ? (
                  <div className="plate relative aspect-[4/5] overflow-hidden">
                    <ImageBackdrop media={example.hero} sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 100vw" />
                    <div className="absolute inset-6">
                      <ArtworkImage
                        media={example.hero}
                        sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 100vw"
                        fill
                        className="transition-transform duration-[1400ms] ease-[var(--ease-silk)] motion-safe:group-hover:scale-[1.04]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="plate relative flex aspect-[4/5] items-center justify-center">
                    <span aria-hidden="true" className="font-display text-[7rem] leading-none font-light text-on-dark/15">
                      {t.term[0]}
                    </span>
                  </div>
                )}
                <p className="label mt-6 text-[0.6875rem] text-muted-dark">
                  {t.artworkIds.length > 0 ? `${t.artworkIds.length} ${t.artworkIds.length === 1 ? "example" : "examples"}` : "No examples published yet"}
                </p>
                <h2 className="display-md mt-2 transition-colors duration-300 group-hover:text-accent">
                  <Link href={routes.technique(t.slug)} className="after:absolute after:inset-0">
                    {t.term}
                  </Link>
                </h2>
                {t.synonyms.length > 0 && <p className="mt-1 text-sm italic text-muted-dark">{t.synonyms.join(", ")}</p>}
                <p className="mt-3 text-sm text-muted-dark">{t.summary}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
