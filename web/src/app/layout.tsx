import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Umami from "@/components/analytics/Umami";
import LenisProvider from "@/components/home/LenisProvider";
import { getSiteUrl } from "@/lib/site";

// Fonts via CSS import (globals.css) — évite @vercel/turbopack-next/internal/font bug en build Turbopack Next 16.3
// Fraunces + Inter chargés via Google Fonts display=swap, variables --font-fraunces / --font-inter définies en CSS

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VELMIRYS — Foulards premium & box cadeaux",
    template: "%s · VELMIRYS",
  },
  description:
    "Foulards en jersey premium, bonnets et épingles à hijab. Composez votre box cadeau personnalisée. Emballage signature offert.",
  keywords: ["foulard", "hijab", "bonnet sous-hijab", "épingles hijab", "box cadeau", "VELMIRYS", "Dakar"],
  authors: [{ name: "VELMIRYS" }],
  creator: "VELMIRYS",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "VELMIRYS",
    title: "VELMIRYS — Foulards premium & box cadeaux",
    description:
      "Foulards en jersey premium, bonnets et épingles à hijab. Composez votre box cadeau personnalisée. Emballage signature offert.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "VELMIRYS — Le voile, porté comme un présent.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VELMIRYS — Foulards premium & box cadeaux",
    description:
      "Foulards en jersey premium, bonnets et épingles à hijab. Composez votre box cadeau personnalisée.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const messages = await getMessages();
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VELMIRYS",
    url: siteUrl,
    logo: `${siteUrl}/favicon.ico`,
    description:
      "Foulards en jersey premium, bonnets et épingles à hijab. Composez votre box cadeau personnalisée. Emballage signature offert.",
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VELMIRYS",
    url: siteUrl,
    inLanguage: "fr-FR",
  };
  return (
    <html lang="fr" className="h-full antialiased">
      <head>
        <Umami />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-ink font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          <LenisProvider>
            <a href="#main" className="skip-link">
              Aller au contenu principal
            </a>
            <Header />
            <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
              {children}
            </main>
            <Footer />
          </LenisProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
