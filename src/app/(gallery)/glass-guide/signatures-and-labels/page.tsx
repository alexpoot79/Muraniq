import Link from "next/link";
import type { Metadata } from "next";
import { PageIntro } from "@/components/editorial/PageIntro";
import { routes } from "@/lib/routes";

// Existing URL on muraniq.nl, kept. Not indexed until reference material is published.
export const metadata: Metadata = {
  title: "Signatures & Labels",
  description: "Reference images and notes on Murano glass signatures and labels.",
  robots: { index: false, follow: true },
};

export default function SignaturesPage() {
  return (
    <>
      <PageIntro
        crumbs={[
          { label: "Glass Guide", href: routes.guide() },
          { label: "Signatures & labels", href: "/glass-guide/signatures-and-labels/" },
        ]}
        kicker="Glass Guide"
        title="Signatures & labels"
      >
        <p>Reference photographs of signatures and paper labels, with literal transcriptions.</p>
      </PageIntro>
      <div className="container-gallery grid gap-8 pb-24 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="display-md">This reference is being catalogued.</h2>
          <p className="mt-5 max-w-prose text-muted-dark">
            Signatures and labels are recorded on each object dossier — exactly as written, with any interpretation
            and its certainty kept separate. A searchable reference will appear here once enough marks have been
            photographed and reviewed.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href={routes.attribution()} className="btn btn-primary">
              How we read marks
            </Link>
            <Link href={routes.collection()} className="btn btn-ghost">
              Browse the collection
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
