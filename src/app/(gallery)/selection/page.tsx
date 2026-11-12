import { Suspense } from "react";
import type { Metadata } from "next";
import { PageIntro } from "@/components/editorial/PageIntro";
import { SelectionView } from "@/features/selection/SelectionView";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Private Selection",
  description: "Works you have set aside on MURANIQ, kept in this browser only.",
  robots: { index: false, follow: true },
};

export default function SelectionPage() {
  return (
    <>
      <PageIntro crumbs={[{ label: "Private Selection", href: routes.selection() }]} kicker="Kept in this browser" title="Private" accent="Selection.">
        <p>Works you set aside while looking. They are kept only in this browser: no account, and nothing is shared unless you send someone a comparison link.</p>
      </PageIntro>
      <div className="container-gallery pt-12 pb-28 lg:pt-16">
        <Suspense fallback={<p className="min-h-[30vh] text-muted-dark">Loading your selection…</p>}>
          <SelectionView />
        </Suspense>
      </div>
    </>
  );
}
