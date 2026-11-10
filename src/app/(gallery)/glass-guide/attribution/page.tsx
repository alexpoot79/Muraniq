import Link from "next/link";
import type { Metadata } from "next";
import { CERTAINTY } from "@/content/schemas";
import { PageIntro } from "@/components/editorial/PageIntro";
import { CertaintyBadge } from "@/components/ui/CertaintyBadge";
import { attributionPhrase } from "@/features/artworks/attribution";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";

export const metadata: Metadata = pageMetadata({
  title: "Attribution & Method",
  description: "How MURANIQ separates observation from interpretation and states the certainty of every attribution.",
  path: routes.attribution(),
});

export default function AttributionPage() {
  return (
    <>
      <PageIntro
        crumbs={[
          { label: "Glass Guide", href: routes.guide() },
          { label: "Attribution & method", href: routes.attribution() },
        ]}
        kicker="Method"
        title="How we attribute"
      >
        <p>What we observe, what we conclude from it, and how sure we are — always kept apart.</p>
      </PageIntro>
      <div className="surface-paper">
        <div className="container-gallery grid gap-12 py-16 md:grid-cols-12 lg:py-24">
          <div className="measure flex flex-col gap-5 md:col-span-7">
            <h2 className="display-md">Observation before interpretation</h2>
            <p>
              Each dossier starts with what can be seen: form, colour, weight, technique and any marks. Marks are
              recorded exactly as written, separately from what they might mean. A signature or label is evidence
              to be weighed; on its own it does not prove who made a piece.
            </p>
            <p>
              Every statement about a maker, date, technique or history carries its own level of certainty and the
              sources it rests on. Visual similarity to a documented work is a reason to investigate, not proof.
            </p>
            <h2 className="display-md mt-6">Sources</h2>
            <p>
              We cite catalogues, books, archives, museum records and our own dated examination notes. When a source
              only gives an indication, we say so. When new evidence appears, the dossier is revised and the review
              date updated.
            </p>
            <h2 className="display-md mt-6">Corrections</h2>
            <p>
              If you hold information that confirms or contradicts an attribution, we would like to hear from you via
              the{" "}
              <Link href={routes.contact()} className="link-quiet">
                contact page
              </Link>
              .
            </p>
          </div>
          <aside className="md:col-span-5" aria-labelledby="levels">
            <h2 id="levels" className="label text-ink-muted">
              Levels of certainty
            </h2>
            <ul className="mt-4 flex flex-col">
              {CERTAINTY.map((c) => (
                <li key={c} className="flex flex-col gap-2 border-t border-line-paper py-5">
                  <CertaintyBadge certainty={c} tone="paper" explain />
                  <p className="text-sm">
                    Written as: <q>{attributionPhrase("Maker name", c)}</q>
                  </p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </>
  );
}
