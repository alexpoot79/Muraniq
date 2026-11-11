"use client";

import { useState } from "react";

/**
 * Optional filter on the makers overview. The list is rendered on the server;
 * this only hides makers without a published, photographed reference (CSS in
 * globals.css keyed on data attributes). Without JavaScript every maker shows.
 */
export function MakerListFilter({ total, withSignatures, children }: { total: number; withSignatures: number; children: React.ReactNode }) {
  const [only, setOnly] = useState(false);
  const button = (active: boolean) =>
    `min-h-11 border px-4 text-[0.6875rem] font-medium tracking-[0.16em] uppercase transition-colors duration-300 ${
      active ? "border-accent text-accent" : "border-line-dark text-on-dark hover:border-accent"
    }`;
  return (
    <div data-maker-filter={only ? "signatures" : "all"}>
      <div className="flex flex-wrap items-center gap-2 pt-10" role="group" aria-label="Filter makers">
        <button type="button" className={button(!only)} aria-pressed={!only} onClick={() => setOnly(false)}>
          All makers ({total})
        </button>
        <button type="button" className={button(only)} aria-pressed={only} onClick={() => setOnly(true)}>
          With signature references ({withSignatures})
        </button>
        <p className="sr-only" aria-live="polite">
          {only ? `Showing ${withSignatures} makers with signature references.` : `Showing all ${total} makers.`}
        </p>
      </div>
      {children}
    </div>
  );
}
