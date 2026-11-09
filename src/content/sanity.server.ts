/**
 * Sanity adapter (server-only). NOT YET CONNECTED: no project, dataset or token
 * has been provisioned. The adapter is written against the HTTP query API so it
 * needs no SDK in the public bundle, and it returns the same dataset shape as
 * the fixtures so it goes through identical validation and projection.
 *
 * Contract:
 *  - perspective=published (drafts never reach the public site),
 *  - an explicit GROQ projection (field allowlist) per document type,
 *  - token only from server environment variables,
 *  - an empty private dataset is treated as a misconfiguration signal (an
 *    unauthenticated query against a private dataset returns 200 with no rows).
 */
import "server-only";
import type { DatasetInput } from "./schemas";

const API_VERSION = "2025-02-19";

export function sanityConfigured(): boolean {
  return Boolean(process.env.SANITY_PROJECT_ID && process.env.SANITY_DATASET && process.env.SANITY_READ_TOKEN);
}

const IMAGE = `"src": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height`;

/** Explicit projection — keep in sync with studio/schemas. */
export const DATASET_QUERY = /* groq */ `{
  "artworks": *[_type == "artwork"]{
    "id": collectionId, "slug": slug.current, title, category, objectType, summary, description,
    "creators": creators[]{ "creatorId": creator->creatorId, role, certainty },
    "glasshouseIds": glasshouses[]->glasshouseId,
    "techniqueIds": techniques[]->techniqueId,
    materials, colours, country, dating, dimensions,
    "heroImageId": heroImage->mediaId,
    "imageIds": images[]->mediaId,
    marks[]{ kind, location, observation, transcription, interpretation, interpretationCertainty, "imageId": image->mediaId },
    assertions[]{ field, statement, certainty, "evidence": evidence[]{ "sourceId": source->sourceId, locator }, publicNote, reviewedOn },
    provenance[]{ label, fromYear, toYear, certainty, "evidence": evidence[]{ "sourceId": source->sourceId, locator } },
    condition,
    "sourceIds": sources[]->sourceId,
    "relatedIds": related[]->collectionId,
    availability, "status": "published", featured, curatedOrder,
    "isFixture": false,
    seo, "updatedAt": string::split(_updatedAt, "T")[0]
  },
  "creators": *[_type == "creator"]{
    "id": creatorId, "slug": slug.current, kind, name, aliases, lifeLabel, roles, summary,
    biography, biographyStatus, "sourceIds": sources[]->sourceId, legacyPath, "isFixture": false, "status": "published"
  },
  "glasshouses": *[_type == "glasshouse"]{
    "id": glasshouseId, "slug": slug.current, name, location, activeLabel, summary,
    "creatorIds": creators[]->creatorId, "status": "published"
  },
  "techniques": *[_type == "technique"]{
    "id": techniqueId, "slug": slug.current, term, synonyms, summary, body, recognition,
    "sourceIds": sources[]->sourceId, editorialStatus, "status": "published"
  },
  "sources": *[_type == "source"]{
    "id": sourceId, type, title, author, publisher, year, url, rightsNote, reliabilityNote, "isFixture": false
  },
  "media": *[_type == "mediaAsset" && rightsCleared == true]{
    "id": mediaId, "artworkId": artwork->collectionId, viewType, ${IMAGE},
    alt, caption, credit, rights, rightsCleared, focalPoint, hotspots
  },
  "redirects": *[_type == "redirect"]{ from, to, reason, checkedOn, active }
}`;

export async function fetchSanityDataset(): Promise<DatasetInput> {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET;
  const token = process.env.SANITY_READ_TOKEN;
  if (!projectId || !dataset || !token) throw new Error("Sanity is not configured");

  // useCdn=false equivalent: the api host (not apicdn) returns fresh content on revalidation.
  const url = new URL(`https://${projectId}.api.sanity.io/v${API_VERSION}/data/query/${dataset}`);
  url.searchParams.set("query", DATASET_QUERY);
  url.searchParams.set("perspective", "published");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Sanity query failed with HTTP ${res.status}`);
  const body = (await res.json()) as { result?: DatasetInput };
  const result = body.result;
  if (!result || (result.artworks?.length ?? 0) + (result.creators?.length ?? 0) === 0) {
    throw new Error(
      "Sanity returned no documents. Check the token and dataset access before treating the collection as empty.",
    );
  }
  return result;
}
