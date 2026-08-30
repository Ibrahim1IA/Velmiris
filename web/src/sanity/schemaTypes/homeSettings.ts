import { defineField, defineType } from "sanity";

// Page d'accueil — singleton éditable depuis /studio
// Tous les textes et images du lander sont modifiables ici.
// Fallback : valeurs hardcodées de src/app/page.tsx + messages/fr.json
export const homeSettings = defineType({
  name: "homeSettings",
  title: "Page d'accueil",
  type: "document",
  fields: [
    // ── Hero ──
    defineField({ name: "heroSurtitle", title: "Hero — Sur-titre", type: "string", description: "Ex. VELMIRYS" }),
    defineField({ name: "heroTitle", title: "Hero — Titre", type: "string", description: "Ex. Le voile, porté comme un présent." }),
    defineField({ name: "heroBaseline", title: "Hero — Baseline", type: "text", rows: 3 }),
    defineField({ name: "heroCtaPrimary", title: "Hero — CTA principal (label)", type: "string", description: "Ex. Composer votre box" }),
    defineField({ name: "heroCtaSecondary", title: "Hero — CTA secondaire (label)", type: "string", description: "Ex. Découvrir la boutique" }),
    defineField({ name: "heroImage", title: "Hero — Image", type: "image", options: { hotspot: true }, description: "Portrait lifestyle hero" }),
    defineField({ name: "heroImageAlt", title: "Hero — Alt image", type: "string" }),
    defineField({ name: "heroCardTitle", title: "Hero — Carte flottante : titre", type: "string", description: "Ex. Douceur & tenue" }),
    defineField({ name: "heroCardText", title: "Hero — Carte flottante : texte", type: "text", rows: 2 }),
    defineField({ name: "heroBadge1", title: "Hero — Badge 1 (pastille)", type: "string", description: "Ex. Emballage offert" }),
    defineField({ name: "heroBadge2", title: "Hero — Badge 2", type: "string", description: "Ex. Jersey qui ne glisse pas" }),

    // ── Manifeste ──
    defineField({ name: "manifestoSurtitle", title: "Manifeste — Sur-titre", type: "string", description: "Ex. MANIFESTE" }),
    defineField({ name: "manifestoTitle", title: "Manifeste — Titre", type: "text", rows: 2 }),
    defineField({ name: "manifestoText", title: "Manifeste — Texte", type: "text", rows: 4 }),
    defineField({ name: "manifestoCta", title: "Manifeste — Label lien", type: "string", description: "Ex. Découvrir notre univers" }),
    defineField({ name: "manifestoImage", title: "Manifeste — Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "manifestoImageAlt", title: "Manifeste — Alt image", type: "string" }),
    defineField({ name: "manifestoCardTitle", title: "Manifeste — Carte flottante : titre", type: "string" }),
    defineField({ name: "manifestoCardText", title: "Manifeste — Carte flottante : texte", type: "text", rows: 2 }),

    // ── Palette (Nos teintes) ── liée aux produits featured=true
    defineField({ name: "shadesSurtitle", title: "Palette — Sur-titre", type: "string", description: "Ex. PALETTE" }),
    defineField({ name: "shadesTitle", title: "Palette — Titre", type: "string" }),
    defineField({ name: "shadesText", title: "Palette — Texte", type: "text", rows: 3 }),
    defineField({ name: "shadesCtaAll", title: "Palette — CTA 'Toute la boutique'", type: "string" }),
    defineField({ name: "shadesCtaTile", title: "Palette — Label tuile (hover)", type: "string", description: "Ex. Voir" }),

    // ── Box builder teaser ──
    defineField({ name: "builderSurtitle", title: "Box — Sur-titre", type: "string" }),
    defineField({ name: "builderTitle", title: "Box — Titre", type: "string" }),
    defineField({ name: "builderText", title: "Box — Texte", type: "text", rows: 3 }),
    defineField({ name: "builderCta", title: "Box — CTA", type: "string" }),
    defineField({ name: "builderImage", title: "Box — Image packaging", type: "image", options: { hotspot: true } }),
    defineField({ name: "builderImageAlt", title: "Box — Alt image", type: "string" }),
    defineField({
      name: "builderSteps",
      title: "Box — Étapes (3)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "Titre", type: "string", validation: (r) => r.required() },
            { name: "text", title: "Texte", type: "text", rows: 2, validation: (r) => r.required() },
          ],
          preview: { select: { title: "title", subtitle: "text" } },
        },
      ],
      validation: (r) => r.max(3),
    }),

    // ── Éditorial ──
    defineField({ name: "editorialSurtitle", title: "Éditorial — Sur-titre", type: "string" }),
    defineField({ name: "editorialTitle", title: "Éditorial — Titre", type: "string" }),
    defineField({ name: "editorialText", title: "Éditorial — Texte", type: "text", rows: 4 }),
    defineField({ name: "editorialImage", title: "Éditorial — Image principale", type: "image", options: { hotspot: true } }),
    defineField({ name: "editorialImageAlt", title: "Éditorial — Alt image principale", type: "string" }),
    defineField({ name: "editorialThumbImage", title: "Éditorial — Vignette texture", type: "image", options: { hotspot: true } }),
    defineField({ name: "editorialThumbTitle", title: "Éditorial — Vignette titre", type: "string", description: "Ex. Maille respirante" }),
    defineField({ name: "editorialThumbText", title: "Éditorial — Vignette texte", type: "text", rows: 2 }),
    defineField({ name: "editorialCta", title: "Éditorial — Label lien", type: "string" }),

    // ── Engagements ──
    defineField({ name: "engagementsTitle", title: "Engagements — Titre", type: "string" }),
    defineField({
      name: "engagements",
      title: "Engagements — Items (3)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "Titre", type: "string", validation: (r) => r.required() },
            { name: "text", title: "Texte", type: "text", rows: 3, validation: (r) => r.required() },
          ],
          preview: { select: { title: "title", subtitle: "text" } },
        },
      ],
      validation: (r) => r.max(3),
    }),

    // ── Témoignages ──
    defineField({ name: "testimonialsSurtitle", title: "Témoignages — Sur-titre", type: "string" }),
    defineField({ name: "testimonialQuote", title: "Témoignages — Citation", type: "text", rows: 3 }),
    defineField({ name: "testimonialAuthor", title: "Témoignages — Auteur", type: "string" }),
  ],
  preview: {
    select: { title: "heroTitle", subtitle: "heroSurtitle", media: "heroImage" },
    prepare({ title, subtitle, media }) {
      return { title: title || "Page d'accueil", subtitle: subtitle || "homeSettings", media };
    },
  },
});
