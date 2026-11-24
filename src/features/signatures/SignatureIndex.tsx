"use client";

import { useState } from "react";
import type { PublicMedia } from "@/content/public-projection";
import { INDEX_GROUPS, type IndexEntry } from "@/content/signature-index";
import { ArtworkImage } from "@/components/editorial/ArtworkImage";
import { ViewerDialog } from "@/features/artworks/ViewerDialog";
import { VIEW_LABEL } from "@/lib/format";
import { APPLICATION_LABEL, GROUP_TEXT, TRANSCRIBED_FROM, certaintyWord, ownerLine } from "./labels";
import { Transcription } from "./SignatureGallery";

/** Who the mark is attributed to, in the wording its certainty allows; otherwise the recorded reading. */
function whoLine(e: IndexEntry): string | null {
  if (e.markKind && e.markOf) return ownerLine(e.markKind, e.markOf);
  if (e.interpretation) {
    const c = e.interpretation.certainty;
    return c ? `${e.interpretation.reading} (${certaintyWord[c].toLowerCase()})` : e.interpretation.reading;
  }
  return null;
}

function objectLink(e: IndexEntry): { href: string; external: boolean } | null {
  if (e.object.href) return { href: e.object.href, external: false };
  if (e.object.heldBy) return { href: e.object.heldBy.url, external: true };
  return null;
}

function AsWritten({ e, tone }: { e: IndexEntry; tone: "paper" | "dark" }) {
  const muted = tone === "paper" ? "text-ink-muted" : "text-muted-dark";
  if (!e.transcription) {
    return (
      <div>
        <p className={`label text-[0.625rem] ${muted}`}>As written</p>
        <p className={`mt-1 text-sm italic ${muted}`}>{e.transcriptionNote ?? "Not transcribed."}</p>
      </div>
    );
  }
  return (
    <div>
      <p className={`label text-[0.625rem] ${muted}`}>As written</p>
      <Transcription text={e.transcription} className={`mt-1 text-lg ${tone === "dark" ? "text-on-dark" : ""}`} />
    </div>
  );
}

function Facts({ e, tone }: { e: IndexEntry; tone: "paper" | "dark" }) {
  const muted = tone === "paper" ? "text-ink-muted" : "text-muted-dark";
  const obj = objectLink(e);
  const rows: Array<{ k: string; v: React.ReactNode }> = [];
  if (e.transcriptionCertainty) rows.push({ k: "Reading", v: certaintyWord[e.transcriptionCertainty] });
  if (e.location) rows.push({ k: "Where", v: e.location.charAt(0).toUpperCase() + e.location.slice(1) });
  rows.push({
    k: "On",
    v: (
      <>
        {obj ? (
          <a href={obj.href} className="link-quiet" rel={obj.external ? "noopener" : undefined}>
            {e.object.title}
          </a>
        ) : (
          e.object.title
        )}
        {e.object.dateLabel && <span className={muted}> · {e.object.dateLabel}</span>}
      </>
    ),
  });
  if (e.dating) rows.push({ k: "This example", v: `${e.dating.label} · ${certaintyWord[e.dating.certainty]}` });
  if (e.object.heldBy)
    rows.push({
      k: "Held by",
      v: `${e.object.heldBy.institution}, ${e.object.heldBy.identifier}${e.object.inCollection ? "" : " (not in the MURANIQ collection)"}`,
    });
  return (
    <dl className="grid grid-cols-[minmax(6.5rem,auto)_1fr] gap-x-4 gap-y-1.5 text-sm">
      {rows.map((r) => (
        <div key={r.k} className="contents">
          <dt className={`label pt-0.5 text-[0.625rem] ${muted}`}>{r.k}</dt>
          <dd>{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}

function ProfileLinks({ e, className = "" }: { e: IndexEntry; className?: string }) {
  return (
    <>
      {e.profiles.map((p) => (
        <a key={p.href} href={p.href} className={`link-quiet text-sm ${className}`}>
          {p.name} profile<span className="sr-only">: this reference among the signatures and marks</span>
        </a>
      ))}
    </>
  );
}

type Slide = { media: PublicMedia; entry: IndexEntry; isDetail: boolean };

/**
 * The combined index: one section per kind, photographed examples as cards,
 * references known only from a source as a text list, and one shared viewer
 * for every photograph on the page.
 */
export function SignatureIndex({ entries }: { entries: IndexEntry[] }) {
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const groups = INDEX_GROUPS
    .map((g) => ({ group: g, items: entries.filter((e) => e.group === g) }))
    .filter((g) => g.items.length > 0);

  const slides: Slide[] = groups.flatMap((g) =>
    g.items
      .filter((e) => e.photo)
      .flatMap((entry) => [
        { media: entry.photo!.detail, entry, isDetail: true },
        ...entry.photo!.views.map((m) => ({ media: m, entry, isDetail: false })),
      ]),
  );
  const current = slides[Math.min(slide, slides.length - 1)];
  const enlarge = (id: string) => {
    setSlide(Math.max(0, slides.findIndex((x) => x.entry.id === id)));
    setOpen(true);
  };

  return (
    <div className="flex flex-col gap-20 lg:gap-28">
      {groups.map(({ group, items }) => {
        const withPhoto = items.filter((e) => e.photo);
        const textOnly = items.filter((e) => !e.photo);
        const { title, intro } = GROUP_TEXT[group];
        return (
          <section key={group} id={group} aria-labelledby={`${group}-title`} className="scroll-mt-24 border-t border-line-paper pt-12 lg:pt-16">
            <div className="grid gap-6 md:grid-cols-12">
              <div className="md:col-span-4">
                <h2 id={`${group}-title`} className="display-lg">
                  {title}
                </h2>
                <p className="label mt-3 text-[0.6875rem] text-ink-muted">
                  {items.length} {items.length === 1 ? "example" : "examples"}
                </p>
              </div>
              <p className="measure md:col-span-8">{intro}</p>
            </div>

            {withPhoto.length > 0 && (
              <ul className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3" aria-label={`${title}, photographed examples`}>
                {withPhoto.map((e) => {
                  const who = whoLine(e);
                  const obj = objectLink(e);
                  return (
                    <li key={e.id} id={e.anchor} className="flex scroll-mt-28 flex-col gap-5">
                      {/* Pointer shortcut only; the Enlarge button below is the accessible control. */}
                      <div className="plate relative aspect-[4/3] cursor-zoom-in overflow-hidden" onClick={() => enlarge(e.id)}>
                        <div className="absolute inset-3">
                          <ArtworkImage media={e.photo!.detail} sizes="(min-width: 80rem) 28vw, (min-width: 40rem) 44vw, 92vw" fill />
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <p className="label text-[0.6875rem] text-ink-muted">
                          {e.kindLabel}
                          {e.application && (
                            <>
                              {" "}
                              <span aria-hidden="true">·</span> {APPLICATION_LABEL[e.application]}
                            </>
                          )}
                        </p>
                        <h3 className="font-display text-2xl leading-tight">{e.markOf?.name ?? e.title}</h3>
                        {e.markOf && <p className="-mt-2 text-sm text-ink-muted">{e.title}</p>}
                        <AsWritten e={e} tone="paper" />
                        {who && <p className="text-sm">{who}</p>}
                        <Facts e={e} tone="paper" />
                        <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-3">
                          <button type="button" className="btn btn-ink btn-sm" onClick={() => enlarge(e.id)}>
                            Enlarge<span className="sr-only">: {e.title}</span>
                          </button>
                          <ProfileLinks e={e} />
                          {obj && (
                            <a href={obj.href} className="link-quiet text-sm" rel={obj.external ? "noopener" : undefined}>
                              View object<span className="sr-only">: {e.object.title}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {textOnly.length > 0 && (
              <div className="mt-14">
                <h3 className="label text-[0.6875rem] text-ink-muted">Recorded in sources, no photograph yet</h3>
                <ul className="mt-3 flex flex-col border-t border-line-paper">
                  {textOnly.map((e) => {
                    const who = whoLine(e);
                    return (
                      <li key={e.id} id={e.anchor} className="grid scroll-mt-28 gap-3 border-b border-line-paper py-6 md:grid-cols-12">
                        <div className="md:col-span-5">
                          <p className="label text-[0.6875rem] text-ink-muted">
                            {e.kindLabel}
                            {e.application && (
                              <>
                                {" "}
                                <span aria-hidden="true">·</span> {APPLICATION_LABEL[e.application]}
                              </>
                            )}
                          </p>
                          {e.transcription ? (
                            <Transcription text={e.transcription} className="mt-2 text-lg" />
                          ) : (
                            <p className="mt-2 font-display text-xl">{e.title}</p>
                          )}
                          <p className="mt-2 text-sm text-ink-muted">{TRANSCRIBED_FROM[e.transcribedFrom]}.</p>
                        </div>
                        <div className="flex flex-col gap-3 md:col-span-7">
                          {who && <p className="text-sm">{who}</p>}
                          <Facts e={e} tone="paper" />
                          <div className="flex flex-wrap gap-x-6 gap-y-2">
                            <ProfileLinks e={e} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>
        );
      })}

      {slides.length > 0 && current && (
        <ViewerDialog
          open={open}
          onClose={() => setOpen(false)}
          media={slides.map((x) => x.media)}
          index={Math.min(slide, slides.length - 1)}
          onSelect={setSlide}
          title={current.entry.markOf?.name ? `${current.entry.markOf.name}: ${current.entry.title}` : current.entry.title}
          labelFor={(m) => {
            const x = slides.find((y) => y.media === m);
            return x?.isDetail ? "Mark, detail" : `${VIEW_LABEL[m.viewType] ?? "View"}, whole`;
          }}
          aside={<SlideInfo slide={current} />}
        />
      )}
    </div>
  );
}

function SlideInfo({ slide }: { slide: Slide }) {
  const { entry: e, media: m, isDetail } = slide;
  const who = whoLine(e);
  return (
    <div className="flex flex-col gap-4">
      <p className="label text-[0.6875rem] text-muted-dark">
        {e.kindLabel}
        {e.application && ` · ${APPLICATION_LABEL[e.application]}`}
      </p>
      <AsWritten e={e} tone="dark" />
      {e.transcription && e.transcriptionNote && <p className="text-muted-dark">{e.transcriptionNote}</p>}
      {e.transcription && <p className="-mt-2 text-muted-dark">{TRANSCRIBED_FROM[e.transcribedFrom]}.</p>}
      {who && <p className="text-on-dark">{who}</p>}
      <Facts e={e} tone="dark" />
      <div className="border-t border-line-dark pt-3 text-muted-dark">
        <p>{m.credit}</p>
        {isDetail && m.cropOf && (
          <p className="mt-1">
            A detail cut from the full photograph, with no other changes.
            {m.sourceUrl && (
              <>
                {" "}
                <a href={m.sourceUrl} className="link-quiet text-on-dark" rel="noopener">
                  Original photograph<span className="sr-only"> (opens the holder’s image)</span>
                </a>
              </>
            )}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <ProfileLinks e={e} className="text-on-dark" />
      </div>
    </div>
  );
}
