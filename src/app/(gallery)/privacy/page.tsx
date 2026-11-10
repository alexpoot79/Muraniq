import type { Metadata } from "next";
import { PageIntro } from "@/components/editorial/PageIntro";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description: "How MURANIQ handles personal data sent through this website.",
  path: routes.privacy(),
});

export default function PrivacyPage() {
  return (
    <>
      <PageIntro crumbs={[{ label: "Privacy", href: routes.privacy() }]} kicker="Information" title="Privacy" />
      <div className="surface-paper">
        <div className="container-gallery py-16 lg:py-24">
          <div className="measure flex flex-col gap-5">
            <p className="text-sm text-ink-muted" role="note">
              Draft for review by MURANIQ before publication. It describes how this website is built; the controller
              details and retention period must be confirmed.
            </p>
            <h2 className="display-md">What this website collects</h2>
            <p>
              This website does not use tracking or advertising cookies. When you send an enquiry, we receive your
              name, email address, your message and, if you chose one, the reference of the work you asked about. We
              use these details only to reply to you.
            </p>
            <h2 className="display-md">How enquiries are delivered</h2>
            <p>
              Enquiries are passed to our email provider for delivery to MURANIQ. Your message is not stored on the
              website itself and is not used for analytics.
            </p>
            <h2 className="display-md">Your rights</h2>
            <p>
              You may ask us to see, correct or delete the personal data we hold about you by writing to{" "}
              <a href={`mailto:${SITE.email}`} className="link-quiet">
                {SITE.email}
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
