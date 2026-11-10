import Link from "next/link";
import type { Crumb } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site";
import { JsonLd } from "./JsonLd";

export function Breadcrumbs({ items, tone = "dark" }: { items: Crumb[]; tone?: "dark" | "paper" }) {
  const muted = tone === "dark" ? "text-muted-dark" : "text-ink-muted";
  return (
    <>
      <nav aria-label="Breadcrumb" className={`label text-[0.6875rem] ${muted}`}>
        <ol className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {items.map((c, i) => {
            const last = i === items.length - 1;
            return (
              <li key={c.href} className="flex items-center gap-3">
                {last ? (
                  <span aria-current="page" className={tone === "dark" ? "text-on-dark" : "text-ink"}>
                    {c.label}
                  </span>
                ) : (
                  <>
                    <Link href={c.href} className="inline-flex min-h-6 items-center transition-colors hover:text-on-dark">
                      {c.label}
                    </Link>
                    <span aria-hidden="true" className="inline-block h-px w-4 bg-current opacity-50" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            item: absoluteUrl(c.href),
          })),
        }}
      />
    </>
  );
}
