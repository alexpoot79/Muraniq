import Link from "next/link";
import type { MakerSignature, MakerSignatures } from "@/content/signatures";
import { ArtworkImage } from "@/components/editorial/ArtworkImage";
import { routes } from "@/lib/routes";
import { SignatureGallery } from "./SignatureGallery";
import { APPLICATION_LABEL, KIND_LABEL, KIND_REFERENCE_HEADING, contextLine, ownerLine, transcriptionLines } from "./labels";

/** At most two lines of the transcription, marked as shortened when cut. */
function shortTranscription(t: string): string {
  const lines = transcriptionLines(t);
  return lines.length > 2 ? `${lines.slice(0, 2).join(" / ")} …` : lines.join(" / ");
}

/**
 * Compact block beside the maker introduction. Same record and same image as
 * the full section: nothing is copied.
 */
export function SignatureCompact({ item, makerName }: { item: MakerSignature; makerName: string }) {
  const photo = item.photo;
  if (!photo) return null;
  const line = item.relation === "own" ? ownerLine(item.kind, item.markOf) : contextLine(item, makerName);
  return (
    <section aria-labelledby="signature-reference-title" className="settle settle-2 border-t border-line-dark pt-6">
      <h2 id="signature-reference-title" className="label text-[0.6875rem] text-muted-dark">
        {KIND_REFERENCE_HEADING[item.kind]}
      </h2>
      <div className="mt-4 flex gap-5">
        <a href={`#sig-${item.id}`} className="plate relative block h-32 w-28 shrink-0 overflow-hidden">
          <span className="absolute inset-1.5">
            <ArtworkImage media={photo.detail} sizes="112px" fill decorative />
          </span>
          <span className="sr-only">{item.title}</span>
        </a>
        <div className="flex min-w-0 flex-col gap-1.5 text-sm">
          <p className="text-on-dark">
            {KIND_LABEL[item.kind]} <span aria-hidden="true">·</span> {APPLICATION_LABEL[item.application]}
          </p>
          {item.transcription && <p className="font-mono text-[0.9em] break-words text-on-dark">{shortTranscription(item.transcription)}</p>}
          {line && <p className="text-muted-dark">{line}</p>}
          <a href="#signatures" className="link-quiet mt-1 text-on-dark">
            View all signature references
          </a>
        </div>
      </div>
    </section>
  );
}

/** Full "Signatures & Marks" section of a maker profile (anchor #signatures). */
export function SignatureSection({ signatures, makerName }: { signatures: MakerSignatures; makerName: string }) {
  const { items } = signatures;
  return (
    <section id="signatures" aria-labelledby="signatures-title" className="scroll-mt-24 border-t border-line-paper pt-14 lg:pt-20">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <h2 id="signatures-title" className="display-lg">
            Signatures <span className="serif-italic">&amp; Marks</span>
          </h2>
        </div>
        <div className="measure flex flex-col gap-4 md:col-span-8">
          {items.length === 0 ? (
            <p>No documented signature reference is currently available.</p>
          ) : (
            <>
              <p>
                Each example comes from one documented object and is shown with its source. Writing, technique and period
                vary, so no single example stands for every signature of {makerName}.
              </p>
              <p className="text-sm text-ink-muted">
                A legible name is not proof that a piece is genuine. Readings, attributions and dates are stated separately,
                with their own certainty.{" "}
                <Link href={routes.attribution()} className="link-quiet">
                  How we read marks
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
      {items.length > 0 && (
        <div className="mt-12">
          <SignatureGallery items={items} makerName={makerName} />
        </div>
      )}
    </section>
  );
}
