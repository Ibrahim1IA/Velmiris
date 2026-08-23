import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { client } from "@/sanity/lib/client";
import Price from "@/components/shop/Price";
import ProductGallery from "@/components/shop/ProductGallery";
import VariantSwatches from "@/components/shop/VariantSwatches";
import AddToCartButton from "@/components/shop/AddToCartButton";
import { getSiteUrl } from "@/lib/site";
import { urlFor } from "@/sanity/lib/image";

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
}): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/boutique/${encodeURIComponent(slug)}`;
  const ogImage = `${siteUrl}/boutique/${encodeURIComponent(slug)}/opengraph-image`;
  try {
    const product: (Product & { description?: string }) | null = await client.fetch(
      `*[_type == "product" && slug.current == $slug][0]{ title, description, priceXof, priceEur, variants[0]{ colorName } }`,
      { slug },
      { next: { revalidate: 60, tags: ["products"] } },
    );
    if (!product) {
      return {
        title: "Produit introuvable",
        alternates: { canonical },
        robots: { index: false, follow: true },
      };
    }
    const colorSuffix = product.variants?.[0]?.colorName ? ` — ${product.variants[0].colorName}` : "";
    const title = `${product.title}${colorSuffix}`;
    const description =
      product.description?.slice(0, 160) ||
      `${product.title}${colorSuffix} — foulard premium VELMIRYS. Jersey qui ne glisse pas, teinte stable, emballage cadeau offert.`;
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: "VELMIRYS",
        locale: "fr_FR",
        type: "website",
        images: [{ url: ogImage, width: 1200, height: 630, alt: `${title} — VELMIRYS` }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return {
      title: "Produit",
      alternates: { canonical },
      openGraph: {
        title: "Produit — VELMIRYS",
        description: "Foulard premium VELMIRYS — jersey qui ne glisse pas, emballage cadeau offert.",
        url: canonical,
        siteName: "VELMIRYS",
        locale: "fr_FR",
        type: "website",
        images: [{ url: ogImage, width: 1200, height: 630, alt: "Produit VELMIRYS" }],
      },
      twitter: {
        card: "summary_large_image",
        title: "Produit — VELMIRYS",
        description: "Foulard premium VELMIRYS.",
        images: [ogImage],
      },
    };
  }
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string }>;
}) {
  const [{ slug }, { variant: variantKey }] = await Promise.all([params, searchParams]);

  // Parallélise i18n + fetch produit ; suggestions après (dépend de _id)
  const withTimeout = <T,>(p: Promise<T>, ms = 2500) =>
    Promise.race([p, new Promise<never>((_, reject) => setTimeout(() => reject(new Error("sanity timeout e2e")), ms))]) as Promise<T>;
  let product: Product | null = null;
  let t: Awaited<ReturnType<typeof getTranslations>>;
  try {
    [t, product] = await Promise.all([
      getTranslations("product"),
      withTimeout(
        client.fetch<Product | null>(
          `*[_type == "product" && slug.current == $slug][0]{
        _id, title, slug, category, description, material, care,
        priceXof, priceEur,
        variants[]{ _key, colorName, hex, sku, inStock, images }
      }`,
          { slug },
          { next: { revalidate: 60, tags: ["products"] } },
        ),
      ),
    ]);
  } catch {
    t = await getTranslations("product");
    product = null;
  }

  if (!product) notFound();

  const selected =
    product.variants.find((v) => v._key === variantKey) ?? product.variants[0];

  if (!selected) notFound();

  const basePath = `/boutique/${product.slug.current}`;

  // Suggestions — même catégorie ou autre (max 4)
  let suggestions: Array<{
    _id: string;
    title: string;
    slug: { current: string };
    priceXof: number;
    priceEur: number;
    hex: string;
  }> = [];
  try {
    suggestions = await withTimeout(
      client.fetch(
        `*[_type == "product" && _id != $id] | order(_createdAt desc)[0...4]{
      _id, title, slug, priceXof, priceEur, "hex": variants[0].hex
    }`,
        { id: product._id },
        { next: { revalidate: 60, tags: ["products"] } },
      ),
    );
  } catch {
    suggestions = [];
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:py-12">
      <nav aria-label="Fil d'Ariane" className="mb-4">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-ink/60">
          <li>
            <Link href="/" className="hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">
              Accueil
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/boutique" className="hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">
              Boutique
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-ink">
            {product.title}
          </li>
        </ol>
      </nav>
      <Link
        href="/boutique"
        className="inline-flex min-h-[44px] items-center gap-1 rounded-md text-sm text-ink/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
          <p className="text-xs uppercase tracking-[0.2em] text-ink/60">
            {t(`category.${product.category}`)} · {selected.colorName}
          </p>
          <h1 className="mt-2 font-serif text-3xl tracking-tight md:text-4xl">
            {product.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <Price priceXof={product.priceXof} priceEur={product.priceEur} className="text-2xl font-medium" secondaryClassName="text-sm text-ink/60" />
          </div>

          <p
            className={`mt-3 text-sm ${selected.inStock ? "text-green-700" : "text-accent"}`}
            role="status"
            aria-live="polite"
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
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-ink/15 px-8 py-3.5 text-center text-sm font-medium transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              {t("addToBox")}
            </Link>
          </div>

          {product.description && (
            <div className="mt-10 border-t border-sand pt-8">
              <h2 className="text-sm font-medium">{t("description")}</h2>
              <p className="mt-2 leading-relaxed text-ink/60">
                {product.description}
              </p>
            </div>
          )}

          {product.material && !product.material.toLowerCase().includes("composition exacte") && (
            <div className="mt-6">
              <h3 className="text-sm font-medium">{t("material")}</h3>
              <p className="mt-1 text-sm text-ink/60">{product.material}</p>
            </div>
          )}

          {product.care && product.care.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium">{t("care")}</h3>
              <ul className="mt-1 list-disc pl-5 text-sm text-ink/60">
                {product.care.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* JSON-LD Product enrichi + BreadcrumbList */}
          {(() => {
            const siteUrl = getSiteUrl();
            const productUrl = `${siteUrl}/boutique/${product.slug.current}`;
            let imageUrls: string[] = [];
            try {
              const firstWithImage = product.variants.find((v) => v.images?.[0]);
              if (firstWithImage?.images?.[0]) {
                const u = urlFor(firstWithImage.images[0] as never).width(1200).height(630).fit("crop").url();
                if (u) imageUrls = [u];
              }
            } catch {
              imageUrls = [];
            }
            const availability = selected.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
            const productLd = {
              "@context": "https://schema.org",
              "@type": "Product",
              name: `${product.title} — ${selected.colorName}`,
              description: product.description,
              category: product.category,
              brand: { "@type": "Brand", name: "VELMIRYS" },
              sku: selected.sku || `${product.slug.current}-${selected._key}`,
              image: imageUrls,
              url: productUrl,
              offers: [
                {
                  "@type": "Offer",
                  price: product.priceXof,
                  priceCurrency: "XOF",
                  availability,
                  url: productUrl,
                  priceValidUntil: "2027-12-31",
                  seller: { "@type": "Organization", name: "VELMIRYS" },
                },
                {
                  "@type": "Offer",
                  price: product.priceEur,
                  priceCurrency: "EUR",
                  availability,
                  url: productUrl,
                  priceValidUntil: "2027-12-31",
                  seller: { "@type": "Organization", name: "VELMIRYS" },
                },
              ],
            };
            const breadcrumbLd = {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
                { "@type": "ListItem", position: 2, name: "Boutique", item: `${siteUrl}/boutique` },
                { "@type": "ListItem", position: 3, name: product.title, item: productUrl },
              ],
            };
            return (
              <>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
              </>
            );
          })()}
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
                className="group flex flex-col gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                aria-label={s.title}
              >
                <div
                  className="aspect-[4/5] rounded-2xl transition-transform group-hover:scale-[1.02]"
                  style={{ backgroundColor: s.hex }}
                  aria-hidden="true"
                />
                <p className="text-sm font-medium group-hover:text-accent">
                  {s.title}
                </p>
                <p className="text-sm text-ink/60">
                  <Price priceXof={s.priceXof} priceEur={s.priceEur} showSecondary={false} />
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
