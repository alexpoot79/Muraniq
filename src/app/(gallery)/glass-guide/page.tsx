import Link from "next/link";
import type { Metadata } from "next";
import { getArtworks, getCreators, getTechniqueBySlug, getTechniques } from "@/content/repository.server";
import { periodsMentioning } from "@/content/history";
import { PageIntro } from "@/components/editorial/PageIntro";
import { ArtworkImage, ImageBackdrop } from "@/components/editorial/ArtworkImage";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { directoryStats } from "@/content/makers-directory";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";

export const metadata: Metadata = pageMetadata({
  title: "Glass Guide",
  description: "An introduction to Murano makers, glassmaking techniques, marks and how MURANIQ attributes works.",
  path: routes.guide(),
});

/**
 * Study-room index of the Glass Guide. One lead entry (the history), a compact
 * index of the other sections, and one worked thread that shows how the
 * archive connects: technique → history → example → maker → source. The
 * thread is built from published data only; it is left out if no technique
 * has all five links.
 */
async function findThread(techniques: Awaited<ReturnType<typeof getTechniques>>) {
  for (const t of techniques) {
    const periods = periodsMentioning(t.slug, t.term);
    if (periods.length === 0) continue;
    const data = await getTechniqueBySlug(t.slug);
    if (!data || data.sources.length === 0) continue;
    const example = data.artworks.find((a) => a.makerSlugs.some((m) => data.makers.some((x) => x.slug === m)));
    const maker = example && data.makers.find((m) => example.makerSlugs.includes(m.slug));
    const source = data.sources.find((s) => s.url);
    if (!example || !maker || !source?.url) continue;
    return { technique: t, period: periods[0]!, example, maker, source: { title: source.title, url: source.url, publisher: source.publisher } };
  }
  return null;
}

export default async function GuidePage() {
  const [creators, techniques, artworks] = await Promise.all([getCreators(), getTechniques(), getArtworks()]);
  const art = (slug: string) => artworks.find((a) => a.slug === slug);
  const thread = await findThread(techniques);
  const lead = {
    title: "History of Murano glass",
    href: routes.history(),
    text: "How glassmaking grew in Venice and on the island of Murano, period by period, from its origins to today. Seven texts, each with the sources it was checked against.",
    image: art("enamelled-ewer-venice"),
  };
  const entries = [
    {
      title: "Techniques",
      href: routes.techniques(),
      text: "How the glass was made, from calcedonia and lattimo to millefiori and aventurine, and how to recognise each in a real object.",
      meta: `${techniques.length} ${techniques.length === 1 ? "technique" : "techniques"}`,
      image: art("chalcedony-and-aventurine-beaker"),
    },
    {
      title: "Makers & Workshops",
      href: routes.directory(),
      text: "Glasshouses, masters, designers and families of Murano and Venice: who worked where, and for whom, with every source and its status.",
      meta: `${directoryStats().published} names`,
      image: art("millefiori-paperweight-bigaglia"),
    },
    {
      title: "Makers in the collection",
      href: routes.makers(),
      text: "The makers, glasshouses and artists behind the works shown on MURANIQ, with what is documented about each and what is not.",
      meta: `${creators.length} ${creators.length === 1 ? "profile" : "profiles"}`,
      image: art("chalcedony-bottle-miotti"),
    },
    {
      title: "Signatures & labels",
      href: "/glass-guide/signatures-and-labels/",
      text: "Marks recorded exactly as written, with any interpretation kept apart. A reference in preparation.",
      meta: "In preparation",
      image: art("roman-millefiori-bowl"),
    },
    {
      title: "Attribution & method",
      href: routes.attribution(),
      text: "How MURANIQ separates observation from interpretation, and what each level of certainty means.",
      meta: "Method",
      image: null,
    },
  ];
  return (
    <>
      <PageIntro crumbs={[{ label: "Glass Guide", href: routes.guide() }]} kicker="Research archive" title="Glass Guide," accent="a reference.">
        <p>For looking at glass closely: who made it, how it was made, and how certain we can be.</p>
      </PageIntro>
      <div className="container-gallery pb-24">
        <article className="group relative grid items-center gap-8 border-b border-line-dark pb-14 md:grid-cols-12 lg:pb-20">
          {lead.image && (
            <div className="plate relative aspect-[4/3] overflow-hidden md:col-span-6">
              <ImageBackdrop media={lead.image.hero} />
              <div className="absolute inset-5 flex items-center justify-center">
                <ArtworkImage media={lead.image.hero} sizes="(min-width: 48rem) 45vw, 100vw" intrinsic feather decorative />
              </div>
            </div>
          )}
          <div className="flex flex-col gap-5 md:col-span-5 md:col-start-8">
            <p className="label eyebrow text-muted-dark">Start here</p>
            <h2 className="display-lg transition-colors duration-300 group-hover:text-accent">
              <Link href={lead.href} className="after:absolute after:inset-0">
                {lead.title}
              </Link>
            </h2>
            <p className="measure text-muted-dark">{lead.text}</p>
            <span className="link-arrow text-on-dark" aria-hidden="true">
              <span>Read the history</span>
              <span className="arrow" />
            </span>
          </div>
        </article>

        <ul className="grid border-b border-line-dark md:grid-cols-2">
          {entries.map((e, i) => (
            <li
              key={e.href}
              className={`group relative flex gap-6 border-line-dark py-8 md:py-10 ${
                i === entries.length - 1 && i % 2 === 0 ? "md:col-span-2" : i % 2 === 0 ? "md:border-r md:pr-10" : "md:pl-10"
              } ${i < entries.length - 1 ? "border-b" : ""} ${i === entries.length - 2 && i % 2 === 1 ? "md:border-b" : ""}`}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <p className="label text-muted-dark">{e.meta}</p>
                <h2 className="display-md transition-colors duration-300 group-hover:text-accent">
                  <Link href={e.href} className="after:absolute after:inset-0">
                    {e.title}
                  </Link>
                </h2>
                <p className="text-muted-dark">{e.text}</p>
              </div>
              {e.image && (
                <div className="plate relative hidden aspect-square w-28 shrink-0 self-start overflow-hidden sm:block lg:w-32">
                  <ImageBackdrop media={e.image.hero} />
                  <div className="absolute inset-2 flex items-center justify-center">
                    <ArtworkImage media={e.image.hero} sizes="128px" intrinsic feather decorative />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {thread && (
          <section aria-labelledby="thread-title" className="pt-16 lg:pt-20">
            <p className="label eyebrow text-muted-dark">How the guide connects</p>
            <h2 id="thread-title" className="display-md mt-5 max-w-[30ch]">
              One thread through the archive, from {thread.technique.term.toLowerCase()} to a source.
            </h2>
            <ol className="mt-10 grid border-t border-line-dark sm:grid-cols-2 lg:grid-cols-5">
              {[
                { step: "Technique", label: thread.technique.term, href: routes.technique(thread.technique.slug), note: "How it was made" },
                { step: "History", label: thread.period.title, href: `${routes.history()}#${thread.period.id}`, note: thread.period.period },
                { step: "Example", label: thread.example.title, href: routes.artwork(thread.example.slug), note: thread.example.datingLabel ?? "Date not recorded" },
                { step: "Maker", label: thread.maker.name, href: routes.maker(thread.maker.slug), note: "Profile and works" },
                { step: "Source", label: thread.source.title, href: thread.source.url, note: thread.source.publisher ?? "External source", external: true },
              ].map((n, i) => (
                <li key={n.step} className="flex flex-col gap-2 border-b border-line-dark py-6 sm:pr-6 lg:border-b-0 lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0">
                  <p className="flex items-baseline gap-3">
                    <span aria-hidden="true" className="numeral text-lg text-accent">
                      {i + 1}
                    </span>
                    <span className="label text-muted-dark">{n.step}</span>
                  </p>
                  {n.external ? (
                    <a href={n.href} className="link-quiet text-on-dark" rel="noopener">
                      {n.label}
                    </a>
                  ) : (
                    <Link href={n.href} className="link-quiet text-on-dark">
                      {n.label}
                    </Link>
                  )}
                  <span className="text-caption text-muted-dark">{n.note}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <p className="mt-14 text-sm text-muted-dark">
          Glasshouse profiles will be added as the collection is catalogued.{" "}
          <ArrowLink href={routes.contact()} className="ml-2 text-on-dark">
            Suggest a source
          </ArrowLink>
        </p>
      </div>
    </>
  );
}
