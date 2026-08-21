import Link from "next/link";
import { useTranslations } from "next-intl";

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
      {/* Hero — TODO-3D : scène Unboxing R3F pilotée au scroll (PRD §7.3), chargée en différé */}
      <section className="flex min-h-[85vh] flex-col items-center justify-center px-6 text-center">
        <p className="text-xs tracking-[0.35em] text-ink/50">{t("hero.surtitle")}</p>
        <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-tight tracking-tight md:text-7xl">
          {t("hero.title")}
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink/70">{t("hero.baseline")}</p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/box"
            className="rounded-full bg-ink px-8 py-3 text-sm font-medium text-cream transition-colors hover:bg-accent"
          >
            {t("hero.ctaPrimary")}
          </Link>
          <Link
            href="/boutique"
            className="rounded-full border border-ink/15 px-8 py-3 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            {t("hero.ctaSecondary")}
          </Link>
        </div>
        <p className="mt-16 text-xs text-ink/40">{t("hero.scrollHint")}</p>
      </section>

      {/* Manifeste */}
      <section className="mx-auto max-w-3xl px-6 py-28 text-center">
        <h2 className="font-serif text-3xl leading-snug tracking-tight md:text-4xl">
          {t("manifesto.title")}
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink/70">{t("manifesto.text")}</p>
      </section>

      {/* Nos teintes — tuiles coloris → fiche produit pré-sélectionnée (PRD §B2) */}
      <section className="mx-auto max-w-6xl px-6 py-28">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl tracking-tight md:text-4xl">{t("shades.title")}</h2>
            <p className="mt-3 max-w-xl text-ink/70">{t("shades.text")}</p>
          </div>
          <Link href="/boutique" className="hidden text-sm underline underline-offset-4 hover:text-accent md:block">
            {t("shades.ctaAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {SHADES.map((shade) => (
            <Link
              key={shade.name}
              href="/boutique"
              className="group flex flex-col gap-3"
              aria-label={`${t("shades.ctaTile")} : ${shade.name}`}
            >
              <div
                className={`aspect-[4/5] rounded-2xl ${shade.className} transition-transform duration-300 group-hover:scale-[1.03]`}
              />
              <span className="text-sm text-ink/80">{shade.name}</span>
            </Link>
          ))}
        </div>
        <Link
          href="/boutique"
          className="mt-8 inline-block text-sm underline underline-offset-4 hover:text-accent md:hidden"
        >
          {t("shades.ctaAll")}
        </Link>
      </section>

      {/* Box Builder */}
      <section className="bg-sand">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <h2 className="font-serif text-3xl tracking-tight md:text-4xl">{t("builder.title")}</h2>
          <p className="mt-4 max-w-2xl text-ink/70">{t("builder.text")}</p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {([1, 2, 3] as const).map((step) => (
              <div key={step} className="rounded-2xl bg-cream p-8">
                <p className="font-serif text-4xl text-accent">{step}</p>
                <h3 className="mt-4 font-serif text-xl">{t(`builder.step${step}Title`)}</h3>
                <p className="mt-2 text-sm text-ink/70">{t(`builder.step${step}Text`)}</p>
              </div>
            ))}
          </div>
          <Link
            href="/box"
            className="mt-10 inline-block rounded-full bg-ink px-8 py-3 text-sm font-medium text-cream transition-colors hover:bg-accent"
          >
            {t("builder.cta")}
          </Link>
        </div>
      </section>

      {/* Éditorial — TODO-CONTENU : photo lifestyle (CONTENUS-A-FOURNIR.md §C) */}
      <section className="mx-auto max-w-3xl px-6 py-28 text-center">
        <h2 className="font-serif text-3xl tracking-tight md:text-4xl">{t("editorial.title")}</h2>
        <p className="mt-6 text-lg leading-relaxed text-ink/70">{t("editorial.text")}</p>
      </section>

      {/* Réassurance */}
      <section className="border-t border-sand">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-3">
          {([1, 2, 3] as const).map((i) => (
            <div key={i}>
              <h3 className="font-serif text-lg">{t(`reassurance.r${i}Title`)}</h3>
              <p className="mt-2 text-sm text-ink/70">{t(`reassurance.r${i}Text`)}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
