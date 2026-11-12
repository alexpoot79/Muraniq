import type { Crumb } from "@/lib/routes";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

/** Page opening: breadcrumb, eyebrow, monumental title, and a short introduction set apart on the right. */
export function PageIntro({
  crumbs,
  kicker,
  title,
  accent,
  children,
  aside,
  compact = false,
}: {
  crumbs: Crumb[];
  kicker?: string;
  title: string;
  /** Optional words set in italic after the title, e.g. title "Makers," accent "and workshops". */
  accent?: string;
  children?: React.ReactNode;
  /** Optional block under the introduction (e.g. a signature reference), outside the lede styling. */
  aside?: React.ReactNode;
  /** Collection room: a shorter opening so the works appear above the fold. */
  compact?: boolean;
}) {
  return (
    <div className="container-gallery pt-8 lg:pt-12">
      <Breadcrumbs items={crumbs} />
      <header
        className={`grid border-b border-line-dark lg:grid-cols-12 ${compact ? "gap-3 pt-6 pb-6 lg:gap-10 lg:pt-8 lg:pb-8" : "gap-10 pt-16 pb-16 lg:pt-24 lg:pb-24"}`}
      >
        <div className="lg:col-span-8">
          {kicker && <p className="settle label eyebrow text-muted-dark">{kicker}</p>}
          <h1 className={`settle settle-1 ${compact ? "display-lg mt-3" : "display-xl mt-6"}`}>
            {title}
            {accent && (
              <>
                {" "}
                <span className="serif-italic text-accent">{accent}</span>
              </>
            )}
          </h1>
        </div>
        {children && !aside && (
          <div className={`settle settle-2 flex flex-col gap-4 text-muted-dark lg:col-span-4 lg:self-end ${compact ? "" : "lede"}`}>{children}</div>
        )}
        {aside && (
          <div className="flex flex-col gap-10 lg:col-span-4 lg:self-end">
            {children && <div className="settle settle-2 lede flex flex-col gap-4 text-muted-dark">{children}</div>}
            {aside}
          </div>
        )}
      </header>
    </div>
  );
}
