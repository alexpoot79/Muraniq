import { STATUS_EXPLANATION, STATUS_LABEL, type ResearchStatus } from "@/content/makers-directory";

const DOTS: Record<ResearchStatus, number> = {
  VERIFIED: 4,
  PARTIALLY_VERIFIED: 3,
  ATTRIBUTED: 2,
  DISPUTED: 1,
  UNVERIFIED: 0,
};

/** Research status, always written out; the dots only reinforce it. */
export function ResearchStatusBadge({
  status,
  tone = "dark",
  explain = false,
}: {
  status: ResearchStatus;
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
            <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < DOTS[status] ? on : off}`} />
          ))}
        </span>
        <span className="label text-label">{STATUS_LABEL[status]}</span>
      </span>
      {explain && (
        <span className={`text-sm ${tone === "dark" ? "text-muted-dark" : "text-ink-muted"}`}>{STATUS_EXPLANATION[status]}</span>
      )}
    </span>
  );
}
