/** Honest editorial status for texts that are not yet reviewed against sources. */
export function EditorialStatus({ status, tone = "paper" }: { status: string; tone?: "paper" | "dark" }) {
  const text: Record<string, string> = {
    draft_unsourced: "Editorial draft. Sources are still being added; treat this as a general introduction.",
    pending_migration:
      "The biography from the current MURANIQ website is being migrated and checked against sources before it is republished here.",
    migrated_unreviewed: "Migrated text, not yet reviewed against sources.",
  };
  const t = text[status];
  if (!t) return null;
  return (
    <p
      role="note"
      className={`border-l-2 pl-4 text-sm ${tone === "paper" ? "border-ink-muted text-ink-muted" : "border-accent-deco text-muted-dark"}`}
    >
      {t}
    </p>
  );
}
