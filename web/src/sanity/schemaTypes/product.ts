import { defineField, defineType } from "sanity";

// Schéma produit — PRD §10.1
export const productVariant = defineType({
  name: "productVariant",
  title: "Coloris",
  type: "object",
  fields: [
    defineField({
      name: "colorName",
      title: "Nom du coloris",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "hex",
      title: "Code couleur (hex)",
      type: "string",
      description: "Ex. #E8C4C4 — utilisé pour les swatches et la scène 3D",
      validation: (rule) => rule.required().regex(/^#([0-9a-fA-F]{6})$/, { name: "hex #RRGGBB" }),
    }),
    defineField({ name: "sku", title: "SKU", type: "string" }),
    defineField({
      name: "inStock",
      title: "En stock",
      type: "boolean",
      initialValue: true,
      description: "Interrupteur manuel — la dispo finale est confirmée sur WhatsApp (PRD §6)",
    }),
    defineField({
      name: "images",
      title: "Photos",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
  ],
});

export const product = defineType({
  name: "product",
  title: "Produit",
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
      name: "category",
      title: "Catégorie",
      type: "string",
      options: {
        list: [
          { title: "Foulard", value: "foulard" },
          { title: "Bonnet", value: "bonnet" },
          { title: "Épingles", value: "epingle" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "description", title: "Description", type: "text", rows: 4 }),
    defineField({ name: "material", title: "Matière", type: "string" }),
    defineField({
      name: "care",
      title: "Entretien",
      type: "array",
      of: [{ type: "string" }],
      description: "Une ligne par conseil (ex. « Lavage à la main ou 30°, cycle délicat »)",
    }),
    // Double saisie manuelle FCFA/EUR — pas de taux auto (PRD §2 / G2)
    defineField({ name: "priceXof", title: "Prix (FCFA)", type: "number", validation: (rule) => rule.required().min(0) }),
    defineField({ name: "priceEur", title: "Prix (EUR)", type: "number", validation: (rule) => rule.required().min(0) }),
    defineField({
      name: "featured",
      title: "Mise en avant (accueil « Nos teintes »)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "variants",
      title: "Coloris",
      type: "array",
      of: [{ type: "productVariant" }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "title", media: "variants.0.images.0" },
  },
});
