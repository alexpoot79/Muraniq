"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { PublicMedia } from "@/content/public-projection";
import { ArtworkImage, ImageBackdrop } from "@/components/editorial/ArtworkImage";
import { VIEW_LABEL } from "@/lib/format";

const ZOOMS = [1, 1.75, 2.5, 3.5] as const;

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d={d} />
    </svg>
  );
}

/**
 * Object explorer.
 * - Inline: the photograph on its plate, view thumbnails (optimised, small),
 *   and optional numbered detail points that are always mirrored as text.
 * - Full screen opens only on request, in a native modal <dialog>: Escape closes,
 *   focus returns to the trigger, arrow keys switch views, +/- zoom, 0 resets.
 *   The full-resolution file is requested only when full screen is opened.
 * - Every drag/pinch action has a button alternative.
 */
export function Viewer({ media, title }: { media: PublicMedia[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showHotspots, setShowHotspots] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const titleId = useId();
  const current = media[index]!;
  const count = media.length;

  const select = useCallback((i: number) => {
    setIndex(i);
    setZoom(0);
    setPan({ x: 0, y: 0 });
  }, []);
  const go = useCallback((delta: number) => select((index + delta + count) % count), [count, index, select]);
  const setZoomLevel = (z: number) => {
    const next = Math.max(0, Math.min(ZOOMS.length - 1, z));
    setZoom(next);
    if (next === 0) setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "+" || e.key === "=") setZoomLevel(zoom + 1);
      else if (e.key === "-") setZoomLevel(zoom - 1);
      else if (e.key === "0") setZoomLevel(0);
      else return;
      e.preventDefault();
    };
    d.addEventListener("keydown", onKey);
    return () => d.removeEventListener("keydown", onKey);
  });

  const hotspots = current.hotspots;
  const ctrl =
    "inline-flex min-h-11 items-center gap-2.5 border border-line-dark px-4 text-[0.6875rem] font-medium tracking-[0.18em] uppercase text-on-dark transition-colors duration-300 hover:border-accent hover:text-accent disabled:opacity-40 disabled:hover:border-line-dark disabled:hover:text-on-dark";

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <figure className="plate relative flex items-center justify-center overflow-hidden px-4 py-6 sm:px-10 sm:py-10">
        <ImageBackdrop media={current} sizes="(min-width: 64rem) 52vw, 100vw" />
        <div className="relative mx-auto w-fit max-w-full shadow-[0_30px_80px_-30px_rgb(0_0_0_/_0.6)]">
          <ArtworkImage
            media={current}
            sizes="(min-width: 64rem) 52vw, 100vw"
            priority={index === 0}
            className="max-h-[72svh] w-auto max-w-full"
          />
          {showHotspots &&
            hotspots.map((h, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent bg-stage/60 font-display text-lg text-ivory shadow-[0_0_0_6px_rgb(197_164_109_/_0.18)] backdrop-blur-sm"
                style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%` }}
              >
                {i + 1}
              </span>
            ))}
        </div>
        <figcaption className="sr-only">{current.caption ?? current.alt}</figcaption>
      </figure>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="text-sm text-muted-dark" aria-live="polite">
          <span className="label text-[0.6875rem] text-on-dark">{VIEW_LABEL[current.viewType] ?? current.viewType}</span>
          {count > 1 && <span className="numeral ml-3 text-base">{`${index + 1} / ${count}`}</span>}
          {current.caption && <span className="block sm:ml-3 sm:inline">{current.caption}</span>}
        </p>
        <div className="flex flex-wrap gap-2">
          {hotspots.length > 0 && (
            <button type="button" className={ctrl} aria-pressed={showHotspots} onClick={() => setShowHotspots((s) => !s)}>
              <Icon d="M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Zm0 3.5v4M6 8h4" />
              {showHotspots ? "Hide" : "Show"} detail points
            </button>
          )}
          <button
            type="button"
            className={ctrl}
            onClick={() => {
              setFullscreen(true);
              dialogRef.current?.showModal();
            }}
          >
            <Icon d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
            View full screen
          </button>
        </div>
      </div>

      {count > 1 && (
        <ul className="relative flex min-w-0 gap-3 overflow-x-auto pb-1" aria-label="Views of this object">
          {media.map((m, i) => (
            <li key={m.id} className="shrink-0">
              <button
                type="button"
                onClick={() => select(i)}
                aria-pressed={i === index}
                className="group flex w-20 flex-col items-center gap-2 p-1 sm:w-24"
              >
                {/* Only the picture dims when not selected; the label keeps full contrast. */}
                <span
                  className={`plate relative block aspect-square w-full overflow-hidden transition-[box-shadow,opacity] duration-300 ${
                    i === index ? "shadow-[inset_0_0_0_1px_var(--color-accent)]" : "opacity-70 group-hover:opacity-100"
                  }`}
                >
                  <span className="absolute inset-1.5">
                    <ArtworkImage media={m} sizes="96px" fill decorative />
                  </span>
                </span>
                <span className={`text-[0.6875rem] tracking-wide ${i === index ? "text-on-dark" : "text-muted-dark"}`}>
                  {VIEW_LABEL[m.viewType] ?? m.viewType}
                </span>
                <span className="sr-only">: {m.alt}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {hotspots.length > 0 && (
        <details className="border-t border-line-dark pt-3" open={showHotspots}>
          <summary className="label cursor-pointer py-2 text-[0.6875rem] text-muted-dark">Detail points on this view (text)</summary>
          <ol className="mt-3 flex flex-col gap-4 text-sm">
            {hotspots.map((h, i) => (
              <li key={i} className="flex gap-4">
                <span className="numeral w-5 text-lg text-accent">{i + 1}</span>
                <span>
                  <span className="text-on-dark">{h.label}</span>
                  <span className="mt-0.5 block text-muted-dark">{h.description}</span>
                </span>
              </li>
            ))}
          </ol>
        </details>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-stage p-0 text-on-dark backdrop:bg-black"
        onClose={() => {
          setFullscreen(false);
          setZoom(0);
          setPan({ x: 0, y: 0 });
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-line-dark px-4 py-2 sm:px-8">
            <p id={titleId} className="truncate text-sm">
              <span className="font-display text-lg text-on-dark">{title}</span>
              <span className="text-muted-dark">
                {" "}
                · {VIEW_LABEL[current.viewType]} ({index + 1}/{count})
              </span>
            </p>
            <button
              type="button"
              autoFocus
              className="label inline-flex h-11 items-center gap-2 px-2 text-[0.6875rem]"
              onClick={() => dialogRef.current?.close()}
            >
              Close
              <Icon d="M3 3l10 10M13 3 3 13" />
            </button>
          </div>

          <div
            className={`relative flex flex-1 items-center justify-center overflow-hidden ${zoom > 0 ? "cursor-grab active:cursor-grabbing" : ""}`}
            onPointerDown={(e) => {
              if (zoom === 0) return;
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
            }}
            onPointerMove={(e) => {
              if (!drag.current) return;
              setPan({ x: drag.current.px + (e.clientX - drag.current.x), y: drag.current.py + (e.clientY - drag.current.y) });
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
            onDoubleClick={() => setZoomLevel(zoom === 0 ? 2 : 0)}
          >
            {fullscreen && (
              // eslint-disable-next-line @next/next/no-img-element -- full-resolution view requested by the visitor
              <img
                src={current.src}
                alt={current.alt}
                width={current.width}
                height={current.height}
                draggable={false}
                className="max-h-full max-w-full select-none object-contain transition-transform duration-300 ease-[var(--ease-gallery)]"
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${ZOOMS[zoom]})` }}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 border-t border-line-dark px-4 py-3">
            <button type="button" className={ctrl} onClick={() => go(-1)} disabled={count < 2}>
              <Icon d="M10 3 5 8l5 5" />
              Previous
            </button>
            <button type="button" className={ctrl} onClick={() => setZoomLevel(zoom - 1)} disabled={zoom === 0} aria-label="Zoom out">
              <Icon d="M3 8h10" />
            </button>
            <span className="numeral min-w-16 text-center text-lg text-muted-dark" aria-live="polite">
              {Math.round(ZOOMS[zoom]! * 100)}%
            </span>
            <button type="button" className={ctrl} onClick={() => setZoomLevel(zoom + 1)} disabled={zoom === ZOOMS.length - 1} aria-label="Zoom in">
              <Icon d="M3 8h10M8 3v10" />
            </button>
            <button type="button" className={ctrl} onClick={() => setZoomLevel(0)} disabled={zoom === 0}>
              Reset
            </button>
            <button type="button" className={ctrl} onClick={() => go(1)} disabled={count < 2}>
              Next
              <Icon d="m6 3 5 5-5 5" />
            </button>
          </div>
          <p className="sr-only">Use the arrow keys to change view, plus and minus to zoom, 0 to reset, Escape to close.</p>
        </div>
      </dialog>
    </div>
  );
}
