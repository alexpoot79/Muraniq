import Link from "next/link";
import { getArtworks, getCreators, getTechniques } from "@/content/repository.server";
import { CATEGORIES } from "@/content/categories";
import { CERTAINTY, type CategorySlug } from "@/content/schemas";
import { ArtworkCard } from "@/components/editorial/ArtworkCard";
import { CERTAINTY_LABEL } from "@/features/artworks/attribution";
import { absoluteUrl } from "@/lib/site";
import { FilterForm } from "./FilterForm";
import { catalogHref, isFiltered, parseCatalogQuery, searchCatalog, type CatalogQuery, type RawParams } from "./query";

type Option = { value: string; label: string; count: number; checked: boolean };

function FacetGroup({ name, legend, options }: { name: string; legend: string; options: Option[] }) {
  if (options.length === 0) return null;
  return (
    <fieldset className="border-t border-line-dark py-5">
      <legend className="label float-left mb-3 w-full text-muted-dark">{legend}</legend>
      <ul className="clear-both flex flex-col gap-1">
        {options.map((o) => (
          <li key={o.value}>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm lg:min-h-9">
              <input
                type="checkbox"
                name={name}
                value={o.value}
                defaultChecked={o.checked}
                disabled={o.count === 0 && !o.checked}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
              <span className={o.count === 0 && !o.checked ? "text-muted-dark/60" : ""}>{o.label}</span>
              <span className="ml-auto text-muted-dark">{o.count}</span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

/**
 * Server-rendered catalogue. Search and filtering run on the server against a
 * compact public index; the browser only receives the current page of results.
 */
export async function Catalog({
  base,
  searchParams,
  fixedCategory,
}: {
  base: string;
  searchParams: Promise<RawParams>;
  fixedCategory?: CategorySlug;
}) {
  const raw = await searchParams;
  const parsed = parseCatalogQuery(raw);
  const query: CatalogQuery = fixedCategory ? { ...parsed, category: [fixedCategory] } : parsed;
  const [all, creators, techniques] = await Promise.all([getArtworks(), getCreators(), getTechniques()]);
  const result = searchCatalog(all, query);
  const filtered = isFiltered(parsed);
  const linkQuery = { ...parsed }; // never serialise the fixed category into links

  const opts = (
    key: keyof typeof result.facets,
    values: Array<{ value: string; label: string }>,
    selected: string[],
  ): Option[] =>
    values
      .map((v) => ({ ...v, count: result.facets[key][v.value] ?? 0, checked: selected.includes(v.value) }))
      .filter((o) => o.count > 0 || o.checked);

  const colourValues = [...new Set(all.flatMap((a) => a.colours.map((c) => c.toLowerCase())))].sort();
  const canonical =
    filtered ? base : result.page > 1 ? `${base}?page=${result.page}` : base;

  return (
    <>
      {filtered && <meta name="robots" content="noindex, follow" />}
      <link rel="canonical" href={absoluteUrl(canonical)} />

      <div className="grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14">
        <FilterForm action={base} className="lg:sticky lg:top-28 lg:self-start">
          <div className="flex flex-col gap-2">
            <label htmlFor="search" className="label text-muted-dark">
              Search the collection
            </label>
            <div className="flex">
              <input
                id="search"
                name="q"
                type="search"
                defaultValue={parsed.q}
                maxLength={80}
                placeholder="Title, maker, technique…"
                className="min-h-12 w-full min-w-0 border border-line-dark bg-raised px-4 text-on-dark placeholder:text-muted-dark/70"
              />
              <button type="submit" className="btn btn-primary min-h-12 px-4" aria-label="Search">
                Go
              </button>
            </div>
          </div>

          <details className="group mt-6 lg:open:block" open={filtered || undefined}>
            <summary className="label flex min-h-12 cursor-pointer items-center justify-between border border-line-dark px-4 lg:hidden">
              Filters
              <span className="text-muted-dark">{result.total} results</span>
            </summary>
            <div className="mt-4 lg:mt-0">
              {!fixedCategory && (
                <FacetGroup
                  name="category"
                  legend="Collection area"
                  options={opts(
                    "category",
                    CATEGORIES.map((c) => ({ value: c.slug, label: c.title })),
                    parsed.category,
                  )}
                />
              )}
              <FacetGroup
                name="technique"
                legend="Technique"
                options={opts("technique", techniques.map((t) => ({ value: t.slug, label: t.term })), parsed.technique)}
              />
              <FacetGroup
                name="maker"
                legend="Maker"
                options={opts("maker", creators.map((c) => ({ value: c.slug, label: c.name })), parsed.maker)}
              />
              <FacetGroup
                name="attribution"
                legend="Certainty of attribution"
                options={opts(
                  "attribution",
                  CERTAINTY.map((c) => ({ value: c, label: CERTAINTY_LABEL[c] })),
                  parsed.attribution,
                )}
              />
              <FacetGroup
                name="colour"
                legend="Colour"
                options={opts(
                  "colour",
                  colourValues.map((c) => ({ value: c.replace(/\s+/g, "-"), label: c[0]!.toUpperCase() + c.slice(1) })),
                  parsed.colour,
                )}
              />
              <fieldset className="border-t border-line-dark py-5">
                <legend className="label mb-3 text-muted-dark">Period (overlapping)</legend>
                <div className="flex items-center gap-2 text-sm">
                  <label className="sr-only" htmlFor="from">From year</label>
                  <input id="from" name="from" inputMode="numeric" pattern="\d{4}" placeholder="From" defaultValue={parsed.from ?? ""} className="min-h-11 w-full border border-line-dark bg-raised px-3" />
                  <span aria-hidden="true">–</span>
                  <label className="sr-only" htmlFor="to">To year</label>
                  <input id="to" name="to" inputMode="numeric" pattern="\d{4}" placeholder="To" defaultValue={parsed.to ?? ""} className="min-h-11 w-full border border-line-dark bg-raised px-3" />
                </div>
              </fieldset>
              <div className="border-t border-line-dark py-5">
                <label htmlFor="sort" className="label mb-3 block text-muted-dark">Sort</label>
                <select id="sort" name="sort" defaultValue={parsed.sort} className="min-h-11 w-full border border-line-dark bg-raised px-3 text-on-dark">
                  <option value="curated">Curated order</option>
                  <option value="title">Title (A–Z)</option>
                  <option value="date-asc">Date (earliest first)</option>
                  <option value="date-desc">Date (latest first)</option>
                </select>
              </div>
              <div className="flex gap-3 border-t border-line-dark pt-5">
                <button type="submit" className="btn btn-primary flex-1">
                  Apply
                </button>
                <Link href={base} className="btn btn-ghost flex-1">
                  Reset
                </Link>
              </div>
            </div>
          </details>
        </FilterForm>

        <div>
          <p className="text-sm text-muted-dark" role="status">
            {result.total === 1 ? "1 work" : `${result.total} works`}
            {parsed.q && <> for “{parsed.q}”</>}
            {result.undatedExcluded > 0 && (
              <> · {result.undatedExcluded} undated {result.undatedExcluded === 1 ? "work is" : "works are"} not included in a period search</>
            )}
          </p>

          {result.items.length === 0 ? (
            <div className="mt-10 border border-line-dark p-8">
              <h2 className="display-md">No works match these choices.</h2>
              <p className="mt-4 max-w-prose text-muted-dark">
                Try fewer filters or a different spelling. Search covers titles, makers, techniques and descriptions.
              </p>
              <p className="mt-6">
                <Link href={base} className="btn btn-ghost">
                  Clear all filters
                </Link>
              </p>
            </div>
          ) : (
            <ul className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
              {result.items.map((a, i) => (
                <li key={a.id}>
                  <ArtworkCard artwork={a} headingLevel="h2" priority={i < 2 && !filtered} />
                </li>
              ))}
            </ul>
          )}

          {result.pageCount > 1 && (
            <nav aria-label="Pagination" className="mt-16 flex items-center justify-between border-t border-line-dark pt-6">
              {result.page > 1 ? (
                <Link className="btn btn-ghost" href={catalogHref(base, { ...linkQuery, page: result.page - 1 })} rel="prev">
                  Previous
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm text-muted-dark">
                Page {result.page} of {result.pageCount}
              </span>
              {result.page < result.pageCount ? (
                <Link className="btn btn-ghost" href={catalogHref(base, { ...linkQuery, page: result.page + 1 })} rel="next">
                  Next
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
