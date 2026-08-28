import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "next-sanity";

// Seed du catalogue VELMIRYS — PRD §10
// Usage : pnpm seed
// ⚠️ Prix et descriptions = placeholders issus de contenus/02 — à corriger dans Studio.

// Le CLI Sanity ne lit pas .env.local (convention Next.js) : chargement manuel.
function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\r\n]*)"?\s*$/);
      if (match && process.env[match[1]] === undefined) {
        process.env[match[1]] = match[2];
      }
    }
  } catch {
    console.warn("⚠️ .env.local introuvable — les variables doivent être dans l'environnement");
  }
}
loadEnvLocal();

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
if (!projectId || projectId.startsWith("TODO")) {
  throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID manquant dans .env.local");
}

const client = createClient({
  projectId,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-19",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const scarfColors = [
  { colorName: "Rose poudré", hex: "#E8C4C4" },
  { colorName: "Bleu ardoise", hex: "#3E4C63" },
  { colorName: "Mauve brume", hex: "#9B7E8C" },
  { colorName: "Crème nude", hex: "#EDE0D4" },
  { colorName: "Noir", hex: "#1C1917" }, // TODO : confirmer noir ou kaki très foncé
  { colorName: "Bordeaux", hex: "#4A1F24" },
];

const bonnetColors = [
  { colorName: "Chocolat", hex: "#5C3A2E" },
  { colorName: "Bordeaux", hex: "#4A1F24" },
  { colorName: "Noir", hex: "#1C1917" },
];

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

type SeedVariant = {
  _type: "productVariant";
  _key: string;
  colorName: string;
  hex: string;
  sku: string;
  inStock: boolean;
};

type SeedProduct = {
  _type: "product";
  title: string;
  slug: { _type: "slug"; current: string };
  category: "foulard" | "bonnet" | "epingle";
  description: string;
  material?: string;
  care?: string[];
  priceXof: number;
  priceEur: number;
  priceGnf: number;
  featured: boolean;
  variants: SeedVariant[];
};

async function seed() {
  // TODO-CONTENU : prix réels FCFA/EUR/GNF (CONTENUS-A-FOURNIR.md §E) — valeurs provisoires ci-dessous
  const products: SeedProduct[] = [
    {
      _type: "product",
      title: "Foulard Jersey Premium",
      slug: { _type: "slug", current: "foulard-jersey-premium" },
      category: "foulard",
      description:
        "Son jersey premium tombe parfaitement et reste en place, sans épaisseur ni transparence. Il se noue en quelques secondes, tient du matin au soir, et se lave sans se déformer.",
      material: "TODO : composition exacte",
      care: ["Lavage à la main ou en machine à 30°, cycle délicat", "Séchage à plat", "Repassage à basse température"],
      priceXof: 12000, // placeholder
      priceEur: 18, // placeholder
      priceGnf: 180000, // placeholder — à ajuster manuellement (GNF)
      featured: true,
      variants: scarfColors.map((c) => ({
        _type: "productVariant",
        _key: slugify(c.colorName),
        ...c,
        sku: `FJP-${slugify(c.colorName).toUpperCase()}`,
        inStock: true,
      })),
    },
    {
      _type: "product",
      title: "Bonnet Sous-Hijab",
      slug: { _type: "slug", current: "bonnet-sous-hijab" },
      category: "bonnet",
      description:
        "Porté sous votre foulard, il maintient chaque mèche en place sans serrer et sans glisser. Ses liens se nouent à votre mesure, sa maille respirante se fait oublier.",
      material: "TODO : composition exacte",
      care: ["Lavage 30°", "Séchage à plat"],
      priceXof: 5000, // placeholder
      priceEur: 8, // placeholder
      priceGnf: 75000, // placeholder — à ajuster manuellement (GNF)
      featured: false,
      variants: bonnetColors.map((c) => ({
        _type: "productVariant",
        _key: slugify(c.colorName),
        ...c,
        sku: `BSH-${slugify(c.colorName).toUpperCase()}`,
        inStock: true,
      })),
    },
    {
      _type: "product",
      title: "Coffret Épingles à hijab — set de 6",
      slug: { _type: "slug", current: "coffret-epingles" },
      category: "epingle",
      description:
        "Des épingles à hijab aux couleurs assorties à vos voiles, présentées dans un coffret blanc brandé. Discrètes, solides, et sans danger pour vos tissus les plus délicats.",
      priceXof: 6500, // placeholder
      priceEur: 10, // placeholder
      priceGnf: 97000, // placeholder — à ajuster manuellement (GNF)
      featured: false,
      variants: [
        { _key: "tons-pastel", colorName: "Tons pastel", hex: "#E8C4C4" },
        { _key: "tons-neutres", colorName: "Tons neutres", hex: "#EDE0D4" },
        { _key: "tons-bleus", colorName: "Tons bleus", hex: "#3E4C63" },
        { _key: "noir-blanc", colorName: "Noir & blanc", hex: "#1C1917" },
      ].map((c) => ({ _type: "productVariant", ...c, sku: `EP6-${c._key.toUpperCase()}`, inStock: true })),
    },
    {
      _type: "product",
      title: "Plaquette Épingles Perles — set de 12",
      slug: { _type: "slug", current: "plaquette-epingles-perles" },
      category: "epingle",
      description:
        "Douze épingles droites coiffées de perles aux teintes douces, pour fixer vos voiles avec élégance. Présentées sur leur plaquette, prêtes à offrir — ou à garder pour soi.",
      priceXof: 4000, // placeholder
      priceEur: 6, // placeholder
      priceGnf: 60000, // placeholder — à ajuster manuellement (GNF)
      featured: false,
      variants: [
        {
          _type: "productVariant",
          _key: "multicolore-pastel",
          colorName: "Multicolore pastel",
          hex: "#E8C4C4",
          sku: "EPP-MULTI",
          inStock: true,
        },
      ],
    },
  ];

  const settings = {
    _id: "siteSettings",
    _type: "siteSettings",
    whatsappNumber: process.env.NEXT_PUBLIC_SHOP_WHATSAPP_NUMBER || "221770000000", // TODO
    giftMessageExamples: [
      "Joyeux anniversaire 🤍 Tu mérites le plus beau.",
      "Merci d'être toi, tout simplement.",
      "Une petite attention, juste parce que.",
    ],
  };

  const tx = client.transaction();
  for (const p of products) {
    tx.createOrReplace({ ...p, _id: p.slug.current });
  }
  tx.createOrReplace(settings);
  await tx.commit();
  console.log(`✅ Seed terminé : ${products.length} produits + réglages`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
