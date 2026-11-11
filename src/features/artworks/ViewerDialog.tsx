"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { PublicMedia } from "@/content/public-projection";

const ZOOMS = [1, 1.75, 2.5, 3.5] as const;

export function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d={d} />
    </svg>
  );
}

export const viewerControl =
  "inline-flex min-h-11 items-center gap-2.5 border border-line-dark px-4 text-[0.6875rem] font-medium tracking-[0.18em] uppercase text-on-dark transition-colors duration-300 hover:border-accent hover:text-accent disabled:opacity-40 disabled:hover:border-line-dark disabled:hover:text-on-dark";

/**
 * Full-screen image dialog shared by the object viewer and the signature
 * references. Mounted only while open, in a portal on <body> so it never
 * inherits the styles of the section that opened it (e.g. a paper surface).
 * A native modal <dialog>: Escape closes and the browser returns
 * focus to the control that opened it; arrow keys change view, +/- zoom,
 * 0 resets. Every drag action has a button. The full-resolution file is
 * requested only while the dialog is open, and is never cropped or altered:
 * it is shown whole (object-contain) and only scaled.
 */
export function ViewerDialog({
  open,
  onClose,
  media,
  index,
  onSelect,
  title,
  labelFor,
  aside,
}: {
  open: boolean;
  onClose: () => void;
  media: PublicMedia[];
  index: number;
  onSelect: (i: number) => void;
  title: string;
  labelFor: (m: PublicMedia) => string;
  /** Shown beside the image on wide screens and below it on narrow ones (transcription, credit). */
  aside?: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [zoom, setZoom] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const titleId = useId();
  const count = media.length;
  const current = media[Math.min(index, count - 1)];

  const setZoomLevel = (z: number) => {
    const next = Math.max(0, Math.min(ZOOMS.length - 1, z));
    setZoom(next);
    if (next === 0) setPan({ x: 0, y: 0 });
  };
  const go = (delta: number) => {
    setZoom(0);
    setPan({ x: 0, y: 0 });
    onSelect((index + delta + count) % count);
  };

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

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

  if (!open) return null;
  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-stage p-0 text-on-dark backdrop:bg-black"
      onClose={() => {
        setZoom(0);
        setPan({ x: 0, y: 0 });
        onClose();
      }}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-line-dark px-4 py-2 sm:px-8">
          <p id={titleId} className="truncate text-sm">
            <span className="font-display text-lg text-on-dark">{title}</span>
            {current && (
              <span className="text-muted-dark">
                {" "}
                · {labelFor(current)} ({index + 1}/{count})
              </span>
            )}
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

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div
            className={`relative flex min-h-0 flex-1 items-center justify-center overflow-hidden ${zoom > 0 ? "cursor-grab active:cursor-grabbing" : ""}`}
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
            {current && (
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
          {aside && (
            <div className="max-h-[38svh] shrink-0 overflow-y-auto border-t border-line-dark px-4 py-4 text-sm sm:px-8 lg:max-h-none lg:w-[24rem] lg:border-t-0 lg:border-l lg:py-6">
              {aside}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-line-dark px-4 py-3">
          <button type="button" className={viewerControl} onClick={() => go(-1)} disabled={count < 2}>
            <Icon d="M10 3 5 8l5 5" />
            Previous
          </button>
          <button type="button" className={viewerControl} onClick={() => setZoomLevel(zoom - 1)} disabled={zoom === 0} aria-label="Zoom out">
            <Icon d="M3 8h10" />
          </button>
          <span className="numeral min-w-16 text-center text-lg text-muted-dark" aria-live="polite">
            {Math.round(ZOOMS[zoom]! * 100)}%
          </span>
          <button
            type="button"
            className={viewerControl}
            onClick={() => setZoomLevel(zoom + 1)}
            disabled={zoom === ZOOMS.length - 1}
            aria-label="Zoom in"
          >
            <Icon d="M3 8h10M8 3v10" />
          </button>
          <button type="button" className={viewerControl} onClick={() => setZoomLevel(0)} disabled={zoom === 0}>
            Reset
          </button>
          <button type="button" className={viewerControl} onClick={() => go(1)} disabled={count < 2}>
            Next
            <Icon d="m6 3 5 5-5 5" />
          </button>
        </div>
        <p className="sr-only">Use the arrow keys to change view, plus and minus to zoom, 0 to reset, Escape to close.</p>
      </div>
    </dialog>,
    document.body,
  );
}
