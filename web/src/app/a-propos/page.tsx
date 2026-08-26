import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import SanityPortableText from "@/components/sanity/SanityPortableText";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const title = "À propos — La maison VELMIRYS";
  const description =
    "VELMIRYS — une maison née d'une conviction : le voile mérite les plus beaux tissus, et le cadeau, les plus belles attentions. Histoire, exigence et geste.";
  const canonical = `${siteUrl}/a-propos`;
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
      type: "article",
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

type PageContent = {
  title?: string;
  body?: Array<{ _key: string; _type: string; [k: string]: unknown }>;
};

async function getPageContent(): Promise<PageContent | null> {
  try {
    const data = await client.fetch<PageContent | null>(
      `*[_type == "pageContent" && slug.current in ["a-propos", "a_propos", "about"]][0]{ title, body }`,
      {},
      { next: { revalidate: 3600, tags: ["pageContent"] } }
    );
    return data;
  } catch {
    return null;
  }
}

export default async function AProposPage() {
  const sanity = await getPageContent();
  const hasSanity = !!(sanity?.body && sanity.body.length > 0);
  const siteUrl = getSiteUrl();
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "À propos", item: `${siteUrl}/a-propos` },
    ],
  };

  return (
    <div className="bg-cream">
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
            À propos
          </li>
        </ol>
      </nav>
      {/* Hero */}
      <section className="border-b border-sand bg-sand/40">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center md:py-24">
          <p className="text-xs uppercase tracking-[0.32em] text-ink/60">VELMIRYS</p>
          <h1 className="mx-auto mt-4 max-w-3xl font-serif text-4xl leading-tight tracking-tight md:text-6xl">
            La maison VELMIRYS
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink/70">
            Une marque née d&apos;une conviction : le voile mérite les plus beaux tissus, et le cadeau, les plus
            belles attentions.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink/60">
            Fondée à Dakar — chaque commande est pliée, emballée et signée à la main.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/boutique"
              className="rounded-full bg-ink px-8 py-3 text-sm font-medium text-cream transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
            >
              Découvrir la boutique
            </Link>
          </div>
        </div>
      </section>

      {hasSanity ? (
        <section className="mx-auto max-w-3xl px-6 py-12 md:py-16">
          <SanityPortableText value={sanity!.body as never} />
          <div className="mt-10 rounded-2xl bg-sand/60 p-6 text-sm text-ink/60">
            <p className="font-medium text-ink">Contenu édité depuis Sanity</p>
            <p className="mt-1">Ce texte provient du CMS. Modifiez le document &quot;pageContent&quot; slug &quot;a-propos&quot; dans Sanity Studio pour le mettre à jour.</p>
          </div>
        </section>
      ) : (
        <>
          {/* Histoire */}
          <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
            <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
              <div className="order-2 md:order-1">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/60">01 — Notre histoire</p>
                <h2 className="mt-3 font-serif text-3xl tracking-tight md:text-4xl">Née d&apos;une frustration simple.</h2>
                <div className="mt-6 space-y-4 leading-relaxed text-ink/70">
                  <p>
                    Trouver un foulard vraiment beau, vraiment doux, dans une teinte vraiment juste, relevait du
                    parcours du combattant. Alors nous avons décidé de le créer nous-mêmes.
                  </p>
                  <p>
                    Chaque tissu est touché avant d&apos;être choisi. Chaque teinte est regardée à la lumière du jour.
                    Chaque commande est pliée, emballée et signée à la main — parce qu&apos;un beau tissu se donne
                    comme il se porte : avec intention.
                  </p>
                  <p className="text-sm text-ink/60">
                    * Histoire détaillée, fondatrice et année de création à préciser — en attente de validation (CONTENUS-A-FOURNIR.md §F6).
                  </p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-sand">
                  <div className="absolute inset-0 bg-gradient-to-br from-cream via-sand to-cream" />
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-cream/80 px-6 py-8 text-center shadow-sm backdrop-blur">
                      <p className="font-serif text-xl">Placeholder lifestyle</p>
                      <p className="mt-2 text-xs leading-relaxed text-ink/60">
                        Photo lifestyle à venir — flatlay foulards, boîte ouverte + papier de soie.
                        <br />
                        <span className="font-medium">assets/photos/lifestyle/</span> (C1–C5)
                      </p>
                      <div className="mx-auto mt-6 grid w-40 grid-cols-3 gap-2">
                        <span className="h-10 rounded-lg bg-blush" aria-hidden />
                        <span className="h-10 rounded-lg bg-slate" aria-hidden />
                        <span className="h-10 rounded-lg bg-mauve" aria-hidden />
                        <span className="h-10 rounded-lg bg-sand border border-ink/10" aria-hidden />
                        <span className="h-10 rounded-lg bg-wine" aria-hidden />
                        <span className="h-10 rounded-lg bg-choco" aria-hidden />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-center text-xs text-ink/60">Parallax léger — se révèle au scroll (respecte prefers-reduced-motion)</p>
              </div>
            </div>
          </section>

          {/* Exigence */}
          <section className="bg-ink text-cream">
            <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-cream/80">02 — Notre exigence</p>
                <h2 className="mt-3 font-serif text-3xl tracking-tight md:text-4xl">L&apos;exigence du détail</h2>
                <p className="mt-4 leading-relaxed text-cream/70">
                  Nous ne retenons qu&apos;une fraction des tissus que nous essayons : pour leur tombé, leur
                  couvrance, leur respirabilité et leur tenue dans le temps. Pas de jersey qui gratte, pas de teinte
                  qui vire au lavage, pas de finition bâclée.
                </p>
              </div>
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {[
                  { k: "Tombé", d: "Fluide, sans glisser — tient toute la journée, se drape avec douceur." },
                  { k: "Couvrance", d: "Opaque juste ce qu'il faut, même dans les teintes claires." },
                  { k: "Tenue", d: "Teinte stable au lavage, finitions nettes, maille respirante." },
                ].map((it) => (
                  <div key={it.k} className="rounded-2xl border border-cream/10 bg-cream/5 p-6 backdrop-blur">
                    <h3 className="font-serif text-lg">{it.k}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-cream/60">{it.d}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs text-cream/70">Chiffre précis à compléter si disponible (ex. « 1 sur 8 »).</p>
            </div>
          </section>

          {/* Geste */}
          <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
            <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-cream">
                <div className="absolute inset-0 bg-gradient-to-tr from-sand via-cream to-sand" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-48 w-64 rounded-2xl border border-ink/10 bg-white shadow-lg">
                    <div className="absolute inset-x-4 top-4 h-6 rounded-full bg-sand" />
                    <div className="absolute inset-x-6 bottom-6 h-24 rounded-xl border border-dashed border-ink/15 bg-sand/50" />
                    <span className="absolute -right-3 -top-3 rounded-full bg-accent px-3 py-1 text-xs font-medium text-white shadow">
                      Carte
                    </span>
                  </div>
                </div>
                <p className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-cream/90 px-4 py-1 text-xs text-ink/60 shadow">
                  Boîte blanche brandée + papier de soie
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink/60">03 — Notre geste</p>
                <h2 className="mt-3 font-serif text-3xl tracking-tight md:text-4xl">Le cadeau, notre signature</h2>
                <div className="mt-6 space-y-4 leading-relaxed text-ink/70">
                  <p>
                    Boîte blanche brandée, papier de soie, carte glissée à la main : chez VELMIRYS, chaque commande est
                    préparée comme un présent — qu&apos;elle soit pour vous ou pour celle à qui vous l&apos;offrez.
                  </p>
                  <p>C&apos;est notre façon de dire merci. Autrement.</p>
                  <p className="text-sm text-ink/60">
                    Clin d&apos;œil au slogan « Autrement » à confirmer (CONTENUS-A-FOURNIR.md §A4).
                  </p>
                </div>
                <div className="mt-6 flex gap-3">
                  <Link
                    href="/box"
                    className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-cream hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Composer une box
                  </Link>
                  <Link
                    href="/contact"
                    className="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-medium hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Nous écrire
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Citation */}
          <section className="border-y border-sand bg-sand/30">
            <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-20">
              <blockquote className="font-serif text-2xl leading-snug tracking-tight md:text-3xl">
                « Nous ne vendons pas des foulards. Nous préparons le moment où l&apos;on ouvre la boîte. »
              </blockquote>
              <p className="mt-4 text-sm tracking-wide text-ink/60">— VELMIRYS, fondatrice</p>
              <p className="mt-1 text-xs text-ink/60">Signature à préciser (Oumou, fondatrice) — en attente de validation</p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
