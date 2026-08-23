"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import CartDrawerTrigger from "@/components/cart/CartDrawerTrigger";
import CurrencySwitcher from "./CurrencySwitcher";

export default function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Fermer menu mobile sur navigation + Esc
  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    // focus premier lien à l'ouverture
    firstLinkRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Fermer au changement de route
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- route change closes menu
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  const linkBase =
    "inline-flex min-h-[44px] items-center rounded-full px-1 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream";

  return (
    <header className="sticky top-0 z-50 border-b border-sand bg-cream supports-[backdrop-filter]:bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* TODO-CONTENU : remplacer par le logo SVG (CONTENUS-A-FOURNIR.md §A1) */}
        <Link
          href="/"
          aria-label="VELMIRYS — Accueil"
          className="inline-flex min-h-[44px] items-center font-serif text-2xl tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-md"
        >
          VELMIRYS
        </Link>
        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-2 text-sm md:flex"
        >
          <Link
            href="/boutique"
            prefetch
            aria-current={isActive("/boutique") ? "page" : undefined}
            className={linkBase}
          >
            {t("shop")}
          </Link>
          <Link
            href="/box"
            aria-current={isActive("/box") ? "page" : undefined}
            className={linkBase}
          >
            {t("box")}
          </Link>
          <Link
            href="/a-propos"
            aria-current={isActive("/a-propos") ? "page" : undefined}
            className={linkBase}
          >
            {t("about")}
          </Link>
          <Link
            href="/contact"
            aria-current={isActive("/contact") ? "page" : undefined}
            className={linkBase}
          >
            {t("contact")}
          </Link>
        </nav>
        <div className="flex items-center gap-2 text-sm">
          {/* Desktop : pill devise */}
          <div className="hidden md:flex">
            <CurrencySwitcher variant="pill" />
          </div>
          {/* Mobile : icône compacte devise active */}
          <div className="flex md:hidden">
            <CurrencySwitcher variant="compact" onCompactClick={() => setMenuOpen(true)} />
          </div>
          <CartDrawerTrigger />
          {/* Burger mobile */}
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="nav-mobile"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-ink/10 hover:border-ink/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 md:hidden"
          >
            <span aria-hidden className="text-lg leading-none">
              {menuOpen ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </div>

      {/* Nav mobile drawer */}
      {menuOpen && (
        <div
          id="nav-mobile"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navigation"
          className="border-t border-sand bg-cream px-6 py-6 md:hidden"
        >
          <nav aria-label="Navigation mobile" className="flex flex-col gap-1">
            <Link
              ref={firstLinkRef}
              href="/boutique"
              prefetch
              aria-current={isActive("/boutique") ? "page" : undefined}
              className="inline-flex min-h-[44px] items-center rounded-xl px-3 text-base hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {t("shop")}
            </Link>
            <Link
              href="/box"
              aria-current={isActive("/box") ? "page" : undefined}
              className="inline-flex min-h-[44px] items-center rounded-xl px-3 text-base hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {t("box")}
            </Link>
            <Link
              href="/a-propos"
              aria-current={isActive("/a-propos") ? "page" : undefined}
              className="inline-flex min-h-[44px] items-center rounded-xl px-3 text-base hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {t("about")}
            </Link>
            <Link
              href="/contact"
              aria-current={isActive("/contact") ? "page" : undefined}
              className="inline-flex min-h-[44px] items-center rounded-xl px-3 text-base hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {t("contact")}
            </Link>
            <Link
              href="/panier"
              aria-current={isActive("/panier") ? "page" : undefined}
              className="inline-flex min-h-[44px] items-center rounded-xl px-3 text-base hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Panier — Voir
            </Link>
          </nav>
          {/* Devise dans le drawer mobile — Option A */}
          <div className="mt-6 border-t border-sand pt-6">
            <p className="text-xs tracking-[0.2em] text-ink/60">DEVISE</p>
            <p className="mt-1 text-xs text-ink/60">Afficher les prix en</p>
            <div className="mt-3">
              <CurrencySwitcher variant="pill" />
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={() => setMenuOpen(false)}
            className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-ink/15 bg-cream px-6 text-sm hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Fermer le menu
          </button>
        </div>
      )}
    </header>
  );
}
