/**
 * Indexing is opt-in: set SITE_INDEXABLE=true only in the Vercel *production*
 * environment, at the authorised switch of muraniq.nl. Everything else
 * (local, previews, the *.vercel.app test URL) sends noindex.
 */
export function siteIndexable(): boolean {
  return process.env.SITE_INDEXABLE === "true" && process.env.VERCEL_ENV !== "preview";
}
