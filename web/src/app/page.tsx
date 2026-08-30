import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import ScrollReveal from "@/components/home/ScrollReveal";
import ParallaxImage from "@/components/home/ParallaxImage";
import { getSiteUrl } from "@/lib/site";
import { sanityFetch } from "@/sanity/lib/fetch";
import { urlFor } from "@/sanity/lib/image";

const siteUrl = getSiteUrl();

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "VELMIRYS — Foulards premium & box cadeaux" },
  description:
    "Foulards en jersey premium, bonnets et épingles à hijab. Composez votre box cadeau personnalisée. Emballage signature offert.",
  alternates: { canonical: `${siteUrl}/` },
  openGraph: {
    title: "VELMIRYS — Foulards premium & box cadeaux",
    description:
      "Foulards en jersey premium, bonnets et épingles à hijab. Composez votre box cadeau personnalisée.",
    url: `${siteUrl}/`,
    siteName: "VELMIRYS",
    locale: "fr_FR",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "VELMIRYS — Le voile, porté comme un présent." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VELMIRYS — Foulards premium & box cadeaux",
    description:
      "Foulards en jersey premium, bonnets et épingles à hijab. Composez votre box cadeau personnalisée.",
    images: ["/opengraph-image"],
  },
};

// Fallback constants — utilisés si homeSettings vide ou Sanity offline
const FALLBACK_SHADES = [
  { name: "Rose poudré", className: "bg-blush", hex: "#E8C4C4" },
  { name: "Bleu ardoise", className: "bg-slate", hex: "#3E4C63" },
  { name: "Mauve brume", className: "bg-mauve", hex: "#9B7E8C" },
  { name: "Crème nude", className: "bg-sand", hex: "#F3EDE4" },
  { name: "Noir", className: "bg-ink", hex: "#1C1917" },
  { name: "Bordeaux", className: "bg-wine", hex: "#4A1F24" },
] as const;

const FALLBACK_IMAGES = {
  manifeste:
    "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80&auto=format&fit=crop",
  manifesteLocal: "/images/manifeste-velmirys.jpg",
  packaging: "/images/packaging-velmirys.jpg",
  editorialSilk:
    "https://images.unsplash.com/photo-1582738411706-bfc82e9521b5?w=1200&q=80&auto=format&fit=crop",
  texture:
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80&auto=format&fit=crop",
  flatlay:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80&auto=format&fit=crop",
};

type SanityImage = { asset?: unknown; hotspot?: unknown; crop?: unknown };

type HomeSettings = {
  heroSurtitle?: string;
  heroTitle?: string;
  heroBaseline?: string;
  heroCtaPrimary?: string;
  heroCtaSecondary?: string;
  heroImage?: SanityImage;
  heroImageAlt?: string;
  heroCardTitle?: string;
  heroCardText?: string;
  heroBadge1?: string;
  heroBadge2?: string;
  manifestoSurtitle?: string;
  manifestoTitle?: string;
  manifestoText?: string;
  manifestoCta?: string;
  manifestoImage?: SanityImage;
  manifestoImageAlt?: string;
  manifestoCardTitle?: string;
  manifestoCardText?: string;
  shadesSurtitle?: string;
  shadesTitle?: string;
  shadesText?: string;
  shadesCtaAll?: string;
  shadesCtaTile?: string;
  builderSurtitle?: string;
  builderTitle?: string;
  builderText?: string;
  builderCta?: string;
  builderImage?: SanityImage;
  builderImageAlt?: string;
  builderSteps?: Array<{ title: string; text: string }>;
  editorialSurtitle?: string;
  editorialTitle?: string;
  editorialText?: string;
  editorialImage?: SanityImage;
  editorialImageAlt?: string;
  editorialThumbImage?: SanityImage;
  editorialThumbTitle?: string;
  editorialThumbText?: string;
  editorialCta?: string;
  engagementsTitle?: string;
  engagements?: Array<{ title: string; text: string }>;
  testimonialsSurtitle?: string;
  testimonialQuote?: string;
  testimonialAuthor?: string;
};

type FeaturedProduct = {
  _id: string;
  title: string;
  slug: { current: string };
  images?: SanityImage[];
  variants: Array<{ _key: string; colorName: string; hex: string; images?: SanityImage[] }>;
};

function sanityImageUrl(img?: SanityImage | null, w = 800, h = 800) {
  if (!img) return null;
  try {
    return urlFor(img as never).width(w).height(h).fit("crop").quality(80).auto("format").url();
  } catch {
    return null;
  }
}

function ReassuranceIcon({ name }: { name: "gift" | "chat" | "truck" }) {
  const common = "h-7 w-7 text-accent/90";
  if (name === "gift")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={common} aria-hidden="true">
        <rect x="3" y="8" width="18" height="12" rx="2" />
        <path d="M12 8V20M3 12h18M7 8a3 3 0 0 1 5-2 3 3 0 0 1 5 2" />
      </svg>
    );
  if (name === "chat")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={common} aria-hidden="true">
        <path d="M8 10h8M8 14h5" />
        <rect x="3" y="4" width="18" height="14" rx="3" />
        <path d="M8 18l-3 3v-3" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={common} aria-hidden="true">
      <path d="M3 8h13v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
      <circle cx="7.5" cy="17.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="17.5" r="1.5" fill="currentColor" stroke="none" />
      <path d="M16 8l3-2v7h-3" />
    </svg>
  );
}

export default async function Home() {
  const t = await getTranslations("home");

  // Fetch Sanity — ne bloque jamais le rendu (fallback = valeurs hardcodées)
  let home: HomeSettings | null = null;
  let featuredTiles: Array<{ product: FeaturedProduct; variant: FeaturedProduct["variants"][number]; imageUrl: string | null }> = [];
  try {
    const timeoutMs = process.env.CI ? 2500 : 20000;
    const withTimeout = <T,>(p: Promise<T>) =>
      Promise.race([p, new Promise<never>((_, r) => setTimeout(() => r(new Error("sanity timeout")), timeoutMs))]) as Promise<T>;

    const [fetchedHome, featured] = await Promise.all([
      withTimeout(
        sanityFetch<HomeSettings | null>(
          `*[_type == "homeSettings"][0]{
            heroSurtitle, heroTitle, heroBaseline, heroCtaPrimary, heroCtaSecondary, heroImage, heroImageAlt, heroCardTitle, heroCardText, heroBadge1, heroBadge2,
            manifestoSurtitle, manifestoTitle, manifestoText, manifestoCta, manifestoImage, manifestoImageAlt, manifestoCardTitle, manifestoCardText,
            shadesSurtitle, shadesTitle, shadesText, shadesCtaAll, shadesCtaTile,
            builderSurtitle, builderTitle, builderText, builderCta, builderImage, builderImageAlt, builderSteps[]{ title, text },
            editorialSurtitle, editorialTitle, editorialText, editorialImage, editorialImageAlt, editorialThumbImage, editorialThumbTitle, editorialThumbText, editorialCta,
            engagementsTitle, engagements[]{ title, text },
            testimonialsSurtitle, testimonialQuote, testimonialAuthor
          }`,
          {},
          { next: { revalidate: 60, tags: ["home"] } },
        ),
      ).catch(() => null),
      withTimeout(
        sanityFetch<FeaturedProduct[]>(
          `*[_type == "product" && featured == true] | order(title asc){
            _id, title, slug, images, variants[]{ _key, colorName, hex, images }
          }`,
          {},
          { next: { revalidate: 60, tags: ["products"] } },
        ),
      ).catch(() => [] as FeaturedProduct[]),
    ]);
    home = fetchedHome;
    const fetchedFeatured: FeaturedProduct[] = (featured ?? []) as FeaturedProduct[];
    if (fetchedFeatured.length > 0) {
      const tiles = fetchedFeatured.flatMap((p) =>
        p.variants.map((v) => {
          const raw = v.images?.[0] ?? p.images?.[0] ?? null;
          return {
            product: p,
            variant: v,
            imageUrl: sanityImageUrl(raw, 600, 750),
          };
        }),
      );
      featuredTiles = tiles.slice(0, 6);
    }
  } catch {
    home = null;
    featuredTiles = [];
  }

  // Résolution avec fallback i18n / constantes
  const heroSurtitle = home?.heroSurtitle ?? t("hero.surtitle");
  const heroTitle = home?.heroTitle ?? t("hero.title");
  const heroBaseline = home?.heroBaseline ?? t("hero.baseline");
  const heroCtaPrimary = home?.heroCtaPrimary ?? t("hero.ctaPrimary");
  const heroCtaSecondary = home?.heroCtaSecondary ?? t("hero.ctaSecondary");
  const heroImageUrl = sanityImageUrl(home?.heroImage, 800, 1000);
  const heroImageAlt = home?.heroImageAlt ?? "Portrait d'une femme élégante portant un hijab en jersey crème, lumière naturelle douce — univers VELMIRYS";
  const heroCardTitle = home?.heroCardTitle ?? "Douceur & tenue";
  const heroCardText = home?.heroCardText ?? "Jersey premium qui ne glisse pas, maille respirante — choisi sans compromis.";
  const heroBadge1 = home?.heroBadge1 ?? "Emballage offert";
  const heroBadge2 = home?.heroBadge2 ?? "Jersey qui ne glisse pas";

  const manifestoSurtitle = home?.manifestoSurtitle ?? "MANIFESTE";
  const manifestoTitle = home?.manifestoTitle ?? t("manifesto.title");
  const manifestoText = home?.manifestoText ?? t("manifesto.text");
  const manifestoCta = home?.manifestoCta ?? "Découvrir notre univers";
  const manifestoImageUrl = sanityImageUrl(home?.manifestoImage, 800, 1000);
  const manifestoImageAlt = home?.manifestoImageAlt ?? "Quatre femmes portant des hijabs VELMIRYS aux teintes douces — bordeaux, vert sauge, bleu ardoise et crème — posant ensemble avec sororité, univers VELMIRYS";
  const manifestoCardTitle = home?.manifestoCardTitle ?? "Sororité & élégance";
  const manifestoCardText = home?.manifestoCardText ?? "Quatre teintes, une même douceur — le jersey VELMIRYS qui sublime chaque carnation.";

  const shadesSurtitle = home?.shadesSurtitle ?? "PALETTE";
  const shadesTitle = home?.shadesTitle ?? t("shades.title");
  const shadesText = home?.shadesText ?? t("shades.text");
  const shadesCtaAll = home?.shadesCtaAll ?? t("shades.ctaAll");
  const shadesCtaTile = home?.shadesCtaTile ?? t("shades.ctaTile");

  const builderSurtitle = home?.builderSurtitle ?? "BOX CADEAU";
  const builderTitle = home?.builderTitle ?? t("builder.title");
  const builderText = home?.builderText ?? t("builder.text");
  const builderCta = home?.builderCta ?? t("builder.cta");
  const builderImageUrl = sanityImageUrl(home?.builderImage, 800, 900);
  const builderImageAlt = home?.builderImageAlt ?? "Flat lay VELMIRYS : foulards jersey pliés avec étiquettes, boîtes blanches siglées VELMIRYS avec papier de soie logo, carte THANK YOU et tulipe blanche — packaging réel";
  const builderSteps: Array<{ title: string; text: string }> =
    home?.builderSteps && home.builderSteps.length === 3
      ? home.builderSteps
      : ([1, 2, 3] as const).map((n) => ({
          title: t(`builder.step${n}Title`),
          text: t(`builder.step${n}Text`),
        }));

  const editorialSurtitle = home?.editorialSurtitle ?? "ÉDITORIAL";
  const editorialTitle = home?.editorialTitle ?? t("editorial.title");
  const editorialText = home?.editorialText ?? t("editorial.text");
  const editorialImageUrl = sanityImageUrl(home?.editorialImage, 1200, 1200);
  const editorialImageAlt = home?.editorialImageAlt ?? "Tissu en soie drapé couleur blush aux plis fluides, gros plan texture premium — douceur VELMIRYS";
  const editorialThumbUrl = sanityImageUrl(home?.editorialThumbImage, 200, 200);
  const editorialThumbTitle = home?.editorialThumbTitle ?? "Maille respirante";
  const editorialThumbText = home?.editorialThumbText ?? "Tenue toute la journée, finitions nettes — choisi comme pour soi.";
  const editorialCta = home?.editorialCta ?? "Découvrir les matières";

  const engagementsTitle = home?.engagementsTitle ?? t("engagements.title");
  const engagements: Array<{ title: string; text: string }> =
    home?.engagements && home.engagements.length === 3
      ? home.engagements
      : ([
          { title: t("engagements.e1Title"), text: t("engagements.e1Text") },
          { title: t("engagements.e2Title"), text: t("engagements.e2Text") },
          { title: t("engagements.e3Title"), text: t("engagements.e3Text") },
        ] as Array<{ title: string; text: string }>);

  const testimonialsSurtitle = home?.testimonialsSurtitle ?? t("testimonials.surtitle");
  const testimonialQuote = home?.testimonialQuote ?? t("testimonials.quote");
  const testimonialAuthor = home?.testimonialAuthor ?? t("testimonials.author");

  const useFeatured = featuredTiles.length > 0;

  return (
    <>
      {/* Hero editorial premium — matière avant boîte (sans 3D) — PRD §7.3 */}
      <section className="relative overflow-hidden grain" aria-labelledby="hero-title">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 90% 55% at 50% 0%, #F3EDE4 0%, transparent 58%), radial-gradient(ellipse 70% 45% at 85% 85%, #FAF7F2 0%, transparent 60%)",
          }}
        />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-16">
          <div className="text-center lg:text-left">
            <ScrollReveal y={10}>
              <p className="text-xs tracking-[0.32em] text-ink/60">{heroSurtitle}</p>
            </ScrollReveal>
            <ScrollReveal delay={0.07} y={14}>
              <h1 id="hero-title" className="mt-5 font-serif text-5xl leading-[0.92] tracking-tight md:text-6xl lg:text-7xl">
                {heroTitle}
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.14} y={10}>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink/70 lg:mx-0">{heroBaseline}</p>
            </ScrollReveal>
            <ScrollReveal delay={0.2} y={8}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/box"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-8 py-3 text-sm font-medium text-cream shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  {heroCtaPrimary}
                </Link>
                <Link
                  href="/boutique"
                  prefetch
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-ink/25 bg-white px-8 py-3 text-sm font-medium shadow-sm transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {heroCtaSecondary}
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.26} y={6}>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-ink/55 lg:justify-start">
                <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/80 px-3 py-1.5 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" /> {heroBadge1}
                </span>
                <span className="hidden sm:inline text-ink/30">•</span>
                <span>{heroBadge2}</span>
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.12} y={10}>
            <div className="relative">
              <ParallaxImage
                src={heroImageUrl ?? FALLBACK_IMAGES.manifeste}
                alt={heroImageAlt}
                sizes="(max-width: 1024px) 100vw, 560px"
                aspect="aspect-[4/5]"
                containerClassName="rounded-[28px] shadow-[0_16px_48px_rgba(28,25,23,0.12)] border border-ink/5"
                priority
              />
              <div className="pointer-events-none absolute -bottom-5 -left-5 hidden rounded-2xl bg-white p-4 shadow-lg border border-ink/5 md:block">
                <p className="font-serif text-sm">{heroCardTitle}</p>
                <p className="mt-1 max-w-[18ch] text-xs leading-relaxed text-ink/60">{heroCardText}</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Manifeste — grid 2 cols premium + image lifestyle */}
      <section className="relative mx-auto max-w-6xl px-6 py-24 md:py-28 grain overflow-hidden" aria-labelledby="manifesto-title">
        <div className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal>
            <div className="max-w-xl">
              <p className="text-xs tracking-[0.28em] text-accent/80">{manifestoSurtitle}</p>
              <h2 id="manifesto-title" className="mt-4 font-serif text-3xl leading-snug tracking-tight md:text-4xl">
                {manifestoTitle}
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-ink/60">{manifestoText}</p>
              <Link
                href="/a-propos"
                className="mt-8 inline-flex min-h-[44px] items-center gap-2 text-sm underline underline-offset-4 decoration-ink/15 hover:text-accent hover:decoration-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
              >
                {manifestoCta}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.12}>
            <div className="relative">
              <ParallaxImage
                src={manifestoImageUrl ?? FALLBACK_IMAGES.manifesteLocal}
                alt={manifestoImageAlt}
                sizes="(max-width: 1024px) 100vw, 560px"
                aspect="aspect-[4/5]"
                containerClassName="rounded-2xl"
              />
              <div className="pointer-events-none absolute -bottom-4 -left-4 hidden rounded-2xl bg-cream p-4 shadow-sm border border-ink/5 md:block">
                <p className="font-serif text-sm">{manifestoCardTitle}</p>
                <p className="mt-1 max-w-[20ch] text-xs leading-relaxed text-ink/60">{manifestoCardText}</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Nos teintes — si produits featured, affiche leurs visuels ; sinon fallback 6 tuiles */}
      <section className="relative mx-auto max-w-6xl px-6 py-24 md:py-28" aria-labelledby="shades-title">
        <ScrollReveal>
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs tracking-[0.28em] text-accent/80">{shadesSurtitle}</p>
              <h2 id="shades-title" className="mt-3 font-serif text-3xl tracking-tight md:text-4xl">
                {shadesTitle}
              </h2>
              <p className="mt-3 max-w-xl text-ink/60">{shadesText}</p>
            </div>
            <Link
              href="/boutique"
              prefetch
              className="hidden min-h-[44px] items-center gap-2 text-sm underline underline-offset-4 decoration-ink/15 hover:text-accent hover:decoration-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm md:inline-flex"
            >
              {shadesCtaAll} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {useFeatured
            ? featuredTiles.map(({ product, variant, imageUrl }, i) => (
                <ScrollReveal key={`${product._id}-${variant._key}`} delay={i * 0.05} y={12}>
                  <Link
                    href={`/boutique/${product.slug.current}?variant=${variant._key}`}
                    prefetch
                    className="group flex flex-col gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    aria-label={`${shadesCtaTile} : ${product.title} — ${variant.colorName}`}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-ink/[0.06] shadow-sm bg-sand transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-md group-active:scale-[0.98]">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={`${product.title} — ${variant.colorName}`}
                          fill
                          sizes="200px"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0" style={{ backgroundColor: variant.hex }} aria-hidden="true" />
                      )}
                      <span className="absolute bottom-3 left-3 rounded-full bg-cream/95 px-2.5 py-1 text-[11px] font-medium tracking-wide opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 shadow-sm">
                        {shadesCtaTile}
                      </span>
                      <span className="absolute top-3 right-3 hidden rounded-full bg-cream/95 px-2 py-1 text-[10px] font-medium shadow-sm md:inline-block">
                        {variant.colorName}
                      </span>
                    </div>
                    <span className="text-sm font-medium tracking-tight text-ink/85 group-hover:text-accent">{variant.colorName}</span>
                    <span className="text-xs text-ink/60">{product.title}</span>
                  </Link>
                </ScrollReveal>
              ))
            : FALLBACK_SHADES.map((shade, i) => (
                <ScrollReveal key={shade.name} delay={i * 0.05} y={12}>
                  <Link
                    href="/boutique"
                    prefetch
                    className="group flex flex-col gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    aria-label={`${shadesCtaTile} : ${shade.name}`}
                  >
                    <div
                      className={`relative aspect-[4/5] overflow-hidden rounded-2xl border border-ink/[0.06] shadow-sm ${shade.className} transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-md group-active:scale-[0.98]`}
                      aria-hidden="true"
                    >
                      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-[0.14]">
                        <Image src={FALLBACK_IMAGES.flatlay} alt="" fill sizes="200px" className="object-cover" loading="lazy" />
                      </div>
                      <span className="absolute bottom-3 left-3 rounded-full bg-cream/95 px-2.5 py-1 text-[11px] font-medium tracking-wide opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 shadow-sm">
                        Voir
                      </span>
                    </div>
                    <span className="text-sm font-medium tracking-tight text-ink/85 group-hover:text-accent">{shade.name}</span>
                  </Link>
                </ScrollReveal>
              ))}
        </div>
        <Link
          href="/boutique"
          prefetch
          className="mt-8 inline-flex min-h-[44px] items-center gap-2 text-sm underline underline-offset-4 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm md:hidden"
        >
          {shadesCtaAll} <span aria-hidden="true">→</span>
        </Link>
      </section>

      {/* Box Builder — 3 steps + visuel packaging */}
      <section className="relative mx-auto max-w-6xl px-6 py-12 md:py-16" aria-labelledby="builder-title">
        <div className="overflow-hidden rounded-[32px] border border-ink/5 bg-sand shadow-sm">
          <div className="grid gap-0 lg:grid-cols-2">
            <div className="p-8 md:p-10 lg:p-12">
              <ScrollReveal>
                <p className="text-xs tracking-[0.28em] text-accent/80">{builderSurtitle}</p>
                <h2 id="builder-title" className="mt-3 font-serif text-3xl tracking-tight md:text-4xl">
                  {builderTitle}
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-ink/60">{builderText}</p>
              </ScrollReveal>
              <div className="mt-10 grid gap-4">
                {builderSteps.map((step, idx) => (
                  <ScrollReveal key={idx} delay={(idx + 1) * 0.06}>
                    <div className="flex gap-4 rounded-2xl border border-ink/5 bg-cream p-6 shadow-sm transition-shadow hover:shadow-md">
                      <p className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand font-serif text-lg text-accent" aria-hidden="true">
                        {idx + 1}
                      </p>
                      <div>
                        <h3 className="font-serif text-[17px] leading-tight">{step.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{step.text}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
              <ScrollReveal delay={0.14}>
                <Link
                  href="/box"
                  className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-8 py-3 text-sm font-medium text-cream shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
                >
                  {builderCta}
                </Link>
              </ScrollReveal>
            </div>
            <ScrollReveal delay={0.1} className="relative p-6 lg:p-8">
              <div className="relative h-full">
                <ParallaxImage
                  src={builderImageUrl ?? FALLBACK_IMAGES.packaging}
                  alt={builderImageAlt}
                  sizes="(max-width: 1024px) 100vw, 560px"
                  aspect="aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[560px]"
                  containerClassName="rounded-2xl shadow-lg"
                  className="object-[center_30%]"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Éditorial — La douceur n'est pas un détail : parallax lifestyle — grain */}
      <section className="relative mx-auto max-w-6xl px-6 py-24 md:py-28 grain" aria-labelledby="editorial-title">
        <div className="overflow-hidden rounded-[32px] border border-sand bg-cream shadow-sm">
          <div className="grid lg:grid-cols-2">
            <ScrollReveal delay={0.05} className="order-2 lg:order-1">
              <ParallaxImage
                src={editorialImageUrl ?? FALLBACK_IMAGES.editorialSilk}
                alt={editorialImageAlt}
                sizes="(max-width: 1024px) 100vw, 600px"
                aspect="aspect-[4/3] lg:aspect-[1/1] lg:h-full"
                containerClassName="rounded-none lg:rounded-l-[32px] lg:rounded-r-none !rounded-2xl lg:!rounded-none"
              />
            </ScrollReveal>
            <div className="order-1 flex flex-col justify-center p-8 md:p-10 lg:order-2 lg:p-12">
              <ScrollReveal>
                <p className="text-xs tracking-[0.28em] text-accent/80">{editorialSurtitle}</p>
                <h2 id="editorial-title" className="mt-3 font-serif text-3xl tracking-tight md:text-4xl">
                  {editorialTitle}
                </h2>
                <p className="mt-6 text-[17px] leading-relaxed text-ink/60">{editorialText}</p>
              </ScrollReveal>
              <ScrollReveal delay={0.08}>
                <div className="mt-8 flex items-center gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-ink/5 bg-sand shadow-sm">
                    {editorialThumbUrl ? (
                      <Image src={editorialThumbUrl} alt={editorialThumbTitle} fill sizes="96px" className="object-cover" loading="lazy" />
                    ) : (
                      <Image src={FALLBACK_IMAGES.texture} alt={editorialThumbTitle} fill sizes="96px" className="object-cover" loading="lazy" />
                    )}
                  </div>
                  <div className="max-w-[28ch]">
                    <p className="font-serif text-sm">{editorialThumbTitle}</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink/60">{editorialThumbText}</p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.14}>
                <Link
                  href="/boutique"
                  prefetch
                  className="mt-8 inline-flex min-h-[44px] items-center gap-2 text-sm underline underline-offset-4 decoration-ink/15 hover:text-accent hover:decoration-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm self-start"
                >
                  {editorialCta} <span aria-hidden="true">→</span>
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Engagements — repris de Stitch Luxury Scarf Landing Page Enriched § Nos engagements */}
      <section className="mx-auto max-w-6xl px-6 py-24 md:py-28 text-center grain relative overflow-hidden" aria-labelledby="engagements-title">
        <ScrollReveal>
          <h2 id="engagements-title" className="relative font-serif text-3xl tracking-tight md:text-4xl">
            {engagementsTitle}
          </h2>
        </ScrollReveal>
        <div className="relative mt-14 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          {engagements.map((eng, i) => (
            <ScrollReveal key={eng.title} delay={0.06 * (i + 1)}>
              <div className="flex flex-col items-center">
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-sand border border-ink/5 shadow-sm text-ink/70" aria-hidden="true">
                  {i === 0 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6" aria-hidden="true">
                      <path d="M12 2.5l3.4 3.4L12 9.3 8.6 5.9 12 2.5z" />
                      <path d="M8.6 5.9l3.4 3.4 3.4-3.4L12 2.5 8.6 5.9z" opacity={0.6} />
                      <path d="M6 7l6 13 6-13-2.6-1.1L12 9.3 8.6 5.9 6 7z" />
                    </svg>
                  )}
                  {i === 1 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6" aria-hidden="true">
                      <path d="M3 12c1.5-1 2.5-1 4 0s2.5 1 4 0 2.5-1 4 0 2.5 1 4 0" />
                      <path d="M3 8c1.5-1 2.5-1 4 0s2.5 1 4 0 2.5-1 4 0 2.5 1 4 0" opacity={0.5} />
                      <path d="M3 16c1.5-1 2.5-1 4 0s2.5 1 4 0 2.5-1 4 0 2.5 1 4 0" opacity={0.5} />
                    </svg>
                  )}
                  {i === 2 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6" aria-hidden="true">
                      <path d="M11 13l-2.5-2.5a1.8 1.8 0 0 1 2.5-2.5L12 9l1-1a1.8 1.8 0 1 1 2.5 2.5L13 13l-2 2-2-2z" />
                      <path d="M7 15l-1.5 1.5a1.2 1.2 0 0 1-1.7-1.7L6 12" opacity={0.6} />
                      <path d="M17 15l1.5 1.5a1.2 1.2 0 0 1-1.7 1.7L15 16" opacity={0.6} />
                    </svg>
                  )}
                </span>
                <h3 className="text-xs tracking-[0.18em] font-medium text-ink">{eng.title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink/60">{eng.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Avis clients — repris de Stitch § Testimonials */}
      <section className="bg-sand/40 border-y border-sand" aria-labelledby="testimonials-title">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24 text-center">
          <ScrollReveal>
            <p id="testimonials-title" className="text-xs tracking-[0.28em] text-ink/50">
              {testimonialsSurtitle}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.06}>
            <div className="mx-auto mt-10 max-w-3xl">
              <p className="font-serif text-[22px] leading-relaxed md:text-[26px] md:leading-[1.6] text-ink/90 italic">
                &ldquo;{testimonialQuote}&rdquo;
              </p>
              <div className="mx-auto mt-6 h-px w-10 bg-ink/15" aria-hidden="true" />
              <p className="mt-6 text-xs tracking-[0.16em] font-medium text-ink/60">{testimonialAuthor}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.12}>
            <div className="mt-8 flex justify-center gap-2" role="tablist" aria-label="Témoignages">
              <span className="h-2 w-2 rounded-full bg-ink" aria-current="true" aria-label="Avis 1" />
              <span className="h-2 w-2 rounded-full bg-ink/15" aria-label="Avis 2" />
              <span className="h-2 w-2 rounded-full bg-ink/15" aria-label="Avis 3" />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
