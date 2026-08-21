import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { client } from "@/sanity/lib/client";
import { formatPrice } from "@/lib/format";
import ProductGallery from "@/components/shop/ProductGallery";
import VariantSwatches from "@/components/shop/VariantSwatches";
import AddToCartButton from "@/components/shop/AddToCartButton";

export const revalidate = 60;

type Variant = {
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
  description?: string;
  material?: string;
  care?: string[];
  priceXof: number;
  priceEur: number;
  variants: Variant[];
};

export async function generateStaticParams() {
  try {
    const slugs: Array<{ slug: { current: string } }> = await client.fetch(
      `*[_type == "product" && defined(slug.current)]{ slug }`,
    );
    return slugs.map((p) => ({ slug: p.slug.current }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product: Product | null = await client.fetch(
    `*[_type == "product" && slug.current == $slug][0]{ title, description }`,
    { slug },
  );
  if (!product) return { title: "Produit introuvable" };
  return {
    title: product.title,
    description: product.description?.slice(0, 160),
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string }>;
}) {
  const { slug } = await params;
  const { variant: variantKey } = await searchParams;
  const t = await getTranslations("product");

  const product: Product | null = await client.fetch(
    `*[_type == "product" && slug.current == $slug][0]{
      _id, title, slug, category, description, material, care,
      priceXof, priceEur,
      variants[]{ _key, colorName, hex, sku, inStock, images }
    }`,
    { slug },
  );

  if (!product) notFound();

  const selected =
    product.variants.find((v) => v._key === variantKey) ?? product.variants[0];

  if (!selected) notFound();

  const basePath = `/boutique/${product.slug.current}`;

  // Suggestions — même catégorie ou autre (max 4)
  const suggestions: Array<{
    _id: string;
    title: string;
    slug: { current: string };
    priceXof: number;
    hex: string;
  }> = await client.fetch(
    `*[_type == "product" && _id != $id] | order(_createdAt desc)[0...4]{
      _id, title, slug, priceXof, "hex": variants[0].hex
    }`,
    { id: product._id },
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:py-12">
      <Link
        href="/boutique"
        className="inline-flex items-center gap-1 text-sm text-ink/60 hover:text-accent"
      >
        ← {t("back")}
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:gap-12">
        {/* Galerie */}
        <ProductGallery
          images={selected.images}
          hex={selected.hex}
          title={product.title}
          colorName={selected.colorName}
        />

        {/* Infos */}
        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">
            {t(`category.${product.category}`)} · {selected.colorName}
          </p>
          <h1 className="mt-2 font-serif text-3xl tracking-tight md:text-4xl">
            {product.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-medium">
              {formatPrice(product.priceXof, "XOF")}
            </span>
            <span className="text-sm text-ink/50">
              {formatPrice(product.priceEur, "EUR")}
            </span>
          </div>

          <p
            className={`mt-3 text-sm ${selected.inStock ? "text-green-700" : "text-accent"}`}
          >
            {selected.inStock ? t("inStock") : t("outOfStock")}
          </p>

          <div className="mt-8">
            <VariantSwatches
              variants={product.variants}
              activeKey={selected._key}
              basePath={basePath}
              label={t("color")}
            />
          </div>

          {/* CTAs — sticky mobile */}
          <div className="mt-8 flex flex-col gap-3 md:mt-10">
            <AddToCartButton
              productId={product._id}
              variantId={selected._key}
              inStock={selected.inStock}
              productTitle={product.title}
              variantName={selected.colorName}
            />
            <Link
              href={`/box?add=${product._id}:${selected._key}`}
              className="w-full rounded-full border border-ink/15 px-8 py-3.5 text-center text-sm font-medium transition-colors hover:border-accent hover:text-accent"
            >
              {t("addToBox")}
            </Link>
          </div>

          {product.description && (
            <div className="mt-10 border-t border-sand pt-8">
              <h2 className="text-sm font-medium">{t("description")}</h2>
              <p className="mt-2 leading-relaxed text-ink/70">
                {product.description}
              </p>
            </div>
          )}

          {product.material && product.material !== "TODO : composition exacte" && (
            <div className="mt-6">
              <h3 className="text-sm font-medium">{t("material")}</h3>
              <p className="mt-1 text-sm text-ink/70">{product.material}</p>
            </div>
          )}

          {product.care && product.care.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium">{t("care")}</h3>
              <ul className="mt-1 list-disc pl-5 text-sm text-ink/70">
                {product.care.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* JSON-LD Product */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name: `${product.title} — ${selected.colorName}`,
                category: product.category,
                description: product.description,
                sku: selected.sku,
                offers: {
                  "@type": "Offer",
                  price: product.priceXof,
                  priceCurrency: "XOF",
                  availability: selected.inStock
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                },
              }),
            }}
          />
        </div>
      </div>

      {suggestions.length > 0 && (
        <section className="mt-16 border-t border-sand pt-12">
          <h2 className="font-serif text-2xl tracking-tight">
            {t("suggestions")}
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {suggestions.map((s) => (
              <Link
                key={s._id}
                href={`/boutique/${s.slug.current}`}
                className="group flex flex-col gap-2"
              >
                <div
                  className="aspect-[4/5] rounded-2xl transition-transform group-hover:scale-[1.02]"
                  style={{ backgroundColor: s.hex }}
                  aria-hidden
                />
                <p className="text-sm font-medium group-hover:text-accent">
                  {s.title}
                </p>
                <p className="text-sm text-ink/60">
                  {formatPrice(s.priceXof, "XOF")}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
