import { defineArrayMember, defineField, defineType } from "sanity";
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
    defineField({
      name: "rights",
      type: "string",
      options: { list: ["owned", "licensed", "permission", "public_domain", "unknown"] },
      validation: (r) => r.required(),
    }),
    defineField({ name: "licence", title: "Licence (as shown)", type: "string", description: "For example “CC0 1.0”. Shown with the credit." }),
    defineField({ name: "sourceUrl", title: "Where the original file comes from", type: "url" }),
    defineField({ name: "licenceExpiresOn", title: "Permission ends on", type: "date", description: "The photograph is withdrawn from the site on this date." }),
    defineField({
      name: "rightsEvidence",
      title: "Rights evidence (never published)",
      type: "string",
      description: "Where the licence, contract or written permission is kept.",
    }),
    defineField({
      name: "recognitionUse",
      title: "May be used in a recognition database",
      type: "string",
      description: "Recorded separately from web publication. Leave unknown unless the licence or permission says so.",
      options: { list: [{ title: "Allowed", value: "allowed" }, { title: "Not allowed", value: "not_allowed" }, { title: "Unknown", value: "unknown" }], layout: "radio" },
      initialValue: "unknown",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "cropOf",
      title: "Detail cut from another photograph",
      type: "object",
      description: "A close-up made by cropping only: no colour, contrast or retouching. The site links to the original.",
      fields: [
        { name: "image", title: "Original photograph", type: "reference", to: [{ type: "mediaAsset" }] },
        {
          name: "region",
          title: "Area of the original (0–1)",
          type: "object",
          fields: ["x", "y", "w", "h"].map((n) => defineField({ name: n, type: "number", validation: (r) => r.min(0).max(1) })),
        },
      ],
    }),
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
  groups: [
    { name: "profile", title: "Profile", default: true },
    { name: "signatures", title: "Signatures & Marks" },
  ],
  fields: [
    { ...idField("creatorId", "CRE", "Maker ID"), group: "profile" },
    defineField({ name: "name", type: "string", validation: (r) => r.required(), group: "profile" }),
    defineField({ name: "slug", type: "slug", options: { source: "name" }, validation: (r) => r.required(), group: "profile" }),
    defineField({ name: "kind", type: "string", options: { list: ["person", "organisation"] }, validation: (r) => r.required(), group: "profile" }),
    defineField({ name: "aliases", type: "array", of: [{ type: "string" }], options: { layout: "tags" }, group: "profile" }),
    defineField({ name: "lifeLabel", title: "Life dates (as shown)", type: "string", group: "profile" }),
    defineField({ name: "roles", type: "array", of: [{ type: "string" }], options: { list: ["designer", "maker", "glasshouse", "decorator", "artist", "publisher"] }, group: "profile" }),
    defineField({ name: "summary", type: "text", rows: 3, validation: (r) => r.required().max(300), group: "profile" }),
    defineField({ name: "biography", type: "array", of: [{ type: "text" }], group: "profile" }),
    defineField({
      name: "biographyStatus",
      type: "string",
      group: "profile",
      options: { list: ["reviewed", "migrated_unreviewed", "pending_migration"] },
      initialValue: "pending_migration",
    }),
    defineField({ name: "sources", type: "array", of: [{ type: "reference", to: [{ type: "source" }] }], group: "profile" }),
    defineField({ name: "legacyPath", title: "Old URL on muraniq.nl", type: "string", group: "profile" }),

    defineField({
      name: "signatureReferences",
      title: "Signatures & Marks",
      type: "array",
      group: "signatures",
      description:
        "Drag to set the order on this profile. Add a new example with “Create” or link an existing one. A factory mark or label of a glasshouse is shown here only as context on a documented work.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "signatureReference" }] })],
      validation: (r) => r.unique(),
    }),
    defineField({
      name: "primarySignature",
      title: "Shown by the introduction",
      type: "reference",
      group: "signatures",
      to: [{ type: "signatureReference" }],
      description: "Must be one of the references above. Without a released photograph the site falls back to another suitable reference, or hides the block.",
      validation: (r) =>
        r.custom((v: { _ref?: string } | undefined, ctx) => {
          if (!v?._ref) return true;
          const list = (ctx.document?.signatureReferences as { _ref?: string }[] | undefined) ?? [];
          return list.some((x) => x._ref === v._ref) || "Add this reference to the list above first";
        }),
    }),
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
