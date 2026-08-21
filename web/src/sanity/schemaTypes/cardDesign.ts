import { defineField, defineType } from "sanity";

// Designs de cartes cadeaux du Box Builder — PRD §10.1
export const cardDesign = defineType({
  name: "cardDesign",
  title: "Carte cadeau (design)",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Nom", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "image",
      title: "Visuel de la carte",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "order", title: "Ordre d'affichage", type: "number", initialValue: 0 }),
    defineField({ name: "active", title: "Actif", type: "boolean", initialValue: true }),
  ],
  orderings: [{ title: "Ordre d'affichage", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
});
