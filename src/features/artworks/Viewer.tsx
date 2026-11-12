"use client";

import { useCallback, useState } from "react";
import type { PublicMedia } from "@/content/public-projection";
import { ArtworkImage, ImageBackdrop } from "@/components/editorial/ArtworkImage";
import { VIEW_LABEL } from "@/lib/format";
import { Icon, ViewerDialog, viewerControl } from "./ViewerDialog";

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
  const [showHotspots, setShowHotspots] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const current = media[index]!;
  const count = media.length;

  const select = useCallback((i: number) => setIndex(i), []);

  const hotspots = current.hotspots;
  const ctrl = viewerControl;

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <figure className="plate relative flex items-center justify-center overflow-hidden px-3 py-3 sm:px-8 sm:py-6">
        <ImageBackdrop media={current} sizes="(min-width: 64rem) 52vw, 100vw" />
        <div className="relative mx-auto w-fit max-w-full">
          <ArtworkImage
            media={current}
            sizes="(min-width: 64rem) 52vw, 100vw"
            priority={index === 0}
            className="max-h-[74svh] w-auto max-w-full [--feather:6%]"
            feather
          />
          {showHotspots &&
            hotspots.map((h, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent bg-stage/75 font-display text-lg text-ivory ring-1 ring-ivory/40"
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
          <span className="label text-label text-on-dark">{VIEW_LABEL[current.viewType] ?? current.viewType}</span>
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
            onClick={() => setFullscreen(true)}
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
                <span className={`text-label tracking-wide ${i === index ? "text-on-dark" : "text-muted-dark"}`}>
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
          <summary className="label cursor-pointer py-2 text-label text-muted-dark">Detail points on this view (text)</summary>
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

      <ViewerDialog
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        media={media}
        index={index}
        onSelect={select}
        title={title}
        labelFor={(m) => VIEW_LABEL[m.viewType] ?? m.viewType}
      />
    </div>
  );
}
