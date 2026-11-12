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
    <fieldset className="border-t border-line-dark py-6">
      <legend className="label float-left mb-4 w-full text-[0.6875rem] text-muted-dark">{legend}</legend>
      <ul className="clear-both flex flex-col gap-1">
        {options.map((o) => (
          <li key={o.value}>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-on-dark/90 transition-colors hover:text-on-dark lg:min-h-9">
              <input
                type="checkbox"
                name={name}
                value={o.value}
                defaultChecked={o.checked}
                disabled={o.count === 0 && !o.checked}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
              <span className={o.count === 0 && !o.checked ? "text-muted-dark/60" : ""}>{o.label}</span>
              <span className="numeral ml-auto text-base text-muted-dark">{o.count}</span>
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
  const techniqueChips = techniques
    .map((t) => ({ slug: t.slug, label: t.term, count: result.facets.technique[t.slug] ?? 0 }))
    .filter((t) => t.count > 0 || parsed.technique.includes(t.slug));
  const moreFiltersActive =
    parsed.maker.length + parsed.attribution.length + parsed.colour.length + (fixedCategory ? 0 : parsed.category.length) > 0 ||
    Boolean(parsed.from) || Boolean(parsed.to);
  const chip = (active: boolean) =>
    `label inline-flex min-h-11 items-center gap-2 border px-4 text-[0.6875rem] transition-colors ${active ? "border-accent text-on-dark" : "border-line-dark text-muted-dark hover:text-on-dark"}`;

  const canonical =
    filtered ? base : result.page > 1 ? `${base}?page=${result.page}` : base;

  return (
    <>
      {filtered && <meta name="robots" content="noindex, follow" />}
      <link rel="canonical" href={absoluteUrl(canonical)} />

      <FilterForm action={base} className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <label htmlFor="search" className="label text-[0.6875rem] text-muted-dark">
            Search
          </label>
          <div className="flex items-end gap-3">
            <input
              id="search"
              name="q"
              type="search"
              defaultValue={parsed.q}
              maxLength={80}
              placeholder="Title, maker, technique…"
              className="field-dark min-w-0 flex-1 font-display text-2xl"
            />
            <button type="submit" className="btn btn-ghost btn-sm">
              Search
            </button>
          </div>
        </div>

        {techniqueChips.length > 0 && (
          <nav aria-label="Techniques">
            <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              <li className="shrink-0">
                <Link href={catalogHref(base, { ...linkQuery, technique: [], page: 1 })} className={chip(parsed.technique.length === 0)} aria-current={parsed.technique.length === 0 ? "true" : undefined}>
                  All techniques
                </Link>
              </li>
              {techniqueChips.map((t) => {
                const active = parsed.technique.includes(t.slug);
                return (
                  <li key={t.slug} className="shrink-0">
                    <Link
                      href={catalogHref(base, { ...linkQuery, technique: active ? [] : [t.slug], page: 1 })}
                      className={chip(active)}
                      aria-current={active ? "true" : undefined}
                    >
                      {t.label}
                      <span className="numeral text-sm text-muted-dark">{t.count}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
        {parsed.technique.map((t) => (
          <input key={t} type="hidden" name="technique" value={t} />
        ))}

        <details className="group border-y border-line-dark" open={moreFiltersActive || undefined}>
          <summary className="label flex min-h-12 cursor-pointer items-center justify-between text-[0.6875rem]">
            More filters
            <span className="hidden text-muted-dark group-open:hidden sm:inline">Maker, certainty, colour, period</span>
          </summary>
          <div className="grid gap-x-10 pb-6 sm:grid-cols-2 lg:grid-cols-4">
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
            <fieldset className="border-t border-line-dark py-6">
              <legend className="label mb-4 text-[0.6875rem] text-muted-dark">Period (overlapping)</legend>
              <div className="flex items-center gap-2 text-sm">
                <label className="sr-only" htmlFor="from">From year</label>
                <input id="from" name="from" inputMode="numeric" pattern="\d{4}" placeholder="From" defaultValue={parsed.from ?? ""} className="field-dark min-h-11 px-1" />
                <span aria-hidden="true">–</span>
                <label className="sr-only" htmlFor="to">To year</label>
                <input id="to" name="to" inputMode="numeric" pattern="\d{4}" placeholder="To" defaultValue={parsed.to ?? ""} className="field-dark min-h-11 px-1" />
              </div>
            </fieldset>
          </div>
          <div className="flex gap-3 pb-6">
            <button type="submit" className="btn btn-primary btn-sm">
              Apply
            </button>
            <Link href={base} className="btn btn-ghost btn-sm">
              Reset
            </Link>
          </div>
        </details>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-dark pb-5">
          <p className="label text-[0.6875rem] text-muted-dark" role="status">
            {result.total === 1 ? "1 work" : `${result.total} works`}
            {parsed.q && <> for “{parsed.q}”</>}
            {result.undatedExcluded > 0 && (
              <> · {result.undatedExcluded} undated {result.undatedExcluded === 1 ? "work is" : "works are"} not included in a period search</>
            )}
          </p>
          <div className="flex items-center gap-3">
            <label htmlFor="sort" className="label text-[0.6875rem] text-muted-dark">Sort</label>
            <select id="sort" name="sort" defaultValue={parsed.sort} className="field-dark min-h-11 bg-stage px-1 text-sm">
              <option value="curated">Curated order</option>
              <option value="title">Title (A–Z)</option>
              <option value="date-asc">Date (earliest first)</option>
              <option value="date-desc">Date (latest first)</option>
            </select>
          </div>
        </div>
      </FilterForm>

      {result.items.length === 0 ? (
        <div className="mt-12 border border-line-dark p-8 sm:p-12">
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
        <ul className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-10">
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
    </>
  );
}
