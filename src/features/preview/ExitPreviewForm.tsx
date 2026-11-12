"use client";

import { usePathname } from "next/navigation";

/** Leave preview and stay on the same page (now showing published content only). */
export function ExitPreviewForm() {
  const pathname = usePathname();
  return (
    <form method="post" action="/api/draft/disable/">
      <input type="hidden" name="return" value={pathname ?? "/"} />
      <button type="submit" className="btn btn-ink min-h-11 px-4 py-2 text-caption">
        Leave preview
      </button>
    </form>
  );
}
