import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/home/ScrollReveal";
import ParallaxImage from "@/components/home/ParallaxImage";
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

/** Images libres Unsplash — 5 visuels VELMIRYS, webp auto via Next Image, voir ATTRIBUTIONS.md */
const IMAGES = {
  manifeste:
    "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80&auto=format&fit=crop",
  packaging:
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80&auto=format&fit=crop",
  editorialSilk:
    "https://images.unsplash.com/photo-1582738411706-bfc82e9521b5?w=1200&q=80&auto=format&fit=crop",
  texture:
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80&auto=format&fit=crop",
  flatlay:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80&auto=format&fit=crop",
};

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

export default function Home() {
  const t = useTranslations("home");
  return (
    <>
      {/* Hero editorial premium — matière avant boîte (sans 3D) — PRD §7.3 */}
      <section
        className="relative overflow-hidden grain"
        aria-labelledby="hero-title"
      >
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true" style={{ background: "radial-gradient(ellipse 90% 55% at 50% 0%, #F3EDE4 0%, transparent 58%), radial-gradient(ellipse 70% 45% at 85% 85%, #FAF7F2 0%, transparent 60%)" }} />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-16">
          <div className="text-center lg:text-left">
            <ScrollReveal y={10}>
              <p className="text-xs tracking-[0.32em] text-ink/60">{t("hero.surtitle")}</p>
            </ScrollReveal>
            <ScrollReveal delay={0.07} y={14}>
              <h1 id="hero-title" className="mt-5 font-serif text-5xl leading-[0.92] tracking-tight md:text-6xl lg:text-7xl">
                {t("hero.title")}
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.14} y={10}>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink/70 lg:mx-0">{t("hero.baseline")}</p>
            </ScrollReveal>
            <ScrollReveal delay={0.20} y={8}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/box" className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-8 py-3 text-sm font-medium text-cream shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
                  {t("hero.ctaPrimary")}
                </Link>
                <Link href="/boutique" prefetch className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-ink/25 bg-white px-8 py-3 text-sm font-medium shadow-sm transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                  {t("hero.ctaSecondary")}
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.26} y={6}>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-ink/55 lg:justify-start">
                <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/80 px-3 py-1.5 shadow-sm"><span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" /> Emballage offert</span>
                <span className="hidden sm:inline text-ink/30">•</span>
                <span>Jersey qui ne glisse pas</span>
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.12} y={10}>
            <div className="relative">
              <ParallaxImage
                src={IMAGES.manifeste}
                alt="Portrait d'une femme élégante portant un hijab en jersey crème, lumière naturelle douce, fond neutre — univers VELMIRYS"
                sizes="(max-width: 1024px) 100vw, 560px"
                aspect="aspect-[4/5]"
                containerClassName="rounded-[28px] shadow-[0_16px_48px_rgba(28,25,23,0.12)] border border-ink/5"
                priority
              />
              <div className="pointer-events-none absolute -bottom-5 -left-5 hidden rounded-2xl bg-white p-4 shadow-lg border border-ink/5 md:block">
                <p className="font-serif text-sm">Douceur &amp; tenue</p>
                <p className="mt-1 max-w-[18ch] text-xs leading-relaxed text-ink/60">Jersey premium qui ne glisse pas, maille respirante — choisi sans compromis.</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Manifeste — grid 2 cols premium + image lifestyle + serif outline */}
      <section
        className="relative mx-auto max-w-6xl px-6 py-24 md:py-28 grain overflow-hidden"
        aria-labelledby="manifesto-title"
      >
        <p aria-hidden="true" className="pointer-events-none absolute -top-6 left-0 hidden select-none font-serif text-[28vw] leading-none tracking-tighter text-outline-ink md:block md:text-[18vw] lg:text-[14vw]">
          01
        </p>
        <div className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal>
            <div className="max-w-xl">
              <p className="text-xs tracking-[0.28em] text-accent/80">MANIFESTE</p>
              <h2
                id="manifesto-title"
                className="mt-4 font-serif text-3xl leading-snug tracking-tight md:text-4xl"
              >
                {t("manifesto.title")}
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-ink/60">{t("manifesto.text")}</p>
              <Link
                href="/a-propos"
                className="mt-8 inline-flex min-h-[44px] items-center gap-2 text-sm underline underline-offset-4 decoration-ink/15 hover:text-accent hover:decoration-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
              >
                Découvrir notre univers
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.12}>
            <div className="relative">
              <ParallaxImage
                src={IMAGES.manifeste}
                alt="Portrait d'une femme élégante portant un hijab en jersey crème, lumière naturelle douce, fond neutre — univers VELMIRYS"
                sizes="(max-width: 1024px) 100vw, 560px"
                aspect="aspect-[4/5]"
                containerClassName="rounded-2xl"
              />
              <div className="pointer-events-none absolute -bottom-4 -left-4 hidden rounded-2xl bg-cream p-4 shadow-sm border border-ink/5 md:block">
                <p className="font-serif text-sm">Douceur &amp; tenue</p>
                <p className="mt-1 max-w-[18ch] text-xs leading-relaxed text-ink/60">
                  Jersey premium qui ne glisse pas, maille respirante — choisi sans compromis.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Nos teintes — tuiles coloris → fiche produit pré-sélectionnée (PRD §B2) — hover enrichi */}
      <section className="relative mx-auto max-w-6xl px-6 py-24 md:py-28" aria-labelledby="shades-title">
        <ScrollReveal>
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs tracking-[0.28em] text-accent/80">PALETTE</p>
              <h2 id="shades-title" className="mt-3 font-serif text-3xl tracking-tight md:text-4xl">
                {t("shades.title")}
              </h2>
              <p className="mt-3 max-w-xl text-ink/60">{t("shades.text")}</p>
            </div>
            <Link
              href="/boutique"
              prefetch
              className="hidden min-h-[44px] items-center gap-2 text-sm underline underline-offset-4 decoration-ink/15 hover:text-accent hover:decoration-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm md:inline-flex"
            >
              {t("shades.ctaAll")} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {SHADES.map((shade, i) => (
            <ScrollReveal key={shade.name} delay={i * 0.05} y={12}>
              <Link
                href="/boutique"
                prefetch
                className="group flex flex-col gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                aria-label={`${t("shades.ctaTile")} : ${shade.name}`}
              >
                  <div
                    className={`relative aspect-[4/5] overflow-hidden rounded-2xl border border-ink/[0.06] shadow-sm ${shade.className} transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-md group-active:scale-[0.98]`}
                    aria-hidden="true"
                  >
                    {/* Premium flatlay overlay au hover — plus visible (Awwwards) */}
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-[0.14]">
                      <Image
                        src={IMAGES.flatlay}
                        alt=""
                        fill
                        sizes="200px"
                        className="object-cover"
                        loading="lazy"
                      />
                    </div>
                    <span className="absolute bottom-3 left-3 rounded-full bg-cream/95 px-2.5 py-1 text-[11px] font-medium tracking-wide opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 shadow-sm">
                      Voir
                    </span>
                  </div>
                <span className="text-sm font-medium tracking-tight text-ink/85 group-hover:text-accent">
                  {shade.name}
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
        <Link
          href="/boutique"
          prefetch
          className="mt-8 inline-flex min-h-[44px] items-center gap-2 text-sm underline underline-offset-4 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm md:hidden"
        >
          {t("shades.ctaAll")} <span aria-hidden="true">→</span>
        </Link>
      </section>

      {/* Box Builder — 3 steps + visuel packaging — serif outline 02 */}
      <section className="relative mx-auto max-w-6xl px-6 py-12 md:py-16" aria-labelledby="builder-title">
        <p aria-hidden="true" className="pointer-events-none absolute -top-2 right-2 hidden select-none font-serif text-[22vw] leading-none tracking-tighter text-outline-accent md:block md:text-[12vw]">
          02
        </p>
        <div className="overflow-hidden rounded-[32px] border border-ink/5 bg-sand shadow-sm">
          <div className="grid gap-0 lg:grid-cols-2">
            <div className="p-8 md:p-10 lg:p-12">
              <ScrollReveal>
                <p className="text-xs tracking-[0.28em] text-accent/80">BOX CADEAU</p>
                <h2 id="builder-title" className="mt-3 font-serif text-3xl tracking-tight md:text-4xl">
                  {t("builder.title")}
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-ink/60">{t("builder.text")}</p>
              </ScrollReveal>
              <div className="mt-10 grid gap-4">
                {([1, 2, 3] as const).map((step) => (
                  <ScrollReveal key={step} delay={step * 0.06}>
                    <div className="flex gap-4 rounded-2xl border border-ink/5 bg-cream p-6 shadow-sm transition-shadow hover:shadow-md">
                      <p
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand font-serif text-lg text-accent"
                        aria-hidden="true"
                      >
                        {step}
                      </p>
                      <div>
                        <h3 className="font-serif text-[17px] leading-tight">{t(`builder.step${step}Title`)}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{t(`builder.step${step}Text`)}</p>
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
                  {t("builder.cta")}
                </Link>
              </ScrollReveal>
            </div>
            <ScrollReveal delay={0.1} className="relative p-6 lg:p-8">
              <div className="relative h-full">
                <ParallaxImage
                  src={IMAGES.packaging}
                  alt="Boîte cadeau VELMIRYS minimaliste crème ouverte avec papier de soie, présentation premium — emballage offert"
                  sizes="(max-width: 1024px) 100vw, 560px"
                  aspect="aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[520px]"
                  containerClassName="rounded-2xl"
                />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-cream/90 px-4 py-2.5 text-xs font-medium shadow-sm backdrop-blur border border-ink/5">
                  <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
                  Emballage cadeau offert
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Éditorial — La douceur n'est pas un détail : parallax lifestyle — grain + serif outline 03 */}
      <section className="relative mx-auto max-w-6xl px-6 py-24 md:py-28 grain" aria-labelledby="editorial-title">
        <p aria-hidden="true" className="pointer-events-none absolute -top-4 left-0 hidden select-none font-serif text-[22vw] leading-none tracking-tighter text-outline-ink md:block md:text-[12vw]">
          03
        </p>
        <div className="overflow-hidden rounded-[32px] border border-sand bg-cream shadow-sm">
          <div className="grid lg:grid-cols-2">
            <ScrollReveal delay={0.05} className="order-2 lg:order-1">
              <ParallaxImage
                src={IMAGES.editorialSilk}
                alt="Tissu en soie drapé couleur blush aux plis fluides, gros plan texture premium — douceur VELMIRYS"
                sizes="(max-width: 1024px) 100vw, 600px"
                aspect="aspect-[4/3] lg:aspect-[1/1] lg:h-full"
                containerClassName="rounded-none lg:rounded-l-[32px] lg:rounded-r-none !rounded-2xl lg:!rounded-none"
              />
            </ScrollReveal>
            <div className="order-1 flex flex-col justify-center p-8 md:p-10 lg:order-2 lg:p-12">
              <ScrollReveal>
                <p className="text-xs tracking-[0.28em] text-accent/80">ÉDITORIAL</p>
                <h2
                  id="editorial-title"
                  className="mt-3 font-serif text-3xl tracking-tight md:text-4xl"
                >
                  {t("editorial.title")}
                </h2>
                <p className="mt-6 text-[17px] leading-relaxed text-ink/60">{t("editorial.text")}</p>
              </ScrollReveal>
              <ScrollReveal delay={0.08}>
                <div className="mt-8 flex items-center gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-ink/5 bg-sand shadow-sm">
                    <Image
                      src={IMAGES.texture}
                      alt="Gros plan texture tissu lin naturel beige, maille respirante et fibres — qualité VELMIRYS"
                      fill
                      sizes="96px"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="max-w-[28ch]">
                    <p className="font-serif text-sm">Maille respirante</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink/60">
                      Tenue toute la journée, finitions nettes — choisi comme pour soi.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.14}>
                <Link
                  href="/boutique"
                  prefetch
                  className="mt-8 inline-flex min-h-[44px] items-center gap-2 text-sm underline underline-offset-4 decoration-ink/15 hover:text-accent hover:decoration-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm self-start"
                >
                  Découvrir les matières <span aria-hidden="true">→</span>
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Réassurance — icônes + premium */}
      <section className="border-t border-sand bg-cream/50" aria-label="Réassurance">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-3 md:gap-8">
          {([1, 2, 3] as const).map((i) => (
            <ScrollReveal key={i} delay={i * 0.06}>
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand border border-ink/5 shadow-sm">
                  <ReassuranceIcon name={i === 1 ? "gift" : i === 2 ? "chat" : "truck"} />
                </div>
                <div>
                  <h3 className="font-serif text-[17px] leading-tight">{t(`reassurance.r${i}Title`)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{t(`reassurance.r${i}Text`)}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </>
  );
}
