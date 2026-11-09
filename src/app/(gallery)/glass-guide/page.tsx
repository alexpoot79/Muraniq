import Link from "next/link";
import type { Metadata } from "next";
import { getCreators, getTechniques } from "@/content/repository.server";
import { PageIntro } from "@/components/editorial/PageIntro";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";

export const metadata: Metadata = pageMetadata({
  title: "Glass Guide",
  description: "An introduction to Murano makers, glassmaking techniques, marks and how MURANIQ attributes works.",
  path: routes.guide(),
});

export default async function GuidePage() {
  const [creators, techniques] = await Promise.all([getCreators(), getTechniques()]);
  const entries = [
    {
      title: "Makers",
      href: routes.makers(),
      text: "Biographies of the makers and workshops represented in the collection, with the works linked to each.",
      meta: `${creators.length} ${creators.length === 1 ? "profile" : "profiles"}`,
    },
    {
      title: "Techniques",
      href: routes.techniques(),
      text: "How the glass was made — sommerso, calcedonia, bullicante and more — and how to recognise each.",
      meta: `${techniques.length} ${techniques.length === 1 ? "technique" : "techniques"}`,
    },
    {
      title: "Attribution & method",
      href: routes.attribution(),
      text: "How MURANIQ separates observation from interpretation, and what each level of certainty means.",
      meta: "Method",
    },
  ];
  return (
    <>
      <PageIntro crumbs={[{ label: "Glass Guide", href: routes.guide() }]} kicker="Research archive" title="Glass Guide">
        <p>A reference for looking at glass: who made it, how it was made, and how certain we can be.</p>
      </PageIntro>
      <div className="container-gallery pb-24">
        <ul className="grid md:grid-cols-3">
          {entries.map((e, i) => (
            <li key={e.href} className={`relative border-b border-line-dark py-12 md:border-b-0 md:px-8 ${i > 0 ? "md:border-l" : "md:pl-0"}`}>
              <p className="label text-muted-dark">{e.meta}</p>
              <h2 className="display-md mt-3">
                <Link href={e.href} className="after:absolute after:inset-0 hover:text-accent">
                  {e.title}
                </Link>
              </h2>
              <p className="mt-4 text-muted-dark">{e.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 border-t border-line-dark pt-6 text-sm text-muted-dark">
          Signatures &amp; labels and glasshouse profiles will be added as the collection is catalogued.
        </p>
      </div>
    </>
  );
}
