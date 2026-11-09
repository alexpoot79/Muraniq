/** Visible marking for local demonstration records. */
export function FixtureNotice({ tone = "dark", compact = false }: { tone?: "dark" | "paper"; compact?: boolean }) {
  const cls =
    tone === "dark"
      ? "border-accent-deco/60 text-muted-dark"
      : "border-ink-muted/60 text-ink-muted";
  if (compact)
    return (
      <span className={`label inline-block border px-2 py-0.5 text-[0.6875rem] ${cls}`}>Demonstration record</span>
    );
  return (
    <p className={`border-l-2 pl-4 text-sm ${cls}`} role="note">
      <strong className="font-medium">Demonstration record.</strong> This dossier and its images are development
      placeholders, not an object in the MURANIQ collection.
    </p>
  );
}
