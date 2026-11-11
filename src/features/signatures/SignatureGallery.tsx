"use client";

import { useMemo, useState } from "react";
import type { PublicMedia } from "@/content/public-projection";
import type { MakerSignature, SignatureSourceRef } from "@/content/signatures";
import type { MarkKind } from "@/content/schemas";
import { ArtworkImage } from "@/components/editorial/ArtworkImage";
import { ViewerDialog } from "@/features/artworks/ViewerDialog";
import { VIEW_LABEL } from "@/lib/format";
import {
  APPLICATION_LABEL,
  KIND_LABEL,
  TRANSCRIBED_FROM,
  certaintyWord,
  contextLine,
  ownerLine,
  transcriptionLines,
} from "./labels";

function sourceTitle(r: SignatureSourceRef) {
  const s = r.source;
  return [s.publisher, s.title].filter(Boolean).join(", ");
}

function Transcription({ text, className = "" }: { text: string; className?: string }) {
  const lines = transcriptionLines(text);
  return (
    <p className={`font-mono text-[0.95em] leading-relaxed ${className}`}>
      {lines.map((l, i) => (
        <span key={i} className="block">
          {l}
          {i < lines.length - 1 && <span className="sr-only"> / </span>}
        </span>
      ))}
    </p>
  );
}

function relationLine(s: MakerSignature, makerName: string) {
  return s.relation === "own" ? ownerLine(s.kind, s.markOf) : contextLine(s, makerName);
}

/** Link to the documented object: the on-site dossier when there is one, otherwise the holder's record. */
function objectLink(s: MakerSignature): { href: string; external: boolean } | null {
  if (s.object.href) return { href: s.object.href, external: false };
  if (s.object.heldBy) return { href: s.object.heldBy.url, external: true };
  return null;
}

function Facts({ s, tone }: { s: MakerSignature; tone: "paper" | "dark" }) {
  const muted = tone === "paper" ? "text-ink-muted" : "text-muted-dark";
  const rows = [
    s.transcriptionCertainty && { k: "Reading", v: certaintyWord[s.transcriptionCertainty] },
    s.dating && { k: "This example", v: `${s.dating.label} · ${certaintyWord[s.dating.certainty]}` },
    s.variantPeriod && { k: "Period of use", v: `${s.variantPeriod.label} · ${certaintyWord[s.variantPeriod.certainty]}` },
    s.object.heldBy && {
      k: "Held by",
      v: `${s.object.heldBy.institution}, ${s.object.heldBy.identifier}${s.object.inCollection ? "" : " (not in the MURANIQ collection)"}`,
    },
  ].filter((x): x is { k: string; v: string } => !!x);
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

type Slide = { media: PublicMedia; item: MakerSignature; isDetail: boolean };

/**
 * The full "Signatures & Marks" list on a maker profile: photo cards with an
 * Enlarge action that opens the shared image dialog, text references for
 * marks known only from sources, and filters when they distinguish anything.
 */
export function SignatureGallery({ items, makerName }: { items: MakerSignature[]; makerName: string }) {
  const kinds = useMemo(() => [...new Set(items.map((s) => s.kind))], [items]);
  const periods = useMemo(
    () => [...new Set(items.map((s) => s.variantPeriod?.label).filter((x): x is string => !!x))],
    [items],
  );
  const [kind, setKind] = useState<MarkKind | null>(null);
  const [period, setPeriod] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);

  const shown = items.filter((s) => (!kind || s.kind === kind) && (!period || s.variantPeriod?.label === period));
  const withPhoto = shown.filter((s) => s.photo);
  const textOnly = shown.filter((s) => !s.photo);
  const slides: Slide[] = withPhoto.flatMap((item) => [
    { media: item.photo!.detail, item, isDetail: true },
    ...item.photo!.views.map((m) => ({ media: m, item, isDetail: false })),
  ]);
  const current = slides[slide];

  const enlarge = (id: string) => {
    setSlide(Math.max(0, slides.findIndex((x) => x.item.id === id)));
    setOpen(true);
  };

  const filterButton = (active: boolean) =>
    `min-h-11 border px-4 text-[0.6875rem] font-medium tracking-[0.16em] uppercase transition-colors duration-300 ${
      active ? "border-ink bg-ink text-paper" : "border-line-paper text-ink hover:border-ink"
    }`;

  return (
    <div className="flex flex-col gap-10">
      {(kinds.length > 1 || periods.length > 1) && (
        <div className="flex flex-col gap-4" role="group" aria-label="Filter signature references">
          {kinds.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="label mr-2 text-[0.6875rem] text-ink-muted">Kind</span>
              <button type="button" className={filterButton(kind === null)} aria-pressed={kind === null} onClick={() => setKind(null)}>
                All
              </button>
              {kinds.map((k) => (
                <button key={k} type="button" className={filterButton(kind === k)} aria-pressed={kind === k} onClick={() => setKind(k)}>
                  {KIND_LABEL[k]}
                </button>
              ))}
            </div>
          )}
          {periods.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="label mr-2 text-[0.6875rem] text-ink-muted">Period of use</span>
              <button type="button" className={filterButton(period === null)} aria-pressed={period === null} onClick={() => setPeriod(null)}>
                All
              </button>
              {periods.map((p) => (
                <button key={p} type="button" className={filterButton(period === p)} aria-pressed={period === p} onClick={() => setPeriod(p)}>
                  {p}
                </button>
              ))}
            </div>
          )}
          <p className="text-sm text-ink-muted" aria-live="polite">
            Showing {shown.length} of {items.length} {items.length === 1 ? "reference" : "references"}.
          </p>
        </div>
      )}

      {withPhoto.length > 0 && (
        <ul
          className={`grid gap-x-8 gap-y-12 ${withPhoto.length === 1 ? "" : withPhoto.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3"}`}
          aria-label="Photographed examples"
        >
          {withPhoto.map((s) => {
            const obj = objectLink(s);
            const src = s.sources[0];
            return (
              <li
                key={s.id}
                id={`sig-${s.id}`}
                className={`flex scroll-mt-28 flex-col gap-5 ${withPhoto.length === 1 ? "md:grid md:grid-cols-12 md:gap-10" : ""}`}
              >
                {/* Pointer shortcut only; the Enlarge button below is the accessible control. */}
                <div
                  className={`plate relative aspect-[4/3] cursor-zoom-in overflow-hidden ${withPhoto.length === 1 ? "md:col-span-6" : ""}`}
                  onClick={() => enlarge(s.id)}
                >
                  <div className="absolute inset-3">
                    <ArtworkImage
                      media={s.photo!.detail}
                      sizes={withPhoto.length === 1 ? "(min-width: 48rem) 45vw, 92vw" : "(min-width: 80rem) 28vw, (min-width: 40rem) 44vw, 92vw"}
                      fill
                    />
                  </div>
                </div>
                <div className={`flex flex-col gap-3 ${withPhoto.length === 1 ? "md:col-span-6" : ""}`}>
                  <p className="label text-[0.6875rem] text-ink-muted">
                    {KIND_LABEL[s.kind]} <span aria-hidden="true">·</span> {APPLICATION_LABEL[s.application]}
                  </p>
                  <h3 className="font-display text-2xl leading-tight">{s.title}</h3>
                  {s.transcription && (
                    <div>
                      <p className="label text-[0.625rem] text-ink-muted">As written</p>
                      <Transcription text={s.transcription} className="mt-1" />
                    </div>
                  )}
                  <p className="text-sm">{relationLine(s, makerName)}</p>
                  <Facts s={s} tone="paper" />
                  {src && (
                    <p className="text-sm text-ink-muted">
                      Source: {sourceTitle(src)}
                      {src.consultedOn && `, consulted ${src.consultedOn}`}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <button type="button" className="btn btn-ink btn-sm" onClick={() => enlarge(s.id)}>
                      Enlarge<span className="sr-only">: {s.title}</span>
                    </button>
                    {src?.source.url && (
                      <a href={src.source.url} className="link-quiet text-sm" rel="noopener">
                        View source<span className="sr-only">: {sourceTitle(src)}</span>
                      </a>
                    )}
                    {obj && (
                      <a href={obj.href} className="link-quiet text-sm" rel={obj.external ? "noopener" : undefined}>
                        View documented object<span className="sr-only">: {s.object.title}</span>
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
        <div>
          <h3 className="label text-[0.6875rem] text-ink-muted">Recorded in sources</h3>
          <ul className="mt-3 flex flex-col border-t border-line-paper">
            {textOnly.map((s) => {
              const obj = objectLink(s);
              const src = s.sources[0];
              return (
                <li key={s.id} id={`sig-${s.id}`} className="grid scroll-mt-28 gap-3 border-b border-line-paper py-6 md:grid-cols-12">
                  <div className="md:col-span-5">
                    <p className="label text-[0.6875rem] text-ink-muted">
                      {KIND_LABEL[s.kind]} <span aria-hidden="true">·</span> {APPLICATION_LABEL[s.application]}
                    </p>
                    {s.transcription ? (
                      <Transcription text={s.transcription} className="mt-2 text-lg" />
                    ) : (
                      <p className="mt-2 font-display text-xl">{s.title}</p>
                    )}
                    <p className="mt-2 text-sm text-ink-muted">{TRANSCRIBED_FROM[s.transcribedFrom]}.</p>
                  </div>
                  <div className="flex flex-col gap-3 md:col-span-7">
                    <p className="text-sm">{relationLine(s, makerName)}</p>
                    <Facts s={s} tone="paper" />
                    {src && (
                      <p className="text-sm text-ink-muted">
                        Source:{" "}
                        {src.source.url ? (
                          <a href={src.source.url} className="link-quiet" rel="noopener">
                            {sourceTitle(src)}
                          </a>
                        ) : (
                          sourceTitle(src)
                        )}
                        {src.note && <span className="block">{src.note}</span>}
                      </p>
                    )}
                    {obj && (
                      <p className="text-sm">
                        <a href={obj.href} className="link-quiet" rel={obj.external ? "noopener" : undefined}>
                          View documented object<span className="sr-only">: {s.object.title}</span>
                        </a>
                      </p>
                    )}
                    <p className="text-sm text-ink-muted">No photograph of this mark can be shown yet.</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {slides.length > 0 && (
        <ViewerDialog
          open={open}
          onClose={() => setOpen(false)}
          media={slides.map((x) => x.media)}
          index={Math.min(slide, slides.length - 1)}
          onSelect={setSlide}
          title={current ? current.item.title : makerName}
          labelFor={(m) => {
            const x = slides.find((y) => y.media === m);
            return x?.isDetail ? "Mark, detail" : `${VIEW_LABEL[m.viewType] ?? "View"}, whole`;
          }}
          aside={current && <SlideInfo slide={current} makerName={makerName} />}
        />
      )}
    </div>
  );
}

function SlideInfo({ slide, makerName }: { slide: Slide; makerName: string }) {
  const { item: s, media: m, isDetail } = slide;
  const obj = objectLink(s);
  const src = s.sources[0];
  return (
    <div className="flex flex-col gap-4">
      <p className="label text-[0.6875rem] text-muted-dark">
        {KIND_LABEL[s.kind]} · {APPLICATION_LABEL[s.application]}
      </p>
      {s.transcription && (
        <div>
          <p className="label text-[0.625rem] text-muted-dark">As written</p>
          <Transcription text={s.transcription} className="mt-1 text-on-dark" />
          {s.transcriptionNote && <p className="mt-2 text-muted-dark">{s.transcriptionNote}</p>}
          <p className="mt-1 text-muted-dark">{TRANSCRIBED_FROM[s.transcribedFrom]}.</p>
        </div>
      )}
      {s.interpretation && (
        <p className="text-muted-dark">
          <span className="text-on-dark">Reading:</span> {s.interpretation.reading} ({certaintyWord[s.interpretation.certainty].toLowerCase()})
        </p>
      )}
      <p className="text-on-dark">{relationLine(s, makerName)}</p>
      <Facts s={s} tone="dark" />
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
        {src?.source.url && (
          <a href={src.source.url} className="link-quiet text-on-dark" rel="noopener">
            View source<span className="sr-only">: {sourceTitle(src)}</span>
          </a>
        )}
        {obj && (
          <a href={obj.href} className="link-quiet text-on-dark" rel={obj.external ? "noopener" : undefined}>
            View documented object<span className="sr-only">: {s.object.title}</span>
          </a>
        )}
      </div>
    </div>
  );
}
