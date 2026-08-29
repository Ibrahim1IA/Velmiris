import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { sanityFetch } from "@/sanity/lib/fetch";
import { urlFor } from "@/sanity/lib/image";
import Price from "@/components/shop/Price";
import BoutiqueFilters from "@/components/shop/BoutiqueFilters";
import BoutiqueSearchBar from "@/components/shop/BoutiqueSearchBar";
import { getSiteUrl } from "@/lib/site";

// ISR 60s — revalidé par webhook Sanity en prod (PRD §9.2)
export const revalidate = 60;

type ProductVariant = {
  _key: string;
  colorName: string;
  hex: string;
  sku?: string;
  inStock: boolean;
  images?: Array<{ asset?: unknown; hotspot?: unknown; crop?: unknown }>;
};

type Product = {
  _id: string;
  title: string;
  slug: { current: string };
  category: "foulard" | "bonnet" | "epingle";
  priceXof: number;
  priceEur: number;
  priceGnf: number;
  images?: Array<{ asset?: unknown; hotspot?: unknown; crop?: unknown }>;
  variants: ProductVariant[];
};

type SearchParams = { category?: string; q?: string };

export async function generateMetadata(): Promise<import("next").Metadata> {
  const t = await getTranslations("boutique");
  const siteUrl = getSiteUrl();
  const title = `${t("title")} — VELMIRYS`;
  const description = t("subtitle");
  const canonical = `${siteUrl}/boutique`;
  const ogImage = `${siteUrl}/boutique/opengraph-image`;
  return {
    title: t("title"),
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "VELMIRYS",
      locale: "fr_FR",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Boutique VELMIRYS — Foulards premium, bonnets et épingles" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category, q } = await searchParams;
  const validCategory =
    category && ["foulard", "bonnet", "epingle"].includes(category)
      ? category
      : null;
  const query = q?.trim() ? q.trim() : null;
  const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

  // Parallélise i18n + fetch Sanity ; filtre poussé côté GROQ pour + perf
  // Fallback offline : si Sanity timeout (e2e sans réseau), on rend boutique vide mais sans crasher
  let t: Awaited<ReturnType<typeof getTranslations>>;
  let products: Product[] = [];
  try {
    const sanityPromise = sanityFetch<Product[]>(
      `*[_type == "product" && (!defined($category) || category == $category)] | order(title asc) {
        _id, title, slug, category, priceXof, priceEur, priceGnf, "images": images[0...1],
        variants[]{ _key, colorName, hex, sku, inStock, "images": images[0...1] }
      }`,
      { category: validCategory },
      { next: { revalidate: 60, tags: ["products"] } },
    );
    // Timeout court en CI uniquement (e2e offline, PRD §9.3) : en prod, un premier
    // rendu à froid prend 1-3 s — un timeout de 2,5 s viderait la boutique et l'ISR
    // figerait ce rendu vide pendant 60 s.
    const sanityTimeoutMs = process.env.CI ? 2500 : 20000;
    const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("sanity timeout e2e")), sanityTimeoutMs));
    const fetchWithTimeout = Promise.race([sanityPromise, timeoutPromise]) as Promise<Product[]>;
    [t, products] = await Promise.all([getTranslations("boutique"), fetchWithTimeout]);
  } catch (error) {
    console.error("[boutique] Échec du fetch Sanity (rendu sans produits):", error);
    t = await getTranslations("boutique");
    products = [];
  }

  const filterLabels = {
    all: t("filters.all"),
    foulard: t("filters.foulard"),
    bonnet: t("filters.bonnet"),
    epingle: t("filters.epingle"),
    label: t("filters.label"),
  };

  const tiles = products.flatMap((p) =>
    p.variants.map((v) => ({ product: p, variant: v })),
  );

  // Filtre texte q côté serveur (hybride, instant sans re-fetch GROQ match accent-insensible)
  const filtered = query
    ? tiles.filter(({ product, variant }) => {
        const hay = normalize(`${product.title} ${product.category} ${variant.colorName} ${variant.sku ?? ""}`);
        return hay.includes(normalize(query));
      })
    : tiles;

  const siteUrlBC = getSiteUrl();
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrlBC },
      { "@type": "ListItem", position: 2, name: "Boutique", item: `${siteUrlBC}/boutique` },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <nav aria-label="Fil d'Ariane" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-ink/60">
          <li>
            <Link href="/" className="hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">
              Accueil
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-ink">
            Boutique
          </li>
        </ol>
      </nav>
      <header className="mb-8">
        <h1 className="font-serif text-4xl tracking-tight md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-ink/60">{t("subtitle")}</p>
      </header>

      {/* Filtres — scroll away (usage ponctuel) */}
      <div className="mb-4 flex flex-col gap-3 md:mb-6">
        <BoutiqueFilters labels={filterLabels} />
      </div>
      {/* Recherche — seule sticky */}
      <div className="sticky top-[69px] z-30 -mx-6 mb-8 border-y border-sand bg-cream/90 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-cream/85">
        <div className="flex items-center gap-3 md:justify-between">
          <BoutiqueSearchBar placeholder={t("search.placeholder")} label={t("search.label")} />
          <p className="shrink-0 text-sm text-ink/60" aria-live="polite" aria-atomic="true">
            {t("count", { count: filtered.length })}
          </p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-ink/60">
          {query ? t("search.noResults", { q: query }) : t("empty")}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map(({ product, variant }, index) => {
            const href = `/boutique/${product.slug.current}?variant=${variant._key}`;
            // Fallback: image variante → image générale produit → hex (alerte admin)
            const rawImage = variant.images?.[0] ?? product.images?.[0];
            const imageUrl = rawImage
              ? urlFor(rawImage as never)
                  .width(600)
                  .height(750)
                  .fit("crop")
                  .quality(80)
                  .auto("format")
                  .url()
              : null;
            const isPriority = index < 4;

            return (
              <Link
                key={`${product._id}-${variant._key}`}
                href={href}
                prefetch
                aria-label={`${product.title} — ${variant.colorName}`}
                className="group flex flex-col gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={`${product.title} — ${variant.colorName}`}
                      width={600}
                      height={750}
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      priority={isPriority}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div
                      className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
                      style={{ backgroundColor: variant.hex }}
                      aria-hidden="true"
                    />
                  )}

                  {!variant.inStock && (
                    <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-xs font-medium text-cream">
                      {t("tile.outOfStock")}
                    </span>
                  )}

                  <span
                    className="absolute bottom-3 right-3 hidden rounded-full bg-cream px-3 py-1 text-xs font-medium shadow-sm md:inline-block"
                    aria-hidden="true"
                  >
                    {variant.colorName}
                  </span>
                </div>

                <div className="px-1">
                  <p className="text-sm font-medium leading-tight group-hover:text-accent">
                    {product.title}
                  </p>
                  <p className="text-sm text-ink/60">{variant.colorName}</p>
                  <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-sm">
                    <Price priceXof={product.priceXof} priceEur={product.priceEur} priceGnf={product.priceGnf} className="font-medium" />
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
