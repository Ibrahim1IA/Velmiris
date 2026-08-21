import { defineField, defineType } from "sanity";

// Pages éditoriales et légales (à propos, contact, CGV…) — PRD §10.1
export const pageContent = defineType({
  name: "pageContent",
  title: "Page éditoriale",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Titre", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Contenu",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
});
