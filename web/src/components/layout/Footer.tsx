import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Footer() {
  const nav = useTranslations("nav");
  const t = useTranslations("footer");
  return (
    <footer className="border-t border-sand bg-sand/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-xl">VELMIRYS</p>
          {/* TODO-CONTENU : slogan officiel (CONTENUS-A-FOURNIR.md §A4) */}
        </div>
        <div>
          <p className="mb-3 text-sm font-medium">{t("shopTitle")}</p>
          <ul className="space-y-2 text-sm text-ink/70">
            <li><Link href="/boutique" className="hover:text-accent">Foulards</Link></li>
            <li><Link href="/boutique" className="hover:text-accent">Bonnets</Link></li>
            <li><Link href="/boutique" className="hover:text-accent">Épingles</Link></li>
            <li><Link href="/box" className="hover:text-accent">{nav("box")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-medium">{t("helpTitle")}</p>
          <ul className="space-y-2 text-sm text-ink/70">
            <li><Link href="/contact" className="hover:text-accent">{nav("contact")}</Link></li>
            <li><Link href="/legal/livraison-retours" className="hover:text-accent">Livraison &amp; retours</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-medium">{t("followTitle")}</p>
          {/* TODO-CONTENU : liens Instagram / TikTok (CONTENUS-A-FOURNIR.md §F3) */}
          <ul className="space-y-2 text-sm text-ink/70">
            <li>Instagram</li>
            <li>TikTok</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sand px-6 py-4 text-center text-xs text-ink/50">
        {t("copyright")} · <Link href="/legal/cgv" className="hover:text-accent">CGV</Link> ·{" "}
        <Link href="/legal/confidentialite" className="hover:text-accent">Confidentialité</Link>
      </div>
    </footer>
  );
}
