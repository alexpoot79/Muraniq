/** Honest editorial status for texts that are not yet reviewed against sources. */
export function EditorialStatus({ status, tone = "paper" }: { status: string; tone?: "paper" | "dark" }) {
  const text: Record<string, string> = {
    draft_unsourced: "Editorial draft. Sources are still being added; treat this as a general introduction.",
    pending_migration:
      "The biography from the current MURANIQ website is being migrated and checked against sources before it is republished here.",
    reference_only:
      "Reference profile. It states only what the museum holding the work records; a full biography has not been written yet.",
    migrated_unreviewed:
      "This biography is carried over from the previous MURANIQ website and is being checked against published sources.",
  };
  const t = text[status];
  if (!t) return null;
  return (
    <p
      role="note"
      className={`border-l pl-5 text-sm ${tone === "paper" ? "border-ink-muted/60 text-ink-muted" : "border-accent/45 text-muted-dark"}`}
    >
      {t}
    </p>
  );
}
