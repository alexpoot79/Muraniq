"use client";

/**
 * Previous / next buttons for the exhibition track. The track itself works
 * without JavaScript (native scroll snapping, swipe, Shift+wheel, arrow keys
 * when focused); these buttons are an enhancement for mouse users.
 */
export function ExhibitionControls({ trackId }: { trackId: string }) {
  const step = (dir: 1 | -1) => {
    const el = document.getElementById(trackId);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };
  const btn =
    "inline-flex h-12 w-12 items-center justify-center rounded-full border border-on-dark/30 bg-stage/60 text-on-dark backdrop-blur-sm transition-colors duration-300 hover:border-accent hover:text-accent";
  return (
    <div className="flex gap-3">
      <button type="button" className={btn} onClick={() => step(-1)} aria-label="Previous work" aria-controls={trackId}>
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M11 3 5 9l6 6" />
        </svg>
      </button>
      <button type="button" className={btn} onClick={() => step(1)} aria-label="Next work" aria-controls={trackId}>
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="m7 3 6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}
