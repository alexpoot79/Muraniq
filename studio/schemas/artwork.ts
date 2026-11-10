import { defineArrayMember, defineField, defineType } from "sanity";
import { certaintyField, idField, sourceRefs } from "./shared";

const FIELD_GROUPS = [
  { name: "identity", title: "Identity", default: true },
  { name: "photography", title: "Photography" },
  { name: "examination", title: "Examination" },
  { name: "attribution", title: "Attribution" },
  { name: "sources", title: "Sources" },
  { name: "publication", title: "Publication" },
];

/**
 * One document per physical object. Never one per photograph.
 * Confidential administration (prices, insurance, owner, storage) does not
 * belong here — keep it in the separate private archive.
 */
export const artwork = defineType({
  name: "artwork",
  title: "Object",
  type: "document",
  groups: FIELD_GROUPS,
  fields: [
    idField("collectionId", "MUR", "Collection ID"),
    defineField({ name: "title", type: "string", group: "identity", validation: (r) => r.required().min(2).max(160) }),
    defineField({ name: "slug", type: "slug", group: "identity", options: { source: "title", maxLength: 96 }, validation: (r) => r.required() }),
    defineField({
      name: "category",
      type: "string",
      group: "identity",
      options: {
        list: [
          { title: "Murano Glass", value: "murano-glass" },
          { title: "Studio Glass", value: "studio-glass" },
          { title: "Fine Art", value: "fine-art" },
          { title: "Collectible Objects", value: "collectible-objects" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "objectType", title: "Object type", type: "string", group: "identity", validation: (r) => r.required() }),
    defineField({ name: "summary", type: "text", rows: 3, group: "identity", validation: (r) => r.required().min(10).max(300) }),
    defineField({ name: "description", type: "array", of: [{ type: "text" }], group: "identity", validation: (r) => r.required().min(1) }),

    defineField({
      name: "heroImage",
      title: "Main photograph",
      type: "reference",
      to: [{ type: "mediaAsset" }],
      group: "photography",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "images",
      title: "All photographs (in display order)",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "mediaAsset" }] })],
      group: "photography",
      validation: (r) => r.required().min(1),
    }),

    defineField({ name: "materials", type: "array", of: [{ type: "string" }], options: { layout: "tags" }, group: "examination" }),
    defineField({ name: "colours", type: "array", of: [{ type: "string" }], options: { layout: "tags" }, group: "examination" }),
    defineField({ name: "techniques", type: "array", of: [{ type: "reference", to: [{ type: "technique" }] }], group: "examination" }),
    defineField({ name: "country", type: "string", group: "examination" }),
    defineField({
      name: "dimensions",
      type: "object",
      group: "examination",
      description: "Leave empty when unknown. Zero is not 'unknown'.",
      fields: ["heightMm", "widthMm", "depthMm", "diameterMm", "weightG"].map((n) =>
        defineField({ name: n, type: "number", validation: (r) => r.positive() }),
      ),
    }),
    defineField({
      name: "marks",
      title: "Marks & labels",
      type: "array",
      group: "examination",
      of: [
        {
          type: "object",
          fields: [
            { name: "kind", type: "string", options: { list: ["signature", "label", "pontil", "engraving", "stamp", "other"] }, validation: (r) => r.required() },
            { name: "location", type: "string" },
            { name: "observation", type: "text", rows: 2 },
            { name: "transcription", title: "Literal transcription (as written)", type: "string" },
            { name: "interpretation", type: "text", rows: 2, description: "Kept separate from the observation." },
            certaintyField("interpretationCertainty", "Certainty of interpretation"),
            { name: "image", type: "reference", to: [{ type: "mediaAsset" }] },
          ],
          preview: { select: { title: "kind", subtitle: "transcription" } },
        },
      ],
    }),
    defineField({ name: "condition", type: "text", rows: 3, group: "examination" }),

    defineField({
      name: "creators",
      title: "Makers & roles",
      type: "array",
      group: "attribution",
      of: [
        {
          type: "object",
          fields: [
            { name: "creator", type: "reference", to: [{ type: "creator" }], validation: (r) => r.required() },
            { name: "role", type: "string", options: { list: ["designer", "maker", "glasshouse", "decorator", "artist", "publisher"] }, validation: (r) => r.required() },
            certaintyField(),
          ],
          preview: { select: { title: "creator.name", subtitle: "certainty" } },
        },
      ],
    }),
    defineField({ name: "glasshouses", type: "array", of: [{ type: "reference", to: [{ type: "glasshouse" }] }], group: "attribution" }),
    defineField({
      name: "dating",
      type: "object",
      group: "attribution",
      fields: [
        { name: "fromYear", type: "number" },
        { name: "toYear", type: "number" },
        { name: "displayLabel", title: "Shown as", type: "string", validation: (r) => r.required() },
        certaintyField(),
      ],
      validation: (r) =>
        r.custom((d: { fromYear?: number; toYear?: number } | undefined) =>
          d?.fromYear && d?.toYear && d.fromYear > d.toYear ? "From year must not be after To year" : true,
        ),
    }),
    defineField({
      name: "assertions",
      title: "Claims & evidence",
      type: "array",
      group: "attribution",
      description: "Every claim about maker, date, technique or history, with its own certainty and sources.",
      of: [
        {
          type: "object",
          fields: [
            { name: "field", type: "string", options: { list: ["creator", "glasshouse", "dating", "technique", "origin", "mark", "provenance", "other"] }, validation: (r) => r.required() },
            { name: "statement", type: "string", validation: (r) => r.required() },
            certaintyField(),
            sourceRefs,
            { name: "publicNote", title: "Public explanation", type: "text", rows: 3 },
            { name: "reviewedOn", type: "date" },
          ],
          validation: (r) =>
            r.custom((a: { certainty?: string; evidence?: unknown[]; reviewedOn?: string } | undefined) => {
              if (a?.certainty === "verified" && (!a.evidence?.length || !a.reviewedOn))
                return "'Verified' needs named evidence and a review date";
              if (a?.certainty === "documented_attribution" && !a.evidence?.length)
                return "A documented attribution must cite a source";
              return true;
            }),
          preview: { select: { title: "statement", subtitle: "certainty" } },
        },
      ],
    }),
    defineField({
      name: "provenance",
      title: "Public provenance",
      type: "array",
      group: "attribution",
      description: "Only events that may be published. No owner names without permission.",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", validation: (r) => r.required() },
            { name: "fromYear", type: "number" },
            { name: "toYear", type: "number" },
            certaintyField(),
            sourceRefs,
          ],
        },
      ],
    }),

    defineField({ name: "sources", type: "array", of: [{ type: "reference", to: [{ type: "source" }] }], group: "sources" }),
    defineField({
      name: "related",
      title: "Related works (max 3)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "artwork" }] }],
      group: "sources",
      validation: (r) => r.max(3),
    }),

    defineField({
      name: "availability",
      type: "string",
      group: "publication",
      options: {
        list: [
          { title: "Private collection", value: "private_collection" },
          { title: "Enquiries welcome", value: "enquiries_welcome" },
          { title: "Reserved", value: "reserved" },
          { title: "Sold", value: "sold" },
        ],
        layout: "radio",
      },
      initialValue: "private_collection",
      validation: (r) => r.required(),
    }),
    defineField({ name: "inReview", title: "In editorial review", type: "boolean", group: "publication", description: "Workflow label only; publishing is controlled by Publish." }),
    defineField({ name: "featured", title: "Show on homepage (max 3 used)", type: "boolean", group: "publication" }),
    defineField({ name: "curatedOrder", type: "number", group: "publication", initialValue: 1000 }),
    defineField({
      name: "seo",
      type: "object",
      group: "publication",
      fields: [
        { name: "title", type: "string", validation: (r) => r.max(70) },
        { name: "description", type: "text", rows: 2, validation: (r) => r.max(170) },
      ],
    }),
  ],
  preview: {
    select: { title: "title", id: "collectionId", maker: "creators.0.creator.name", media: "heroImage.image" },
    prepare: ({ title, id, maker, media }) => ({ title, subtitle: [id, maker].filter(Boolean).join(" · "), media }),
  },
  orderings: [{ title: "Collection ID", name: "idAsc", by: [{ field: "collectionId", direction: "asc" }] }],
});
