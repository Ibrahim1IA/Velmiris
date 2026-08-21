import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { formatPrice } from "@/lib/format";
import BoutiqueFilters from "@/components/shop/BoutiqueFilters";

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
  variants: ProductVariant[];
};

type SearchParams = { category?: string };

export async function generateMetadata() {
  const t = await getTranslations("boutique");
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const t = await getTranslations("boutique");
  const { category } = await searchParams;

  const products: Product[] = await client.fetch(
    `*[_type == "product"] | order(title asc) {
      _id, title, slug, category, priceXof, priceEur,
      variants[]{ _key, colorName, hex, sku, inStock, images }
    }`,
  );

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

  const filtered =
    category && ["foulard", "bonnet", "epingle"].includes(category)
      ? tiles.filter((tile) => tile.product.category === category)
      : tiles;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <header className="mb-8">
        <h1 className="font-serif text-4xl tracking-tight md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-ink/70">{t("subtitle")}</p>
      </header>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <BoutiqueFilters labels={filterLabels} />
        <p className="text-sm text-ink/50" aria-live="polite">
          {t("count", { count: filtered.length })}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-ink/60">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map(({ product, variant }) => {
            const href = `/boutique/${product.slug.current}?variant=${variant._key}`;
            const hasImage = variant.images?.[0];
            const imageUrl = hasImage
              ? urlFor(hasImage as never)
                  .width(600)
                  .height(750)
                  .fit("crop")
                  .auto("format")
                  .url()
              : null;

            return (
              <Link
                key={`${product._id}-${variant._key}`}
                href={href}
                aria-label={`${product.title} — ${variant.colorName}`}
                className="group flex flex-col gap-3"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={`${product.title} — ${variant.colorName}`}
                      width={600}
                      height={750}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div
                      className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
                      style={{ backgroundColor: variant.hex }}
                      aria-hidden
                    />
                  )}

                  {!variant.inStock && (
                    <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-xs font-medium text-cream">
                      {t("tile.outOfStock")}
                    </span>
                  )}

                  <span
                    className="absolute bottom-3 right-3 hidden rounded-full bg-cream px-3 py-1 text-xs font-medium shadow-sm md:inline-block"
                    aria-hidden
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
                    <span className="font-medium">
                      {formatPrice(product.priceXof, "XOF")}
                    </span>
                    <span className="text-xs text-ink/50">
                      {formatPrice(product.priceEur, "EUR")}
                    </span>
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
