import type { Certainty } from "@/content/schemas";
import { CERTAINTY_EXPLANATION, CERTAINTY_LABEL } from "@/features/artworks/attribution";

const DOTS: Record<Certainty, number> = {
  verified: 4,
  documented_attribution: 3,
  probable: 2,
  hypothesis: 1,
  unknown: 0,
};

/** Certainty is always written out; the dots are decorative reinforcement. */
export function CertaintyBadge({
  certainty,
  tone = "dark",
  explain = false,
}: {
  certainty: Certainty;
  tone?: "dark" | "paper";
  explain?: boolean;
}) {
  const on = tone === "dark" ? "bg-accent" : "bg-ink";
  const off = tone === "dark" ? "bg-line-dark" : "bg-line-paper";
  return (
    <span className="inline-flex flex-col gap-1">
      <span className="inline-flex items-center gap-2">
        <span aria-hidden="true" className="inline-flex gap-[3px]">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < DOTS[certainty] ? on : off}`} />
          ))}
        </span>
        <span className="label">{CERTAINTY_LABEL[certainty]}</span>
      </span>
      {explain && (
        <span className={`text-sm ${tone === "dark" ? "text-muted-dark" : "text-ink-muted"}`}>
          {CERTAINTY_EXPLANATION[certainty]}
        </span>
      )}
    </span>
  );
}
