import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site";
import PanierClient from "./PanierClient";

export const metadata: Metadata = {
  title: "Panier",
  description:
    "Relisez votre panier VELMIRYS — articles et box détaillées. La commande se confirme sur WhatsApp en quelques minutes.",
  alternates: { canonical: `${getSiteUrl()}/panier` },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Panier — VELMIRYS",
    description: "Relisez votre panier VELMIRYS avant de commander sur WhatsApp.",
    url: `${getSiteUrl()}/panier`,
    siteName: "VELMIRYS",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Panier — VELMIRYS",
    description: "Relisez votre panier VELMIRYS avant de commander sur WhatsApp.",
  },
};

export default function PanierPage() {
  const siteUrl = getSiteUrl();
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Panier", item: `${siteUrl}/panier` },
    ],
  };
  return (
    <>
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
            Panier
          </li>
        </ol>
      </nav>
      <PanierClient />
    </>
  );
}
