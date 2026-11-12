import Link from "next/link";
import type { Metadata } from "next";
import { getArtworkBySlug, getArtworks, getFeaturedArtworks, getTechniques } from "@/content/repository.server";
import type { ArtworkSummary } from "@/content/publication";
import { CATEGORIES } from "@/content/categories";
import { EDITORIAL_IMAGES } from "@/content/editorial-images";
import { ArtworkImage } from "@/components/editorial/ArtworkImage";
import { ArtworkCard } from "@/components/editorial/ArtworkCard";
import { EditorialFigure } from "@/components/editorial/EditorialFigure";
import { LogoImage } from "@/components/layout/Logo";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { CertaintyBadge } from "@/components/ui/CertaintyBadge";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/metadata";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMetadata({ title: `${SITE.name} | ${SITE.tagline}`, description: SITE.description, path: "/" }),
  title: { absolute: `${SITE.name} | ${SITE.tagline}` },
};

/** The heritage timeline: each step is anchored to a real object, never to an invented claim. */
const HERITAGE: Array<{ year: string; title: string; text: string; slug?: string }> = [
  {
    year: "1291",
    title: "The furnaces move to Murano",
    text: "Venice concentrates its glassmaking on the island of Murano, across the lagoon from the city.",
  },
  {
    year: "c. 1480",
    title: "Enamel on lapis-blue glass",
    text: "Painted roundels, gilding and rings of white enamel dots on deep blue glass.",
    slug: "enamelled-ewer-venice",
  },
  {
    year: "Late 1400s",
    title: "Lattimo, white as porcelain",
    text: "Opaque white glass made in imitation of Chinese porcelain; very few vessels survive.",
    slug: "marriage-beaker-lattimo",
  },
  {
    year: "c. 1500",
    title: "Chalcedony: stone made of glass",
    text: "Marbled glass imitating banded hardstone, its veining formed in the furnace.",
    slug: "chalcedony-ewer-venice",
  },
  {
    year: "c. 1730",
    title: "Chalcedony and aventurine",
    text: "Chalcedony glass combined with aventurine, glittering with tiny copper crystals.",
    slug: "chalcedony-and-aventurine-beaker",
  },
  {
    year: "1847",
    title: "Millefiori under a dome",
    text: "A paperweight by Pietro Bigaglia, packed with canes and twisted ribbons.",
    slug: "millefiori-paperweight-bigaglia",
  },
  {
    year: "19th century",
    title: "The Renaissance revived",
    text: "Murano workshops return to enamelled decoration in the manner of the 1400s.",
    slug: "the-peddler-goblet",
  },
];

const AREA_PREVIEW: Record<string, string | undefined> = {
  "murano-glass": "enamelled-ewer-venice",
  "collectible-objects": "millefiori-paperweight-bigaglia",
};

export default async function HomePage() {
  const [featured, all, techniques] = await Promise.all([getFeaturedArtworks(8), getArtworks(), getTechniques()]);
  const bySlug = new Map(all.map((a) => [a.slug, a] as const));
  const heroSummary = featured[0] ?? all[0];
  const hero = heroSummary ? await getArtworkBySlug(heroSummary.slug) : null;
  const studySummary = featured.find((a) => a.id !== heroSummary?.id && a.hero.hotspots.length > 0);
  const study = studySummary ? await getArtworkBySlug(studySummary.slug) : null;
  const studyTechnique = study?.techniques[0] ? techniques.find((t) => t.slug === study.techniques[0]!.slug) : undefined;
  const selected = featured.filter((a) => a.id !== heroSummary?.id && a.id !== studySummary?.id).slice(0, 4);
  const PAINTINGS = ["piazza-san-marco-bellotto", "pontifical-ceremony-guardi", "venetian-glass-workers-sargent", "bead-stringers-venice-blum"];
  const paintings = all.filter((a) => PAINTINGS.includes(a.slug));
  const vista = paintings[0] ? await getArtworkBySlug(paintings[0].slug) : null;
  const invitation = paintings[1] ?? null;
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c.slug, all.filter((a) => a.category === c.slug).length]));

  // One claim, followed to its evidence: prefer a qualified attribution, which shows the method best.
  let evidence: { art: ArtworkSummary; claim: NonNullable<Awaited<ReturnType<typeof getArtworkBySlug>>>["assertions"][number] } | null = null;
  for (const certainty of ["probable", "hypothesis", "documented_attribution"] as const) {
    for (const a of all.filter((x) => x.attributionCertainty === certainty)) {
      const d = await getArtworkBySlug(a.slug);
      const claim = d?.assertions.find((x) => (x.field === "creator" || x.field === "glasshouse") && x.certainty === certainty);
      if (d && claim) {
        evidence = { art: a, claim };
        break;
      }
    }
    if (evidence) break;
  }

  const heritage = HERITAGE.map((h) => ({ ...h, art: h.slug ? bySlug.get(h.slug) : undefined }));

  return (
    <>
      {/* 1 — Hero: one object, monumental, on black */}
      <section aria-labelledby="hero-title" className="relative grid bg-stage lg:min-h-[calc(100svh-6rem)] lg:grid-cols-[minmax(0,1fr)_auto]">
        {hero && (
          <figure className="relative h-[62svh] min-h-[22rem] overflow-hidden sm:h-[70svh] lg:order-2 lg:h-auto lg:w-[min(50vw,calc((100svh-6rem)*0.78))]">
            <div className="slow-zoom absolute inset-0">
              <ArtworkImage
                media={hero.hero}
                sizes="(min-width: 64rem) 50vw, 100vw"
                priority
                fill
                fit="cover"
                className="object-[50%_38%]"
              />
            </div>
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-stage to-transparent lg:inset-y-0 lg:left-0 lg:h-auto lg:w-40 lg:bg-gradient-to-r" />
            <figcaption className="sr-only">
              {hero.title}, {hero.dating?.displayLabel}. {hero.reference ? `${hero.reference.institution}, ${hero.reference.accessionNumber}, CC0.` : ""}
            </figcaption>
          </figure>
        )}

        <div className="container-gallery flex flex-col justify-between gap-12 pt-6 pb-14 lg:order-1 lg:max-w-none lg:pt-16 lg:pr-16 lg:pb-12">
          <p className="settle label eyebrow hidden text-muted-dark lg:inline-flex">Murano · Venezia · Private collection</p>
          <div>
            <h1 id="hero-title" className="settle settle-1 display-hero max-w-[11ch] text-on-dark">
              Glass and art, <span className="serif-italic text-accent">seen closely.</span>
            </h1>
            <p className="settle settle-2 lede measure mt-8 text-muted-dark lg:mt-10">
              A private collection of Murano glass, other glass and collectible objects. Each work is shown in
              full, with what is known about its making, and an honest account of what is not.
            </p>
            <div className="settle settle-3 mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link href={routes.collection()} className="btn btn-primary">
                Explore the collection
              </Link>
              <ArrowLink href={routes.exhibition()} className="text-on-dark">
                Enter the exhibition
              </ArrowLink>
            </div>
          </div>
          {hero && (
            <div className="flex items-end justify-between gap-6 border-t border-line-dark pt-5 text-sm">
              <p className="text-muted-dark">
                <Link href={routes.artwork(hero.slug)} className="link-quiet text-on-dark">
                  {hero.title}
                </Link>
                , {hero.dating?.displayLabel}
                {hero.reference && (
                  <span className="block text-xs tracking-wide">
                    Reference work · {hero.reference.institution} · CC0
                  </span>
                )}
              </p>
              <span aria-hidden="true" className="label hidden shrink-0 text-muted-dark lg:inline">
                Scroll
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 2 — Statement */}
      <section aria-labelledby="statement-title" className="section-y border-t border-line-dark bg-stage">
        <div className="container-gallery flex flex-col items-center text-center">
          <LogoImage variant="monogram" height={44} className="reveal h-11 w-auto" />
          <h2 id="statement-title" className="sr-only">
            About the collection
          </h2>
          <p className="reveal statement mt-12 max-w-5xl text-on-dark">
            A collection built around the object and the evidence: photographed from every side, described as it is,
            and linked to the makers, techniques and sources that <span className="serif-italic text-accent">explain it.</span>
          </p>
          <ul className="mt-20 grid w-full max-w-6xl gap-px bg-line-dark text-left sm:grid-cols-3">
            {[
              ["01", "The object first", "Front, reverse, base and marks, uncropped and in full, before any interpretation."],
              ["02", "Evidence for every claim", "Each attribution names its source and states how certain it is, from verified to hypothesis."],
              ["03", "An honest account", "Where the record is silent we say so. Visual similarity is never treated as proof."],
            ].map(([n, t, d]) => (
              <li key={n} className="reveal bg-stage px-0 py-10 sm:px-10 sm:first:pl-0">
                <p className="numeral text-2xl text-accent">{n}</p>
                <h3 className="display-sm mt-4">{t}</h3>
                <p className="mt-3 text-sm text-muted-dark">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3 — Selected works, asymmetric */}
      {selected.length > 0 && (
        <section aria-labelledby="selected-title" className="section-y bg-raised">
          <div className="container-gallery">
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="reveal label eyebrow text-muted-dark">Selected works</p>
                <h2 id="selected-title" className="reveal display-xl mt-6">
                  Venetian glass, <span className="serif-italic">in the round.</span>
                </h2>
              </div>
              <div className="reveal flex flex-col gap-6 lg:col-span-4 lg:col-start-9 lg:self-end">
                <p className="text-sm text-muted-dark">
                  Shown here: reference works from public museum collections, with their open-access photography, while
                  the MURANIQ collection is being photographed and documented.
                </p>
                <ArrowLink href={routes.collection()} className="text-on-dark">
                  View all works
                </ArrowLink>
              </div>
            </div>
            <ul className="mt-20 grid gap-x-10 gap-y-20 sm:grid-cols-2 lg:mt-28 lg:grid-cols-12 lg:gap-y-0">
              {selected.map((a, i) => {
                const layout = [
                  { li: "lg:col-span-5" },
                  { li: "lg:col-span-4 lg:col-start-8 lg:mt-48", drift: true },
                  { li: "lg:col-span-6 lg:col-start-2 lg:mt-28" },
                  { li: "lg:col-span-3 lg:col-start-9 lg:mt-56", drift: true },
                ][i] ?? { li: "lg:col-span-4" };
                return (
                  <li key={a.id} className={`${layout.li} ${layout.drift ? "drift" : ""}`}>
                    <div className="reveal">
                      <ArtworkCard artwork={a} ratio="natural" sizes="(min-width: 64rem) 40vw, (min-width: 40rem) 45vw, 100vw" />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* 4 — The city: one painting, full width and uncropped */}
      {vista && (
        <section aria-labelledby="city-title" className="section-y bg-stage">
          <div className="container-gallery grid gap-8 lg:grid-cols-12">
            <p className="reveal label eyebrow text-muted-dark lg:col-span-3">The city</p>
            <h2 id="city-title" className="reveal display-lg lg:col-span-8 lg:col-start-5">
              Venice, the market and the stage for <span className="serif-italic text-accent">Murano’s glass.</span>
            </h2>
          </div>
          <figure className="mt-16 lg:mt-24">
            <div className="overflow-hidden">
              <Link href={routes.artwork(vista.slug)} className="reveal-img block" aria-label={`${vista.title}: view the dossier`}>
                <ArtworkImage media={vista.hero} sizes="100vw" />
              </Link>
            </div>
            <figcaption className="container-gallery mt-5 flex flex-col gap-1 text-sm text-muted-dark sm:flex-row sm:justify-between sm:gap-8">
              <span>
                <span className="text-on-dark">{vista.title}</span>, {vista.dating?.displayLabel} · {vista.attributionLine}
              </span>
              {vista.reference && (
                <span>
                  {vista.reference.institution}, {vista.reference.accessionNumber} · CC0 · Reference work
                </span>
              )}
            </figcaption>
          </figure>
        </section>
      )}

      {/* 5 — Heritage: Murano since 1291, an interactive timeline anchored in objects */}
      <section aria-labelledby="heritage-title" className="surface-paper section-y">
        <div className="container-gallery">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="reveal label eyebrow text-ink-muted">Heritage</p>
              <h2 id="heritage-title" className="reveal display-xl mt-6">
                Murano, <span className="serif-italic">since 1291.</span>
              </h2>
            </div>
            <p className="reveal lede measure text-ink-muted lg:col-span-5 lg:col-start-8 lg:self-end">
              Seven centuries of technique, each step shown through an object you can study closely. Choose a moment to
              see the work that represents it.
            </p>
          </div>

          <EditorialFigure
            image={EDITORIAL_IMAGES.deBarbari}
            sizes="(min-width: 96rem) 86rem, 92vw"
            className="reveal mt-16 lg:mt-24"
            tone="paper"
          />

          <div className="heritage mt-20 grid gap-12 lg:mt-28 lg:grid-cols-12">
            <ol className="lg:col-span-6">
              {heritage.map((h, i) => {
                const body = (
                  <>
                    <span className="numeral hidden w-36 shrink-0 text-2xl text-ink-muted sm:block">{h.year}</span>
                    <span className="flex min-w-0 flex-col gap-1.5">
                      <span className="numeral text-lg text-ink-muted sm:hidden">{h.year}</span>
                      <span className="display-sm">{h.title}</span>
                      <span className="text-sm text-ink-muted">{h.text}</span>
                    </span>
                    {h.art && (
                      <span className="plate relative ml-auto aspect-square w-16 shrink-0 lg:hidden" aria-hidden="true">
                        <span className="absolute inset-1.5">
                          <ArtworkImage media={h.art.hero} sizes="64px" fill decorative />
                        </span>
                      </span>
                    )}
                  </>
                );
                return (
                  <li key={h.year} data-i={i + 1} className="heritage-item reveal border-t border-line-paper last:border-b">
                    {h.art ? (
                      <Link href={routes.artwork(h.art.slug)} className="group flex items-center gap-4 py-6 sm:gap-6">
                        {body}
                        <span className="sr-only">: view {h.art.title}</span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-4 py-6 sm:gap-6">{body}</div>
                    )}
                  </li>
                );
              })}
            </ol>
            <div className="relative hidden lg:col-span-5 lg:col-start-8 lg:block">
              <div className="plate sticky top-32 aspect-[4/5]">
                {heritage.map((h, i) => (
                  <div key={h.year} data-i={i + 1} className="heritage-img absolute inset-8" aria-hidden="true">
                    {h.art ? (
                      <ArtworkImage media={h.art.hero} sizes="(min-width: 64rem) 36vw, 1px" fill decorative />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
                        <p className="numeral text-7xl text-ink-muted">1291</p>
                        <p className="max-w-[16rem] text-sm text-ink-muted">Murano, across the lagoon from Venice.</p>
                      </div>
                    )}
                    {h.art && (
                      <p className="absolute inset-x-0 -bottom-6 translate-y-full text-sm text-ink-muted">
                        {h.art.title}
                        {h.art.heldBy ? ` · ${h.art.heldBy.institution}` : ""}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 — Study: one object, annotated (a preview of the object explorer) */}
      {study && (
        <section aria-labelledby="study-title" className="section-y bg-stage">
          <div className="container-gallery grid items-center gap-14 lg:grid-cols-12">
            <figure className="reveal lg:col-span-6">
              <div className="plate relative mx-auto max-h-[82svh] overflow-hidden" style={{ aspectRatio: `${study.hero.width} / ${study.hero.height}` }}>
                <ArtworkImage media={study.hero} sizes="(min-width: 64rem) 45vw, 92vw" fill />
                {study.hero.hotspots.map((h, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent bg-stage/55 font-display text-lg text-ivory shadow-[0_0_0_6px_rgb(197_164_109_/_0.18)] backdrop-blur-sm"
                    style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%` }}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>
              <figcaption className="mt-4 text-sm text-muted-dark">
                {study.title}, {study.dating?.displayLabel}
                {study.reference ? ` · ${study.reference.institution} · CC0` : ""}
              </figcaption>
            </figure>
            <div className="flex flex-col gap-8 lg:col-span-5 lg:col-start-8">
              <p className="reveal label eyebrow text-muted-dark">Look closer</p>
              <h2 id="study-title" className="reveal display-lg">
                {studyTechnique ? (
                  <>
                    {studyTechnique.term}, <span className="serif-italic text-accent">up close.</span>
                  </>
                ) : (
                  study.title
                )}
              </h2>
              {studyTechnique && <p className="reveal lede text-muted-dark">{studyTechnique.summary}</p>}
              <ol className="reveal flex flex-col border-t border-line-dark">
                {study.hero.hotspots.map((h, i) => (
                  <li key={i} className="flex gap-5 border-b border-line-dark py-5">
                    <span className="numeral w-6 text-xl text-accent">{i + 1}</span>
                    <span>
                      <span className="block text-on-dark">{h.label}</span>
                      <span className="mt-1 block text-sm text-muted-dark">{h.description}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="reveal flex flex-wrap items-center gap-x-8 gap-y-4">
                <Link href={routes.artwork(study.slug)} className="btn btn-ghost">
                  Open in the object explorer
                </Link>
                {studyTechnique && (
                  <ArrowLink href={routes.technique(studyTechnique.slug)} className="text-on-dark">
                    The technique
                  </ArrowLink>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7 — Collection areas: a typographic index */}
      <section aria-labelledby="areas-title" className="section-y border-t border-line-dark bg-raised">
        <div className="container-gallery">
          <div className="grid gap-8 lg:grid-cols-12">
            <p className="reveal label eyebrow text-muted-dark lg:col-span-3">Collection areas</p>
            <h2 id="areas-title" className="reveal display-lg lg:col-span-8 lg:col-start-5">
              Four areas, <span className="serif-italic">one standard</span> of documentation.
            </h2>
          </div>
          <ul className="mt-16 border-t border-line-dark lg:mt-24">
            {CATEGORIES.map((c, i) => {
              const n = counts[c.slug] ?? 0;
              const preview = AREA_PREVIEW[c.slug] ? bySlug.get(AREA_PREVIEW[c.slug]!) : undefined;
              return (
                <li key={c.slug} className="group reveal relative border-b border-line-dark">
                  <div className="grid items-baseline gap-x-8 gap-y-3 py-9 sm:grid-cols-[4rem_minmax(0,1fr)_auto] lg:grid-cols-[6rem_minmax(0,1fr)_minmax(0,22rem)_10rem] lg:py-12">
                    <span className="numeral text-xl text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="display-lg transition-transform duration-700 ease-[var(--ease-silk)] lg:group-hover:translate-x-4">
                      <Link href={routes.category(c.slug)} className="after:absolute after:inset-0 after:z-10">
                        {c.title}
                      </Link>
                    </h3>
                    <p className={`hidden text-sm text-muted-dark transition-opacity duration-500 lg:block ${preview ? "xl:group-hover:opacity-0" : ""}`}>{c.intro}</p>
                    <p className="label text-muted-dark sm:text-right">
                      {n > 0 ? `${n} ${n === 1 ? "work" : "works"}` : "In preparation"}
                    </p>
                  </div>
                  {preview && (
                    <div
                      aria-hidden="true"
                      className="plate pointer-events-none absolute top-1/2 right-[calc(10rem+4rem)] hidden aspect-[4/5] w-44 -translate-y-1/2 rotate-2 opacity-0 transition-all duration-500 ease-[var(--ease-silk)] group-hover:rotate-0 group-hover:opacity-100 xl:block"
                    >
                      <div className="absolute inset-3">
                        <ArtworkImage media={preview.hero} sizes="176px" fill decorative />
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 8 — Evidence: one claim leading to its source */}
      {evidence && (
        <section aria-labelledby="research-title" className="surface-ivory section-y">
          <div className="container-gallery grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="reveal label eyebrow text-ink-muted">Research &amp; provenance</p>
              <h2 id="research-title" className="reveal display-lg mt-6">
                Every claim leads to <span className="serif-italic">its evidence.</span>
              </h2>
              <p className="reveal mt-8 text-ink-muted">
                A signature is an observation, not a conclusion. We record what is written, what it may mean and how
                sure we are, and link it to the source.
              </p>
              <ArrowLink href={routes.attribution()} className="reveal mt-8">
                How we attribute
              </ArrowLink>
            </div>
            <div className="reveal lg:col-span-6 lg:col-start-7">
              <div className="grid gap-8 border border-line-paper bg-paper-2 p-6 sm:grid-cols-[9rem_minmax(0,1fr)] sm:p-10">
                <div className="plate relative w-28 self-start overflow-hidden sm:w-auto" style={{ aspectRatio: `${evidence.art.hero.width} / ${evidence.art.hero.height}` }}>
                  <ArtworkImage media={evidence.art.hero} sizes="144px" fill />
                </div>
                <div className="flex flex-col gap-4">
                  <p className="label text-ink-muted">Claim · {evidence.art.title}</p>
                  <p className="font-display text-3xl leading-tight">{evidence.claim.statement}</p>
                  <CertaintyBadge certainty={evidence.claim.certainty} tone="paper" explain />
                  {evidence.claim.publicNote && <p className="text-ink-muted">{evidence.claim.publicNote}</p>}
                  <p className="pt-2">
                    <Link href={`${routes.artwork(evidence.art.slug)}#attribution`} className="btn btn-ink">
                      See the evidence
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 9 — Invitation */}
      <section aria-labelledby="invite-title" className="section-y bg-stage">
        <div className="container-gallery grid items-center gap-14 lg:grid-cols-12">
          <div className="flex flex-col items-start gap-8 lg:col-span-5">
            <p className="reveal label eyebrow text-muted-dark">Enquiries</p>
            <h2 id="invite-title" className="reveal display-xl">
              A question about a piece, a maker <span className="serif-italic text-accent">or a mark?</span>
            </h2>
            <p className="reveal measure text-muted-dark">
              We welcome enquiries from collectors, researchers and anyone with information about the works.
            </p>
            <div className="reveal flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link href={routes.contact()} className="btn btn-primary">
                Get in touch
              </Link>
              <a href={`mailto:${SITE.email}`} className="link-quiet text-on-dark">
                {SITE.email}
              </a>
            </div>
          </div>
          {invitation && (
            <figure className="lg:col-span-7">
              <div className="overflow-hidden">
                <Link href={routes.artwork(invitation.slug)} className="reveal-img block" aria-label={`${invitation.title}: view the dossier`}>
                  <ArtworkImage media={invitation.hero} sizes="(min-width: 64rem) 55vw, 100vw" />
                </Link>
              </div>
              <figcaption className="mt-4 text-sm text-muted-dark">
                {invitation.title}, {invitation.datingLabel} · {invitation.attributionLine}
                {invitation.heldBy ? ` · ${invitation.heldBy.institution} · CC0` : ""}
              </figcaption>
            </figure>
          )}
        </div>
      </section>
    </>
  );
}
