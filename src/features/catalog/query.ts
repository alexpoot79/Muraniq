/**
 * Catalogue search contract. The URL is the source of truth:
 *   /collection/?q=vase&category=murano-glass&technique=sommerso&page=2
 *
 * - Only known parameters are accepted; values are bounded.
 * - OR within a facet, AND between facets.
 * - Date ranges match on overlap; undated works are counted separately.
 * - Stable sort with the id as the final key. 24 results per page.
 */
import { CATEGORY_SLUGS, CERTAINTY, type CategorySlug, type Certainty } from "@/content/schemas";
import { fold, type ArtworkSummary } from "@/content/publication";

export const PAGE_SIZE = 24;
const MAX_Q = 80;
const MAX_VALUES_PER_FACET = 8;
const MAX_PAGE = 500;

export const SORTS = ["curated", "title", "date-asc", "date-desc"] as const;
export type Sort = (typeof SORTS)[number];

export type CatalogQuery = {
  q: string;
  category: CategorySlug[];
  technique: string[];
  maker: string[];
  attribution: Certainty[];
  colour: string[];
  from: number | null;
  to: number | null;
  sort: Sort;
  page: number;
};

export type RawParams = Record<string, string | string[] | undefined>;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function values(raw: string | string[] | undefined): string[] {
  const arr = Array.isArray(raw) ? raw : raw === undefined ? [] : [raw];
  return arr.flatMap((v) => v.split(",")).map((v) => v.trim()).filter(Boolean);
}

function slugs(raw: string | string[] | undefined): string[] {
  return [...new Set(values(raw).map((v) => v.toLowerCase()).filter((v) => SLUG_RE.test(v) && v.length <= 60))].slice(
    0,
    MAX_VALUES_PER_FACET,
  );
}

function year(raw: string | string[] | undefined): number | null {
  const v = values(raw)[0];
  if (!v || !/^\d{4}$/.test(v)) return null;
  const n = Number(v);
  return n >= 1000 && n <= 2100 ? n : null;
}

export function parseCatalogQuery(params: RawParams): CatalogQuery {
  const q = (values(params.q)[0] ?? "").replace(/\s+/g, " ").slice(0, MAX_Q);
  const sortRaw = values(params.sort)[0];
  const pageRaw = Number(values(params.page)[0] ?? "1");
  let from = year(params.from);
  let to = year(params.to);
  if (from !== null && to !== null && from > to) [from, to] = [to, from];
  return {
    q,
    category: slugs(params.category).filter((c): c is CategorySlug =>
      (CATEGORY_SLUGS as readonly string[]).includes(c),
    ),
    technique: slugs(params.technique),
    maker: slugs(params.maker),
    attribution: values(params.attribution)
      .filter((c): c is Certainty => (CERTAINTY as readonly string[]).includes(c))
      .slice(0, CERTAINTY.length),
    colour: slugs(params.colour),
    from,
    to,
    sort: (SORTS as readonly string[]).includes(sortRaw ?? "") ? (sortRaw as Sort) : "curated",
    page: Number.isInteger(pageRaw) && pageRaw >= 1 ? Math.min(pageRaw, MAX_PAGE) : 1,
  };
}

/** True when the query narrows results (search or facet) — such pages are noindex. */
export function isFiltered(q: CatalogQuery): boolean {
  return Boolean(
    q.q ||
      q.category.length ||
      q.technique.length ||
      q.maker.length ||
      q.attribution.length ||
      q.colour.length ||
      q.from !== null ||
      q.to !== null ||
      q.sort !== "curated",
  );
}

/** Serialise back to a canonical query string (stable key order). */
export function toSearchParams(q: Partial<CatalogQuery>): URLSearchParams {
  const sp = new URLSearchParams();
  if (q.q) sp.set("q", q.q);
  for (const key of ["category", "technique", "maker", "attribution", "colour"] as const) {
    const v = q[key];
    if (v && v.length) sp.set(key, [...v].sort().join(","));
  }
  if (q.from != null) sp.set("from", String(q.from));
  if (q.to != null) sp.set("to", String(q.to));
  if (q.sort && q.sort !== "curated") sp.set("sort", q.sort);
  if (q.page && q.page > 1) sp.set("page", String(q.page));
  return sp;
}

export function catalogHref(base: string, q: Partial<CatalogQuery>): string {
  const s = toSearchParams(q).toString();
  return s ? `${base}?${s}` : base;
}

/* ------------------------------------------------------------------ */

function score(a: ArtworkSummary, terms: string[]): number {
  let total = 0;
  for (const t of terms) {
    let s = 0;
    if (a.search.title.includes(t)) s = Math.max(s, a.search.title.split(/\W+/).includes(t) ? 10 : 7);
    if (a.id.toLowerCase() === t) s = Math.max(s, 12);
    if (a.search.makers.includes(t)) s = Math.max(s, 8);
    if (a.search.aliases.includes(t)) s = Math.max(s, 4);
    if (a.search.techniques.includes(t)) s = Math.max(s, 4);
    if (a.search.text.includes(t)) s = Math.max(s, 2);
    if (s === 0) return 0; // every term must match somewhere
    total += s;
  }
  return total;
}

function overlaps(a: ArtworkSummary, from: number | null, to: number | null): boolean | null {
  if (from === null && to === null) return true;
  if (a.fromYear === null && a.toYear === null) return null; // undated
  const af = a.fromYear ?? a.toYear!;
  const at = a.toYear ?? a.fromYear!;
  return (from === null || at >= from) && (to === null || af <= to);
}

export type FacetCounts = {
  category: Record<string, number>;
  technique: Record<string, number>;
  maker: Record<string, number>;
  attribution: Record<string, number>;
  colour: Record<string, number>;
};

export type CatalogResult = {
  query: CatalogQuery;
  items: ArtworkSummary[];
  total: number;
  page: number;
  pageCount: number;
  undatedExcluded: number;
  facets: FacetCounts;
};

type FacetKey = keyof FacetCounts;

function facetValues(a: ArtworkSummary, key: FacetKey): string[] {
  switch (key) {
    case "category":
      return [a.category];
    case "technique":
      return a.techniqueSlugs;
    case "maker":
      return a.makerSlugs;
    case "attribution":
      return [a.attributionCertainty];
    case "colour":
      return a.colours.map((c) => fold(c).replace(/\s+/g, "-"));
  }
}

function matchesFacet(a: ArtworkSummary, key: FacetKey, selected: readonly string[]): boolean {
  if (selected.length === 0) return true;
  const vals = facetValues(a, key);
  return selected.some((s) => vals.includes(s)); // OR within facet
}

const FACETS: FacetKey[] = ["category", "technique", "maker", "attribution", "colour"];

export function searchCatalog(all: ArtworkSummary[], query: CatalogQuery): CatalogResult {
  const terms = fold(query.q)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2)
    .slice(0, 8);

  const scored = new Map<string, number>();
  let undatedExcluded = 0;
  const base = all.filter((a) => {
    if (terms.length) {
      const s = score(a, terms);
      if (!s) return false;
      scored.set(a.id, s);
    }
    const ov = overlaps(a, query.from, query.to);
    if (ov === null) {
      undatedExcluded++;
      return false;
    }
    return ov;
  });

  // Facet counts: for each facet, apply all OTHER facets (standard disjunctive faceting).
  const facets = Object.fromEntries(FACETS.map((k) => [k, {} as Record<string, number>])) as FacetCounts;
  for (const key of FACETS) {
    for (const a of base) {
      const others = FACETS.every((k) => k === key || matchesFacet(a, k, query[k]));
      if (!others) continue;
      for (const v of facetValues(a, key)) facets[key][v] = (facets[key][v] ?? 0) + 1;
    }
  }

  const filtered = base.filter((a) => FACETS.every((k) => matchesFacet(a, k, query[k])));

  const byId = (x: ArtworkSummary, y: ArtworkSummary) => x.id.localeCompare(y.id);
  const sorted = [...filtered].sort((x, y) => {
    if (terms.length && query.sort === "curated") {
      const d = (scored.get(y.id) ?? 0) - (scored.get(x.id) ?? 0);
      if (d) return d;
    }
    switch (query.sort) {
      case "title":
        return x.title.localeCompare(y.title) || byId(x, y);
      case "date-asc":
      case "date-desc": {
        const dx = x.fromYear ?? x.toYear;
        const dy = y.fromYear ?? y.toYear;
        if (dx === null && dy === null) return byId(x, y);
        if (dx === null) return 1; // undated last in both directions
        if (dy === null) return -1;
        return (query.sort === "date-asc" ? dx - dy : dy - dx) || byId(x, y);
      }
      default:
        return x.curatedOrder - y.curatedOrder || byId(x, y);
    }
  });

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(query.page, pageCount);
  return {
    query,
    items: sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total,
    page,
    pageCount,
    undatedExcluded,
    facets,
  };
}
