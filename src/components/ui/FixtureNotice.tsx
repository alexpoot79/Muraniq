type HeldBy = { institution: string; accessionNumber: string; url?: string };

/**
 * Visible marking for records that are not MURANIQ collection objects:
 * reference works held by a museum (shown with that museum's CC0 photograph),
 * or plain local demonstration records.
 */
export function FixtureNotice({
  tone = "dark",
  compact = false,
  heldBy,
}: {
  tone?: "dark" | "paper";
  compact?: boolean;
  heldBy?: HeldBy | null;
}) {
  const border = tone === "dark" ? "border-accent/45" : "border-ink-muted/50";
  const text = tone === "dark" ? "text-muted-dark" : "text-ink-muted";
  if (compact)
    return (
      <span className={`label inline-block border px-2.5 py-1 text-label tracking-[0.18em] ${border} ${text}`}>
        {heldBy ? "Museum reference" : "Demonstration record"}
      </span>
    );
  if (heldBy)
    return (
      <div className={`border-l pl-5 text-sm leading-relaxed ${border} ${text}`} role="note">
        <p>
          <strong className={`font-medium ${tone === "dark" ? "text-on-dark" : "text-ink"}`}>Reference work.</strong>{" "}
          Held by {heldBy.institution} ({heldBy.accessionNumber}) and shown with the museum’s open-access photograph
          (CC0). It is not part of the MURANIQ collection and is not offered for sale.
        </p>
        {heldBy.url && (
          <p className="mt-2">
            <a href={heldBy.url} className="link-quiet" rel="noopener">
              View the museum record<span className="sr-only"> (opens the {heldBy.institution} website)</span>
            </a>
          </p>
        )}
      </div>
    );
  return (
    <p className={`border-l pl-5 text-sm ${border} ${text}`} role="note">
      <strong className="font-medium">Demonstration record.</strong> This record is a development example, not an
      object in the MURANIQ collection.
    </p>
  );
}
