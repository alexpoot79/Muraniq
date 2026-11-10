import Link from "next/link";
import type { Metadata } from "next";
import { PageIntro } from "@/components/editorial/PageIntro";
import { ResearchStatusBadge } from "@/components/ui/ResearchStatusBadge";
import { GROUPS, PUBLIC_STATUSES, STATUS_EXPLANATION, STATUS_LABEL, directoryEntries, directoryStats } from "@/content/makers-directory";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";

export const metadata: Metadata = pageMetadata({
  title: "Makers & Workshops",
  description:
    "A sourced directory of Murano and Venetian glasshouses, masters, designers and families, with the status of every claim.",
  path: routes.directory(),
});

const fmtDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default function MakersAndWorkshopsPage() {
  const entries = directoryEntries();
  const stats = directoryStats();
  const groups = GROUPS.map((g) => ({ ...g, items: entries.filter((e) => e.group === g.key) })).filter((g) => g.items.length);
  return (
    <>
      <PageIntro
        crumbs={[
          { label: "Glass Guide", href: routes.guide() },
          { label: "Makers & Workshops", href: routes.directory() },
        ]}
        kicker="Glass Guide · Research"
        title="Makers"
        accent="& workshops."
      >
        <p>
          Who made Murano glass, and for whom. {stats.published} glasshouses, masters, designers and families, each with
          its sources and an honest status.
        </p>
      </PageIntro>

      <nav aria-label="Sections" className="container-gallery">
        <ul className="flex flex-wrap gap-x-8 gap-y-3 border-b border-line-dark py-6">
          {groups.map((g) => (
            <li key={g.key}>
              <a href={`#${g.key}`} className="link-quiet label text-[0.6875rem] text-muted-dark hover:text-on-dark">
                {g.title} {g.accent} <span className="numeral ml-1 text-sm tracking-normal">{g.items.length}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container-gallery pb-20">
        {groups.map((g, gi) => (
          <section key={g.key} id={g.key} aria-labelledby={`${g.key}-title`} className="scroll-mt-28 pt-20 lg:pt-28">
            <div className="grid gap-6 md:grid-cols-12">
              <div className="md:col-span-5">
                <p className="numeral text-2xl text-accent">{String(gi + 1).padStart(2, "0")}</p>
                <h2 id={`${g.key}-title`} className="display-lg mt-3">
                  {g.title} <span className="serif-italic text-accent">{g.accent}</span>
                </h2>
              </div>
              <p className="lede text-muted-dark md:col-span-5 md:col-start-8 md:self-end">{g.intro}</p>
            </div>
            <ul className="mt-12 border-t border-line-dark">
              {g.items.map((e) => (
                <li
                  key={e.id}
                  className="group relative grid gap-3 border-b border-line-dark py-7 md:grid-cols-12 md:items-baseline md:gap-6"
                >
                  <div className="md:col-span-5">
                    <h3 className="display-sm transition-[color,transform] duration-500 ease-[var(--ease-silk)] group-hover:text-accent lg:group-hover:translate-x-2">
                      <Link href={routes.directoryEntry(e.slug)} className="after:absolute after:inset-0">
                        {e.name}
                      </Link>
                    </h3>
                    <p className="label mt-2 text-[0.6875rem] text-muted-dark">
                      {e.kind}
                      {e.dates && <span className="numeral ml-3 text-sm tracking-normal normal-case">{e.dates}</span>}
                    </p>
                  </div>
                  <p className="text-sm text-muted-dark md:col-span-5">{e.summary}</p>
                  <div className="text-on-dark md:col-span-2 md:justify-self-end">
                    <ResearchStatusBadge status={e.status} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section aria-labelledby="method-title" className="surface-paper">
        <div className="container-gallery section-y grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="label eyebrow text-ink-muted">How to read this</p>
            <h2 id="method-title" className="display-lg mt-6">
              Every claim, <span className="serif-italic">with its status.</span>
            </h2>
          </div>
          <div className="flex flex-col gap-8 md:col-span-6 md:col-start-7">
            <dl className="flex flex-col border-t border-line-paper">
              {PUBLIC_STATUSES.map((s) => (
                <div key={s} className="grid gap-2 border-b border-line-paper py-5 sm:grid-cols-[11rem_1fr]">
                  <dt>
                    <ResearchStatusBadge status={s} tone="paper" />
                    <span className="sr-only">: </span>
                  </dt>
                  <dd className="text-ink-muted">{STATUS_EXPLANATION[s]}</dd>
                </div>
              ))}
            </dl>
            <p className="text-ink-muted">
              {stats.withheld} further names in the research are {STATUS_LABEL.UNVERIFIED.toLowerCase()} and are not shown
              until they are. Details that could not be confirmed are left out rather than guessed. Sources checked on{" "}
              {fmtDate(stats.checked)}.
            </p>
            <p>
              <Link href={routes.attribution()} className="link-quiet">
                How MURANIQ attributes works
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
