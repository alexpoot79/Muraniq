import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArtworkBySlug, getArtworks, getPreviewNote, getSignaturesForArtwork } from "@/content/repository.server";
import { APPLICATION_LABEL, certaintyWord } from "@/features/signatures/labels";
import { categoryBySlug } from "@/content/categories";
import { Viewer } from "@/features/artworks/Viewer";
import { ArtworkCard } from "@/components/editorial/ArtworkCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CertaintyBadge } from "@/components/ui/CertaintyBadge";
import { FixtureNotice } from "@/components/ui/FixtureNotice";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { JsonLd } from "@/components/ui/JsonLd";
import { ROLE_LABEL, attributionPhrase, mayAssertCreatorInStructuredData } from "@/features/artworks/attribution";
import { AVAILABILITY_LABEL, VIEW_LABEL, formatDimensions } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site";

export async function generateStaticParams() {
  return (await getArtworks()).map((a) => ({ slug: a.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArtworkBySlug(slug);
  if (!a) return { title: "Not found", robots: { index: false } };
  return pageMetadata({
    title: a.seo.title ?? `${a.title} — ${a.attributionLine}`,
    description: a.seo.description ?? a.summary,
    path: routes.artwork(a.slug),
    image: { src: a.hero.src, alt: a.hero.alt, width: a.hero.width, height: a.hero.height },
  });
}

const MARK_KIND: Record<string, string> = {
  signature: "Signature",
  label: "Label",
  pontil: "Pontil mark",
  engraving: "Engraving",
  stamp: "Stamp",
  inscription: "Inscription",
  other: "Mark",
};

function Section({ id, n, title, children }: { id: string; n: number; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`} id={id} className="scroll-mt-28 border-t border-line-paper py-14 first:border-t-0 first:pt-0 lg:py-20">
      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-4">
          <p aria-hidden="true" className="numeral text-xl text-accent-ink">
            {String(n).padStart(2, "0")}
          </p>
          <h2 id={`${id}-title`} className="display-md mt-3">
            {title}
          </h2>
        </div>
        <div className="md:col-span-8 lg:col-span-7 lg:col-start-6">{children}</div>
      </div>
    </section>
  );
}

function enquiryCta(availability: string) {
  switch (availability) {
    case "enquiries_welcome":
      return { label: "Enquire about this work", primary: true };
    default:
      return { label: "Ask a question about this work", primary: false };
  }
}

export default async function ArtworkPage({ params }: Props) {
  const { slug } = await params;
  const [a, previewNote] = await Promise.all([getArtworkBySlug(slug), getPreviewNote(slug)]);
  if (!a) notFound();
  const markRefs = await getSignaturesForArtwork(a.id);

  const category = categoryBySlug(a.category)!;
  const dims = formatDimensions(a.dimensions);
  const sourceIndex = new Map(a.sources.map((s, i) => [s.id, i + 1]));
  const cta = enquiryCta(a.availability);
  const lead = a.creatorLinks[0];
  // A maker named in the attribution but without a profile page (yet) is still shown, unlinked, with its qualifier.
  const unlinkedMaker = a.creatorLinks.length
    ? undefined
    : a.assertions.find((x) => x.field === "creator" && x.certainty !== "unknown")?.statement;

  const specs: Array<{ label: string; value: React.ReactNode }> = [
    { label: "Object", value: a.objectType },
    {
      label: "Maker",
      value: a.creatorLinks.length ? (
        <ul className="flex flex-col gap-1">
          {a.creatorLinks.map((c) => (
            <li key={c.id + c.role}>
              <Link href={routes.maker(c.slug)} className="link-quiet">
                {attributionPhrase(c.name, c.certainty)}
              </Link>{" "}
              <span className="text-ink-muted">({ROLE_LABEL[c.role]})</span>
            </li>
          ))}
        </ul>
      ) : (
        (unlinkedMaker ?? "Not documented")
      ),
    },
    { label: "Date", value: a.dating?.displayLabel ?? "Not documented" },
    { label: "Country", value: a.country ?? "Not documented" },
    { label: "Materials", value: a.materials.length ? a.materials.join(", ") : "Not documented" },
    {
      label: "Technique",
      value: a.techniques.length ? (
        <ul>
          {a.techniques.map((t) => (
            <li key={t.id}>
              <Link href={routes.technique(t.slug)} className="link-quiet">
                {t.term}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        "Not documented"
      ),
    },
    ...(dims.length ? dims : [{ label: "Dimensions", value: "Not documented" }]),
    ...(a.reference
      ? [
          { label: "Held by", value: a.reference.institution },
          { label: "Accession no.", value: a.reference.accessionNumber },
          ...(a.reference.creditLine ? [{ label: "Credit line", value: a.reference.creditLine }] : []),
          { label: "Photograph", value: `${a.reference.institution}, open access (${a.reference.licence})` },
        ]
      : []),
    { label: a.reference ? "Record ID" : "Collection ID", value: <span className="font-mono text-sm">{a.id}</span> },
  ];

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    "@id": absoluteUrl(routes.artwork(a.slug)),
    name: a.title,
    url: absoluteUrl(routes.artwork(a.slug)),
    description: a.summary,
    image: absoluteUrl(a.hero.src),
    artMedium: a.materials.join(", ") || undefined,
    artform: a.objectType,
    identifier: a.id,
    ...(a.dimensions.heightMm ? { height: { "@type": "QuantitativeValue", value: a.dimensions.heightMm, unitCode: "MMT" } } : {}),
    ...(a.dimensions.widthMm ? { width: { "@type": "QuantitativeValue", value: a.dimensions.widthMm, unitCode: "MMT" } } : {}),
    ...(a.dating?.certainty === "verified" && a.dating.fromYear ? { dateCreated: String(a.dating.fromYear) } : {}),
    // Only verified creators are asserted; otherwise no creator claim (no fictive Offer either).
    ...(lead && mayAssertCreatorInStructuredData(lead.certainty)
      ? { creator: { "@type": "Person", name: lead.name, url: absoluteUrl(routes.maker(lead.slug)) } }
      : {}),
  };

  const sectionIds = [
    "description",
    "specifications",
    ...(a.marks.length ? ["marks"] : []),
    "attribution",
    ...(a.provenance.length ? ["provenance"] : []),
    ...(a.condition ? ["condition"] : []),
  ];
  const num = (id: string) => sectionIds.indexOf(id) + 1;
  const origin = a.assertions.find((x) => x.field === "origin")?.statement.replace(/^Made (in|on) (the )?/, "");
  const ref = a.reference;

  return (
    <article>
      <div className="container-gallery pt-8 pb-20 lg:pt-12 lg:pb-28">
        <Breadcrumbs
          items={[
            { label: "Collection", href: routes.collection() },
            { label: category.title, href: routes.category(category.slug) },
            { label: a.title, href: routes.artwork(a.slug) },
          ]}
        />

        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-x-16 gap-y-10 [grid-template-areas:'head'_'media'_'facts'] lg:mt-14 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:[grid-template-areas:'media_head'_'media_facts'] lg:[grid-template-rows:auto_1fr]">
          <header className="flex flex-col gap-5 [grid-area:head]">
            {previewNote && (
              <div className="border-l-2 border-accent pl-4 text-sm" role="note">
                <p>
                  <strong className="font-medium text-on-dark">
                    {previewNote.status === "in_review" ? "In review" : "Draft"} · not published.
                  </strong>{" "}
                  <span className="text-muted-dark">Only visible in preview.</span>
                </p>
                {previewNote.blockers.length > 0 && (
                  <>
                    <p className="mt-2 text-muted-dark">Before this work can be published:</p>
                    <ul className="mt-1 list-disc pl-5 text-muted-dark">
                      {previewNote.blockers.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
            <p className="settle label eyebrow text-muted-dark">
              {category.title} · {a.objectType}
            </p>
            <h1 className="settle settle-1 display-lg">{a.title}</h1>
            <div className="settle settle-2 flex flex-col gap-3">
              <p className="font-display text-xl text-on-dark">
                {[origin ?? a.country, a.dating?.displayLabel].filter(Boolean).join(", ")}
              </p>
              {a.attributionCertainty === "unknown" ? (
                <p className="text-sm text-muted-dark">Maker not recorded</p>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-on-dark">{a.attributionLine}</p>
                  <CertaintyBadge certainty={a.attributionCertainty} />
                </div>
              )}
            </div>
          </header>

          <div className="[grid-area:media] lg:sticky lg:top-32 lg:self-start">
            <Viewer media={a.media} title={a.title} />
          </div>

          <div className="flex flex-col gap-10 [grid-area:facts]">
            <p className="lede text-muted-dark">{a.summary}</p>
            <dl className="grid grid-cols-[minmax(7.5rem,auto)_1fr] border-t border-line-dark text-sm">
              {[
                ...(ref
                  ? [{ k: "Held by", v: `${ref.institution}, ${ref.accessionNumber}` }]
                  : [{ k: "Status", v: AVAILABILITY_LABEL[a.availability] }]),
                ...(a.country ? [{ k: "Country", v: a.country }] : []),
                ...(a.materials.length ? [{ k: "Materials", v: a.materials.join(", ") }] : []),
                ...(a.techniques.length ? [{ k: "Technique", v: a.techniques.map((t) => t.term).join(", ") }] : []),
                ...(dims[0] ? [{ k: dims[0].label, v: dims[0].value }] : []),
                { k: "Record", v: a.id },
              ].map((row) => (
                <div key={row.k} className="contents">
                  <dt className="label border-b border-line-dark py-3.5 text-[0.6875rem] text-muted-dark">{row.k}</dt>
                  <dd className="border-b border-line-dark py-3.5 text-on-dark">{row.v}</dd>
                </div>
              ))}
            </dl>

            {a.isFixture && <FixtureNotice heldBy={ref ? { ...ref } : null} />}

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              {ref ? (
                <a href={ref.url} className="btn btn-ghost" rel="noopener">
                  View the museum record
                  <span className="sr-only"> (opens the {ref.institution} website)</span>
                </a>
              ) : (
                <Link href={routes.contact(a.id)} className={`btn ${cta.primary ? "btn-primary" : "btn-ghost"}`}>
                  {cta.label}
                </Link>
              )}
              <ArrowLink href="#study" className="text-on-dark">
                Read the full dossier
              </ArrowLink>
            </div>
          </div>
        </div>
      </div>

      {/* Study room */}
      <div id="study" className="surface-paper scroll-mt-24">
        <div className="container-gallery py-20 lg:py-32">
          <Section id="description" n={num("description")} title="Description">
            <div className="measure flex flex-col gap-4">
              {a.description.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Section>

          <Section id="specifications" n={num("specifications")} title="Specifications">
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-[minmax(8rem,auto)_1fr]">
              {specs.map((s) => (
                <div key={s.label} className="contents">
                  <dt className="label pt-0.5 text-ink-muted">{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </Section>

          {a.marks.length > 0 && (
            <Section id="marks" n={num("marks")} title="Marks & Labels">
              <ul className="flex flex-col gap-8">
                {a.marks.map((m, i) => (
                  <li key={i} className="flex flex-col gap-2">
                    <h3 className="font-display text-2xl">
                      {MARK_KIND[m.kind]} <span className="text-ink-muted">· {m.location}</span>
                    </h3>
                    {m.application && <p className="label text-[0.6875rem] text-ink-muted">{APPLICATION_LABEL[m.application]}</p>}
                    <p>{m.observation}</p>
                    {m.transcription && (
                      <p>
                        <span className="label text-ink-muted">As written:</span>{" "}
                        <q className="font-mono text-[0.95em]">{m.transcription}</q>
                        {m.transcriptionCertainty && (
                          <span className="text-sm text-ink-muted"> · reading: {certaintyWord[m.transcriptionCertainty].toLowerCase()}</span>
                        )}
                      </p>
                    )}
                    {m.transcriptionNote && <p className="text-sm text-ink-muted">{m.transcriptionNote}</p>}
                    {m.interpretation && (
                      <div className="mt-1 flex flex-col gap-2 border-l-2 border-line-paper pl-4">
                        <p className="label text-ink-muted">Interpretation</p>
                        <p>{m.interpretation}</p>
                        {m.interpretationCertainty && <CertaintyBadge certainty={m.interpretationCertainty} tone="paper" />}
                      </div>
                    )}
                    {m.imageId && (
                      <p className="text-sm text-ink-muted">
                        Shown in the {VIEW_LABEL[a.media.find((x) => x.id === m.imageId)?.viewType ?? ""]?.toLowerCase() ?? "detail"} view above.
                      </p>
                    )}
                    {m.id &&
                      (markRefs[m.id] ?? []).flatMap((r) =>
                        r.makers.map((mk) => (
                          <p key={`${r.id}-${mk.slug}`} className="text-sm">
                            <Link href={`${routes.maker(mk.slug)}#sig-${r.id}`} className="link-quiet">
                              Signature reference on the {mk.name} profile
                            </Link>
                          </p>
                        )),
                      )}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section id="attribution" n={num("attribution")} title="Attribution & Sources">
            <div className="flex flex-col gap-8">
              {a.assertions.length === 0 && <p>Not documented.</p>}
              {a.assertions.map((as, i) => (
                <div key={i} className="flex flex-col gap-3 border border-line-paper bg-paper-2/70 p-6 sm:p-8">
                  <p className="label text-ink-muted">{as.field === "other" ? "Claim" : as.field}</p>
                  <p className="font-display text-2xl">{as.statement}</p>
                  <CertaintyBadge certainty={as.certainty} tone="paper" explain />
                  {as.publicNote && <p>{as.publicNote}</p>}
                  {as.evidence.length > 0 && (
                    <p className="text-sm text-ink-muted">
                      Evidence:{" "}
                      {as.evidence.map((e, j) => (
                        <span key={j}>
                          {j > 0 && "; "}
                          <a href={`#source-${e.sourceId}`} className="link-quiet">
                            [{sourceIndex.get(e.sourceId)}]
                          </a>
                          {e.locator ? ` ${e.locator}` : ""}
                        </span>
                      ))}
                      {as.reviewedOn && ` · reviewed ${as.reviewedOn}`}
                    </p>
                  )}
                </div>
              ))}
              {a.sources.length > 0 && (
                <div>
                  <h3 className="label text-ink-muted">Sources</h3>
                  <ol className="mt-3 flex flex-col gap-3">
                    {a.sources.map((s, i) => (
                      <li key={s.id} id={`source-${s.id}`} className="scroll-mt-28">
                        <span className="text-ink-muted">[{i + 1}]</span> {s.author ? `${s.author}, ` : ""}
                        <cite>{s.title}</cite>
                        {s.publisher ? `, ${s.publisher}` : ""}
                        {s.year ? ` (${s.year})` : ""}.
                        {s.url && (
                          <>
                            {" "}
                            <a href={s.url} className="link-quiet" rel="noopener">
                              View record<span className="sr-only">: {s.title}</span>
                            </a>
                          </>
                        )}
                        {s.rightsNote && <span className="block text-sm text-ink-muted">{s.rightsNote}</span>}
                        {s.reliabilityNote && <span className="block text-sm text-ink-muted">{s.reliabilityNote}</span>}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              <p className="text-sm text-ink-muted">
                <Link href={routes.attribution()} className="link-quiet">
                  How MURANIQ states certainty
                </Link>
              </p>
            </div>
          </Section>

          {a.provenance.length > 0 && (
            <Section id="provenance" n={num("provenance")} title="Public Provenance">
              <ol className="flex flex-col gap-4">
                {a.provenance.map((p, i) => (
                  <li key={i} className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-6">
                    <span className="label pt-1 text-ink-muted">
                      {p.fromYear ?? "Date unknown"}
                      {p.toYear && p.toYear !== p.fromYear ? `–${p.toYear}` : ""}
                    </span>
                    <span className="flex flex-col gap-2">
                      <span>{p.label}</span>
                      <CertaintyBadge certainty={p.certainty} tone="paper" />
                    </span>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {a.condition && (
            <Section id="condition" n={num("condition")} title="Condition">
              <p className="measure">{a.condition}</p>
            </Section>
          )}
        </div>
      </div>

      {a.related.length > 0 && (
        <section aria-labelledby="related-title" className="section-y border-t border-line-dark">
          <div className="container-gallery">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="label eyebrow text-muted-dark">Continue looking</p>
                <h2 id="related-title" className="display-lg mt-5">
                  Related <span className="serif-italic">works</span>
                </h2>
              </div>
              <ArrowLink href={routes.category(category.slug)} className="text-on-dark">
                {category.title}
              </ArrowLink>
            </div>
            <ul className="mt-14 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {a.related.map((r) => (
                <li key={r.id}>
                  <ArtworkCard artwork={r} />
                  {r.techniqueSlugs.some((t) => a.techniques.some((x) => x.slug === t)) && (
                    <p className="mt-3 text-xs tracking-wide text-muted-dark">Shares a documented technique.</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <JsonLd data={jsonLd} />
    </article>
  );
}
