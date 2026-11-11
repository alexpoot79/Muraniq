import { defineField } from "sanity";

export const CERTAINTY = [
  { title: "Verified (named evidence + review)", value: "verified" },
  { title: "Documented attribution (cited source)", value: "documented_attribution" },
  { title: "Probable", value: "probable" },
  { title: "Hypothesis", value: "hypothesis" },
  { title: "Unknown / not documented", value: "unknown" },
];

export const certaintyField = (name = "certainty", title = "Certainty") =>
  defineField({
    name,
    title,
    type: "string",
    options: { list: CERTAINTY, layout: "radio" },
    validation: (r) => r.required(),
  });

export const idField = (name: string, prefix: string, title: string) =>
  defineField({
    name,
    title,
    type: "string",
    description: `Stable identifier, never reused (e.g. ${prefix}-0001). Independent of the URL slug.`,
    validation: (r) =>
      r
        .required()
        .regex(new RegExp(`^${prefix}-[A-Z0-9-]+$`), { name: `${prefix}-XXXX` })
        .custom(async (value, ctx) => {
          if (!value) return true;
          const client = ctx.getClient({ apiVersion: "2025-02-19" });
          const id = ctx.document?._id.replace(/^drafts\./, "");
          const n = await client.fetch(`count(*[defined(${name}) && ${name} == $v && !(_id in [$id, "drafts." + $id])])`, {
            v: value,
            id,
          });
          return n === 0 || "This identifier is already in use";
        }),
  });

export const sourceRefs = defineField({
  name: "evidence",
  title: "Evidence",
  type: "array",
  of: [
    {
      type: "object",
      fields: [
        { name: "source", type: "reference", to: [{ type: "source" }], validation: (r) => r.required() },
        { name: "locator", title: "Page / plate / lot", type: "string" },
        { name: "consultedOn", title: "Consulted on", type: "date" },
        { name: "note", title: "Note on what the source says", type: "string", validation: (r) => r.max(300) },
      ],
      preview: { select: { title: "source.title", subtitle: "locator" } },
    },
  ],
});
