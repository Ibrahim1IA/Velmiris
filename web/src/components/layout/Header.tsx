import Link from "next/link";
import { useTranslations } from "next-intl";
import CartDrawerTrigger from "@/components/cart/CartDrawerTrigger";

export default function Header() {
  const t = useTranslations("nav");
  return (
    <header className="sticky top-0 z-50 border-b border-sand bg-cream supports-[backdrop-filter]:bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* TODO-CONTENU : remplacer par le logo SVG (CONTENUS-A-FOURNIR.md §A1) */}
        <Link href="/" className="font-serif text-2xl tracking-tight">
          VELMIRYS
        </Link>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link href="/boutique" className="transition-colors hover:text-accent">
            {t("shop")}
          </Link>
          <Link href="/box" className="transition-colors hover:text-accent">
            {t("box")}
          </Link>
          <Link href="/a-propos" className="transition-colors hover:text-accent">
            {t("about")}
          </Link>
          <Link href="/contact" className="transition-colors hover:text-accent">
            {t("contact")}
          </Link>
        </nav>
        <div className="flex items-center gap-4 text-sm">
          {/* TODO : sélecteur de devise FCFA/EUR (PRD §2 / G2) */}
          <CartDrawerTrigger />
          <Link
            href="/panier"
            className="hidden text-sm underline-offset-4 hover:underline md:inline"
          >
            Voir
          </Link>
        </div>
      </div>
    </header>
  );
}
