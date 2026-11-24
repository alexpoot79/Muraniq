import Link from "next/link";
import type { Metadata } from "next";
import { PageIntro } from "@/components/editorial/PageIntro";
import { getSignatureIndex } from "@/content/repository.server";
import { INDEX_GROUPS } from "@/content/signature-index";
import { SignatureIndex } from "@/features/signatures/SignatureIndex";
import { GROUP_TEXT } from "@/features/signatures/labels";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";

// Existing URL on muraniq.nl, kept.
export const metadata: Metadata = pageMetadata({
  title: "Signatures & Labels",
  description:
    "Signatures, labels and inscriptions recorded on MURANIQ, each photographed on a documented object, transcribed exactly as written and attributed with its own certainty.",
  path: routes.signatures(),
});

const crumbs = [
  { label: "Glass Guide", href: routes.guide() },
  { label: "Signatures & labels", href: routes.signatures() },
];

export default async function SignaturesPage() {
  const entries = await getSignatureIndex();

  if (entries.length === 0) {
    return (
      <>
        <PageIntro crumbs={crumbs} kicker="Glass Guide" title="Signatures & labels">
          <p>Reference photographs of signatures and paper labels, with literal transcriptions.</p>
        </PageIntro>
        <div className="container-gallery pb-24">
          <p className="max-w-prose text-muted-dark">No signature or label has been published yet.</p>
        </div>
      </>
    );
  }

  const groups = INDEX_GROUPS.map((g) => ({ group: g, count: entries.filter((e) => e.group === g).length })).filter((g) => g.count > 0);
  const makers = [
    ...new Map(entries.flatMap((e) => e.profiles).map((p) => [p.slug, p.name] as const)).entries(),
  ].sort((a, b) => a[1].split(" ").at(-1)!.localeCompare(b[1].split(" ").at(-1)!));
  const objects = new Set(entries.map((e) => e.object.title)).size;

  return (
    <>
      <PageIntro crumbs={crumbs} kicker="Glass Guide" title="Signatures" accent="& labels">
        <p>
          Every signature, label and inscription recorded on MURANIQ so far: {entries.length} examples on {objects}{" "}
          {objects === 1 ? "object" : "objects"}. What is written is kept apart from whose it may be, and each statement
          carries its own certainty.
        </p>
      </PageIntro>
      <div className="surface-paper">
        <div className="container-gallery py-14 lg:py-20">
          <div className="grid gap-10 pb-14 md:grid-cols-12 lg:pb-20">
            <nav aria-label="Kinds of mark" className="md:col-span-4">
              <p className="label text-[0.6875rem] text-ink-muted">On this page</p>
              <ul className="mt-4 flex flex-col border-t border-line-paper">
                {groups.map((g) => (
                  <li key={g.group} className="border-b border-line-paper">
                    <a href={`#${g.group}`} className="flex min-h-11 items-baseline justify-between gap-4 py-2.5 transition-colors hover:text-accent-ink">
                      <span className="font-display text-xl">{GROUP_TEXT[g.group].title}</span>
                      <span className="text-sm text-ink-muted">{g.count}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="md:col-span-4">
              <p className="label text-[0.6875rem] text-ink-muted">By maker</p>
              <ul className="mt-4 flex flex-col border-t border-line-paper">
                {makers.map(([slug, name]) => (
                  <li key={slug} className="border-b border-line-paper">
                    <Link
                      href={`${routes.maker(slug)}#signatures`}
                      className="flex min-h-11 items-baseline justify-between gap-4 py-2.5 transition-colors hover:text-accent-ink"
                    >
                      <span className="font-display text-xl">{name}</span>
                      <span className="text-sm text-ink-muted">
                        {entries.filter((e) => e.profiles.some((p) => p.slug === slug)).length}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="measure flex flex-col gap-4 text-sm text-ink-muted md:col-span-4">
              <p className="label text-[0.6875rem]">How to read this</p>
              <p>
                Each example comes from one documented object and is shown with its source. A legible name is not proof
                that a piece is genuine: the reading of the letters, whose mark it is, and the date are stated separately.
              </p>
              <p>
                <Link href={routes.attribution()} className="link-quiet text-ink">
                  How we read marks
                </Link>
              </p>
            </div>
          </div>
          <SignatureIndex entries={entries} />
        </div>
      </div>
    </>
  );
}
