"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { PublicMedia } from "@/content/public-projection";
import { ArtworkImage } from "@/components/editorial/ArtworkImage";
import { VIEW_LABEL } from "@/lib/format";

const ZOOMS = [1, 1.75, 2.5, 3.5] as const;

/**
 * Object viewer.
 * - Inline: main image + thumbnail buttons (no gestures required).
 * - Fullscreen opens only on request, in a native modal <dialog>: Escape closes,
 *   focus returns to the trigger, arrow keys switch views, +/- zoom, 0 resets.
 * - Every drag/pinch action has a button alternative.
 * - Detail hotspots are off by default and always mirrored as a text list.
 */
export function Viewer({ media, title }: { media: PublicMedia[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showHotspots, setShowHotspots] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const titleId = useId();
  const current = media[index]!;
  const count = media.length;

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + count) % count);
      setZoom(0);
      setPan({ x: 0, y: 0 });
    },
    [count],
  );
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

  return (
    <div className="flex flex-col gap-4">
      <figure className="relative bg-raised">
        <div className="relative mx-auto w-fit">
          <ArtworkImage
            media={current}
            sizes="(min-width: 64rem) 58vw, 100vw"
            priority={index === 0}
            className="max-h-[82vh] w-auto"
          />
          {showHotspots &&
            hotspots.map((h, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-on-dark bg-stage/70 text-xs text-on-dark"
                style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%` }}
              >
                {i + 1}
              </span>
            ))}
        </div>
        <figcaption className="sr-only">{current.caption ?? current.alt}</figcaption>
      </figure>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-dark" aria-live="polite">
          <span className="text-on-dark">{VIEW_LABEL[current.viewType] ?? current.viewType}</span>
          {count > 1 && ` · ${index + 1} of ${count}`}
          {current.caption && <span className="block sm:inline sm:before:content-['_—_']">{current.caption}</span>}
        </p>
        <div className="flex flex-wrap gap-2">
          {hotspots.length > 0 && (
            <button
              type="button"
              className="btn btn-ghost min-h-11 px-4 py-2 text-xs"
              aria-pressed={showHotspots}
              onClick={() => setShowHotspots((s) => !s)}
            >
              {showHotspots ? "Hide" : "Show"} detail points
            </button>
          )}
          <button
            type="button"
            className="btn btn-ghost min-h-11 px-4 py-2 text-xs"
            onClick={() => dialogRef.current?.showModal()}
          >
            View full screen
          </button>
        </div>
      </div>

      {count > 1 && (
        <ul className="flex gap-3 overflow-x-auto pb-1" aria-label="Views of this object">
          {media.map((m, i) => (
            <li key={m.id} className="shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIndex(i);
                  setZoom(0);
                  setPan({ x: 0, y: 0 });
                }}
                aria-pressed={i === index}
                className={`flex w-20 flex-col items-center gap-1.5 border p-1 transition-colors sm:w-24 ${
                  i === index ? "border-accent" : "border-line-dark hover:border-muted-dark"
                }`}
              >
                <span className="flex aspect-square w-full items-center justify-center overflow-hidden bg-raised">
                  {/* eslint-disable-next-line @next/next/no-img-element -- tiny local thumbnails */}
                  <img src={m.src} alt="" className="max-h-full max-w-full object-contain" loading="lazy" />
                </span>
                <span className="text-xs text-muted-dark">{VIEW_LABEL[m.viewType] ?? m.viewType}</span>
                <span className="sr-only">: {m.alt}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {hotspots.length > 0 && (
        <details className="border-t border-line-dark pt-3" open={showHotspots}>
          <summary className="label cursor-pointer py-2 text-muted-dark">Detail points on this view (text)</summary>
          <ol className="mt-2 flex flex-col gap-3 text-sm">
            {hotspots.map((h, i) => (
              <li key={i}>
                <span className="text-on-dark">
                  {i + 1}. {h.label}
                </span>{" "}
                <span className="text-muted-dark">— {h.description}</span>
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
          setZoom(0);
          setPan({ x: 0, y: 0 });
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-line-dark px-4 py-2 sm:px-6">
            <p id={titleId} className="truncate text-sm">
              <span className="text-on-dark">{title}</span>
              <span className="text-muted-dark">
                {" "}
                — {VIEW_LABEL[current.viewType]} ({index + 1}/{count})
              </span>
            </p>
            <button
              type="button"
              autoFocus
              className="label inline-flex h-11 items-center gap-2 px-2"
              onClick={() => dialogRef.current?.close()}
            >
              Close
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3l12 12M15 3 3 15" />
              </svg>
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
            {/* eslint-disable-next-line @next/next/no-img-element -- full-resolution view requested by the visitor */}
            <img
              src={current.src}
              alt={current.alt}
              width={current.width}
              height={current.height}
              draggable={false}
              className="max-h-full max-w-full select-none object-contain transition-transform duration-200 ease-[var(--ease-gallery)]"
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${ZOOMS[zoom]})` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 border-t border-line-dark px-4 py-3">
            <button type="button" className="btn btn-ghost min-h-11 px-4 py-2 text-xs" onClick={() => go(-1)} disabled={count < 2}>
              Previous
            </button>
            <button
              type="button"
              className="btn btn-ghost min-h-11 px-4 py-2 text-xs"
              onClick={() => setZoomLevel(zoom - 1)}
              disabled={zoom === 0}
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="min-w-14 text-center text-sm text-muted-dark" aria-live="polite">
              {Math.round(ZOOMS[zoom]! * 100)}%
            </span>
            <button
              type="button"
              className="btn btn-ghost min-h-11 px-4 py-2 text-xs"
              onClick={() => setZoomLevel(zoom + 1)}
              disabled={zoom === ZOOMS.length - 1}
              aria-label="Zoom in"
            >
              +
            </button>
            <button type="button" className="btn btn-ghost min-h-11 px-4 py-2 text-xs" onClick={() => setZoomLevel(0)} disabled={zoom === 0}>
              Reset
            </button>
            <button type="button" className="btn btn-ghost min-h-11 px-4 py-2 text-xs" onClick={() => go(1)} disabled={count < 2}>
              Next
            </button>
          </div>
          <p className="sr-only">Use the arrow keys to change view, plus and minus to zoom, 0 to reset, Escape to close.</p>
        </div>
      </dialog>
    </div>
  );
}
