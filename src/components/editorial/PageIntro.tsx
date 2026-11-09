import type { Crumb } from "@/lib/routes";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export function PageIntro({
  crumbs,
  kicker,
  title,
  children,
}: {
  crumbs: Crumb[];
  kicker?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="container-gallery pt-6 lg:pt-10">
      <Breadcrumbs items={crumbs} />
      <header className="mt-8 grid gap-6 border-b border-line-dark pb-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {kicker && <p className="label text-accent">{kicker}</p>}
          <h1 className="display-xl mt-4">{title}</h1>
        </div>
        {children && <div className="text-muted-dark lg:col-span-4 lg:col-start-9 lg:self-end">{children}</div>}
      </header>
    </div>
  );
}
