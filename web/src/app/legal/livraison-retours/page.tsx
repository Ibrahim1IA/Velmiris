import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import SanityPortableText from "@/components/sanity/SanityPortableText";
import { LegalShell } from "@/components/legal/LegalNotice";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const title = "Livraison & retours — VELMIRYS";
  const description =
    "Livraison VELMIRYS : zones, tarifs FCFA/EUR, délais et suivi sur WhatsApp. Échanges et retours sous 7 jours, article non porté.";
  const canonical = `${siteUrl}/legal/livraison-retours`;
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
      `*[_type == "pageContent" && slug.current in ["livraison-retours", "livraison_retours", "legal-livraison-retours", "legal/livraison-retours"]][0]{ body }`,
      {},
      { next: { revalidate: 3600, tags: ["pageContent"] } }
    );
    return data;
  } catch {
    return null;
  }
}

export default async function LivraisonRetoursPage() {
  const sanity = await getPageContent();
  const hasSanity = !!(sanity?.body && sanity.body.length > 0);
  const siteUrl = getSiteUrl();
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Livraison & retours", item: `${siteUrl}/legal/livraison-retours` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <LegalShell
      title="Livraison & retours"
      description="Zones, tarifs et délais — coordination sur WhatsApp avec votre référence VEL-XXXX."
      updated="19 août 2026 — template générique"
    >
      {hasSanity ? (
        <SanityPortableText value={sanity!.body as never} />
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="font-serif text-xl">1. Zones &amp; tarifs</h2>
            <p className="mt-3 leading-relaxed text-ink/70">
              Les tarifs sont confirmés sur WhatsApp lors de la commande. Tableau indicatif (à compléter — CONTENUS-A-FOURNIR.md §G1–G2) :
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-sand">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-sand/60 text-xs uppercase tracking-wide text-ink/60">
                    <tr>
                      <th className="px-4 py-3 font-medium">Zone</th>
                      <th className="px-4 py-3 font-medium">Tarif FCFA</th>
                      <th className="px-4 py-3 font-medium">Tarif EUR</th>
                      <th className="px-4 py-3 font-medium">Délai indicatif</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand">
                    <tr>
                      <td className="px-4 py-3 font-medium">Dakar — centre &amp; Almadies</td>
                      <td className="px-4 py-3 text-ink/60">2 000 FCFA</td>
                      <td className="px-4 py-3 text-ink/60">3,00 €</td>
                      <td className="px-4 py-3 text-ink/60">24–48 h</td>
                    </tr>
                    <tr className="bg-sand/20">
                      <td className="px-4 py-3 font-medium">Autres villes — Sénégal</td>
                      <td className="px-4 py-3 text-ink/60">5 000 FCFA</td>
                      <td className="px-4 py-3 text-ink/60">7,60 €</td>
                      <td className="px-4 py-3 text-ink/60">2–4 jours</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">International — sur devis</td>
                      <td className="px-4 py-3 text-ink/60">Sur devis</td>
                      <td className="px-4 py-3 text-ink/60">Sur devis</td>
                      <td className="px-4 py-3 text-ink/60">4–10 jours</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="bg-amber-50 px-4 py-2 text-xs text-amber-800">
                Tarifs placeholder — à remplacer par les tarifs réels (Sanity <code>siteSettings.deliveryZonesLabel</code> ou table <code>delivery_zones</code> Supabase).
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl">2. Délais</h2>
            <p className="mt-3 leading-relaxed text-ink/70">
              Les délais sont donnés à titre indicatif à compter de la confirmation du paiement sur WhatsApp. VELMIRYS prépare chaque commande avec soin ; un retard indépendant de notre volonté (transporteur, adresse incomplète) ne saurait engager notre responsabilité au-delà du remboursement des frais de livraison concernés.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-sand bg-cream p-4">
                <p className="text-sm font-medium">Dakar</p>
                <p className="mt-1 text-sm text-ink/60">24–48 h ouvrées</p>
              </div>
              <div className="rounded-2xl border border-sand bg-cream p-4">
                <p className="text-sm font-medium">Autres villes</p>
                <p className="mt-1 text-sm text-ink/60">2–4 jours ouvrés</p>
              </div>
              <div className="rounded-2xl border border-sand bg-cream p-4">
                <p className="text-sm font-medium">International</p>
                <p className="mt-1 text-sm text-ink/60">Sur devis — 4–10 jours</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl">3. Suivi</h2>
            <p className="mt-3 leading-relaxed text-ink/70">
              La confirmation et la coordination de la livraison se font sur <strong className="font-medium">WhatsApp</strong> avec votre référence de commande <code className="rounded bg-sand px-1 py-0.5">VEL-XXXX</code>. Vous recevez la référence à la validation du panier et sur la page{" "}
              <Link href="/commande/confirmation" className="underline decoration-ink/20 underline-offset-4 hover:decoration-accent">
                /commande/confirmation
              </Link>
              . En cas de besoin, bouton &quot;Rouvrir WhatsApp&quot; + &quot;Copier le message&quot; en secours (PRD §6.1).
            </p>
            <div className="mt-4 rounded-2xl bg-sand/60 p-4 text-sm text-ink/60">
              Astuce : gardez votre référence — elle permet à la boutique de retrouver votre commande instantanément.
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl">4. Retours &amp; échanges</h2>
            <div className="mt-3 rounded-xl border border-dashed border-ink/15 bg-sand/40 p-5">
              <p className="text-sm font-medium">Politique à définir — exemple :</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink/60">
                <li>Échange possible sous 7 jours à réception, article non porté, non lavé, emballage d&apos;origine intact.</li>
                <li>Retour à la charge de la cliente sauf erreur de préparation ; remboursement ou avoir selon disponibilité.</li>
                <li>Contactez-nous sur WhatsApp avec photo de l&apos;article et référence <code className="rounded bg-cream px-1">VEL-XXXX</code>.</li>
              </ul>
              <p className="mt-3 text-xs text-ink/60">À valider juridiquement et à préciser (CONTENUS-A-FOURNIR.md §G4).</p>
            </div>
          </section>

          <section className="rounded-2xl bg-ink px-6 py-6 text-cream">
            <h3 className="font-serif text-lg">Une question sur votre livraison ?</h3>
            <p className="mt-2 text-sm text-cream/70">
              Écrivez-nous — nous confirmons zone, tarif et créneau ensemble avant expédition.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="rounded-full bg-cream px-6 py-2 text-sm font-medium text-ink hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream"
              >
                Contact
              </Link>
              <Link
                href="/legal/cgv"
                className="rounded-full border border-cream/20 px-6 py-2 text-sm font-medium text-cream hover:bg-cream/10"
              >
                Voir les CGV
              </Link>
            </div>
          </section>
        </div>
      )}
    </LegalShell>
    </>
  );
}
