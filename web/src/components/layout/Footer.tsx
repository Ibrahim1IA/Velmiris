"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Footer() {
  const nav = useTranslations("nav");
  const t = useTranslations("footer");
  return (
    <footer className="border-t border-sand bg-sand/50" aria-label="Pied de page">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-xl">VELMIRYS</p>
          {/* TODO-CONTENU : slogan officiel (CONTENUS-A-FOURNIR.md §A4) */}
        </div>
        <nav aria-label="Boutique" className="space-y-2">
          <p className="mb-3 text-sm font-medium">{t("shopTitle")}</p>
          <ul className="space-y-2 text-sm text-ink/60">
            <li>
              <Link href="/boutique" prefetch className="inline-flex min-h-[44px] items-center rounded-md hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                Foulards
              </Link>
            </li>
            <li>
              <Link href="/boutique" prefetch className="inline-flex min-h-[44px] items-center rounded-md hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                Bonnets
              </Link>
            </li>
            <li>
              <Link href="/boutique" prefetch className="inline-flex min-h-[44px] items-center rounded-md hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                Épingles
              </Link>
            </li>
            <li>
              <Link href="/box" className="inline-flex min-h-[44px] items-center rounded-md hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                {nav("box")}
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Aide et informations">
          <p className="mb-3 text-sm font-medium">{t("helpTitle")}</p>
          <ul className="space-y-2 text-sm text-ink/60">
            <li>
              <Link href="/a-propos" className="inline-flex min-h-[44px] items-center rounded-md hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                {nav("about")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="inline-flex min-h-[44px] items-center rounded-md hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                {nav("contact")}
              </Link>
            </li>
            <li>
              <Link href="/legal/livraison-retours" className="inline-flex min-h-[44px] items-center rounded-md hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                Livraison &amp; retours
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <p className="mb-3 text-sm font-medium">{t("followTitle")}</p>
          {/* TODO-CONTENU : liens Instagram / TikTok (CONTENUS-A-FOURNIR.md §F3) */}
          <ul className="space-y-2 text-sm text-ink/60">
            <li>Instagram</li>
            <li>TikTok</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sand px-6 py-4 text-center text-xs text-ink/60">
        {t("copyright")} ·{" "}
        <Link href="/legal/cgv" className="inline-flex min-h-[44px] items-center rounded-md hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent px-1">
          CGV
        </Link>{" "}
        ·{" "}
        <Link href="/legal/confidentialite" className="inline-flex min-h-[44px] items-center rounded-md hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent px-1">
          Confidentialité
        </Link>
      </div>
    </footer>
  );
}
