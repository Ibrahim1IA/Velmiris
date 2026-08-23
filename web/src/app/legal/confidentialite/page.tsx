import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import SanityPortableText from "@/components/sanity/SanityPortableText";
import { LegalShell } from "@/components/legal/LegalNotice";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const title = "Confidentialité — VELMIRYS";
  const description =
    "Politique de confidentialité VELMIRYS : données collectées, cookies, conservation, droits. Mesure d'audience anonyme sans cookies tiers.";
  const canonical = `${siteUrl}/legal/confidentialite`;
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
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
  };
}

type PageContent = { body?: Array<{ _key: string; _type: string; [k: string]: unknown }> };

async function getPageContent(): Promise<PageContent | null> {
  try {
    const data = await client.fetch<PageContent | null>(
      `*[_type == "pageContent" && slug.current in ["confidentialite", "legal-confidentialite", "legal/confidentialite", "politique-confidentialite"]][0]{ body }`,
      {},
      { next: { revalidate: 3600, tags: ["pageContent"] } }
    );
    return data;
  } catch {
    return null;
  }
}

export default async function ConfidentialitePage() {
  const sanity = await getPageContent();
  const hasSanity = !!(sanity?.body && sanity.body.length > 0);
  const siteUrl = getSiteUrl();
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Confidentialité", item: `${siteUrl}/legal/confidentialite` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <LegalShell
      title="Politique de confidentialité"
      description="Nous collectons le minimum nécessaire pour traiter votre commande — et rien d'autre."
      updated="19 août 2026 — template générique"
    >
      {hasSanity ? (
        <SanityPortableText value={sanity!.body as never} />
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="font-serif text-xl">1. Données collectées</h2>
            <p className="mt-3 leading-relaxed text-ink/70">
              Lors du formulaire de commande (<Link href="/panier" className="underline decoration-ink/20 underline-offset-4 hover:decoration-accent">/panier</Link>) nous collectons : <strong className="font-medium">nom &amp; prénom, téléphone, zone de livraison</strong>. Ces informations servent uniquement au traitement de la commande, à la préparation de la box et à la coordination de la livraison sur WhatsApp.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm leading-relaxed text-ink/70">
              <li>Aucune création de compte en V1 — pas de mot de passe stocké.</li>
              <li>Panier et devise stockés en <code className="rounded bg-sand px-1 py-0.5">localStorage</code> côté navigateur, jamais sur le serveur hors commande.</li>
              <li>Commande enregistrée en base Supabase avec référence <code className="rounded bg-sand px-1 py-0.5">VEL-XXXX</code> et payload figé.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl">2. Mesure d&apos;audience</h2>
            <p className="mt-3 leading-relaxed text-ink/70">
              <strong className="font-medium">Pas de cookies tiers par défaut.</strong> La mesure d&apos;audience est anonyme via Umami auto-hébergé (sans cookies, sans suivi individuel) — conforme à la vie privée et à l&apos;approche RGPD prévue (PRD §8.5).
            </p>
            <div className="mt-3 rounded-xl bg-sand/60 p-4 text-sm text-ink/60">
              Bandeau cookies léger uniquement si des cookies tiers sont ajoutés ultérieurement. En V1, aucun consentement n&apos;est requis.
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl">3. Partage &amp; revente</h2>
            <p className="mt-3 leading-relaxed text-ink/70">
              <strong className="font-medium">Aucune revente de données personnelles.</strong> Les données ne sont partagées qu&apos;avec les prestataires strictement nécessaires au traitement de la commande (hébergeur DigitalOcean, Supabase, Resend pour l&apos;email de notification boutique).
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl">4. Conservation</h2>
            <div className="mt-3 rounded-xl border border-dashed border-ink/15 bg-sand/40 p-4">
              <p className="text-sm font-medium">Durée à préciser</p>
              <p className="mt-1 text-sm leading-relaxed text-ink/60">
                Exemple : conservation 3 ans à compter de la dernière commande, puis anonymisation. À renseigner selon obligations comptables et droit applicable (CONTENUS-A-FOURNIR.md §F5).
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl">5. Vos droits</h2>
            <p className="mt-3 leading-relaxed text-ink/70">
              Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression sur simple demande. Contactez-nous :
            </p>
            <div className="mt-3 rounded-2xl border border-sand bg-cream p-5">
              <p className="text-sm">
                <span className="text-ink/60">Email :</span>{" "}
                <span className="rounded bg-sand px-2 py-0.5 text-sm text-ink/60">[à renseigner — siteSettings.email]</span>
              </p>
              <p className="mt-2 text-sm">
                <span className="text-ink/60">WhatsApp :</span>{" "}
                <span className="rounded bg-sand px-2 py-0.5 text-sm text-ink/60">[numéro boutique — siteSettings.whatsappNumber]</span>
              </p>
              <p className="mt-3 text-xs text-ink/60">Réponse sous 30 jours.</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl">6. Sécurité</h2>
            <p className="mt-3 leading-relaxed text-ink/70">
              Accès admin protégé par Supabase Auth (lien magique, compte unique — PRD §8.5). API <code className="rounded bg-sand px-1 py-0.5">POST /api/orders</code> avec validation serveur, rate limiting et honeypot anti-spam. Secrets en variables d&apos;environnement, jamais exposés côté navigateur.
            </p>
          </section>

          <section className="rounded-2xl bg-sand px-6 py-6">
            <h3 className="font-serif text-lg">Une question sur vos données ?</h3>
            <p className="mt-2 text-sm text-ink/60">Nous répondons en personne sur WhatsApp ou par email.</p>
            <div className="mt-4 flex gap-3">
              <Link href="/contact" className="rounded-full bg-ink px-6 py-2 text-sm font-medium text-cream hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                Contact
              </Link>
              <Link href="/legal/cgv" className="rounded-full border border-ink/15 bg-cream px-6 py-2 text-sm font-medium hover:border-accent hover:text-accent">
                CGV
              </Link>
            </div>
          </section>
        </div>
      )}
    </LegalShell>
    </>
  );
}
