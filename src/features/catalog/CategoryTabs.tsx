import Link from "next/link";
import { CATEGORIES } from "@/content/categories";
import { routes } from "@/lib/routes";

/** Tabs across the collection areas; the current area is marked for assistive tech. */
export function CategoryTabs({ current }: { current?: string }) {
  return (
    <nav aria-label="Collection areas" className="container-gallery">
      <ul className="flex gap-x-8 gap-y-2 overflow-x-auto border-b border-line-dark">
        <li className="shrink-0">
          <Link
            href={routes.history()}
            aria-current={current === "history" ? "page" : undefined}
            className={`label inline-flex min-h-14 items-center border-b text-[0.6875rem] transition-colors ${current === "history" ? "border-accent text-on-dark" : "border-transparent text-muted-dark hover:text-on-dark"}`}
          >
            History
          </Link>
        </li>
        {CATEGORIES.map((c) => (
          <li key={c.slug} className="shrink-0">
            <Link
              href={routes.category(c.slug)}
              aria-current={current === c.slug ? "page" : undefined}
              className={`label inline-flex min-h-14 items-center border-b text-[0.6875rem] transition-colors ${current === c.slug ? "border-accent text-on-dark" : "border-transparent text-muted-dark hover:text-on-dark"}`}
            >
              {c.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
