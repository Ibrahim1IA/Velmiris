import Link from "next/link";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page introuvable — VELMIRYS",
  description: "Cette page n'existe pas. Retour à la boutique ou composez votre box cadeau.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${getSiteUrl()}/404` },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <nav aria-label="Fil d'Ariane" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-ink/60">
          <li>
            <Link
              href="/"
              className="hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
            >
              Accueil
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-ink">
            Page introuvable
          </li>
        </ol>
      </nav>

      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-ink/60">Erreur 404</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight md:text-5xl">
          Cette page s&apos;est envolée
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-ink/60">
          Le lien que vous avez suivi n&apos;existe plus ou a été déplacé. Retrouvez nos foulards
          premium ou composez votre box cadeau — l&apos;emballage est offert.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/boutique"
            prefetch
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-8 py-3 text-sm font-medium text-cream hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Découvrir la boutique
          </Link>
          <Link
            href="/box"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-ink/15 px-8 py-3 text-sm font-medium hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Composer une box
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2 text-sm">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center rounded-full px-4 py-2 text-ink/70 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            ← Accueil
          </Link>
          <Link
            href="/a-propos"
            className="inline-flex min-h-[44px] items-center rounded-full px-4 py-2 text-ink/70 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            À propos
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-[44px] items-center rounded-full px-4 py-2 text-ink/70 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Contact
          </Link>
          <Link
            href="/legal/livraison-retours"
            className="inline-flex min-h-[44px] items-center rounded-full px-4 py-2 text-ink/70 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Livraison &amp; retours
          </Link>
        </div>

        <p className="mt-12 text-xs text-ink/60">
          Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, contactez-nous sur{" "}
          <Link href="/contact" className="underline underline-offset-4 hover:text-accent">
            la page contact
          </Link>{" "}
          ou via WhatsApp.
        </p>
      </div>
    </div>
  );
}
