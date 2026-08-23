import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import HomeHero3D from "@/components/box/HomeHero3D";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

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

// TODO-CONTENU : noms de coloris définitifs (CONTENUS-A-FOURNIR.md §B1)
// Sera alimenté par Sanity (produits featured) — PRD §10
const SHADES = [
  { name: "Rose poudré", className: "bg-blush" },
  { name: "Bleu ardoise", className: "bg-slate" },
  { name: "Mauve brume", className: "bg-mauve" },
  { name: "Crème nude", className: "bg-sand" },
  { name: "Noir", className: "bg-ink" },
  { name: "Bordeaux", className: "bg-wine" },
];

export default function Home() {
  const t = useTranslations("home");
  return (
    <>
      {/* Hero — Scène Unboxing R3F pilotée au scroll (PRD §7.3) — asset mutualisé Box_Base/Lid */}
      <section className="flex min-h-[85vh] flex-col items-center justify-center px-6 text-center" aria-labelledby="hero-title">
        <p className="text-xs tracking-[0.35em] text-ink/60">{t("hero.surtitle")}</p>
        <h1 id="hero-title" className="mt-6 max-w-3xl font-serif text-5xl leading-tight tracking-tight md:text-7xl">
          {t("hero.title")}
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink/60">{t("hero.baseline")}</p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/box"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-8 py-3 text-sm font-medium text-cream transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            {t("hero.ctaPrimary")}
          </Link>
          <Link
            href="/boutique"
            prefetch
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-ink/15 px-8 py-3 text-sm font-medium transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {t("hero.ctaSecondary")}
          </Link>
        </div>
        <div className="mt-10 w-full max-w-3xl">
          <HomeHero3D />
        </div>
        <p className="mt-2 text-xs text-ink/60" aria-hidden="true">
          {t("hero.scrollHint")}
        </p>
      </section>

      {/* Manifeste */}
      <section className="mx-auto max-w-3xl px-6 py-28 text-center" aria-labelledby="manifesto-title">
        <h2 id="manifesto-title" className="font-serif text-3xl leading-snug tracking-tight md:text-4xl">
          {t("manifesto.title")}
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink/60">{t("manifesto.text")}</p>
      </section>

      {/* Nos teintes — tuiles coloris → fiche produit pré-sélectionnée (PRD §B2) */}
      <section className="mx-auto max-w-6xl px-6 py-28" aria-labelledby="shades-title">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 id="shades-title" className="font-serif text-3xl tracking-tight md:text-4xl">
              {t("shades.title")}
            </h2>
            <p className="mt-3 max-w-xl text-ink/60">{t("shades.text")}</p>
          </div>
          <Link href="/boutique" prefetch className="hidden min-h-[44px] items-center text-sm underline underline-offset-4 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm md:inline-flex">
            {t("shades.ctaAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {SHADES.map((shade) => (
            <Link
              key={shade.name}
              href="/boutique"
              prefetch
              className="group flex flex-col gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              aria-label={`${t("shades.ctaTile")} : ${shade.name}`}
            >
              <div
                className={`aspect-[4/5] rounded-2xl ${shade.className} transition-transform duration-300 group-hover:scale-[1.03] group-focus-visible:ring-2 group-focus-visible:ring-accent`}
                aria-hidden="true"
              />
              <span className="text-sm text-ink/80">{shade.name}</span>
            </Link>
          ))}
        </div>
        <Link
          href="/boutique"
          prefetch
          className="mt-8 inline-flex min-h-[44px] items-center text-sm underline underline-offset-4 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm md:hidden"
        >
          {t("shades.ctaAll")}
        </Link>
      </section>

      {/* Box Builder */}
      <section className="bg-sand" aria-labelledby="builder-title">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <h2 id="builder-title" className="font-serif text-3xl tracking-tight md:text-4xl">
            {t("builder.title")}
          </h2>
          <p className="mt-4 max-w-2xl text-ink/60">{t("builder.text")}</p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {([1, 2, 3] as const).map((step) => (
              <div key={step} className="rounded-2xl bg-cream p-8">
                <p className="font-serif text-4xl text-accent" aria-hidden="true">
                  {step}
                </p>
                <h3 className="mt-4 font-serif text-xl">{t(`builder.step${step}Title`)}</h3>
                <p className="mt-2 text-sm text-ink/60">{t(`builder.step${step}Text`)}</p>
              </div>
            ))}
          </div>
          <Link
            href="/box"
            className="mt-10 inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-8 py-3 text-sm font-medium text-cream transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
          >
            {t("builder.cta")}
          </Link>
        </div>
      </section>

      {/* Éditorial — TODO-CONTENU : photo lifestyle (CONTENUS-A-FOURNIR.md §C) */}
      <section className="mx-auto max-w-3xl px-6 py-28 text-center" aria-labelledby="editorial-title">
        <h2 id="editorial-title" className="font-serif text-3xl tracking-tight md:text-4xl">
          {t("editorial.title")}
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink/60">{t("editorial.text")}</p>
      </section>

      {/* Réassurance */}
      <section className="border-t border-sand" aria-label="Réassurance">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-3">
          {([1, 2, 3] as const).map((i) => (
            <div key={i}>
              <h3 className="font-serif text-lg">{t(`reassurance.r${i}Title`)}</h3>
              <p className="mt-2 text-sm text-ink/60">{t(`reassurance.r${i}Text`)}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
