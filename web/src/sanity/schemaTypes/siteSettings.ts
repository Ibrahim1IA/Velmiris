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
      description:
        "Liste des emails pouvant recevoir les notifications. Ajoutez un email puis sa clé Resend dans .env (RESEND_API_KEYS). Cochez les actifs ci-dessous.",
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
      name: "activeNotificationEmails",
      title: "Emails actifs (notifications)",
      description:
        "Cochez les destinataires actifs (multi-actif). Vide = tous les emails ci-dessus reçoivent. Chaque actif doit être dans la liste ci-dessus. La clé Resend correspondante doit être dans .env RESEND_API_KEYS.",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) =>
        rule.unique().custom((vals, ctx) => {
          if (!vals || vals.length === 0) return true;
          const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const bad = (vals as string[]).filter((v) => !emailRe.test(v));
          if (bad.length) return `Emails invalides: ${bad.join(", ")}`;
          const parent = ctx.parent as { notificationEmails?: string[] } | undefined;
          const allowed = new Set((parent?.notificationEmails || []).map((e) => e.toLowerCase().trim()));
          const notAllowed = (vals as string[]).filter((v) => !allowed.has(v.toLowerCase().trim()));
          if (notAllowed.length) return `Doit être dans notificationEmails: ${notAllowed.join(", ")}`;
          return true;
        }),
    }),
    defineField({
      name: "adminUsers",
      title: "Utilisateurs admin (/admin) — avec rôles",
      description:
        "Source de vérité unique. Rôle admin = peut gérer les collaborateurs + son propre mot de passe (pas celui d'un autre admin). Rôle collaborateur = accès commandes uniquement, pas de gestion users. Après ajout, créer le mot de passe dans /admin/users.",
      type: "array",
      of: [
        {
          type: "object",
          name: "adminUser",
          title: "Utilisateur",
          fields: [
            defineField({
              name: "email",
              title: "Email",
              type: "string",
              validation: (rule) =>
                rule.required().custom((v) => {
                  if (!v) return "Email requis";
                  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v as string) ? true : "Email invalide";
                }),
            }),
            defineField({
              name: "role",
              title: "Rôle",
              type: "string",
              initialValue: "collaborateur",
              options: {
                list: [
                  { title: "Admin", value: "admin" },
                  { title: "Collaborateur", value: "collaborateur" },
                ],
                layout: "radio",
              },
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { email: "email", role: "role" },
            prepare({ email, role }) {
              return {
                title: email || "—",
                subtitle: role === "admin" ? "Admin" : "Collaborateur",
              };
            },
          },
        },
      ],
      validation: (rule) =>
        rule
          .unique()
          .custom((vals) => {
            if (!vals || vals.length === 0) return true;
            const emails = (vals as { email?: string }[]).map((v) => (v.email || "").toLowerCase().trim()).filter(Boolean);
            const bad = emails.filter((v) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
            if (bad.length) return `Emails invalides: ${bad.join(", ")}`;
            const seen = new Set<string>();
            for (const e of emails) {
              if (seen.has(e)) return `Doublon: ${e}`;
              seen.add(e);
            }
            return true;
          }),
    }),
    defineField({
      name: "adminEmails",
      title: "Emails administrateurs (déprécié)",
      description: "Ancien champ string[]. Conservé pour migration — utiliser adminUsers. Masqué si adminUsers est renseigné.",
      type: "array",
      of: [{ type: "string" }],
      hidden: ({ document }) => {
        const users = (document as unknown as { adminUsers?: unknown[] })?.adminUsers;
        return Array.isArray(users) && users.length > 0;
      },
      validation: (rule) =>
        rule.custom((vals) => {
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
