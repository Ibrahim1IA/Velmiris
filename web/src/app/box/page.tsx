import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import BoxBuilder from "./BoxBuilder";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const title = "Composer votre box — VELMIRYS";
  const description = "Choisissez 2 à 5 articles — l'emballage cadeau est offert. La box 3D se remplit en direct.";
  const canonical = `${siteUrl}/box`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "VELMIRYS",
      locale: "fr_FR",
      type: "website",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

type ProductVariant = {
  _key: string;
  colorName: string;
  hex: string;
  sku?: string;
  inStock: boolean;
};

type Product = {
  _id: string;
  title: string;
  slug: { current: string };
  category: "foulard" | "bonnet" | "epingle";
  priceXof: number;
  priceEur: number;
  priceGnf: number;
  variants: ProductVariant[];
};

type CardDesign = {
  _id: string;
  name: string;
  image: unknown;
  order: number;
  active: boolean;
};

export default async function BoxPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string }>;
}) {
  const { add } = await searchParams;

  let products: Product[] = [];
  let cards: CardDesign[] = [];
  let siteSettings: { giftMessageExamples?: string[] } | null = null;
  const withTimeout = <T,>(p: Promise<T>, ms = 2500) =>
    Promise.race([p, new Promise<never>((_, reject) => setTimeout(() => reject(new Error("sanity timeout e2e")), ms))]) as Promise<T>;
  try {
    [products, cards, siteSettings] = await Promise.all([
      withTimeout(
        client.fetch<Product[]>(
          `*[_type == "product"] | order(title asc) {
        _id, title, slug, category, priceXof, priceEur, priceGnf,
        variants[]{ _key, colorName, hex, sku, inStock }
      }`,
          {},
          { next: { revalidate: 60, tags: ["products"] } },
        ),
      ),
      withTimeout(
        client.fetch<CardDesign[]>(
          `*[_type == "cardDesign" && active == true] | order(order asc) { _id, name, image, order, active }`,
          {},
          { next: { revalidate: 60, tags: ["cards"] } },
        ),
      ),
      withTimeout(
        client
          .fetch<{ giftMessageExamples?: string[] }>(
            `*[_type == "siteSettings"][0]{ giftMessageExamples }`,
            {},
            { next: { revalidate: 60, tags: ["settings"] } },
          )
          .catch(() => ({ giftMessageExamples: [] })),
      ),
    ]);
  } catch {
    products = [];
    cards = [];
    siteSettings = { giftMessageExamples: [] };
  }

  // Fallback cards si aucun en Sanity (placeholder)
  const effectiveCards: CardDesign[] =
    cards.length > 0
      ? cards
      : [
          { _id: "card-1", name: "Thank You — Floral", image: null, order: 0, active: true } as CardDesign,
          { _id: "card-2", name: "Minimal — Crème", image: null, order: 1, active: true } as CardDesign,
        ];

  const fallbackExamples = [
    "Joyeux anniversaire 🤍 Tu mérites le plus beau.",
    "Merci d'être toi, tout simplement.",
    "Une petite attention, juste parce que.",
  ];

  const siteUrl = getSiteUrl();
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Box cadeau", item: `${siteUrl}/box` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <nav aria-label="Fil d'Ariane" className="mx-auto max-w-6xl px-6 pt-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-ink/60">
          <li>
            <Link href="/" className="hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">
              Accueil
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-ink">
            Box cadeau
          </li>
        </ol>
      </nav>
      <BoxBuilder
        products={products}
        cards={effectiveCards}
        giftExamples={siteSettings?.giftMessageExamples?.length ? siteSettings.giftMessageExamples : fallbackExamples}
        initialAdd={add ?? null}
      />
    </>
  );
}
