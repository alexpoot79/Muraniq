import Link from "next/link";
import type { Metadata } from "next";
import { getArtworks, getCreators, getTechniques } from "@/content/repository.server";
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

export default async function GuidePage() {
  const [creators, techniques, artworks] = await Promise.all([getCreators(), getTechniques(), getArtworks()]);
  const art = (slug: string) => artworks.find((a) => a.slug === slug);
  const entries = [
    {
      title: "History of Murano glass",
      href: routes.history(),
      text: "How glassmaking grew in Venice and on the island of Murano, period by period, from its origins to today.",
      meta: "History",
      image: art("enamelled-ewer-venice"),
    },
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
      image: art("enamelled-ewer-venice"),
    },
    {
      title: "Attribution & method",
      href: routes.attribution(),
      text: "How MURANIQ separates observation from interpretation, and what each level of certainty means.",
      meta: "Method",
      image: art("chalcedony-bottle-miotti"),
    },
    {
      title: "Signatures & labels",
      href: "/glass-guide/signatures-and-labels/",
      text: "Marks recorded exactly as written, with any interpretation kept apart. A reference in preparation.",
      meta: "In preparation",
      image: art("roman-millefiori-bowl"),
    },
  ];
  return (
    <>
      <PageIntro crumbs={[{ label: "Glass Guide", href: routes.guide() }]} kicker="Research archive" title="Glass Guide," accent="a reference.">
        <p>For looking at glass closely: who made it, how it was made, and how certain we can be.</p>
      </PageIntro>
      <div className="container-gallery pb-28">
        <ul>
          {entries.map((e, i) => (
            <li key={e.href} className="group reveal relative grid items-center gap-8 border-b border-line-dark py-14 md:grid-cols-12 lg:py-20">
              {e.image && (
                <div className={`plate relative aspect-[4/3] overflow-hidden md:col-span-5 ${i % 2 ? "md:order-2 md:col-start-8" : ""}`}>
                  <ImageBackdrop media={e.image.hero} sizes="(min-width: 48rem) 40vw, 100vw" />
                  <div className="absolute inset-6">
                    <ArtworkImage
                      media={e.image.hero}
                      sizes="(min-width: 48rem) 40vw, 100vw"
                      fill
                      className="transition-transform duration-[1400ms] ease-[var(--ease-silk)] motion-safe:group-hover:scale-[1.04]"
                    />
                  </div>
                </div>
              )}
              <div className={`flex flex-col gap-5 md:col-span-6 ${i % 2 ? "md:order-1 md:col-start-1" : "md:col-start-7"}`}>
                <p className="flex items-baseline gap-4">
                  <span className="numeral text-2xl text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <span className="label text-[0.6875rem] text-muted-dark">{e.meta}</span>
                </p>
                <h2 className="display-lg transition-colors duration-300 group-hover:text-accent">
                  <Link href={e.href} className="after:absolute after:inset-0">
                    {e.title}
                  </Link>
                </h2>
                <p className="measure text-muted-dark">{e.text}</p>
                <span className="link-arrow text-on-dark" aria-hidden="true">
                  <span>Open</span>
                  <span className="arrow" />
                </span>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-sm text-muted-dark">
          Glasshouse profiles will be added as the collection is catalogued.{" "}
          <ArrowLink href={routes.contact()} className="ml-2 text-on-dark">
            Suggest a source
          </ArrowLink>
        </p>
      </div>
    </>
  );
}
