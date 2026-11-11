import { defineArrayMember, defineField, defineType } from "sanity";
import { certaintyField, idField, sourceRefs } from "./shared";

export const MARK_KINDS = [
  { title: "Personal signature", value: "personal_signature" },
  { title: "Factory mark", value: "factory_mark" },
  { title: "Label", value: "label" },
  { title: "Inscription (other)", value: "inscription" },
];

export const MARK_APPLICATIONS = [
  { title: "Diamond-point engraving", value: "diamond_point" },
  { title: "Wheel engraving", value: "wheel_engraved" },
  { title: "Other engraving", value: "engraved_other" },
  { title: "Acid-etched stamp", value: "acid_etched" },
  { title: "Painted in enamel", value: "enamel_painted" },
  { title: "Lettered glass cane (in the glass)", value: "cane" },
  { title: "Impressed", value: "impressed" },
  { title: "Printed label", value: "printed_label" },
  { title: "Handwritten label", value: "handwritten_label" },
  { title: "Unknown", value: "unknown" },
];

const ROLES = ["designer", "maker", "glasshouse", "decorator", "artist", "publisher"];

const GROUPS = [
  { name: "identity", title: "Identity", default: true },
  { name: "observation", title: "Observation" },
  { name: "interpretation", title: "Interpretation & dating" },
  { name: "object", title: "Documented object" },
  { name: "photography", title: "Photography" },
  { name: "sources", title: "Sources & review" },
];

/**
 * One documented example of a signature, factory mark, label or inscription.
 * Visibility is Sanity's own: only published documents reach the site. A
 * photograph is shown only when its Photograph document is rights-cleared,
 * credited and this reference has a review date; otherwise the site shows a
 * text reference with the source.
 */
export const signatureReference = defineType({
  name: "signatureReference",
  title: "Signature reference",
  type: "document",
  groups: GROUPS,
  fields: [
    idField("signatureId", "SIG", "Reference ID"),
    defineField({ name: "title", title: "Short title", type: "string", group: "identity", validation: (r) => r.required().min(3).max(120) }),
    defineField({ name: "sortOrder", title: "Default order", type: "number", group: "identity", initialValue: 100, description: "Order on a maker profile is set on the maker; this is the fallback." }),
    defineField({ name: "variantGroup", title: "Variant group", type: "string", group: "identity", description: "Same wording, technique and period. Used to keep variants apart." }),
    defineField({ name: "kind", title: "Kind of mark", type: "string", group: "identity", options: { list: MARK_KINDS, layout: "radio" }, validation: (r) => r.required() }),
    defineField({ name: "application", title: "How it was applied", type: "string", group: "identity", options: { list: MARK_APPLICATIONS }, initialValue: "unknown", validation: (r) => r.required() }),

    defineField({
      name: "markRef",
      title: "Mark on a collection object",
      type: "object",
      group: "observation",
      description: "For marks on MURANIQ objects: link the mark recorded on the object. The transcription is then read from there — do not repeat it below.",
      fields: [
        { name: "artwork", type: "reference", to: [{ type: "artwork" }] },
        { name: "markId", title: "Mark ID on that object (MRK-…)", type: "string" },
      ],
    }),
    defineField({
      name: "observation",
      title: "Observation (objects held elsewhere)",
      type: "object",
      group: "observation",
      fields: [
        { name: "transcription", title: "Literal transcription", type: "string", description: "Exactly as written. “/” for a line break, […] for an illegible part." },
        { name: "transcriptionNote", title: "What could not be read, and how it was read", type: "text", rows: 2 },
        { name: "location", title: "Place on the object", type: "string" },
        {
          name: "transcribedFrom",
          type: "string",
          options: { list: [{ title: "Read by us from a photograph", value: "photograph" }, { title: "Quoted from the source", value: "source" }], layout: "radio" },
        },
        certaintyField("transcriptionCertainty", "Certainty of the reading"),
      ],
    }),

    defineField({
      name: "interpretation",
      type: "object",
      group: "interpretation",
      fields: [{ name: "reading", title: "Proposed reading", type: "text", rows: 2 }, certaintyField()],
    }),
    defineField({
      name: "markOf",
      title: "Whose mark",
      type: "object",
      group: "interpretation",
      description: "The person who signed, or the firm whose factory mark or label it is. A factory mark belongs to the glasshouse, never to a designer.",
      fields: [
        { name: "creator", type: "reference", to: [{ type: "creator" }] },
        { name: "role", type: "string", options: { list: ROLES } },
        certaintyField(),
      ],
    }),
    defineField({
      name: "dating",
      title: "Date of this example",
      type: "object",
      group: "interpretation",
      description: "Usually the documented object's date. Not the period of use of the mark.",
      fields: [
        { name: "fromYear", type: "number" },
        { name: "toYear", type: "number" },
        { name: "displayLabel", title: "Shown as", type: "string" },
        certaintyField(),
        { name: "source", title: "Source of the date", type: "reference", to: [{ type: "source" }] },
      ],
    }),
    defineField({
      name: "variantPeriod",
      title: "Documented period of use of this variant",
      type: "object",
      group: "interpretation",
      description: "Only with its own source. Never derived from one dated object.",
      fields: [
        { name: "displayLabel", title: "Shown as", type: "string" },
        { name: "fromYear", type: "number" },
        { name: "toYear", type: "number" },
        certaintyField(),
        sourceRefs,
      ],
    }),

    defineField({
      name: "object",
      title: "Documented object",
      type: "object",
      group: "object",
      fields: [
        { name: "artwork", title: "Object on MURANIQ", type: "reference", to: [{ type: "artwork" }] },
        {
          name: "external",
          title: "Object held elsewhere (museum, archive, auction)",
          type: "object",
          description: "Never create a collection object for this.",
          fields: [
            { name: "kind", type: "string", options: { list: ["museum", "archive", "auction", "other"] } },
            { name: "title", type: "string" },
            { name: "institution", type: "string" },
            { name: "identifier", title: "Accession / inventory / lot number", type: "string" },
            { name: "url", type: "url" },
            { name: "dateLabel", title: "Date as recorded", type: "string" },
            {
              name: "creators",
              title: "Makers named on the record",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    { name: "name", type: "string" },
                    { name: "creator", type: "reference", to: [{ type: "creator" }] },
                    { name: "role", type: "string", options: { list: ROLES } },
                    certaintyField(),
                  ],
                  preview: { select: { title: "name", subtitle: "role" } },
                },
              ],
            },
          ],
        },
      ],
      validation: (r) =>
        r.custom((o: { artwork?: unknown; external?: { url?: string } } | undefined) =>
          o?.artwork || o?.external?.url ? true : "Link the documented object",
        ),
    }),

    defineField({
      name: "detailImage",
      title: "Close-up of the mark",
      type: "reference",
      to: [{ type: "mediaAsset" }],
      group: "photography",
      description: "Replace the photograph here. Upload only rights-cleared web images (Sanity assets are public).",
      validation: (r) =>
        r
          .custom((v, ctx) => (v && !ctx.document?.reviewedOn ? "The photograph stays hidden until the editorial review date is set" : true))
          .warning(),
    }),
    defineField({
      name: "contextImages",
      title: "Whole base / whole object",
      type: "array",
      group: "photography",
      of: [defineArrayMember({ type: "reference", to: [{ type: "mediaAsset" }] })],
      validation: (r) => r.max(4),
    }),

    defineField({ ...sourceRefs, group: "sources", validation: (r) => r.required().min(1) }),
    defineField({ name: "reviewedOn", title: "Editorial review date", type: "date", group: "sources" }),
    defineField({ name: "internalNote", title: "Internal note (never published)", type: "text", rows: 3, group: "sources" }),
  ],
  preview: {
    select: { title: "title", kind: "kind", owner: "markOf.creator.name", media: "detailImage.image" },
    prepare: ({ title, kind, owner, media }) => ({
      title,
      subtitle: [MARK_KINDS.find((k) => k.value === kind)?.title, owner].filter(Boolean).join(" · "),
      media,
    }),
  },
});
