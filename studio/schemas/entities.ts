import { defineField, defineType } from "sanity";
import { idField } from "./shared";

export const mediaAsset = defineType({
  name: "mediaAsset",
  title: "Photograph",
  type: "document",
  description: "Upload ONLY cleared, EXIF-stripped web derivatives. Sanity assets are public on the CDN.",
  fields: [
    idField("mediaId", "IMG", "Media ID"),
    defineField({ name: "image", type: "image", options: { hotspot: true }, validation: (r) => r.required() }),
    defineField({ name: "artwork", type: "reference", to: [{ type: "artwork" }] }),
    defineField({
      name: "viewType",
      type: "string",
      options: { list: ["front", "reverse", "side", "base", "signature", "label", "detail", "context"] },
      validation: (r) => r.required(),
    }),
    defineField({ name: "alt", title: "Alt text", type: "string", validation: (r) => r.required().min(8).max(300) }),
    defineField({ name: "caption", type: "string" }),
    defineField({ name: "credit", type: "string" }),
    defineField({ name: "rights", type: "string", options: { list: ["owned", "licensed", "permission", "unknown"] }, validation: (r) => r.required() }),
    defineField({
      name: "rightsCleared",
      title: "Rights cleared for web publication",
      type: "boolean",
      initialValue: false,
      validation: (r) =>
        r.custom((v, ctx) => (v && (ctx.document?.rights === "unknown") ? "Rights are unknown — cannot be cleared" : true)),
    }),
    defineField({ name: "focalPoint", type: "object", fields: [{ name: "x", type: "number" }, { name: "y", type: "number" }] }),
    defineField({
      name: "hotspots",
      title: "Detail points (optional)",
      type: "array",
      of: [{ type: "object", fields: [{ name: "x", type: "number" }, { name: "y", type: "number" }, { name: "label", type: "string" }, { name: "description", type: "text", rows: 2 }] }],
    }),
  ],
  preview: { select: { title: "alt", subtitle: "viewType", media: "image" } },
});

export const creator = defineType({
  name: "creator",
  title: "Maker",
  type: "document",
  fields: [
    idField("creatorId", "CRE", "Maker ID"),
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "name" }, validation: (r) => r.required() }),
    defineField({ name: "kind", type: "string", options: { list: ["person", "organisation"] }, validation: (r) => r.required() }),
    defineField({ name: "aliases", type: "array", of: [{ type: "string" }], options: { layout: "tags" } }),
    defineField({ name: "lifeLabel", title: "Life dates (as shown)", type: "string" }),
    defineField({ name: "roles", type: "array", of: [{ type: "string" }], options: { list: ["designer", "maker", "glasshouse", "decorator", "artist", "publisher"] } }),
    defineField({ name: "summary", type: "text", rows: 3, validation: (r) => r.required().max(300) }),
    defineField({ name: "biography", type: "array", of: [{ type: "text" }] }),
    defineField({
      name: "biographyStatus",
      type: "string",
      options: { list: ["reviewed", "migrated_unreviewed", "pending_migration"] },
      initialValue: "pending_migration",
    }),
    defineField({ name: "sources", type: "array", of: [{ type: "reference", to: [{ type: "source" }] }] }),
    defineField({ name: "legacyPath", title: "Old URL on muraniq.nl", type: "string" }),
  ],
});

export const glasshouse = defineType({
  name: "glasshouse",
  title: "Glasshouse",
  type: "document",
  fields: [
    idField("glasshouseId", "GLH", "Glasshouse ID"),
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "name" }, validation: (r) => r.required() }),
    defineField({ name: "location", type: "string" }),
    defineField({ name: "activeLabel", type: "string" }),
    defineField({ name: "summary", type: "text", rows: 3 }),
    defineField({ name: "creators", type: "array", of: [{ type: "reference", to: [{ type: "creator" }] }] }),
  ],
});

export const technique = defineType({
  name: "technique",
  title: "Technique",
  type: "document",
  fields: [
    idField("techniqueId", "TEC", "Technique ID"),
    defineField({ name: "term", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "term" }, validation: (r) => r.required() }),
    defineField({ name: "synonyms", type: "array", of: [{ type: "string" }], options: { layout: "tags" } }),
    defineField({ name: "summary", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "body", type: "array", of: [{ type: "text" }], validation: (r) => r.required().min(1) }),
    defineField({ name: "recognition", title: "How to recognise it", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "sources", type: "array", of: [{ type: "reference", to: [{ type: "source" }] }] }),
    defineField({ name: "editorialStatus", type: "string", options: { list: ["reviewed", "draft_unsourced"] }, initialValue: "draft_unsourced" }),
  ],
});

export const source = defineType({
  name: "source",
  title: "Source",
  type: "document",
  fields: [
    idField("sourceId", "SRC", "Source ID"),
    defineField({ name: "type", type: "string", options: { list: ["catalogue", "book", "museum", "archive", "auction", "manufacturer", "observation", "other"] }, validation: (r) => r.required() }),
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "author", type: "string" }),
    defineField({ name: "publisher", type: "string" }),
    defineField({ name: "year", type: "string" }),
    defineField({ name: "url", type: "url" }),
    defineField({ name: "rightsNote", type: "string" }),
    defineField({ name: "reliabilityNote", type: "text", rows: 2 }),
  ],
});

export const redirect = defineType({
  name: "redirect",
  title: "Redirect",
  type: "document",
  fields: [
    defineField({ name: "from", type: "string", validation: (r) => r.required().regex(/^\//) }),
    defineField({ name: "to", type: "string", validation: (r) => r.required().regex(/^\//) }),
    defineField({ name: "reason", type: "string", validation: (r) => r.required() }),
    defineField({ name: "checkedOn", type: "date" }),
    defineField({ name: "active", type: "boolean", initialValue: false, description: "Activated only at the authorised migration." }),
  ],
});
