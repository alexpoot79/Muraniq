import { Suspense } from "react";
import type { Metadata } from "next";
import { PageIntro } from "@/components/editorial/PageIntro";
import { ContactForm } from "@/features/enquiries/ContactForm";
import { enquiryDeliveryConfigured } from "@/features/enquiries/provider.server";
import { getArtworkById } from "@/content/repository.server";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Contact MURANIQ about a work in the collection, a maker or the research.",
  path: routes.contact(),
});

async function ContactBody({ searchParams }: { searchParams: PageProps<"/contact">["searchParams"] }) {
  const sp = await searchParams;
  const objectParam = typeof sp.object === "string" ? sp.object.slice(0, 40) : undefined;
  const status = typeof sp.status === "string" ? sp.status : undefined;
  const object = objectParam ? await getArtworkById(objectParam) : null;
  const configured = enquiryDeliveryConfigured();

  if (!configured) {
    const subject = object ? `Enquiry: ${object.title} (${object.id})` : "Enquiry via muraniq.nl";
    return (
      <div className="flex flex-col gap-6">
        {object && (
          <div className="border border-line-paper bg-paper-2 p-4">
            <p className="label text-ink-muted">About this work</p>
            <p className="mt-1">
              {object.title} <span className="font-mono text-sm text-ink-muted">({object.id})</span>
            </p>
          </div>
        )}
        <p>Please write to us by email. We reply personally.</p>
        <p>
          <a href={`mailto:${SITE.email}?subject=${encodeURIComponent(subject)}`} className="btn btn-ink">
            Email {SITE.email}
          </a>
        </p>
      </div>
    );
  }

  return (
    <ContactForm
      object={object ? { id: object.id, title: object.title } : undefined}
      initialStatus={status}
      fallbackEmail={SITE.email}
    />
  );
}

export default function ContactPage({ searchParams }: PageProps<"/contact">) {
  return (
    <>
      <PageIntro crumbs={[{ label: "Contact", href: routes.contact() }]} kicker="Enquiries" title="Contact">
        <p>For questions about a work, a maker, a mark — or information you would like to share.</p>
      </PageIntro>
      <div className="surface-paper">
        <div className="container-gallery grid gap-12 py-16 md:grid-cols-12 lg:py-24">
          <div className="md:col-span-7">
            <Suspense fallback={<p>Loading…</p>}>
              <ContactBody searchParams={searchParams} />
            </Suspense>
          </div>
          <aside className="flex flex-col gap-3 md:col-span-4 md:col-start-9">
            <h2 className="label text-ink-muted">Email</h2>
            <p>
              <a href={`mailto:${SITE.email}`} className="link-quiet">
                {SITE.email}
              </a>
            </p>
            <p className="text-sm text-ink-muted">
              We use your details only to answer your message. Read the{" "}
              <a href={routes.privacy()} className="link-quiet">
                privacy notice
              </a>
              .
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
