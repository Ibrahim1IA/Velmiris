import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import SanityPortableText from "@/components/sanity/SanityPortableText";
import { LegalShell } from "@/components/legal/LegalNotice";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const title = "CGV — VELMIRYS";
  const description =
    "Conditions générales de vente VELMIRYS : commande, prix, paiement, livraison, rétractation et litiges. Templates à faire valider juridiquement.";
  const canonical = `${siteUrl}/legal/cgv`;
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
      `*[_type == "pageContent" && slug.current in ["cgv", "legal-cgv", "legal/cgv", "conditions-generales"]][0]{ body }`,
      {},
      { next: { revalidate: 3600, tags: ["pageContent"] } }
    );
    return data;
  } catch {
    return null;
  }
}

export default async function CGVPage() {
  const sanity = await getPageContent();
  const hasSanity = !!(sanity?.body && sanity.body.length > 0);
  const siteUrl = getSiteUrl();
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "CGV", item: `${siteUrl}/legal/cgv` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <LegalShell
      title="Conditions générales de vente"
      description="Vente à distance de foulards, bonnets et accessoires VELMIRYS. Commande confirmée sur WhatsApp avec référence VEL-XXXX."
      updated="19 août 2026 — template générique"
    >
      {hasSanity ? (
        <SanityPortableText value={sanity!.body as never} />
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="font-serif text-xl">1. Objet</h2>
            <p className="mt-3 leading-relaxed text-ink/70">
              Les présentes conditions régissent la vente à distance de foulards, bonnets et accessoires VELMIRYS via le
              site <span className="rounded bg-sand px-1 py-0.5 text-sm text-ink/60">[domaine à renseigner — ex. velmirys.com]</span>. Toute commande est confirmée
              via WhatsApp après validation du panier sur le site.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl">2. Commande</h2>
            <p className="mt-3 leading-relaxed text-ink/70">
              Une commande est réputée ferme après confirmation de la disponibilité des articles et du montant total sur
              WhatsApp. Chaque commande reçoit une référence unique au format <code className="rounded bg-sand px-1 py-0.5">VEL-XXXX</code> (4 caractères alphanumériques) à conserver pour le suivi.
            </p>
            <div className="mt-3 rounded-xl bg-sand/60 p-4 text-sm text-ink/60">
              Le panier (articles + box) et le brouillon du Box Builder sont conservés en local (localStorage) ; seule l&apos;enregistrement serveur <code>POST /api/orders</code> fait foi.
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl">3. Prix</h2>
            <p className="mt-3 leading-relaxed text-ink/70">
              Les prix sont affichés en FCFA et en EUR selon le choix de la cliente (double saisie Sanity, pas de conversion automatique). L&apos;emballage cadeau — boîte, papier de soie, carte — est <strong className="font-semibold">offert</strong>.
            </p>
            <p className="mt-2 text-sm text-ink/60">
              Les frais de livraison, le cas échéant, sont confirmés avant le paiement sur WhatsApp. Les prix sont recalculés côté serveur à la commande (source Sanity) — aucune confiance au prix côté client.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl">4. Paiement</h2>
            <div className="mt-3 rounded-xl border border-dashed border-ink/15 bg-sand/40 p-4">
              <p className="text-sm font-medium">Moyens acceptés — à compléter</p>
              <p className="mt-1 text-sm leading-relaxed text-ink/60">
                Exemples : Wave, Orange Money, virement bancaire, espèces à la livraison. À confirmer avec la boutique sur WhatsApp (CONTENUS-A-FOURNIR.md §F4). La commande part en préparation après confirmation du paiement.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl">5. Livraison</h2>
            <p className="mt-3 leading-relaxed text-ink/70">
              Zones, tarifs et délais sont confirmés sur WhatsApp lors de la commande. VELMIRYS s&apos;engage à préparer chaque commande avec soin ; les délais sont donnés à titre indicatif. Le suivi se fait via votre référence <code className="rounded bg-sand px-1 py-0.5">VEL-XXXX</code>.
            </p>
            <p className="mt-3 text-sm">
              <Link href="/legal/livraison-retours" className="underline decoration-ink/20 underline-offset-4 hover:decoration-accent hover:text-accent">
                Voir le détail zones &amp; tarifs →
              </Link>
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl">6. Rétractation &amp; échanges</h2>
            <div className="mt-3 rounded-xl border border-dashed border-ink/15 bg-sand/40 p-4">
              <p className="text-sm font-medium">Politique à définir selon le droit applicable</p>
              <p className="mt-1 text-sm leading-relaxed text-ink/60">
                Exemple : échange possible sous 7 jours, article non porté, emballage intact, sous réserve de disponibilité. Frais éventuels à préciser. À renseigner (CONTENUS-A-FOURNIR.md §G4) et à faire valider juridiquement. Conformité Sénégal / France selon immatriculation.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl">7. Litiges</h2>
            <div className="mt-3 rounded-xl border border-dashed border-ink/15 bg-sand/40 p-4">
              <p className="text-sm leading-relaxed text-ink/60">
                Juridiction compétente, langue du contrat et médiation à préciser. Exemple : droit sénégalais, tribunal compétent de Dakar, langue française.
              </p>
            </div>
          </section>

          <section className="rounded-2xl bg-ink px-6 py-6 text-cream">
            <h3 className="font-serif text-lg">Besoin d&apos;aide sur une commande ?</h3>
            <p className="mt-2 text-sm text-cream/70">
              Contactez-nous sur WhatsApp avec votre référence <code className="rounded bg-cream/10 px-1">VEL-XXXX</code> — nous confirmons disponibilité, livraison et paiement ensemble.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-block rounded-full bg-cream px-6 py-2 text-sm font-medium text-ink hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream"
            >
              Nous contacter
            </Link>
          </section>
        </div>
      )}
    </LegalShell>
    </>
  );
}
