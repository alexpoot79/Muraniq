import { draftMode } from "next/headers";
import { getPreviewState } from "@/content/repository.server";
import { ExitPreviewForm } from "./ExitPreviewForm";

/**
 * Shown on every page while Draft Mode is on. Marks the page as not public,
 * keeps it out of search engines and lists draft problems that block the preview.
 */
export async function PreviewBanner() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  const state = await getPreviewState();
  const issues = state?.issues ?? [];

  return (
    <aside aria-label="Preview" className="surface-paper border-b-2 border-accent-deco">
      <meta name="robots" content="noindex, nofollow" />
      <div className="container-gallery flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3">
        <p className="text-sm" role="status">
          <strong className="font-medium">Preview.</strong> You are seeing unpublished drafts. This view is private
          and is not what visitors see.
        </p>
        <ExitPreviewForm />
      </div>
      {issues.length > 0 && (
        <div className="container-gallery pb-4 text-sm">
          <p className="font-medium">
            The drafts contain {issues.length === 1 ? "a problem" : `${issues.length} problems`}, so this preview shows
            the published content instead:
          </p>
          <ul className="mt-2 list-disc pl-5 text-ink-muted">
            {issues.slice(0, 10).map((i) => (
              <li key={i} className="break-words">
                {i}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
