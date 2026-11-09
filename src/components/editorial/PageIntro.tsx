import type { Crumb } from "@/lib/routes";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

/** Page opening: breadcrumb, eyebrow, monumental title, and a short introduction set apart on the right. */
export function PageIntro({
  crumbs,
  kicker,
  title,
  accent,
  children,
}: {
  crumbs: Crumb[];
  kicker?: string;
  title: string;
  /** Optional words set in italic after the title, e.g. title "Makers," accent "and workshops". */
  accent?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="container-gallery pt-8 lg:pt-12">
      <Breadcrumbs items={crumbs} />
      <header className="grid gap-10 border-b border-line-dark pt-16 pb-16 lg:grid-cols-12 lg:pt-24 lg:pb-24">
        <div className="lg:col-span-8">
          {kicker && <p className="settle label eyebrow text-muted-dark">{kicker}</p>}
          <h1 className="settle settle-1 display-xl mt-6">
            {title}
            {accent && (
              <>
                {" "}
                <span className="serif-italic text-accent">{accent}</span>
              </>
            )}
          </h1>
        </div>
        {children && (
          <div className="settle settle-2 lede flex flex-col gap-4 text-muted-dark lg:col-span-4 lg:self-end">{children}</div>
        )}
      </header>
    </div>
  );
}
