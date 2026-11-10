import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ResearchStatusBadge } from "@/components/ui/ResearchStatusBadge";
import { STATUS_LABEL, directoryDossier, directoryEntries } from "@/content/makers-directory";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";

export function generateStaticParams() {
  return directoryEntries().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/glass-guide/makers-and-workshops/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const d = directoryDossier(slug);
  if (!d) return { title: "Not found", robots: { index: false } };
  return pageMetadata({
    title: `${d.name} — Makers & Workshops`,
    description: `${d.kind}${d.dates ? `, ${d.dates}` : ""}. ${d.summary}`,
    path: routes.directoryEntry(slug),
  });
}

function Section({ id, n, title, children }: { id: string; n: number; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`} className="grid gap-8 border-t border-line-paper py-14 first:border-t-0 first:pt-0 md:grid-cols-12 lg:py-20">
      <div className="md:col-span-4">
        <p aria-hidden="true" className="numeral text-xl text-accent-ink">
          {String(n).padStart(2, "0")}
        </p>
        <h2 id={`${id}-title`} className="display-md mt-3">
          {title}
        </h2>
      </div>
      <div className="md:col-span-8 lg:col-span-7 lg:col-start-6">{children}</div>
    </section>
  );
}

export default async function DirectoryEntryPage({ params }: PageProps<"/glass-guide/makers-and-workshops/[slug]">) {
  const { slug } = await params;
  const d = directoryDossier(slug);
  if (!d) notFound();

  const withImage = d.works.filter((w) => w.image);
  const linkOnly = d.works.filter((w) => !w.image);
  const sections = [
    d.connections.length > 0 && "connections",
    d.works.length > 0 && "works",
    (d.marks.length > 0 || d.techniques.length > 0) && "marks",
    d.openQuestions.length > 0 && "questions",
    "sources",
  ].filter(Boolean) as string[];
  const num = (id: string) => sections.indexOf(id) + 1;

  return (
    <>
      <div className="container-gallery pt-8 lg:pt-12">
        <Breadcrumbs
          items={[
            { label: "Glass Guide", href: routes.guide() },
            { label: "Makers & Workshops", href: routes.directory() },
            { label: d.name, href: routes.directoryEntry(d.slug) },
          ]}
        />
        <header className="grid gap-12 border-b border-line-dark pt-16 pb-16 lg:grid-cols-12 lg:pt-24 lg:pb-24">
          <div className="lg:col-span-7">
            <p className="settle label eyebrow text-muted-dark">
              {d.kind}
              {d.dates && <span className="numeral ml-3 text-base tracking-normal normal-case">{d.dates}</span>}
            </p>
            <h1 className="settle settle-1 display-xl mt-6">{d.name}</h1>
            {d.alternativeNames.length > 0 && (
              <p className="mt-4 text-muted-dark">Also recorded as {d.alternativeNames.join(", ")}</p>
            )}
            <p className="settle settle-2 lede mt-8 max-w-2xl text-muted-dark">{d.summary}</p>
          </div>
          <div className="flex flex-col gap-8 lg:col-span-4 lg:col-start-9 lg:self-end">
            <ResearchStatusBadge status={d.status} explain />
            {d.facts.length > 0 && (
              <dl className="grid grid-cols-[7rem_1fr] text-sm">
                {d.facts.map((f) => (
                  <div key={f.k} className="contents">
                    <dt className="label border-b border-line-dark py-3 text-[0.6875rem] text-muted-dark">{f.k}</dt>
                    <dd className="border-b border-line-dark py-3 text-on-dark">{f.v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </header>
      </div>

      {withImage.length > 0 && (
        <section aria-label="Works by or attributed to this name, in public collections" className="container-gallery py-16 lg:py-24">
          <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {withImage.map((w) => (
              <li key={w.id}>
                <figure className="flex flex-col gap-4">
                  <div className="plate relative aspect-[4/5] overflow-hidden">
                    <div className="absolute inset-6">
                      <Image
                        src={w.image!.src}
                        alt={w.image!.alt}
                        fill
                        sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 92vw"
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <figcaption className="flex flex-col gap-1 text-sm">
                    <span className="font-display text-xl text-on-dark">{w.title}</span>
                    <span className="text-muted-dark">
                      {[w.date, w.medium].filter(Boolean).join(" · ")}
                      {w.candidate ? " · maker not confirmed" : w.status !== "VERIFIED" ? ` · ${STATUS_LABEL[w.status].toLowerCase()}` : ""}
                    </span>
                    {w.creditLineMaker && (
                      <span className="text-muted-dark">Museum record: {w.creditLineMaker}</span>
                    )}
                    <span className="text-muted-dark">
                      <a href={w.url} rel="noopener" className="link-quiet">
                        {w.image!.credit}
                        <span className="sr-only"> (opens the museum record)</span>
                      </a>
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="surface-paper">
        <div className="container-gallery py-20 lg:py-32">
          {d.connections.length > 0 && (
            <Section id="connections" n={num("connections")} title="Connections">
              <dl className="flex flex-col">
                {d.connections.map((c) => (
                  <div key={c.label} className="grid gap-2 border-b border-line-paper py-5 first:pt-0 sm:grid-cols-[11rem_1fr]">
                    <dt className="label text-[0.6875rem] text-ink-muted">{c.label}</dt>
                    <dd>
                      <ul className="flex flex-col gap-2">
                        {c.links.map((l, i) => (
                          <li key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            {l.slug ? (
                              <Link href={routes.directoryEntry(l.slug)} className="link-quiet font-display text-xl">
                                {l.name}
                              </Link>
                            ) : (
                              <span className="font-display text-xl">{l.name}</span>
                            )}
                            {l.when && <span className="numeral text-ink-muted">{l.when}</span>}
                            {l.status !== "VERIFIED" && (
                              <span className="label text-[0.625rem] text-ink-muted">{STATUS_LABEL[l.status]}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ))}
              </dl>
            </Section>
          )}

          {d.works.length > 0 && (
            <Section id="works" n={num("works")} title="In public collections">
              <p className="text-ink-muted">
                Works linked to this name in museum records. They are not part of the MURANIQ collection.
                {linkOnly.length > 0 && " Where the photograph is not free to reuse, we link to the museum instead of showing it."}
              </p>
              <ul className="mt-6 flex flex-col border-t border-line-paper">
                {d.works.map((w) => (
                  <li key={w.id} className="flex flex-col gap-1 border-b border-line-paper py-4">
                    <a href={w.url} rel="noopener" className="link-quiet font-display text-xl">
                      {w.title}
                      <span className="sr-only"> (opens the {w.institution} record)</span>
                    </a>
                    <span className="text-sm text-ink-muted">
                      {[w.date, w.institution, w.accessionNumber].filter(Boolean).join(" · ")}
                    </span>
                    <span className="label text-[0.625rem] text-ink-muted">
                      {w.candidate ? "Candidate maker only" : STATUS_LABEL[w.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {(d.marks.length > 0 || d.techniques.length > 0) && (
            <Section id="marks" n={num("marks")} title="Marks and techniques">
              {d.marks.length > 0 && (
                <ul className="flex flex-col gap-5">
                  {d.marks.map((m, i) => (
                    <li key={i} className="flex flex-col gap-1">
                      <span className="label text-[0.6875rem] text-ink-muted">{m.kind}</span>
                      <span className="font-display text-xl">{m.text}</span>
                      <span className="text-sm text-ink-muted">
                        {[m.period, m.frequency, STATUS_LABEL[m.status]].filter(Boolean).join(" · ")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {d.techniques.length > 0 && (
                <p className={d.marks.length ? "mt-8" : ""}>
                  <span className="label mr-3 text-[0.6875rem] text-ink-muted">Techniques</span>
                  {d.techniques.join(", ")}
                </p>
              )}
            </Section>
          )}

          {d.openQuestions.length > 0 && (
            <Section id="questions" n={num("questions")} title="Open questions">
              <ul className="flex flex-col gap-8">
                {d.openQuestions.map((q, i) => (
                  <li key={i}>
                    <p>{q.description}</p>
                    <ul className="mt-3 flex flex-col gap-1 border-l border-line-paper pl-5 text-sm text-ink-muted">
                      {q.positions.map((p, j) => (
                        <li key={j}>
                          {p.value} <span className="whitespace-nowrap">({p.source})</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section id="sources" n={num("sources")} title="Sources">
            <ol className="flex flex-col border-t border-line-paper">
              {d.sources.map((s) => (
                <li key={s.id} className="flex flex-col gap-1 border-b border-line-paper py-4">
                  {s.url ? (
                    <a href={s.url} rel="noopener" className="link-quiet">
                      {s.title}
                    </a>
                  ) : (
                    <span>{s.title}</span>
                  )}
                  <span className="text-sm text-ink-muted">
                    {[s.publisher, s.date, s.kind].filter(Boolean).join(" · ")}
                    {!s.consulted && " · identified, not yet consulted in full"}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-ink-muted">
              Checked {d.checked}. Found an error or a better source?{" "}
              <Link href={routes.contact()} className="link-quiet">
                Tell us
              </Link>
              .
            </p>
          </Section>
        </div>
      </div>

      <div className="container-gallery py-16">
        <ArrowLink href={routes.directory()} className="text-on-dark">
          All makers and workshops
        </ArrowLink>
      </div>
    </>
  );
}
