import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import SanityPortableText from "@/components/sanity/SanityPortableText";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const title = "Contact — VELMIRYS";
  const description =
    "Une question, une hésitation sur une teinte, une commande spéciale ? Écrivez-nous sur WhatsApp, email, Instagram ou TikTok. Réponse sous 24h ouvrées.";
  const canonical = `${siteUrl}/contact`;
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

type SiteSettings = {
  whatsappNumber?: string;
  email?: string;
  instagram?: string;
  tiktok?: string;
  deliveryZonesLabel?: string;
};

type PageContent = {
  title?: string;
  body?: Array<{ _key: string; _type: string; [k: string]: unknown }>;
};

async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const data = await client.fetch<SiteSettings | null>(
      `*[_type == "siteSettings"][0]{ whatsappNumber, email, instagram, tiktok, deliveryZonesLabel }`,
      {},
      { next: { revalidate: 3600, tags: ["settings"] } }
    );
    return data;
  } catch {
    return null;
  }
}

async function getPageContent(): Promise<PageContent | null> {
  try {
    const data = await client.fetch<PageContent | null>(
      `*[_type == "pageContent" && slug.current in ["contact", "contacts"]][0]{ title, body }`,
      {},
      { next: { revalidate: 3600, tags: ["pageContent"] } }
    );
    return data;
  } catch {
    return null;
  }
}

const FAQ = [
  {
    q: "Comment passer commande ?",
    a: "Ajoutez vos articles ou composez votre box, validez votre panier : vous êtes redirigée vers WhatsApp avec un récapitulatif pré-rempli. Nous confirmons ensemble la disponibilité, la livraison et le paiement. Simple, humain, sans création de compte.",
  },
  {
    q: "Quels sont les moyens de paiement acceptés ?",
    a: "Paiement à confirmer avec la boutique sur WhatsApp — Wave, Orange Money, virement bancaire ou espèces à la livraison selon votre zone. À préciser lors de la confirmation.",
    placeholder: true,
  },
  {
    q: "Quels sont les délais et zones de livraison ?",
    a: "Zones, tarifs et délais sont confirmés sur WhatsApp lors de la commande. Indicatif : Dakar 24–48 h, autres villes et international sur devis. Détail complet sur la page Livraison & retours.",
    placeholder: true,
  },
  {
    q: "Comment fonctionne la box cadeau ?",
    a: "Choisissez 2 à 5 articles, ajoutez un message et choisissez votre carte : nous composons votre box dans notre emballage signature — offert. Vous pouvez composer plusieurs box dans une même commande. Prix = somme des articles, emballage offert.",
  },
  {
    q: "Puis-je échanger ou retourner un article ?",
    a: "Échange possible sous 7 jours si l'article est non porté et l'emballage intact — sous réserve de disponibilité. Contactez-nous sur WhatsApp avec votre référence VEL-XXXX.",
    placeholder: true,
  },
  {
    q: "Comment entretenir mon foulard ?",
    a: "Lavage à la main ou en machine à 30° (cycle délicat), séchage à plat, repassage à basse température. Le détail figure sur chaque fiche produit (matière et entretien).",
  },
  {
    q: "Un article est épuisé — quand revient-il ?",
    a: "Écrivez-nous sur WhatsApp : nous vous préviendrons en priorité dès le réassort.",
  },
];

function normalizeNumber(n?: string | null): string | null {
  if (!n) return null;
  const digits = n.replace(/\D/g, "");
  return digits.length >= 8 ? digits : null;
}

export default async function ContactPage() {
  const [settings, sanity] = await Promise.all([getSiteSettings(), getPageContent()]);
  const envNumber = process.env.NEXT_PUBLIC_SHOP_WHATSAPP_NUMBER ?? "";
  const rawNumber = settings?.whatsappNumber ?? envNumber ?? "";
  const whatsappDigits = normalizeNumber(rawNumber);
  const whatsappUrl = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent("Bonjour VELMIRYS 🤍 — j'ai une question à propos de votre boutique.")}`
    : null;

  const email = settings?.email ?? "";
  const instagram = settings?.instagram ?? "";
  const tiktok = settings?.tiktok ?? "";
  const hasSanity = !!(sanity?.body && sanity.body.length > 0);
  const siteUrl = getSiteUrl();
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Contact", item: `${siteUrl}/contact` },
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
            Contact
          </li>
        </ol>
      </nav>
      {/* Hero */}
      <section className="border-b border-sand bg-sand/40">
        <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
          <p className="text-xs uppercase tracking-[0.32em] text-ink/60">VELMIRYS — Contact</p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight tracking-tight md:text-5xl">Parlons-nous</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/70">
            Une question, une hésitation sur une teinte, une commande spéciale ? Nous répondons en personne,
            généralement sous 24&nbsp;h ouvrées.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3 text-sm font-medium text-cream transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <span aria-hidden>↗</span> Écrire sur WhatsApp
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-ink/10 px-8 py-3 text-sm font-medium text-ink/60">
                WhatsApp — numéro à configurer
              </span>
            )}
            <Link
              href="/boutique"
              className="rounded-full border border-ink/15 bg-cream px-8 py-3 text-sm font-medium hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Voir la boutique
            </Link>
          </div>
          {!whatsappDigits && (
            <p className="mt-3 text-xs text-ink/60">
              Configurez <code className="rounded bg-cream px-1 py-0.5">NEXT_PUBLIC_SHOP_WHATSAPP_NUMBER</code> ou le champ
              Sanity <code className="rounded bg-cream px-1 py-0.5">siteSettings.whatsappNumber</code> (format international sans +).
            </p>
          )}
        </div>
      </section>

      {/* Sanity override */}
      {hasSanity && (
        <section className="mx-auto max-w-3xl px-6 py-10">
          <SanityPortableText value={sanity!.body as never} />
        </section>
      )}

      {/* Cartes contact */}
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-sand bg-cream p-6">
            <h2 className="font-serif text-lg">WhatsApp — réponse rapide</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">
              Le canal principal. Message pré-rempli depuis votre panier, confirmation humaine.
            </p>
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex rounded-full bg-ink px-5 py-2 text-sm font-medium text-cream hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Ouvrir WhatsApp
              </a>
            ) : (
              <p className="mt-4 text-sm text-ink/60">Numéro à renseigner</p>
            )}
            <p className="mt-3 text-xs text-ink/60">
              Numéro : {whatsappDigits ? `+${whatsappDigits}` : "— à compléter"}
            </p>
          </div>

          <div className="rounded-2xl border border-sand bg-cream p-6">
            <h2 className="font-serif text-lg">Email</h2>
            <p className="mt-2 text-sm text-ink/60">Pour les demandes détaillées ou pièces jointes.</p>
            {email ? (
              <a
                href={`mailto:${email}`}
                className="mt-4 inline-block text-sm font-medium text-accent underline underline-offset-4 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {email}
              </a>
            ) : (
              <p className="mt-4 rounded-xl bg-sand/60 px-4 py-3 text-sm text-ink/60">
                Email à renseigner — Sanity <code>siteSettings.email</code> ou contactez-nous sur WhatsApp.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-sand bg-cream p-6">
            <h2 className="font-serif text-lg">Horaires</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">
              Lun–Sam, 9h–18h (GMT)
              <br />
              Réponse sous 24&nbsp;h ouvrées.
            </p>
            <p className="mt-3 text-xs text-ink/60">
              En dehors des horaires, laissez un message WhatsApp — nous répondons dès l&apos;ouverture.
            </p>
            {settings?.deliveryZonesLabel && (
              <p className="mt-4 rounded-xl bg-sand/60 px-3 py-2 text-xs text-ink/60">
                Zones : {settings.deliveryZonesLabel}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-sand bg-sand/20 p-6">
            <h3 className="text-sm font-medium">Instagram</h3>
            {instagram ? (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-accent underline underline-offset-4 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {instagram}
              </a>
            ) : (
              <p className="mt-2 text-sm text-ink/60">
                Lien à renseigner — Sanity <code className="rounded bg-cream px-1">siteSettings.instagram</code>
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-sand bg-sand/20 p-6">
            <h3 className="text-sm font-medium">TikTok</h3>
            {tiktok ? (
              <a
                href={tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-accent underline underline-offset-4 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {tiktok}
              </a>
            ) : (
              <p className="mt-2 text-sm text-ink/60">
                Lien à renseigner — Sanity <code className="rounded bg-cream px-1">siteSettings.tiktok</code>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 pb-16 md:pb-24">
        <h2 className="font-serif text-2xl tracking-tight md:text-3xl">Questions fréquentes</h2>
        <p className="mt-2 text-sm text-ink/60">7 questions — réponses courtes. Cliquez pour déplier.</p>
        <div className="mt-8 divide-y divide-sand rounded-2xl border border-sand bg-cream">
          {FAQ.map((item, i) => (
            <details
              key={item.q}
              open={i === 0}
              className="group px-6 py-4 open:bg-sand/20"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
                <span className="font-medium leading-snug">
                  <span className="mr-2 text-accent">{i + 1}.</span>
                  {item.q}
                </span>
                <span
                  aria-hidden
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink/10 bg-cream text-sm transition-transform group-open:rotate-45 group-open:bg-ink group-open:text-cream"
                >
                  +
                </span>
              </summary>
              <div className="prose prose-sm mt-3 max-w-none text-ink/70">
                <p className="leading-relaxed">{item.a}</p>
                {item.placeholder && (
                  <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Contenu à valider — voir CONTENUS-A-FOURNIR.md §F4 / §G (moyens de paiement, zones, retours).
                  </p>
                )}
              </div>
            </details>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-ink/60">
          D&apos;autres questions ?{" "}
          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-accent">
              Écrivez-nous sur WhatsApp
            </a>
          ) : (
            "Écrivez-nous sur WhatsApp"
          )}{" "}
          ou consultez la page <Link href="/legal/livraison-retours" className="underline underline-offset-4 hover:text-accent">Livraison &amp; retours</Link>.
        </p>
      </section>
    </div>
  );
}
