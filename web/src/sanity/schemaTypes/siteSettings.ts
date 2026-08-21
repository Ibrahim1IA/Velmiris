import { defineField, defineType } from "sanity";

// Réglages du site (singleton) — PRD §10.1
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Réglages du site",
  type: "document",
  fields: [
    defineField({
      name: "whatsappNumber",
      title: "Numéro WhatsApp de la boutique",
      type: "string",
      description: "Format international sans « + » ni espaces — ex. 221770000000",
      validation: (rule) => rule.required().regex(/^\d{8,15}$/, { name: "format international" }),
    }),
    defineField({ name: "email", title: "Email de contact", type: "string" }),
    defineField({ name: "instagram", title: "URL Instagram", type: "url" }),
    defineField({ name: "tiktok", title: "URL TikTok", type: "url" }),
    defineField({
      name: "giftMessageExamples",
      title: "Exemples de messages cadeaux (builder)",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "deliveryZonesLabel",
      title: "Zones de livraison (texte affiché)",
      type: "string",
      description: "V1 : la livraison est confirmée sur WhatsApp (PRD §6)",
    }),
  ],
});
