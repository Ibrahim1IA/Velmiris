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
    defineField({
      name: "email",
      title: "Email de contact (public)",
      type: "string",
      description: "Affiché sur /contact (mailto). Validation email.",
      validation: (rule) =>
        rule.custom((v) => {
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v as string) ? true : "Email invalide";
        }),
    }),
    defineField({
      name: "notificationEmails",
      title: "Emails de notification commande",
      description: "Destinataires Resend à chaque commande (plusieurs possibles). Si vide, utilise SHOP_EMAIL (env).",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) =>
        rule.unique().custom((vals) => {
          if (!vals || vals.length === 0) return true;
          const bad = (vals as string[]).filter((v) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
          return bad.length ? `Emails invalides: ${bad.join(", ")}` : true;
        }),
    }),
    defineField({
      name: "adminEmails",
      title: "Emails administrateurs (/admin)",
      description: "Comptes autorisés à accéder à /admin (magic link Supabase). Si vide, utilise ADMIN_EMAIL ou SHOP_EMAIL (env).",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) =>
        rule.unique().custom((vals) => {
          if (!vals || vals.length === 0) return true;
          const bad = (vals as string[]).filter((v) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
          return bad.length ? `Emails invalides: ${bad.join(", ")}` : true;
        }),
    }),
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
